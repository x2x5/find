import { parse } from "yaml";

const CCFDDL_DATA_URL = "https://ccfddl.com/conference/allconf.yml";
const SUPPORTED_CONFERENCES = new Map<string, string>([
  ["AAAI", "AAAI"],
  ["IJCAI", "IJCAI"],
  ["ICML", "ICML"],
  ["ICLR", "ICLR"],
  ["CVPR", "CVPR"],
  ["ECCV", "ECCV"],
  ["ICCV", "ICCV"],
  ["NEURIPS", "NeurIPS"],
  ["NIPS", "NeurIPS"],
  ["MM", "MM"],
  ["ACM MM", "MM"],
]);

interface CcfTimeline {
  deadline?: string;
}

interface CcfConferenceYear {
  year?: number;
  timezone?: string;
  timeline?: CcfTimeline[];
}

interface CcfConference {
  title?: string;
  confs?: CcfConferenceYear[];
}

export interface ConferenceDeadline {
  label: string;
  target: string;
}

let deadlineRequest: Promise<ConferenceDeadline[]> | null = null;
let conferenceDataRequest: Promise<CcfConference[]> | null = null;

function getConferenceData() {
  conferenceDataRequest ??= fetch(CCFDDL_DATA_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`CCFDDL returned ${response.status}`);
      return response.text();
    })
    .then((text) => parse(text) as CcfConference[]);
  return conferenceDataRequest;
}

function timezoneOffsetMinutes(timezone: string): number | null {
  if (timezone === "AoE") return -12 * 60;
  if (timezone === "PT") return null;
  const match = timezone.match(/^UTC(?:([+-])(\d{1,2}))?$/);
  if (!match) return null;
  if (!match[1]) return 0;
  const minutes = Number(match[2]) * 60;
  return match[1] === "+" ? minutes : -minutes;
}

function deadlineToTimestamp(deadline: string, timezone: string): number | null {
  const match = deadline.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/,
  );
  const offsetMinutes = timezoneOffsetMinutes(timezone);
  if (!match || offsetMinutes === null) return null;
  const [, year, month, day, hour, minute, second] = match;
  return (
    Date.UTC(+year, +month - 1, +day, +hour, +minute, +second) -
    offsetMinutes * 60_000
  );
}

function formatShanghaiIso(timestamp: number): string {
  const date = new Date(timestamp + 8 * 60 * 60 * 1000);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}+08:00`;
}

async function fetchUpcomingDeadlines(): Promise<ConferenceDeadline[]> {
  const conferences = await getConferenceData();
  const now = Date.now();
  const upcoming: { label: string; timestamp: number }[] = [];

  for (const conference of conferences) {
    const label = SUPPORTED_CONFERENCES.get(
      conference.title?.trim().toUpperCase() ?? "",
    );
    if (!label) continue;
    for (const edition of conference.confs ?? []) {
      for (const timeline of edition.timeline ?? []) {
        if (!timeline.deadline || timeline.deadline === "TBD") continue;
        const timestamp = deadlineToTimestamp(
          timeline.deadline,
          edition.timezone ?? "UTC",
        );
        if (timestamp && timestamp > now) upcoming.push({ label, timestamp });
      }
    }
  }

  return upcoming
    .sort((a, b) => a.timestamp - b.timestamp)
    .filter(
      (item, index, items) =>
        index === 0 ||
        item.label !== items[index - 1].label ||
        item.timestamp !== items[index - 1].timestamp,
    )
    .map((item) => ({
      label: item.label,
      target: formatShanghaiIso(item.timestamp),
    }));
}

export function getUpcomingConferenceDeadlines() {
  deadlineRequest ??= fetchUpcomingDeadlines().catch(() => []);
  return deadlineRequest;
}

export async function getTimelineDeadlineOverrides(
  currentYear: number,
): Promise<Record<string, string>> {
  const conferences = await getConferenceData();
  const overrides: Record<string, string> = {};

  for (const conference of conferences) {
    const label = SUPPORTED_CONFERENCES.get(
      conference.title?.trim().toUpperCase() ?? "",
    );
    if (!label) continue;

    const candidates: { timestamp: number; year: number; monthDay: string }[] = [];
    for (const edition of conference.confs ?? []) {
      const deadline = edition.timeline?.find(
        (item) => item.deadline && item.deadline !== "TBD",
      )?.deadline;
      const match = deadline?.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!match) continue;
      candidates.push({
        timestamp: Date.UTC(+match[1], +match[2] - 1, +match[3]),
        year: +match[1],
        monthDay: `${match[2]}-${match[3]}`,
      });
    }

    const sameYear = candidates
      .filter((item) => item.year === currentYear)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    const latestPast = candidates
      .filter((item) => item.year < currentYear)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    const earliestFuture = candidates
      .filter((item) => item.year > currentYear)
      .sort((a, b) => a.timestamp - b.timestamp)[0];
    const selected = sameYear ?? latestPast ?? earliestFuture;
    if (selected) overrides[label] = selected.monthDay;
  }

  return overrides;
}

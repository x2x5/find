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

let deadlineRequest: Promise<ConferenceDeadline | null> | null = null;

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

async function fetchNextDeadline(): Promise<ConferenceDeadline | null> {
  const response = await fetch(CCFDDL_DATA_URL);
  if (!response.ok) throw new Error(`CCFDDL returned ${response.status}`);
  const conferences = parse(await response.text()) as CcfConference[];
  const now = Date.now();
  let next: { label: string; timestamp: number } | null = null;

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
        if (timestamp && timestamp > now && (!next || timestamp < next.timestamp)) {
          next = { label, timestamp };
        }
      }
    }
  }

  return next
    ? { label: next.label, target: formatShanghaiIso(next.timestamp) }
    : null;
}

export function getNextConferenceDeadline() {
  deadlineRequest ??= fetchNextDeadline().catch(() => null);
  return deadlineRequest;
}

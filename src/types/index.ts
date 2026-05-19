export interface ConferenceFileMeta {
  file: string;
  hash: string;
  count: number;
}

export interface ConferenceMeta {
  name: string;
  field: 'CV' | 'AI' | 'ML';
  years: Record<string, ConferenceFileMeta>;
}

export interface Manifest {
  version: string;
  conferences: Record<string, ConferenceMeta>;
}

export interface PaperData {
  conference: string;
  year: string;
  papers: string[];
}

export interface Paper {
  conference: string;
  year: string;
  title: string;
  citationCount?: number;
}

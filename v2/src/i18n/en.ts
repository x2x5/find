export interface Translations {
  appTitle: string;
  search: {
    placeholder: string;
    button: string;
  };
  sidebar: {
    timeline: string;
    filters: string;
    yearRange: string;
    from: string;
    to: string;
    recent2y: string;
  };
  fields: {
    CV: string;
    AI: string;
    ML: string;
  };
  table: {
    title: string;
    copyPage: string;
    copyAll: string;
    results: string;
    showing: string;
    noResults: string;
    loading: string;
  };
  pagination: {
    page: string;
    of: string;
    goTo: string;
    go: string;
  };
  theme: {
    light: string;
    dark: string;
  };
  language: {
    zh: string;
    en: string;
  };
  error: string;
  timeline: {
    today: string;
    deadline: string;
    result: string;
  };
}

export const en: Translations = {
  appTitle: 'Top AI Papers',
  search: {
    placeholder: 'Search papers...',
    button: 'Search',
  },
  sidebar: {
    timeline: 'Timeline',
    filters: 'Field',
    yearRange: 'Year Range',
    from: 'From',
    to: 'To',
    recent2y: 'Recent 2y',
  },
  fields: {
    CV: 'Computer Vision',
    AI: 'Artificial Intelligence',
    ML: 'Machine Learning',
  },
  table: {
    title: 'Papers',
    copyPage: 'Copy Page',
    copyAll: 'Copy All',
    results: 'results',
    showing: 'showing',
    noResults: 'No papers match your filters',
    loading: 'Loading data...',
  },
  pagination: {
    page: 'Page',
    of: 'of',
    goTo: 'Go to',
    go: 'Go',
  },
  theme: {
    light: 'Light',
    dark: 'Dark',
  },
  language: {
    zh: '中',
    en: 'EN',
  },
  error: 'Error',
  timeline: {
    today: 'Today',
    deadline: 'Submission',
    result: 'Acceptance',
  },
};

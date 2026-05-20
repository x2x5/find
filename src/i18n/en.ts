export interface Translations {
  appTitle: string;
  subtitle: string;
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
    selectAll: string;
    deselectAll: string;
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
    perPage: string;
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
    about: string;
    label: string;
  };
  error: string;
  common: {
    settings: string;
    collapse: string;
    saveLocal: string;
    copiedTitle: string;
  };
  timeline: {
    today: string;
    deadline: string;
    result: string;
  };
  countdown: {
    untilPrefix: string;
    untilSuffix: string;
    day: string;
    hour: string;
    minute: string;
    second: string;
    expired: string;
    year: string;
    month: string;
    dayLabel: string;
    hourLabel: string;
    minuteLabel: string;
    secondLabel: string;
  };
  cart: {
    cart: string;
    copy: string;
    clear: string;
    empty: string;
  };
  wordCloud: {
    generate: string;
    popupBlocked: string;
    writeFailed: string;
  };
}

export const en: Translations = {
  appTitle: '淘顶网',
  subtitle: 'Target:',
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
    selectAll: 'Select All',
    deselectAll: 'Deselect',
  },
  fields: {
    CV: 'Computer Vision',
    AI: 'Artificial Intelligence',
    ML: 'Machine Learning',
  },
  table: {
    title: 'Papers',
    copyPage: 'Copy Page',
    copyAll: 'Copy 500',
    results: 'Found',
    showing: 'showing',
    noResults: 'No papers match your filters',
    loading: 'Loading data...',
  },
  pagination: {
    page: 'Page',
    of: 'of',
    perPage: 'Per page',
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
    about: 'About',
    label: 'Language',
  },
  error: 'Error',
  common: {
    settings: 'Settings',
    collapse: 'Collapse',
    saveLocal: 'Save locally',
    copiedTitle: 'Title copied',
  },
  timeline: {
    today: 'Today',
    deadline: 'Submission',
    result: 'Acceptance',
  },
  countdown: {
    untilPrefix: 'Until ',
    untilSuffix: ' submission',
    day: 'DAY',
    hour: 'HRS',
    minute: 'MIN',
    second: 'SEC',
    expired: 'Expired',
    year: 'YY',
    month: 'MM',
    dayLabel: 'D',
    hourLabel: 'H',
    minuteLabel: 'M',
    secondLabel: 'S',
  },
  cart: {
    cart: 'Cart',
    copy: 'Copy',
    clear: 'Clear',
    empty: 'Click a paper title to add',
  },
  wordCloud: {
    generate: 'Word Cloud',
    popupBlocked: 'Popup was blocked',
    writeFailed: 'Failed to prepare word cloud',
  },
};

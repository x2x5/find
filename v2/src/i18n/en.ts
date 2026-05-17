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
  };
  error: string;
  timeline: {
    today: string;
    deadline: string;
    result: string;
  };
  cart: {
    cart: string;
    copy: string;
    clear: string;
    empty: string;
  };
}

export const en: Translations = {
  appTitle: 'TaoDing',
  subtitle: 'Lucky Pick',
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
  },
  error: 'Error',
  timeline: {
    today: 'Today',
    deadline: 'Submission',
    result: 'Acceptance',
  },
  cart: {
    cart: 'Cart',
    copy: 'Copy',
    clear: 'Clear',
    empty: 'Click a paper title to add',
  },
};

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
    total: string;
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
    clickWordHint: string;
    clickWordHintShort: string;
    searchExternal: string;
  };
  pagination: {
    page: string;
    of: string;
    perPage: string;
    goTo: string;
    go: string;
    firstPage: string;
    prevPage: string;
    nextPage: string;
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
    backToHome: string;
    perPage: string;
  };
  mobileTab: {
    filter: string;
    papers: string;
    cart: string;
    settings: string;
  };
  footer: {
    slogan: string;
    totalVisits: string;
    totalSearches: string;
    featureRequest: string;
    bugReport: string;
    chitchat: string;
  };
  timeline: {
    today: string;
    deadline: string;
    result: string;
    monthLabels: string[];
  };
  countdown: {
    selfCheck: string;
    submit: string;
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
    tokenSaved: string;
    tokenCleared: string;
    rateLimit: string;
    rateLimitNoToken: string;
    queryFailed: string;
    noMatch: string;
    noSearchable: string;
    foundReposPartial: string;
    foundRepos: string;
    badToken: string;
    total: string;
    tooltipGetToken: string;
    tooltipTokenSet: string;
    tooltipSetToken: string;
    tooltipClearToken: string;
    tooltipSaveToken: string;
    tooltipQuerying: string;
    tooltipCheckout: string;
  };
  wordCloud: {
    generate: string;
    popupBlocked: string;
    writeFailed: string;
    generatedFromPrefix: string;
    generatedFromSuffix: string;
    topWords: string;
    clickToRemove: string;
    emptyWithPapers: string;
    emptyNoPapers: string;
  };
  issueDialog: {
    featureTitles: string[];
    bugTitles: string[];
    chitchatTitles: string[];
    featurePlaceholder: string;
    bugPlaceholder: string;
    chitchatPlaceholder: string;
    cancel: string;
    submitChat: string;
    submitIssue: string;
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
    total: 'Total',
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
    clickWordHint: 'Click any word in a title to narrow search',
    clickWordHintShort: 'Tap words to search',
    searchExternal: 'Search on papers.cool',
  },
  pagination: {
    page: 'Page',
    of: 'of',
    perPage: 'Per page',
    goTo: 'Go to',
    go: 'Go',
    firstPage: 'First page',
    prevPage: 'Prev',
    nextPage: 'Next',
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
    backToHome: 'Back to home',
    perPage: 'Per page',
  },
  mobileTab: {
    filter: 'Filter',
    papers: 'Papers',
    cart: 'Cart',
    settings: 'Settings',
  },
  footer: {
    slogan: 'TaoDing · Find top conference papers',
    totalVisits: 'Total visits',
    totalSearches: 'Total searches',
    featureRequest: 'Feature request!',
    bugReport: 'Found a bug!',
    chitchat: 'Just chatting?',
  },
  timeline: {
    today: 'Today',
    deadline: 'Submission',
    result: 'Acceptance',
    monthLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan+', 'Feb+'],
  },
  countdown: {
    selfCheck: 'Check',
    submit: 'Submit',
    untilPrefix: 'Until ',
    untilSuffix: ' remaining',
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
    tokenSaved: 'GitHub Token saved locally',
    tokenCleared: 'GitHub Token cleared',
    rateLimit: 'GitHub API rate limited: {searched}/{total} queries, {found} found, {blocked} blocked',
    rateLimitNoToken: 'GitHub API rate limited: {searched}/{total} queries, add a Token',
    queryFailed: 'GitHub query failed: {failed} failed, checked {searched}/{total}',
    noMatch: 'No matching repos (checked {searched})',
    noSearchable: 'No searchable papers',
    foundReposPartial: 'Found {found}/{searched} repos, {unmatched} unmatched',
    foundRepos: 'Found {found}/{searched} GitHub repos',
    badToken: 'Invalid GitHub Token',
    total: 'Total:',
    tooltipGetToken: 'How to get Token',
    tooltipTokenSet: 'Token set',
    tooltipSetToken: 'Set Token',
    tooltipClearToken: 'Clear Token',
    tooltipSaveToken: 'Save Token',
    tooltipQuerying: 'Querying GitHub',
    tooltipCheckout: 'Query GitHub & checkout',
  },
  wordCloud: {
    generate: 'Word Cloud',
    popupBlocked: 'Popup was blocked',
    writeFailed: 'Failed to prepare word cloud',
    generatedFromPrefix: 'Generated from ',
    generatedFromSuffix: ' titles',
    topWords: 'Top {n} words',
    clickToRemove: 'Click words to remove',
    emptyWithPapers: 'No word cloud data. Try different filters on the main page.',
    emptyNoPapers: 'No word cloud data. Close and try different filters.',
  },
  issueDialog: {
    featureTitles: ['Feature', 'UI', 'UX', 'Search', 'Experience'],
    bugTitles: ['UI', 'Search', 'Data', 'UX', 'Bug'],
    chitchatTitles: ['Rant', 'Idea', 'Suggestion', 'Chat', 'Other'],
    featurePlaceholder: 'Describe the feature you want...',
    bugPlaceholder: 'Describe the issue and steps to reproduce...',
    chitchatPlaceholder: 'Say anything...',
    cancel: 'Cancel',
    submitChat: 'Chat on GitHub',
    submitIssue: 'Submit to GitHub Issues',
  },
};

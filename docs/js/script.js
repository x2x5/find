document.addEventListener('DOMContentLoaded', function() {
    const papersList = document.getElementById('papers-list-view');
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('no-results');
    const toggleIcon = document.querySelector('.toggle-icon');
    const versionBadge = document.querySelector('.version-badge');
    const searchBtn = document.getElementById('search-btn');
    const topicInput = document.getElementById('topic-input');
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    const recentLabel = document.getElementById('recent-label');
    const timelineTitle = document.getElementById('timeline-title');
    const timelineNote = document.getElementById('timeline-note');
    const legendDeadlineLabel = document.getElementById('legend-deadline-label');
    const legendResultLabel = document.getElementById('legend-result-label');
    const themeToggleContainer = document.querySelector('.theme-toggle-top');
    // Topic标签已移除
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    const startYearSelect = document.getElementById('start-year');
    const endYearSelect = document.getElementById('end-year');
    const startYearRange = document.getElementById('start-year-range');
    const endYearRange = document.getElementById('end-year-range');
    const startYearValue = document.getElementById('start-year-value');
    const endYearValue = document.getElementById('end-year-value');
    const startYearLabel = document.getElementById('start-year-label');
    const endYearLabel = document.getElementById('end-year-label');
    const yearSliderFill = document.getElementById('year-slider-fill');
    const recentCheckbox = document.getElementById('recent-checkbox');
    const fieldMainCheckboxes = document.querySelectorAll('.field-main-checkbox');
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    const paginationContainer = document.getElementById('pagination-container');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const currentPageInput = document.getElementById('current-page-input');
    const totalPagesSpan = document.getElementById('total-pages');
    const pageStartSpan = document.getElementById('page-start');
    const pageEndSpan = document.getElementById('page-end');
    const totalPapersPagination = document.getElementById('total-papers-pagination');
    const versionInfo = document.querySelector('.site-footer .version-info');
    const conferenceTimelineTrack = document.getElementById('conference-timeline-track');

    const DATA_MANIFEST_URL = 'data/manifest.json';
    const currentYear = new Date().getFullYear();
    const timelineReferenceYear = 2025;
    const timelineRangeStart = new Date(2025, 0, 1);
    const timelineRangeEnd = new Date(2026, 1, 28);
    let timelineTrackHeight = 1240;
    const timelineTopPadding = 24;
    const timelineBottomPadding = 24;
    const timelineLabelGap = 58;
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const conferenceTimelineData = [
        { deadline: '01-19', result: '04-29', conference: 'IJCAI' },
        { deadline: '01-28', result: '04-30', conference: 'ICML' },
        { deadline: '03-05', result: '06-17', conference: 'ECCV' },
        { deadline: '03-07', result: '06-25', conference: 'ICCV' },
        { deadline: '04-01', result: '07-07', conference: 'MM' },
        { deadline: '05-06', result: '09-24', conference: 'NeurIPS' },
        { deadline: '08-15', result: '12-09', conference: 'AAAI' },
        { deadline: '10-01', result: '01-22', conference: 'ICLR' },
        { deadline: '11-15', result: '02-26', conference: 'CVPR' }
        ];

    const manifestCache = { loaded: false, data: null };
    const conferenceDataCache = new Map();
    let availableYears = [];
    let isSyncingYearControls = false;
    let currentLang = localStorage.getItem('uiLang') || 'zh';

    function applyLanguage(lang) {
        const isEn = lang === 'en';
        if (searchBtn) {
            searchBtn.innerHTML = '<i class="fas fa-search" aria-hidden="true"></i>';
            searchBtn.setAttribute('aria-label', isEn ? 'Search' : '搜索');
        }
        if (topicInput) topicInput.placeholder = 'flow matching';
        if (recentLabel) recentLabel.textContent = isEn ? 'Recent' : '最近';
        if (timelineTitle) timelineTitle.textContent = isEn ? 'Timeline' : '时间轴';
        if (timelineNote) {
            timelineNote.textContent = '';
            timelineNote.style.display = 'none';
        }
        if (legendDeadlineLabel) legendDeadlineLabel.textContent = isEn ? 'Submit' : '投稿';
        if (legendResultLabel) legendResultLabel.textContent = isEn ? 'Accept' : '接受';
        if (langToggleBtn) langToggleBtn.textContent = isEn ? 'EN / 中' : '中 / EN';
        document.documentElement.lang = isEn ? 'en' : 'zh-CN';
    }

    if (versionInfo) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        versionInfo.textContent = `Top AI Papers · updated ${year}-${month}-${day}`;
    }

    function formatMonthDay(month, day) {
        return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    function normalizeMonthDay(monthDayText) {
        if (!monthDayText) return null;
        const parts = String(monthDayText).trim().split(/[-./]/).map(part => parseInt(part, 10));
        if (parts.length !== 2 || !Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) {
            return null;
        }

        const [month, day] = parts;
        const date = new Date(timelineReferenceYear, month - 1, day);
        const isValidDate = date.getFullYear() === timelineReferenceYear &&
            date.getMonth() === month - 1 &&
            date.getDate() === day;
        if (!isValidDate) {
            return null;
        }

        return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    function monthDayToDate(monthDayText, year) {
        const normalizedDate = normalizeMonthDay(monthDayText);
        if (!normalizedDate || !Number.isFinite(year)) return null;
        const [month, day] = normalizedDate.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const isValidDate = date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day;
        return isValidDate ? date : null;
    }

    function diffDays(startDate, endDate) {
        return Math.round((endDate - startDate) / ONE_DAY_MS);
    }

    function dateToProgress(date) {
        const totalDays = diffDays(timelineRangeStart, timelineRangeEnd);
        if (!Number.isFinite(totalDays) || totalDays <= 0 || !(date instanceof Date)) {
            return 0;
        }
        const offset = diffDays(timelineRangeStart, date);
        return Math.min(1, Math.max(0, offset / totalDays));
    }

    function progressToTrackY(progress) {
        const clamped = Math.min(1, Math.max(0, progress));
        const usableHeight = timelineTrackHeight - timelineTopPadding - timelineBottomPadding;
        return timelineTopPadding + usableHeight * clamped;
    }

    function buildMonthMarkers() {
        const markers = [];
        const cursor = new Date(timelineRangeStart.getFullYear(), timelineRangeStart.getMonth(), 1);
        while (cursor <= timelineRangeEnd) {
            markers.push(new Date(cursor));
            cursor.setMonth(cursor.getMonth() + 1);
        }
        return markers;
    }

    function adjustLabelsWithoutOverlap(items, minY, maxY, gap) {
        if (items.length === 0) return items;
        const sorted = [...items].sort((a, b) => a.targetY - b.targetY);

        let previous = minY - gap;
        sorted.forEach(item => {
            item.labelY = Math.max(item.targetY, previous + gap);
            previous = item.labelY;
        });

        if (sorted[sorted.length - 1].labelY > maxY) {
            sorted[sorted.length - 1].labelY = maxY;
            for (let i = sorted.length - 2; i >= 0; i--) {
                sorted[i].labelY = Math.min(sorted[i].labelY, sorted[i + 1].labelY - gap);
            }
            if (sorted[0].labelY < minY) {
                const shift = minY - sorted[0].labelY;
                sorted.forEach(item => {
                    item.labelY += shift;
                });
            }
        }
        return sorted;
    }

    function appendTimelineConnector(track, typeClass, left, top, width, orientation) {
        const connector = document.createElement('div');
        connector.className = `conference-timeline-connector ${typeClass} connector-${orientation}`;
        connector.style.left = `${left}px`;
        connector.style.top = `${top}px`;
        if (orientation === 'horizontal') {
            connector.style.width = `${Math.max(width, 0)}px`;
            connector.style.height = '2px';
        }
        track.appendChild(connector);
    }

    function appendTimelineMarker(track, typeClass, targetX, targetY) {
        const marker = document.createElement('div');
        marker.className = `conference-timeline-marker ${typeClass}`;
        marker.style.top = `${targetY}px`;
        marker.style.left = `${targetX}px`;
        track.appendChild(marker);
    }

    function renderConferenceTimeline() {
        if (!conferenceTimelineTrack) return;
        try {

        conferenceTimelineTrack.querySelectorAll(
            '.conference-timeline-node, .conference-timeline-month-label, .conference-timeline-month-tick, .conference-timeline-event, .conference-timeline-connector, .conference-timeline-marker, .conference-timeline-arrowhead, .conference-timeline-side-label'
        ).forEach(node => node.remove());

        const timelineWidth = conferenceTimelineTrack.clientWidth || 260;
        const centerX = timelineWidth / 2;
        const sidePadding = 8;
        const monthColumnWidth = 32;
        const arrowLineLength = 44;
        const minY = timelineTopPadding + 20;
        let maxY = Math.max(minY + 100, timelineTrackHeight - timelineBottomPadding - 12);
        const connectorGap = 6;
        const axisTargetX = centerX;

        const today = new Date();
        const todayMonth = today.getMonth() + 1;
        const todayDay = today.getDate();
        const todayMonthDay = formatMonthDay(todayMonth, todayDay);
        const todayTimelineYear = todayMonth <= 2 ? 2026 : 2025;
        const todayDate = monthDayToDate(todayMonthDay, todayTimelineYear);

        function monthKeyOf(date) {
            if (!(date instanceof Date)) return '';
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }

        const rawEvents = [];
        conferenceTimelineData.forEach(item => {
            const normalizedDeadline = normalizeMonthDay(item.deadline);
            const normalizedResult = normalizeMonthDay(item.result);
            if (!normalizedDeadline || !normalizedResult) {
                return;
            }

            const deadlineDate = monthDayToDate(normalizedDeadline, 2025);
            const deadlineMonth = parseInt(normalizedDeadline.slice(0, 2), 10);
            const resultMonth = parseInt(normalizedResult.slice(0, 2), 10);
            const resultYear = resultMonth < deadlineMonth ? 2026 : 2025;
            const resultDate = monthDayToDate(normalizedResult, resultYear);

            if (!deadlineDate || !resultDate) {
                return;
            }

            rawEvents.push({
                side: 'left',
                typeClass: 'event-deadline',
                conference: item.conference,
                dateText: normalizedDeadline,
                bucketKey: monthKeyOf(deadlineDate),
                actualDate: deadlineDate
            });
            rawEvents.push({
                side: 'left',
                typeClass: 'event-result',
                conference: item.conference,
                dateText: normalizedResult,
                bucketKey: monthKeyOf(resultDate),
                actualDate: resultDate
            });
        });

        if (todayDate) {
            rawEvents.push({
                side: 'left',
                typeClass: 'event-today',
                conference: '今天',
                dateText: todayMonthDay,
                bucketKey: monthKeyOf(todayDate),
                actualDate: todayDate
            });
        }

        const timelineMonths = buildMonthMarkers().map(monthDate => {
            const key = monthKeyOf(monthDate);
            const label = monthDate.getFullYear() === 2025
                ? `${monthDate.getMonth() + 1}月`
                : `次年${monthDate.getMonth() + 1}月`;
            return { key, label };
        });

        const monthEventsMap = new Map();
        timelineMonths.forEach(month => {
            monthEventsMap.set(month.key, []);
        });
        rawEvents.forEach(event => {
            if (!monthEventsMap.has(event.bucketKey)) {
                monthEventsMap.set(event.bucketKey, []);
            }
            monthEventsMap.get(event.bucketKey).push(event);
        });

        // 每个月的显示区间按“该月事件数”扩展，避免拥挤；事件永远放在当月与下月之间
        const monthBaseHeight = 92;
        const perEventExtraHeight = 30;
        let currentY = timelineTopPadding;
        timelineMonths.forEach(month => {
            const monthEvents = monthEventsMap.get(month.key) || [];
            const monthHeight = monthBaseHeight + Math.max(0, monthEvents.length - 1) * perEventExtraHeight;
            month.startY = currentY;
            month.height = monthHeight;
            currentY += monthHeight;
        });

        timelineTrackHeight = Math.max(currentY + timelineBottomPadding, 920);
        conferenceTimelineTrack.style.height = `${timelineTrackHeight}px`;
        conferenceTimelineTrack.style.minHeight = `${timelineTrackHeight}px`;
        maxY = Math.max(minY + 100, timelineTrackHeight - timelineBottomPadding - 12);

        timelineMonths.forEach(month => {
            const y = month.startY;
            const tick = document.createElement('div');
            tick.className = 'conference-timeline-month-tick';
            tick.style.top = `${y}px`;

            const label = document.createElement('div');
            label.className = 'conference-timeline-month-label';
            label.style.top = `${y}px`;
            label.textContent = month.label;

            conferenceTimelineTrack.appendChild(tick);
            conferenceTimelineTrack.appendChild(label);
        });

        // 每个月内统一按日期排序，再把该月区间均分后排布
        const positionedEvents = [];
        timelineMonths.forEach(month => {
            const monthEvents = (monthEventsMap.get(month.key) || [])
                .filter(event => event.actualDate instanceof Date)
                .sort((a, b) => {
                    const diff = a.actualDate - b.actualDate;
                    if (diff !== 0) return diff;
                    if (a.side !== b.side) return a.side === 'left' ? -1 : 1;
                    return a.conference.localeCompare(b.conference);
                });

            const count = monthEvents.length;
            if (count === 0) return;
            const step = month.height / (count + 1);
            monthEvents.forEach((event, idx) => {
                event.labelY = Math.max(minY, Math.min(maxY, month.startY + step * (idx + 1)));
                positionedEvents.push(event);
            });
        });

        positionedEvents.forEach(event => {
            const eventNode = document.createElement('div');
            eventNode.className = `conference-timeline-event side-${event.side} ${event.typeClass}`;
            eventNode.style.top = `${event.labelY}px`;
            eventNode.style.left = '0px';
            eventNode.title = `${event.conference} ${event.dateText}`;

            const chip = document.createElement('div');
            chip.className = 'conference-timeline-event-chip';
            const mainLine = document.createElement('div');
            mainLine.className = 'conference-timeline-event-main';
            mainLine.textContent = event.conference;
            chip.appendChild(mainLine);
            eventNode.appendChild(chip);
            conferenceTimelineTrack.appendChild(eventNode);
            const nodeWidth = Math.ceil(eventNode.getBoundingClientRect().width);

            if (event.side === 'left') {
                const targetX = axisTargetX;
                const connectorLeft = targetX - arrowLineLength;
                const desiredLeft = connectorLeft - connectorGap - nodeWidth;
                const nodeLeft = Math.max(sidePadding + monthColumnWidth + 2, desiredLeft);
                eventNode.style.left = `${nodeLeft}px`;
                appendTimelineConnector(
                    conferenceTimelineTrack,
                    event.typeClass,
                    connectorLeft,
                    event.labelY,
                    arrowLineLength,
                    'horizontal'
                );
                appendTimelineMarker(conferenceTimelineTrack, event.typeClass, targetX, event.labelY);
            } else {
                const targetX = axisTargetX;
                const connectorLeft = targetX;
                const desiredLeft = connectorLeft + arrowLineLength + connectorGap;
                const maxLeft = Math.max(sidePadding, timelineWidth - sidePadding - nodeWidth);
                const nodeLeft = Math.min(desiredLeft, maxLeft);
                eventNode.style.left = `${nodeLeft}px`;
                appendTimelineConnector(
                    conferenceTimelineTrack,
                    event.typeClass,
                    connectorLeft,
                    event.labelY,
                    arrowLineLength,
                    'horizontal'
                );
                appendTimelineMarker(conferenceTimelineTrack, event.typeClass, targetX, event.labelY);
            }

            const dateTag = document.createElement('div');
            dateTag.className = `conference-timeline-date-tag ${event.typeClass}`;
            dateTag.textContent = event.dateText;
            dateTag.style.top = `${event.labelY}px`;
            dateTag.style.left = `${axisTargetX + arrowLineLength + connectorGap + 8}px`;
            conferenceTimelineTrack.appendChild(dateTag);
        });
        } catch (error) {
            console.error('Failed to render conference timeline:', error);
        }
    }

    renderConferenceTimeline();

    async function loadManifest() {
        if (manifestCache.loaded) {
            return manifestCache.data;
        }
        const response = await fetch(DATA_MANIFEST_URL, { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error('Failed to load manifest');
        }
        const data = await response.json();
        manifestCache.loaded = true;
        manifestCache.data = data;
        return data;
    }

    async function loadConferenceData(conference) {
        if (conferenceDataCache.has(conference)) {
            return conferenceDataCache.get(conference);
        }

        const manifest = await loadManifest();
        const confInfo = manifest.conferences[conference];
        if (!confInfo) {
            conferenceDataCache.set(conference, []);
            return [];
        }

        const response = await fetch(confInfo.file, { cache: 'force-cache' });
        if (!response.ok) {
            throw new Error(`Failed to load data for ${conference}`);
        }
        const data = await response.json();
        const papers = Array.isArray(data.papers) ? data.papers : [];
        conferenceDataCache.set(conference, papers);
        return papers;
    }

    async function loadPapersForConferences(conferences) {
        const loadPromises = conferences.map(conf => loadConferenceData(conf));
        const results = await Promise.all(loadPromises);

        const merged = [];
        for (let i = 0; i < conferences.length; i++) {
            const conf = conferences[i];
            const papers = results[i];
            papers.forEach(p => {
                merged.push({
                    conference: conf,
                    year: p.y,
                    title: p.t
                });
            });
        }
        return merged;
    }
    
    // 统计信息相关元素
    const papersStats = document.getElementById('papers-stats');
    const totalPapersCount = document.getElementById('total-papers-count');
    const displayedCount = document.getElementById('displayed-count');
    const totalCount = document.getElementById('total-count');
    
    // 设置列表视图初始状态为隐藏
    if (papersList) {
        papersList.classList.remove('view-active');
        papersList.style.display = 'none';
    }
    
    // 确保初始显示提示信息
    if (noResults) {
        noResults.style.display = 'flex';
    }
    
    // 全局变量：当前搜索词
    let currentSearchTerm = '';

    // 翻页相关变量
    let allFilteredPapers = []; // 存储所有过滤后的论文
    let currentPage = 1; // 当前页数，从1开始
    const papersPerPage = 50; // 每页显示的论文数量
    let totalPages = 0; // 总页数

    // Function to check if a paper matches all keywords
    function paperMatchesAllKeywords(paper, keywords) {
        return keywords.every(keyword => {
            const lowerKeyword = keyword.toLowerCase();
            return paper.title.toLowerCase().includes(lowerKeyword) || 
                   paper.conference.toLowerCase().includes(lowerKeyword) ||
                   paper.year.toLowerCase().includes(lowerKeyword);
        });
    }

    // Function to display no results message
    function showNoResultsMessage(isSearchPerformed = false) {
        if (loading) loading.style.display = 'none';
        if (noResults) {
            noResults.style.display = 'flex';
            // 根据是否进行了搜索来显示不同的消息
            if (isSearchPerformed) {
                noResults.innerHTML = "No papers found. Please try different keywords or filters.";
            } else {
                noResults.innerHTML = "Please select a topic and sample a batch of papers.";
            }
        }
        if (papersList) {
            papersList.style.display = 'none';
            papersList.classList.remove('view-active');
        }
        // 隐藏统计信息
        if (papersStats) papersStats.style.display = 'none';
    }

    // 高亮文本的辅助函数
    function highlightText(text, searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') return text;
        
        // 将搜索词按空格分割成数组
        const searchTerms = searchTerm.split(' ').filter(term => term.trim() !== '');
        if (searchTerms.length === 0) return text;
        
        // 初始结果为原文本
        let result = text;
        
        // 对每个搜索词进行高亮处理
        searchTerms.forEach(term => {
            const termLower = term.toLowerCase();
            
            // 创建一个临时的HTML元素来处理
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = result;
            const textNodes = getTextNodes(tempDiv);
            
            // 遍历所有文本节点并替换匹配项
            textNodes.forEach(node => {
                const nodeText = node.nodeValue;
                const nodeLower = nodeText.toLowerCase();
                let lastIndex = 0;
                let newHtml = '';
                let index = nodeLower.indexOf(termLower);
                
                while (index !== -1) {
                    // 添加前面不匹配的部分
                    newHtml += nodeText.substring(lastIndex, index);
                    
                    // 添加高亮的匹配部分（使用原始大小写）
                    const matchedText = nodeText.substring(index, index + term.length);
                    newHtml += `<span class="highlight">${matchedText}</span>`;
                    
                    // 更新索引位置
                    lastIndex = index + term.length;
                    index = nodeLower.indexOf(termLower, lastIndex);
                }
                
                // 添加最后剩余的文本
                newHtml += nodeText.substring(lastIndex);
                
                // 创建一个新的包装元素
                const wrapper = document.createElement('span');
                wrapper.innerHTML = newHtml;
                
                // 替换原节点
                if (node.parentNode) {
                    while (wrapper.firstChild) {
                        node.parentNode.insertBefore(wrapper.firstChild, node);
                    }
                    node.parentNode.removeChild(node);
                }
            });
            
            // 更新结果
            result = tempDiv.innerHTML;
        });
        
        return result;
    }
    
    // 获取元素内的所有文本节点
    function getTextNodes(node) {
        const textNodes = [];
        const walker = document.createTreeWalker(
            node, 
            NodeFilter.SHOW_TEXT, 
            null, 
            false
        );
        
        let currentNode;
        while (currentNode = walker.nextNode()) {
            textNodes.push(currentNode);
        }
        
        return textNodes;
    }

    // Search functionality
    if (searchBtn && topicInput) {
        let allPapersData = null;

        async function ensurePapersLoaded(conferences) {
            const uniqueConfs = Array.from(new Set(conferences));
            return loadPapersForConferences(uniqueConfs);
        }
        
        searchBtn.addEventListener('click', async function() {
            let searchTerm = topicInput.value.trim();
            
            // 如果输入框是默认的placeholder内容或为空，使用"flow matching"
            if (!searchTerm || searchTerm === 'flow matching') {
                searchTerm = 'flow matching';
                topicInput.value = searchTerm; // 更新输入框显示
            }
            
            currentSearchTerm = searchTerm; // 保存当前搜索词
            
            if (searchTerm) {
                console.log('Searching for:', searchTerm);
                
                // 获取过滤条件
                const conferences = getSelectedConferences();
                console.log('Selected conferences:', conferences);
                
                const startYear = startYearSelect ? startYearSelect.value : '2023';
                const endYear = endYearSelect ? endYearSelect.value : '2025';
                
                // 如果没有选中任何会议，显示提示
                if (conferences.length === 0) {
                    showNoResultsMessage(true);
                    alert('Please select at least one field or conference to search.');
                    return;
                }
                
                // Show loading status
                if (loading) loading.style.display = 'block';
                if (noResults) noResults.style.display = 'none';
                
                ensurePapersLoaded(conferences)
                    .then(data => {
                        allPapersData = data;
                        return data;
                    })
                    .then(data => {
                        const papers = data || [];
                        const keywords = searchTerm.split(' ').filter(k => k.trim() !== '');

                        const filteredPapers = papers.filter(paper => {
                            if (conferences.length > 0 && !conferences.includes(paper.conference)) {
                                return false;
                            }

                            const paperYear = parseInt(paper.year, 10);
                            const startYearInt = parseInt(startYear, 10);
                            const endYearInt = parseInt(endYear, 10);
                            if (paperYear < startYearInt || paperYear > endYearInt) {
                                return false;
                            }

                            if (keywords.length === 0) return true;
                            const titleLower = paper.title.toLowerCase();
                            return keywords.every(keyword => titleLower.includes(keyword.toLowerCase()));
                        });
                    
                    // 随机排序所有过滤后的论文
                    const shuffledPapers = [...filteredPapers].sort(() => 0.5 - Math.random());
                    
                    console.log('Filtered papers:', shuffledPapers.length);
                    
                    // 重置显示状态
                    resetDisplayState();
                    
                    // 存储所有过滤后的论文
                    allFilteredPapers = shuffledPapers;
                    
                    // 显示过滤后的论文
                    if (shuffledPapers.length > 0) {
                        // 计算总页数
                        totalPages = Math.ceil(shuffledPapers.length / papersPerPage);
                        currentPage = 1;
                        
                        // 显示第一页
                        displayCurrentPage();
                        
                        // 更新翻页控件
                        updatePaginationControls();
                        
                        // 显示翻页容器
                        if (paginationContainer) paginationContainer.style.display = 'block';
                        
                        // 更新统计信息
                        updatePapersStats();
                    } else {
                        showNoResultsMessage(true);
                    }
                })
                .catch(error => {
                    console.error('Error fetching papers:', error);
                    showNoResultsMessage(true);
                })
                .finally(() => {
                    if (loading) loading.style.display = 'none';
                });
            } else {
                showNoResultsMessage(true);
            }
        });
        
        // Support Enter key for search
        topicInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }

    // 翻页事件监听器
    function initializePaginationEvents() {
        // 上一页按钮
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', function() {
                if (currentPage > 1) {
                    goToPage(currentPage - 1);
                }
            });
        }

        // 下一页按钮
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', function() {
                if (currentPage < totalPages) {
                    goToPage(currentPage + 1);
                }
            });
        }

        // 页码输入框
        if (currentPageInput) {
            currentPageInput.addEventListener('change', function() {
                let page = parseInt(this.value);
                if (page >= 1 && page <= totalPages) {
                    goToPage(page);
                } else {
                    this.value = currentPage; // 恢复当前页码
                }
            });

            currentPageInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    let page = parseInt(this.value);
                    if (page >= 1 && page <= totalPages) {
                        goToPage(page);
                    } else {
                        this.value = currentPage; // 恢复当前页码
                    }
                }
            });
        }
    }

    // 跳转到指定页
    function goToPage(page) {
        if (page < 1 || page > totalPages) return;
        
        currentPage = page;
        displayCurrentPage();
        updatePaginationControls();
        
        // 滚动到顶部
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // 显示当前页的论文
    function displayCurrentPage() {
        const startIndex = (currentPage - 1) * papersPerPage;
        const endIndex = startIndex + papersPerPage;
        const currentPagePapers = allFilteredPapers.slice(startIndex, endIndex);
        
        displayPapers(currentPagePapers);
        updatePaginationSummary();
    }

    // 更新翻页控件状态
    function updatePaginationControls() {
        if (currentPageInput) currentPageInput.value = currentPage;
        if (totalPagesSpan) totalPagesSpan.textContent = totalPages;
        
        // 更新按钮状态
        if (prevPageBtn) {
            prevPageBtn.disabled = currentPage <= 1;
        }
        if (nextPageBtn) {
            nextPageBtn.disabled = currentPage >= totalPages;
        }
    }

    // 更新翻页摘要信息
    function updatePaginationSummary() {
        const startIndex = (currentPage - 1) * papersPerPage + 1;
        const endIndex = Math.min(currentPage * papersPerPage, allFilteredPapers.length);
        
        if (pageStartSpan) pageStartSpan.textContent = startIndex;
        if (pageEndSpan) pageEndSpan.textContent = endIndex;
        if (totalPapersPagination) totalPapersPagination.textContent = allFilteredPapers.length;
    }

    // Function to display papers
    function displayPapers(papers) {
        if (!papersList) return;
        
        if (papers.length === 0) {
            showNoResultsMessage();
            return;
        }
        
        if (loading) loading.style.display = 'none';
        if (noResults) noResults.style.display = 'none';
        
        // 设置列表视图为活动视图
        papersList.classList.add('view-active');
        papersList.style.display = 'table';
        
        // 清空现有内容（仅在初始加载时）
        const listTbody = papersList.querySelector('tbody');
        if (listTbody) listTbody.innerHTML = '';
        
        // 设置Copy All按钮
        setupCopyAllButton();
        
        // 添加论文到列表
        appendPapersToList(papers);
    }
    
        // 设置Copy All按钮
    function setupCopyAllButton() {
        const titleHeader = document.getElementById('title-header');
        if (titleHeader) {
            titleHeader.addEventListener('click', function() {
                // 获取当前页显示的论文
                const startIndex = (currentPage - 1) * papersPerPage;
                const endIndex = startIndex + papersPerPage;
                const currentPagePapers = allFilteredPapers.slice(startIndex, endIndex);
                
                // 格式化当前页显示的论文标题为要求的格式
                const formattedText = currentPagePapers.map(paper => 
                    `- ${paper.conference} ${paper.year} ${paper.title}`
                ).join('\n');
                
                console.log("Copying all text:", formattedText);
                
                // 使用现代Clipboard API复制
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(formattedText)
                        .then(() => {
                            console.log('All text copied successfully using Clipboard API');
                            showToast('已复制当前页标题');
                        })
                        .catch(err => {
                            console.error('Failed to copy using Clipboard API:', err);
                            // 尝试备用方法
                            copyUsingFallback(formattedText, this);
                        });
                } else {
                    // 使用备用方法
                    copyUsingFallback(formattedText, this);
                }
            });
        }
    }
    
    // 追加论文到列表（用于无限滚动）
    function appendPapersToList(papers) {
        if (!papersList || papers.length === 0) return;
        
        // 获取当前年份
        const currentYear = new Date().getFullYear();
        
        // 定义会议所属领域的映射
        const conferenceFieldMap = {
            // CV领域
            'cvpr': 'cv', 'iccv': 'cv', 'eccv': 'cv', 
            // ML领域
            'icml': 'ml', 'nips': 'ml', 'iclr': 'ml', 'neurips': 'ml',
            // AI领域 
            'aaai': 'ai', 'ijcai': 'ai', 'mm': 'ai'
        };
        
        // 计算标题的单词数（考虑连字符）
        function countWords(title) {
            // 将标题按空格分割成单词
            const words = title.split(/\s+/);
            // 计算总单词数，包括连字符分隔的部分
            let wordCount = 0;
            words.forEach(word => {
                // 检查单词中是否包含连字符
                if (word.includes('-')) {
                    // 按连字符分割并计算分割后的单词数
                    const hyphenatedParts = word.split('-').filter(part => part.length > 0);
                    wordCount += hyphenatedParts.length;
                } else {
                    // 普通单词计为1个
                    wordCount += 1;
                }
            });
            return wordCount;
        }
        
        // Sort papers by word count instead of character length
        papers.sort((a, b) => {
            const aWordCount = countWords(a.title);
            const bWordCount = countWords(b.title);
            return aWordCount - bWordCount;
        });
        
        const listTbody = papersList.querySelector('tbody');
        if (!listTbody) return;
        
        papers.forEach(paper => {
            // 确定会议所属领域
            const confLower = paper.conference.toLowerCase();
            const field = conferenceFieldMap[confLower] || 'ml';
            const conferenceClass = `${field}-conference`;
            
            // 确定年份类别
            const paperYear = parseInt(paper.year);
            const yearDiff = currentYear - paperYear;
            let yearClass = 'current-year';
            
            if (yearDiff === 1) {
                yearClass = 'year-1';
            } else if (yearDiff === 2) {
                yearClass = 'year-2';
            } else if (yearDiff === 3) {
                yearClass = 'year-3';
            } else if (yearDiff === 4) {
                yearClass = 'year-4';
            } else if (yearDiff === 5) {
                yearClass = 'year-5';
            } else if (yearDiff === 6) {
                yearClass = 'year-6';
            } else if (yearDiff === 7) {
                yearClass = 'year-7';
            } else if (yearDiff === 8) {
                yearClass = 'year-8';
            } else if (yearDiff === 9) {
                yearClass = 'year-9';
            } else if (yearDiff > 9) {
                yearClass = 'year-old';
            }
            
            // 列表视图
            const row = document.createElement('tr');
            
            // 创建会议单元格
            const confCell = document.createElement('td');
            const confBadge = document.createElement('span');
            confBadge.className = `conference-badge ${conferenceClass}`;
            confBadge.textContent = paper.conference;
            confCell.appendChild(confBadge);
            
            // 创建年份单元格
            const yearCell = document.createElement('td');
            const yearBadge = document.createElement('span');
            yearBadge.className = `year-badge ${yearClass}`;
            yearBadge.textContent = paper.year;
            yearCell.appendChild(yearBadge);
            
            // 创建标题单元格并高亮搜索词
            const titleCell = document.createElement('td');
            titleCell.className = 'list-paper-title tex2jax_process';
            titleCell.title = 'Click to copy: ' + paper.title;
            titleCell.style.cursor = 'pointer';
            
            // 高亮显示搜索词
            if (currentSearchTerm && currentSearchTerm.trim() !== '') {
                titleCell.innerHTML = highlightText(paper.title, currentSearchTerm);
            } else {
                titleCell.innerHTML = paper.title; // 使用innerHTML而不是textContent以支持LaTeX
            }
            
            // 添加点击复制功能
            titleCell.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                handleCopyTitleClick(this, paper.title);
            });
            
            // 将所有单元格添加到行
            row.appendChild(confCell);
            row.appendChild(yearCell);
            row.appendChild(titleCell);
            
            listTbody.appendChild(row);
        });
        
        // 重新渲染MathJax以显示数学公式
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([listTbody]).catch(function (err) {
                console.log('MathJax rendering error:', err.message);
            });
        }
    }

    // 轻提示（toast）
    function showToast(message) {
        const existing = document.getElementById('global-toast');
        const toast = existing || document.createElement('div');
        toast.id = 'global-toast';
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.left = '50%';
        toast.style.top = '20px';
        toast.style.transform = 'translateX(-50%)';
        toast.style.background = 'rgba(0,0,0,0.75)';
        toast.style.color = '#fff';
        toast.style.padding = '8px 14px';
        toast.style.borderRadius = '8px';
        toast.style.fontSize = '14px';
        toast.style.zIndex = '100000';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.2s ease';
        if (!existing) document.body.appendChild(toast);
        requestAnimationFrame(() => { toast.style.opacity = '1'; });
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
        }, 1200);
    }
    
    // 备用复制方法
    function copyUsingFallback(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        
        try {
            textArea.select();
            textArea.setSelectionRange(0, 99999);
            const successful = document.execCommand('copy');
            if (successful) {
                console.log('Text copied successfully using fallback method');
                showToast('已复制');
            } else {
                console.error('Fallback copy failed');
                alert('复制失败，请手动复制');
            }
        } catch (err) {
            console.error('Fallback copy error:', err);
            alert('复制失败，请手动复制');
        }
        
        document.body.removeChild(textArea);
    }

    // 存储领域和会议数据
    let conferencesData = {};
    let selectedConferences = {};
    let fieldsSelected = {
        'CV': true,
        'AI': false,
        'ML': true
    };
    
    // 全选/全不选功能
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const isChecked = this.checked;
            
            // 更新所有领域复选框
            fieldMainCheckboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
                checkbox.indeterminate = false;
                const field = checkbox.dataset.field;
                fieldsSelected[field] = isChecked;
                
                // 更新该领域下的所有会议复选框
                const dropdownContent = document.getElementById(`dropdown-${field}`);
                if (dropdownContent) {
                    const conferenceCheckboxes = dropdownContent.querySelectorAll('.conference-checkbox');
                    conferenceCheckboxes.forEach(confCheckbox => {
                        confCheckbox.checked = isChecked;
                        selectedConferences[confCheckbox.dataset.conference] = isChecked;
                    });
                }
            });
            
            console.log('All checkbox changed:', isChecked);
            console.log('Selected conferences:', Object.keys(selectedConferences).filter(c => selectedConferences[c]));
        });
    }
    
    // 领域复选框功能
    fieldMainCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function(e) {
            const field = this.dataset.field;
            const isChecked = this.checked;
            this.indeterminate = false; // 手动点击时清除部分选中状态
            fieldsSelected[field] = isChecked;
            
            // 更新该领域下的所有会议复选框
            const dropdownContent = document.getElementById(`dropdown-${field}`);
            if (dropdownContent) {
                const conferenceCheckboxes = dropdownContent.querySelectorAll('.conference-checkbox');
                conferenceCheckboxes.forEach(confCheckbox => {
                    confCheckbox.checked = isChecked;
                    selectedConferences[confCheckbox.dataset.conference] = isChecked;
                });
            }
            
            // 防止事件冒泡，避免触发下拉菜单
            e.stopPropagation();
            
            // 更新所有领域状态
            updateFieldCheckboxes();

            // 如果当前点击的是 All 复选框，直接触发全选/全不选逻辑
            if (field === 'All' && selectAllCheckbox) {
                selectAllCheckbox.checked = isChecked;
                selectAllCheckbox.indeterminate = false;

                fieldMainCheckboxes.forEach(fieldCheckbox => {
                    const targetField = fieldCheckbox.dataset.field;
                    if (targetField === 'All') return;

                    fieldCheckbox.checked = isChecked;
                    fieldCheckbox.indeterminate = false;
                    fieldsSelected[targetField] = isChecked;

                    const dropdownContent = document.getElementById(`dropdown-${targetField}`);
                    if (dropdownContent) {
                        const conferenceCheckboxes = dropdownContent.querySelectorAll('.conference-checkbox');
                        conferenceCheckboxes.forEach(confCheckbox => {
                            confCheckbox.checked = isChecked;
                            selectedConferences[confCheckbox.dataset.conference] = isChecked;
                        });
                    }
                });

                console.log('All checkbox toggled via field checkbox change:', isChecked);
                console.log('Selected conferences:', Object.keys(selectedConferences).filter(c => selectedConferences[c]));
                return;
            }
            
            console.log('Field checkbox changed:', field, isChecked);
            console.log('Selected conferences:', Object.keys(selectedConferences).filter(c => selectedConferences[c]));
        });
    });
    
    // 更新全选复选框状态
    function updateSelectAllCheckbox() {
        if (selectAllCheckbox) {
            const fields = ['CV', 'AI', 'ML'];
            const fieldCheckboxes = fields.map(field => 
                document.querySelector(`.field-main-checkbox[data-field="${field}"]`)
            ).filter(checkbox => checkbox !== null);
            
            // 计算选中和部分选中的数量
            let checkedCount = 0;
            let indeterminateCount = 0;
            
            fieldCheckboxes.forEach(checkbox => {
                if (checkbox.indeterminate) {
                    indeterminateCount++;
                } else if (checkbox.checked) {
                    checkedCount++;
                }
            });
            
            // 全部选中
            if (checkedCount === fieldCheckboxes.length) {
                selectAllCheckbox.checked = true;
                selectAllCheckbox.indeterminate = false;
            }
            // 全部未选中，且没有部分选中
            else if (checkedCount === 0 && indeterminateCount === 0) {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = false;
            }
            // 部分选中或至少有一个领域是部分选中
            else {
                selectAllCheckbox.indeterminate = true;
                selectAllCheckbox.checked = false;
            }
            
            console.log('All checkbox state updated:', { 
                checked: selectAllCheckbox.checked, 
                indeterminate: selectAllCheckbox.indeterminate,
                checkedFields: checkedCount,
                indeterminateFields: indeterminateCount,
                totalFields: fieldCheckboxes.length
            });
        }
    }
    
    // 更新会议复选框选择事件
    function updateConferenceCheckboxEvents() {
        document.querySelectorAll('.conference-checkbox').forEach(checkbox => {
            checkbox.removeEventListener('change', conferenceCheckboxChangeHandler);
            checkbox.addEventListener('change', conferenceCheckboxChangeHandler);
        });
    }
    
    // 更新领域复选框状态
    function updateFieldCheckboxes() {
        const fields = ['CV', 'AI', 'ML'];
        
        // 遍历每个领域
        fields.forEach(field => {
            const fieldCheckbox = document.querySelector(`.field-main-checkbox[data-field="${field}"]`);
            if (!fieldCheckbox) return;
            
            const dropdownContent = document.getElementById(`dropdown-${field}`);
            if (!dropdownContent) return;
            
            const conferenceCheckboxes = dropdownContent.querySelectorAll('.conference-checkbox');
            if (conferenceCheckboxes.length === 0) return;
            
            const checkedCount = Array.from(conferenceCheckboxes).filter(cb => cb.checked).length;
            
            // 完全选中
            if (checkedCount === conferenceCheckboxes.length) {
                fieldCheckbox.checked = true;
                fieldCheckbox.indeterminate = false;
                fieldsSelected[field] = true;
            } 
            // 完全不选中
            else if (checkedCount === 0) {
                fieldCheckbox.checked = false;
                fieldCheckbox.indeterminate = false;
                fieldsSelected[field] = false;
            } 
            // 部分选中
            else {
                fieldCheckbox.indeterminate = true;
                fieldCheckbox.checked = false;
                fieldsSelected[field] = true; // 即使部分选中，也视为选中状态
            }
        });
        
        // 更新全选框状态
        updateSelectAllCheckbox();
    }

    // 会议复选框变化处理函数
    function conferenceCheckboxChangeHandler(e) {
        const conf = this.dataset.conference;
        selectedConferences[conf] = this.checked;
        
        // 更新相应领域的选中状态
        updateFieldCheckboxes();
        
        // 防止事件冒泡
        e.stopPropagation();
        
        console.log('Conference selection updated:', conf, this.checked);
        console.log('Current selected conferences:', Object.keys(selectedConferences).filter(c => selectedConferences[c]));
    }

    console.log("Theme toggle loaded:", versionBadge); // 调试信息

    // 主题切换功能
    function setTheme(isDark) {
        console.log("Setting theme, dark mode:", isDark); // 调试信息
        if (isDark) {
            document.body.classList.add('dark-mode');
            if (toggleIcon) toggleIcon.textContent = '☀️';
        } else {
            document.body.classList.remove('dark-mode');
            if (toggleIcon) toggleIcon.textContent = '🌙';
        }
        localStorage.setItem('darkMode', isDark);
        console.log("Theme applied, body classes:", document.body.className); // 调试信息
    }

    // 检查保存的主题偏好
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    console.log("Saved dark mode preference:", savedDarkMode); // 调试信息
    
    // 检查系统是否首选暗模式
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log("System prefers dark mode:", prefersDarkMode); // 调试信息
    
    // 设置初始主题（优先级：保存的偏好 > 系统偏好）
    setTheme(savedDarkMode !== null ? savedDarkMode : prefersDarkMode);
    
    // 添加主题切换事件监听器
    if (versionBadge) {
        versionBadge.addEventListener('click', function() {
            const isDarkMode = document.body.classList.contains('dark-mode');
            setTheme(!isDarkMode);
        });
    }

    // 监听系统主题更改
    try {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            console.log("System theme changed:", e.matches); // 调试信息
            // 仅在用户未设置首选项时应用
            if (localStorage.getItem('darkMode') === null) {
                setTheme(e.matches);
            }
        });
    } catch (e) {
        console.log('Browser does not support matchMedia listener');
    }

    applyLanguage(currentLang);
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', function() {
            currentLang = currentLang === 'zh' ? 'en' : 'zh';
            localStorage.setItem('uiLang', currentLang);
            applyLanguage(currentLang);
        });
    }

    function ensureYearExistsInSelect(selectEl, year) {
        if (!selectEl || !Number.isFinite(year)) return;
        const yearStr = String(year);
        const exists = Array.from(selectEl.options).some(option => option.value === yearStr);
        if (!exists) {
            const option = document.createElement('option');
            option.value = yearStr;
            option.textContent = yearStr;
            selectEl.appendChild(option);
        }
    }

    function collectAvailableYears() {
        const years = new Set();
        [startYearSelect, endYearSelect].forEach(selectEl => {
            if (!selectEl) return;
            Array.from(selectEl.options).forEach(option => {
                const yearValue = parseInt(option.value, 10);
                if (Number.isFinite(yearValue)) {
                    years.add(yearValue);
                }
            });
        });
        years.add(currentYear);
        return Array.from(years).sort((a, b) => a - b);
    }

    function normalizeYearSelectOptions(selectEl, yearsDesc) {
        if (!selectEl || !Array.isArray(yearsDesc) || yearsDesc.length === 0) return;
        const selectedValue = selectEl.value;
        selectEl.innerHTML = '';
        yearsDesc.forEach(year => {
            const option = document.createElement('option');
            option.value = String(year);
            option.textContent = String(year);
            selectEl.appendChild(option);
        });
        if (yearsDesc.includes(parseInt(selectedValue, 10))) {
            selectEl.value = selectedValue;
        }
    }

    function rebuildYearSliderModel() {
        if (!startYearSelect || !endYearSelect) return;
        const years = collectAvailableYears();
        if (years.length === 0) return;

        years.forEach(year => {
            ensureYearExistsInSelect(startYearSelect, year);
            ensureYearExistsInSelect(endYearSelect, year);
        });
        const yearsDesc = [...years].sort((a, b) => b - a);
        normalizeYearSelectOptions(startYearSelect, yearsDesc);
        normalizeYearSelectOptions(endYearSelect, yearsDesc);

        availableYears = years;
        if (startYearRange && endYearRange) {
            const maxIndex = Math.max(availableYears.length - 1, 0);
            startYearRange.min = '0';
            startYearRange.max = String(maxIndex);
            startYearRange.step = '1';
            endYearRange.min = '0';
            endYearRange.max = String(maxIndex);
            endYearRange.step = '1';
        }
    }

    function yearToSliderIndex(year) {
        if (availableYears.length === 0) return 0;
        const exactIndex = availableYears.indexOf(year);
        if (exactIndex !== -1) return exactIndex;
        if (year <= availableYears[0]) return 0;
        if (year >= availableYears[availableYears.length - 1]) return availableYears.length - 1;
        for (let i = 1; i < availableYears.length; i++) {
            if (year < availableYears[i]) {
                return i - 1;
            }
        }
        return availableYears.length - 1;
    }

    function sliderIndexToYear(index) {
        if (availableYears.length === 0) return currentYear;
        const clampedIndex = Math.min(Math.max(index, 0), availableYears.length - 1);
        return availableYears[clampedIndex];
    }

    function clampSliderIndices(source = 'start') {
        if (!startYearRange || !endYearRange) return [0, 0, 0];
        const maxIndex = Math.max(availableYears.length - 1, 0);
        let startIndex = parseInt(startYearRange.value, 10);
        let endIndex = parseInt(endYearRange.value, 10);

        if (!Number.isFinite(startIndex)) startIndex = 0;
        if (!Number.isFinite(endIndex)) endIndex = maxIndex;

        startIndex = Math.min(Math.max(startIndex, 0), maxIndex);
        endIndex = Math.min(Math.max(endIndex, 0), maxIndex);

        if (startIndex > endIndex) {
            if (source === 'end') {
                startIndex = endIndex;
            } else {
                endIndex = startIndex;
            }
        }

        startYearRange.value = String(startIndex);
        endYearRange.value = String(endIndex);
        return [startIndex, endIndex, maxIndex];
    }

    function renderYearSlider(source = 'start') {
        if (!startYearRange || !endYearRange || !yearSliderFill) return;
        const [startIndex, endIndex, maxIndex] = clampSliderIndices(source);
        const startYear = sliderIndexToYear(startIndex);
        const endYear = sliderIndexToYear(endIndex);

        if (startYearValue) startYearValue.textContent = String(startYear);
        if (endYearValue) endYearValue.textContent = String(endYear);

        const startPct = maxIndex === 0 ? 0 : (startIndex / maxIndex) * 100;
        const endPct = maxIndex === 0 ? 100 : (endIndex / maxIndex) * 100;
        yearSliderFill.style.left = `${startPct}%`;
        yearSliderFill.style.width = `${Math.max(endPct - startPct, 0)}%`;

        if (startYearLabel) startYearLabel.style.left = `${startPct}%`;
        if (endYearLabel) endYearLabel.style.left = `${endPct}%`;
    }

    function syncYearSliderFromSelects() {
        if (!startYearSelect || !endYearSelect || !startYearRange || !endYearRange) return;
        rebuildYearSliderModel();
        if (availableYears.length === 0) return;

        let startYear = parseInt(startYearSelect.value, 10);
        let endYear = parseInt(endYearSelect.value, 10);

        if (!Number.isFinite(startYear)) startYear = availableYears[0];
        if (!Number.isFinite(endYear)) endYear = availableYears[availableYears.length - 1];

        if (startYear > endYear) {
            endYear = startYear;
            endYearSelect.value = String(endYear);
        }

        startYearRange.value = String(yearToSliderIndex(startYear));
        endYearRange.value = String(yearToSliderIndex(endYear));
        renderYearSlider();
    }

    function syncSelectsFromYearSlider(source = 'start') {
        if (!startYearSelect || !endYearSelect || !startYearRange || !endYearRange) return;
        rebuildYearSliderModel();
        if (availableYears.length === 0) return;

        const [startIndex, endIndex] = clampSliderIndices(source);
        const startYear = sliderIndexToYear(startIndex);
        const endYear = sliderIndexToYear(endIndex);

        isSyncingYearControls = true;
        startYearSelect.value = String(startYear);
        endYearSelect.value = String(endYear);
        isSyncingYearControls = false;

        renderYearSlider(source);
        updateRecentCheckboxState();
    }

    // 确保开始年份不大于结束年份
    function validateYearRange() {
        if (!startYearSelect || !endYearSelect) return;
        const startYear = parseInt(startYearSelect.value, 10);
        const endYear = parseInt(endYearSelect.value, 10);

        if (Number.isFinite(startYear) && Number.isFinite(endYear) && startYear > endYear) {
            endYearSelect.value = startYearSelect.value;
        }
    }
    
    // 添加年份选择事件
    if (startYearSelect && endYearSelect) {
        startYearSelect.addEventListener('change', function() {
            if (isSyncingYearControls) return;
            validateYearRange();
            syncYearSliderFromSelects();
            updateRecentCheckboxState();
        });
        endYearSelect.addEventListener('change', function() {
            if (isSyncingYearControls) return;
            validateYearRange();
            syncYearSliderFromSelects();
            updateRecentCheckboxState();
        });
    }

    if (startYearRange && endYearRange) {
        startYearRange.addEventListener('input', function() {
            syncSelectsFromYearSlider('start');
        });
        endYearRange.addEventListener('input', function() {
            syncSelectsFromYearSlider('end');
        });
    }
    
    // 处理“最近”复选框：选中后自动恢复到去年—今年
    function applyRecentRange() {
        const currentYear = new Date().getFullYear();
        if (!startYearSelect || !endYearSelect) return;
        startYearSelect.value = String(currentYear - 1);
        endYearSelect.value = String(currentYear);
        // 触发校验与UI更新
        validateYearRange();
        startYearSelect.dispatchEvent(new Event('change'));
        endYearSelect.dispatchEvent(new Event('change'));
        flashYearSelector();
        updateRecentCheckboxState();
    }

    function flashYearSelector() {
        const el = document.querySelector('.year-selector');
        if (!el) return;
        const original = el.style.boxShadow;
        const originalTransition = el.style.transition;
        el.style.transition = 'box-shadow 0.3s ease';
        el.style.boxShadow = '0 0 0 2px #3498db inset';
        setTimeout(() => {
            el.style.boxShadow = original || '';
            el.style.transition = originalTransition || '';
        }, 600);
    }

    // 计算“最近”应当对应的年份区间
    function computeRecentRange() {
        const currentYear = new Date().getFullYear();
        return [currentYear - 1, currentYear];
    }

    function isRecentRangeSelected() {
        if (!startYearSelect || !endYearSelect) return false;
        const [s, e] = computeRecentRange();
        return parseInt(startYearSelect.value, 10) === s && parseInt(endYearSelect.value, 10) === e;
    }

    function updateRecentCheckboxState() {
        if (!recentCheckbox) return;
        recentCheckbox.checked = isRecentRangeSelected();
    }

    if (recentCheckbox) {
        recentCheckbox.addEventListener('change', function() {
            if (this.checked) {
                applyRecentRange();
            }
            updateRecentCheckboxState();
        });
    }

    // 获取会议信息
    function fetchConferences() {
        fetch('conferences.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load conferences data');
                }
                return response.json();
            })
            .then(data => {
                conferencesData = data;
                initializeDropdowns(data.categories);
            })
            .catch(error => {
                console.error('Error fetching conferences:', error);
                // 如果加载失败，尝试使用默认会议数据
                const defaultCategories = {
                    "CV": {"cvpr": ["2023", "2024"], "eccv": ["2022", "2024"], "iccv": ["2023"]},
                    "AI": {"aaai": ["2023", "2024"], "ijcai": ["2023", "2024"], "mm": ["2023", "2024"]},
                    "ML": {"nips": ["2023", "2024"], "icml": ["2023", "2024"], "iclr": ["2023", "2024"]}
                };
                conferencesData = {
                    categories: defaultCategories,
                    recent_years: ["2020", "2021", "2022", "2023", "2024"]
                };
                initializeDropdowns(defaultCategories);
            });
    }
    
    // 初始化下拉菜单
    function initializeDropdowns(categories) {
        // 为每个领域设置会议选项
        const fields = ['CV', 'AI', 'ML'];
        
        fields.forEach(field => {
            if (categories[field]) {
                const dropdownContent = document.getElementById(`dropdown-${field}`);
                if (dropdownContent) {
                    const confs = categories[field];
                    dropdownContent.innerHTML = ''; // 清空现有内容
                    
                    const fieldDefaultSelected = fieldsSelected[field] === true;
                    
                    // 初始化会议默认选中状态
                    Object.keys(confs).forEach(conf => {
                        if (selectedConferences[conf] === undefined) {
                            selectedConferences[conf] = fieldDefaultSelected;
                        }
                    });
                    
                    // 创建会议选项
                    Object.keys(confs).forEach(conf => {
                        const option = document.createElement('div');
                        option.className = 'conference-option';
                        
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.className = 'conference-checkbox';
                        checkbox.dataset.conference = conf;
                        checkbox.checked = selectedConferences[conf]; // 使用储存的状态
                        
                        option.appendChild(checkbox);
                        option.appendChild(document.createTextNode(conf.toUpperCase()));
                        
                        // 点击选项文本也可以切换复选框
                        option.addEventListener('click', function(e) {
                            // 避免重复触发复选框自己的点击事件
                            if (e.target !== checkbox) {
                                checkbox.checked = !checkbox.checked;
                                selectedConferences[conf] = checkbox.checked;
                                
                                // 手动触发change事件
                                const changeEvent = new Event('change');
                                checkbox.dispatchEvent(changeEvent);
                                
                                // 防止事件冒泡导致下拉菜单关闭
                                e.stopPropagation();
                            }
                        });
                        
                        dropdownContent.appendChild(option);
                    });
                }
            }
        });
        
        // 调用更新会议复选框事件
        updateConferenceCheckboxEvents();
        
        // 设置下拉菜单的切换事件
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                const field = this.dataset.field;
                const dropdown = document.getElementById(`dropdown-${field}`);
                
                // 如果点击的是复选框，则不触发下拉菜单
                if (e.target.classList.contains('field-main-checkbox')) {
                    e.stopPropagation();
                    return;
                }
                
                // 关闭其他所有下拉菜单
                document.querySelectorAll('.dropdown-content').forEach(content => {
                    if (content !== dropdown && content.classList.contains('show')) {
                        content.classList.remove('show');
                    }
                });
                
                // 切换当前下拉菜单
                dropdown.classList.toggle('show');
            });
        });
        
        // 点击页面其他地方关闭所有下拉菜单
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.field-dropdown')) {
                document.querySelectorAll('.dropdown-content').forEach(content => {
                    content.classList.remove('show');
                });
            }
        });
        
        // 初始化所有复选框状态
        updateFieldCheckboxes();
    }

    // Function to copy text to clipboard
    function copyToClipboard(text) {
        // Fallback method for older browsers
        if (!navigator.clipboard) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed'; // Avoid scrolling to bottom
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                console.log('Fallback: Copying text successful');
            } catch (err) {
                console.error('Fallback: Could not copy text: ', err);
            }
            
            document.body.removeChild(textArea);
            return;
        }
        
        // Modern approach with Clipboard API
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log('Text copied to clipboard');
            })
            .catch(err => {
                console.error('Error copying text: ', err);
            });
    }

    // 标题点击复制：不替换文字，显示toast
    function handleCopyTitleClick(button, title) {
        copyToClipboard(title);
        showToast('已复制标题');
    }

    // Topic标签已移除，不再需要相关处理代码

    // 获取所有选择的会议
    function getSelectedConferences() {
        const selected = [];
        
        // 检查是否有任何会议被选中，无论领域状态
        let anyConferenceSelected = false;
        for (const conf in selectedConferences) {
            if (selectedConferences[conf]) {
                anyConferenceSelected = true;
                break;
            }
        }
        
        // 如果没有任何会议被选中，返回空数组
        if (!anyConferenceSelected) {
            return [];
        }
        
        // 获取所有选中的会议，无需检查领域状态
        for (const conf in selectedConferences) {
            if (selectedConferences[conf]) {
                selected.push(conf);
            }
        }
        
        return selected;
    }

    // 初始化页面
    fetchConferences(); // 获取会议数据
    showNoResultsMessage(false); // 默认显示无结果消息

    // Fix for references to non-existent elements
    document.querySelectorAll('.papers-table').forEach(element => {
        // This is just to ensure any potential references to papers-table don't cause errors
        // We're not using tables anymore, but this prevents errors from old code
    });

    // 更新年份选项（确保包含当前年份，并同步滑块）
    function updateYearOptions() {
        if (!startYearSelect || !endYearSelect) return;
        ensureYearExistsInSelect(startYearSelect, currentYear);
        ensureYearExistsInSelect(endYearSelect, currentYear);
        rebuildYearSliderModel();

        if (!Number.isFinite(parseInt(startYearSelect.value, 10))) {
            const fallbackStart = Math.max(currentYear - 1, availableYears[0] || currentYear);
            startYearSelect.value = String(fallbackStart);
        }
        if (!Number.isFinite(parseInt(endYearSelect.value, 10))) {
            endYearSelect.value = String(currentYear);
        }

        validateYearRange();
        syncYearSliderFromSelects();
    }

    // 设置最近三年
    function setRecentThreeYears() {
        if (!startYearSelect || !endYearSelect) return;
        const startYear = currentYear - 1;

        ensureYearExistsInSelect(startYearSelect, startYear);
        ensureYearExistsInSelect(endYearSelect, currentYear);
        startYearSelect.value = String(startYear);
        endYearSelect.value = String(currentYear);

        validateYearRange();
        syncYearSliderFromSelects();
        updateRecentCheckboxState();
    }

    // 设置全部年份
    function setAllYears() {
        if (!startYearSelect || !endYearSelect) return;
        rebuildYearSliderModel();
        if (availableYears.length === 0) return;

        startYearSelect.value = String(availableYears[0]);
        endYearSelect.value = String(availableYears[availableYears.length - 1]);

        validateYearRange();
        syncYearSliderFromSelects();
        updateRecentCheckboxState();
    }

    // 更新年份选项并初始化滑块状态
    updateYearOptions();
    // 首次加载默认锁定为“去年 -> 今年”，避免被静态selected年份覆盖
    setRecentThreeYears();
    // 初始化“最近”状态
    updateRecentCheckboxState();
    
    // 移除旧的Recent按钮逻辑（已由复选框替代）
    
    // 为"All Years"按钮添加点击事件
    const allYearsBtn = document.getElementById('all-years-btn');
    if (allYearsBtn) {
        allYearsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            setAllYears();
        });
    }

    // 添加移动端侧边栏切换功能
    function setupSidebarToggle() {
        // 移除侧边栏切换功能，使侧边栏始终显示
        const sidebar = document.querySelector('.sidebar');
        
        if (sidebar) {
            // 确保侧边栏不包含折叠类
            sidebar.classList.remove('collapsed');
        }
    }

    // 添加移动端适配支持
    function handleResponsiveLayout() {
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        
        // 可以在这里添加针对移动端的特定逻辑
        // 例如：调整卡片尺寸、简化UI等
        
        // 当在移动端时，点击搜索后滚动到论文区域
        if(isMobile) {
            const searchBtn = document.getElementById('search-btn');
            
            const scrollToPapers = () => {
                setTimeout(() => {
                    const paperContainer = document.querySelector('.paper-container');
                    if (paperContainer) {
                        paperContainer.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 300);
            };
            
            if(searchBtn) {
                searchBtn.addEventListener('click', scrollToPapers);
            }
        }
    }

    // 动态设置内容区域顶部内边距，避免固定顶栏遮挡
    function applyDynamicTopPadding() {
        const topBar = document.querySelector('.top-bar');
        const contentWrapper = document.querySelector('.content-wrapper');
        if (!topBar || !contentWrapper) return;
        const computedPos = window.getComputedStyle(topBar).position;
        if (computedPos === 'fixed') {
            const topBarHeight = topBar.offsetHeight || 0;
            contentWrapper.style.paddingTop = (topBarHeight + 8) + 'px';
        } else {
            // sticky/relative 情况不需要额外 padding
            contentWrapper.style.paddingTop = '';
        }
    }

    // 初始化时调用
    setupSidebarToggle();
    handleResponsiveLayout();
    applyDynamicTopPadding();

    // 监听窗口大小变化
    window.addEventListener('resize', function() {
        handleResponsiveLayout();
        renderConferenceTimeline();
        
        // 在窗口大小变化时，确保侧边栏始终可见
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.remove('collapsed');
        }
        applyDynamicTopPadding();
    });

    // 返回顶部按钮功能
    const backToTopBtn = document.getElementById('back-to-top');

    // 添加滚动监听器实现返回顶部按钮控制
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 控制返回顶部按钮的显示
        if (scrollTop > 300) {
            if (backToTopBtn) {
                backToTopBtn.style.display = 'flex';
            }
        } else {
            if (backToTopBtn) {
                backToTopBtn.style.display = 'none';
            }
        }
    });
    
    // 返回顶部按钮点击事件
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 初始化翻页事件监听器
    initializePaginationEvents();
    
    // 重置显示状态
    function resetDisplayState() {
        allFilteredPapers = [];
        currentPage = 1;
        totalPages = 0;
        
        // 隐藏翻页容器
        if (paginationContainer) paginationContainer.style.display = 'none';
        
        // 隐藏统计信息
        if (papersStats) papersStats.style.display = 'none';
    }
    
    // 更新统计信息
    function updatePapersStats() {
        if (!totalPapersCount) {
            return;
        }
        
        // 获取统计信息元素
        const displayedCount = document.getElementById('displayed-count');
        const totalCount = document.getElementById('total-count');
        
        const totalPapers = allFilteredPapers.length;
        // 计算当前页实际显示的论文数量
        const startIndex = (currentPage - 1) * papersPerPage + 1;
        const endIndex = Math.min(currentPage * papersPerPage, totalPapers);
        const currentDisplayed = endIndex - startIndex + 1;
        
        // 更新统计数字
        totalPapersCount.textContent = totalPapers;
        
        // 更新统计信息（如果存在）
        if (displayedCount) displayedCount.textContent = currentDisplayed;
        if (totalCount) totalCount.textContent = totalPapers;
        
        // 永远不显示统计信息区域，因为All按钮左边已经有统计信息了
        if (papersStats) papersStats.style.display = 'none';
    }
}); 

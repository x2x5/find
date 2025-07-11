document.addEventListener('DOMContentLoaded', function() {
    const papersList = document.getElementById('papers-list-view');
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('no-results');
    const themeToggle = document.getElementById('theme-toggle-input');
    const toggleIcon = document.querySelector('.toggle-icon');
    const searchBtn = document.getElementById('search-btn');
    const topicInput = document.getElementById('topic-input');
    const themeToggleContainer = document.querySelector('.theme-toggle-top');
    // Topic标签已移除
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    const startYearSelect = document.getElementById('start-year');
    const endYearSelect = document.getElementById('end-year');
    const fieldMainCheckboxes = document.querySelectorAll('.field-main-checkbox');
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    const loadMoreIndicator = document.getElementById('load-more-indicator');
    const loadingMore = document.getElementById('loading-more');
    const noMorePapers = document.getElementById('no-more-papers');
    
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

    // 无限滚动相关变量
    let allFilteredPapers = []; // 存储所有过滤后的论文
    let displayedPapers = []; // 存储当前显示的论文
    let currentPage = 0; // 当前页数
    const papersPerPage = 9; // 每页显示的论文数量
    let isLoading = false; // 是否正在加载
    let hasMorePapers = true; // 是否还有更多论文

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
        // 全局变量存储所有论文数据
        let allPapersData = null;
        
        // 加载所有论文数据
        function loadAllPapers() {
            return fetch('papers.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to load papers data');
                    }
                    return response.json();
                })
                .then(data => {
                    allPapersData = data;
                    return data;
                });
        }
        
        // 加载所有论文数据
        loadAllPapers().catch(error => {
            console.error('Error loading papers data:', error);
        });
        
        searchBtn.addEventListener('click', function() {
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
                
                // 检查是否已加载论文数据
                const papersPromise = allPapersData ? Promise.resolve(allPapersData) : loadAllPapers();
                
                papersPromise.then(data => {
                    // 在客户端过滤论文
                    const papers = data.papers || [];
                    
                    // 将搜索词分割成关键词数组
                    const keywords = searchTerm.split(' ').filter(k => k.trim() !== '');
                    
                    // 根据条件过滤论文
                    const filteredPapers = papers.filter(paper => {
                        // 检查会议
                        if (conferences.length > 0 && !conferences.includes(paper.conference)) {
                            return false;
                        }
                        
                        // 检查年份
                        const paperYear = parseInt(paper.year);
                        const startYearInt = parseInt(startYear);
                        const endYearInt = parseInt(endYear);
                        if (paperYear < startYearInt || paperYear > endYearInt) {
                            return false;
                        }
                        
                        // 检查标题是否包含所有关键词
                        const titleLower = paper.title.toLowerCase();
                        return keywords.every(keyword => 
                            titleLower.includes(keyword.toLowerCase())
                        );
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
                        // 初始显示第一批论文
                        const initialPapers = shuffledPapers.slice(0, papersPerPage);
                        displayedPapers = initialPapers;
                        displayPapers(initialPapers);
                        currentPage = 1;
                        
                        // 更新统计信息
                        updatePapersStats();
                        
                        // 如果还有更多论文，显示加载指示器
                        if (shuffledPapers.length > papersPerPage) {
                            hasMorePapers = true;
                            if (loadMoreIndicator) loadMoreIndicator.style.display = 'block';
                        } else {
                            hasMorePapers = false;
                        }
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
        const headerRow = papersList.querySelector('thead tr');
        if (headerRow) {
            const copyAllCell = headerRow.querySelector('th:last-child');
            if (copyAllCell) {
                // 创建Copy All按钮
                while (copyAllCell.firstChild) {
                    copyAllCell.removeChild(copyAllCell.firstChild);
                }
                
                const copyAllBtn = document.createElement('button');
                copyAllBtn.className = 'list-copy-button copy-all-button';
                copyAllBtn.innerHTML = '<i class="fas fa-copy"></i> ALL';
                copyAllBtn.addEventListener('click', function() {
                    // 格式化所有显示的论文标题为要求的格式
                    const formattedText = displayedPapers.map(paper => 
                        `- ${paper.conference} ${paper.year} ${paper.title}`
                    ).join('\n');
                    
                    console.log("Copying text:", formattedText);
                    
                    // 使用现代Clipboard API复制
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(formattedText)
                            .then(() => {
                                console.log('Text copied successfully using Clipboard API');
                                showCopySuccess(this);
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
                
                // 添加按钮到表头
                copyAllCell.appendChild(copyAllBtn);
            }
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
            'aaai': 'ai', 'ijcai': 'ai', 'acl': 'ai', 'naacl': 'ai', 'emnlp': 'ai',
            // 默认为Other
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
            const field = conferenceFieldMap[confLower] || 'other';
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
            titleCell.className = 'list-paper-title';
            titleCell.title = paper.title;
            
            // 高亮显示搜索词
            if (currentSearchTerm && currentSearchTerm.trim() !== '') {
                titleCell.innerHTML = highlightText(paper.title, currentSearchTerm);
            } else {
                titleCell.textContent = paper.title;
            }
            
            // 创建操作单元格
            const actionCell = document.createElement('td');
            const copyBtn = document.createElement('button');
            copyBtn.className = 'list-copy-button';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            copyBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                handleCopyButtonClick(this, paper.title);
            });
            actionCell.appendChild(copyBtn);
            
            // 将所有单元格添加到行
            row.appendChild(confCell);
            row.appendChild(yearCell);
            row.appendChild(titleCell);
            row.appendChild(actionCell);
            
            listTbody.appendChild(row);
        });
    }

    // 显示复制成功的UI反馈
    function showCopySuccess(button) {
        button.classList.add('copy-success');
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copy-success');
        }, 2000);
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
                showCopySuccess(button);
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
        'AI': true,
        'ML': true,
        'Other': true
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
            
            console.log('Field checkbox changed:', field, isChecked);
            console.log('Selected conferences:', Object.keys(selectedConferences).filter(c => selectedConferences[c]));
        });
    });
    
    // 更新全选复选框状态
    function updateSelectAllCheckbox() {
        if (selectAllCheckbox) {
            const fields = ['CV', 'AI', 'ML', 'Other'];
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
        const fields = ['CV', 'AI', 'ML', 'Other'];
        
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

    console.log("Theme toggle loaded:", themeToggle); // 调试信息

    // 主题切换功能
    function setTheme(isDark) {
        console.log("Setting theme, dark mode:", isDark); // 调试信息
        if (isDark) {
            document.body.classList.add('dark-mode');
            if (toggleIcon) toggleIcon.textContent = '☀️';
            if (themeToggle) themeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            if (toggleIcon) toggleIcon.textContent = '🌙';
            if (themeToggle) themeToggle.checked = false;
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
    if (themeToggleContainer) {
        themeToggleContainer.addEventListener('click', function(e) {
            console.log("Theme toggle container clicked!"); // 调试信息
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

    // 确保开始年份不大于结束年份
    function validateYearRange() {
        const startYear = parseInt(startYearSelect.value);
        const endYear = parseInt(endYearSelect.value);
        
        if (startYear > endYear) {
            endYearSelect.value = startYearSelect.value;
        }
    }
    
    // 添加年份选择事件
    if (startYearSelect && endYearSelect) {
        startYearSelect.addEventListener('change', validateYearRange);
        endYearSelect.addEventListener('change', validateYearRange);
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
        const fields = ['CV', 'AI', 'ML', 'Other'];
        
        fields.forEach(field => {
            if (categories[field]) {
                const dropdownContent = document.getElementById(`dropdown-${field}`);
                if (dropdownContent) {
                    const confs = categories[field];
                    dropdownContent.innerHTML = ''; // 清空现有内容
                    
                    // 初始化所有会议为选中状态
                    Object.keys(confs).forEach(conf => {
                        if (selectedConferences[conf] === undefined) {
                            selectedConferences[conf] = true;
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

    // Function to handle the copy button UI feedback
    function handleCopyButtonClick(button, title) {
        // Copy the title to clipboard
        copyToClipboard(title);
        
        // Change button style to show success
        button.classList.add('copy-success');
        
        // Change button text and icon temporarily
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        
        // Reset button after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copy-success');
        }, 2000);
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

    // 获取当前年份
    const currentYear = new Date().getFullYear();

    // 更新年份下拉框选项
    function updateYearOptions() {
        // 更新结束年份选项，确保包含当前年份
        const endYearSelect = document.getElementById('end-year');
        const options = endYearSelect.options;
        
        // 检查是否需要更新选项
        let maxYear = 0;
        for (let i = 0; i < options.length; i++) {
            const yearValue = parseInt(options[i].value);
            maxYear = Math.max(maxYear, yearValue);
        }
        
        // 如果当前年份大于最大年份，添加新选项
        if (currentYear > maxYear) {
            for (let year = maxYear + 1; year <= currentYear; year++) {
                const option = document.createElement('option');
                option.value = year.toString();
                option.textContent = year.toString();
                endYearSelect.appendChild(option);
            }
        }
        
        // 默认选择当前年份作为结束年份
        for (let i = 0; i < options.length; i++) {
            if (options[i].value === currentYear.toString()) {
                options[i].selected = true;
                break;
            }
        }
    }

    // 设置最近三年
    function setRecentThreeYears() {
        const startYearSelect = document.getElementById('start-year');
        const endYearSelect = document.getElementById('end-year');
        
        // 设置开始年份为当前年份减2
        const startYear = currentYear - 2;
        for (let i = 0; i < startYearSelect.options.length; i++) {
            if (startYearSelect.options[i].value === startYear.toString()) {
                startYearSelect.options[i].selected = true;
                break;
            }
        }
        
        // 设置结束年份为当前年份
        for (let i = 0; i < endYearSelect.options.length; i++) {
            if (endYearSelect.options[i].value === currentYear.toString()) {
                endYearSelect.options[i].selected = true;
                break;
            }
        }
        
        // 修复：确保选择框视觉上更新
        startYearSelect.dispatchEvent(new Event('change'));
        endYearSelect.dispatchEvent(new Event('change'));
    }

    // 设置全部年份
    function setAllYears() {
        const startYearSelect = document.getElementById('start-year');
        const endYearSelect = document.getElementById('end-year');
        
        // 设置开始年份为最早的年份选项
        if (startYearSelect.options.length > 0) {
            startYearSelect.options[0].selected = true;
        }
        
        // 设置结束年份为当前年份
        for (let i = 0; i < endYearSelect.options.length; i++) {
            if (endYearSelect.options[i].value === currentYear.toString()) {
                endYearSelect.options[i].selected = true;
                break;
            }
        }
        
        // 确保选择框视觉上更新
        startYearSelect.dispatchEvent(new Event('change'));
        endYearSelect.dispatchEvent(new Event('change'));
    }

    // 更新年份选项
    updateYearOptions();
    
    // 为"Recent Years"按钮添加点击事件
    const recentYearsBtn = document.getElementById('recent-years-btn');
    if (recentYearsBtn) {
        recentYearsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            setRecentThreeYears();
        });
    }
    
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

    // 初始化时调用
    setupSidebarToggle();
    handleResponsiveLayout();

    // 监听窗口大小变化
    window.addEventListener('resize', function() {
        handleResponsiveLayout();
        
        // 在窗口大小变化时，确保侧边栏始终可见
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.remove('collapsed');
        }
    });

    // 返回顶部按钮功能
    const backToTopBtn = document.getElementById('back-to-top');

    // 添加滚动监听器实现无限滚动和返回顶部按钮控制
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
        
        // 无限滚动逻辑
        if (isLoading || !hasMorePapers || allFilteredPapers.length === 0) {
            return;
        }
        
        // 检查是否滚动到页面底部附近
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // 当距离底部还有200px时开始加载
        if (scrollTop + windowHeight >= documentHeight - 200) {
            loadMorePapers();
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

    // 加载更多论文
    function loadMorePapers() {
        if (isLoading || !hasMorePapers) {
            return;
        }
        
        isLoading = true;
        
        // 显示加载指示器
        if (loadMoreIndicator) loadMoreIndicator.style.display = 'block';
        if (loadingMore) loadingMore.style.display = 'block';
        if (noMorePapers) noMorePapers.style.display = 'none';
        
        // 模拟加载延迟
        setTimeout(() => {
            const startIndex = currentPage * papersPerPage;
            const endIndex = startIndex + papersPerPage;
            const newPapers = allFilteredPapers.slice(startIndex, endIndex);
            
            if (newPapers.length > 0) {
                displayedPapers = displayedPapers.concat(newPapers);
                appendPapersToList(newPapers);
                currentPage++;
                
                // 更新统计信息
                updatePapersStats();
                
                // 检查是否还有更多论文
                if (endIndex >= allFilteredPapers.length) {
                    hasMorePapers = false;
                    if (loadingMore) loadingMore.style.display = 'none';
                    if (noMorePapers) noMorePapers.style.display = 'block';
                }
            } else {
                hasMorePapers = false;
                if (loadingMore) loadingMore.style.display = 'none';
                if (noMorePapers) noMorePapers.style.display = 'block';
            }
            
            isLoading = false;
            
            // 如果没有更多论文，隐藏加载指示器
            if (!hasMorePapers && newPapers.length === 0) {
                if (loadMoreIndicator) loadMoreIndicator.style.display = 'none';
            }
        }, 500); // 500ms延迟以提供更好的用户体验
    }
    
    // 重置显示状态
    function resetDisplayState() {
        allFilteredPapers = [];
        displayedPapers = [];
        currentPage = 0;
        isLoading = false;
        hasMorePapers = true;
        
        // 隐藏加载指示器
        if (loadMoreIndicator) loadMoreIndicator.style.display = 'none';
        if (loadingMore) loadingMore.style.display = 'none';
        if (noMorePapers) noMorePapers.style.display = 'none';
        
        // 隐藏统计信息
        if (papersStats) papersStats.style.display = 'none';
    }
    
    // 更新统计信息
    function updatePapersStats() {
        if (!papersStats || !totalPapersCount) {
            return;
        }
        
        // 获取内联统计信息元素
        const displayedCountInline = document.getElementById('displayed-count-inline');
        const totalCountInline = document.getElementById('total-count-inline');
        const displayedCount = document.getElementById('displayed-count');
        const totalCount = document.getElementById('total-count');
        
        const totalPapers = allFilteredPapers.length;
        const currentDisplayed = displayedPapers.length;
        
        // 更新统计数字
        totalPapersCount.textContent = totalPapers;
        
        // 更新内联统计信息
        if (displayedCountInline) displayedCountInline.textContent = currentDisplayed;
        if (totalCountInline) totalCountInline.textContent = totalPapers;
        
        // 更新原有统计信息（如果存在）
        if (displayedCount) displayedCount.textContent = currentDisplayed;
        if (totalCount) totalCount.textContent = totalPapers;
        
        // 永远不显示统计信息区域，因为All按钮左边已经有统计信息了
        papersStats.style.display = 'none';
    }
}); 
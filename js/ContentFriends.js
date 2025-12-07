// ==========================================
// 1. CONFIG & CACHE
// ==========================================
const CONFIG = {
    cfBaseUrl: "https://codeforces.com",
    apiBaseUrl: "https://codeforces.com/api",
    baseDelay: 1500, 
    randomJitter: 500,
    batchSize: 10, 
    batchRestTime: 4000 
};

const CODE_CACHE = new Map();

const Utils = {
    getRandomInt: (min, max) => Math.floor(Math.random() * (max - min + 1) + min),
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    humanSleep: async () => {
        const jitter = Utils.getRandomInt(0, CONFIG.randomJitter);
        await Utils.sleep(CONFIG.baseDelay + jitter);
    },
    getProblemIdFromUrl: () => {
        const url = new URL(window.location.href);
        const path = url.pathname.split('/');
        return path[path.length - 1];
    },
    getContestIdFromUrl: () => {
        const url = new URL(window.location.href);
        const path = url.pathname.split('/');
        if (path.includes('contest')) return path[path.indexOf('contest') + 1];
        if (path.includes('problemset')) return path[path.indexOf('problemset') + 2];
        return null;
    },
    getPrettifyClass: (cfLanguageString) => {
        if (!cfLanguageString) return '';
        const s = cfLanguageString.toLowerCase();
        if (s.includes('c++')) return 'lang-cpp';
        if (s.includes('java') && !s.includes('script')) return 'lang-java';
        if (s.includes('python') || s.includes('pypy')) return 'lang-py';
        if (s.includes('c#') || s.includes('mono')) return 'lang-cs';
        return '';
    }
};

// ==========================================
// 2. UI MANIPULATION
// ==========================================
const UI = {
    sidebarId: 'sidebar',
    pageContentId: 'pageContent',
    modalId: 'cf_friends_modal',
    listContainerId: 'cf_friends_list_container',
    progressFillId: 'cf_progress_fill',
    progressTextId: 'cf_progress_text',

    init: () => {
        UI.injectSidebarBox();
        UI.injectModal();
        UI.setupEventListeners();
    },

    injectSidebarBox: () => {
        const sidebar = document.getElementById(UI.sidebarId);
        if (!sidebar) return;
        const boxHtml = `
            <div class="roundbox sidebox sidebar-menu borderTopRound">
                <div class="caption titled">→ Accepted Codes of Friends</div>
                <div><ul><li><span>
                    <span id="showCodeButton" class="sidebar-link">Show Codes</span>
                </span></li></ul></div>
            </div>`;
        sidebar.insertAdjacentHTML('beforeend', boxHtml);
    },

    injectModal: () => {
        const pageContent = document.getElementById(UI.pageContentId);
        if (!pageContent) return;
        const modalHtml = `
            <div id="${UI.modalId}" class="modal">
                <div class="modalContent">
                    <span class="modalClose">&times;</span>
                    <div class="modalHeaderContainer">
                        <div class="modalCodeHeader">→ Accepted Codes of Friends</div>
                        <div class="progress-info" id="${UI.progressTextId}">Initializing...</div>
                        <div class="progress-track">
                            <div class="progress-fill" id="${UI.progressFillId}"></div>
                        </div>
                    </div>
                    <div id="${UI.listContainerId}"></div>
                </div>
            </div>`;
        pageContent.insertAdjacentHTML('beforeend', modalHtml);
    },

    setupEventListeners: () => {
        const modal = document.getElementById(UI.modalId);
        const btn = document.getElementById("showCodeButton");
        const span = document.getElementsByClassName("modalClose")[0];
        const listContainer = document.getElementById(UI.listContainerId);

        if (btn) btn.onclick = () => modal.style.display = "block";
        if (span) span.onclick = () => modal.style.display = "none";
        window.onclick = (event) => {
            if (event.target == modal) modal.style.display = "none";
        };

        // EVENT DELEGATION FOR ACCORDION
        if (listContainer) {
            listContainer.addEventListener('click', (e) => {
                
                // 1. Check if user clicked the PROFILE LINK
                if (e.target.closest('.friend-profile-link')) {
                    // Allow default link behavior (opening new tab), 
                    // but STOP propagation so the accordion doesn't toggle.
                    e.stopPropagation(); 
                    return;
                }

                // 2. Check if user clicked the ROW (Header)
                const header = e.target.closest('.accordion-header');
                if (header) {
                    const { submissionId, contestId, language } = header.dataset;
                    UI.toggleCode(submissionId, contestId, language, header);
                }
            });
        }
    },

    updateProgress: (current, total) => {
        const textEl = document.getElementById(UI.progressTextId);
        const fillEl = document.getElementById(UI.progressFillId);
        if (textEl && fillEl) {
            const percentage = Math.floor((current / total) * 100);
            textEl.innerText = `Checking friends: ${current} / ${total}`;
            fillEl.style.width = `${percentage}%`;
            if (current === total) {
                textEl.innerText = `Done! Checked ${total} friends.`;
                fillEl.style.backgroundColor = "#00a65a"; 
            }
        }
    },

    addFriendToList: (friendObj, contestId, submissionId, language) => {
        const listContainer = document.getElementById(UI.listContainerId);
        const uniqueId = `sub-${submissionId}`;

        const html = `
            <div class="accordion-item">
                <div class="accordion-header" 
                     data-submission-id="${submissionId}" 
                     data-contest-id="${contestId}" 
                     data-language="${language}">
                     
                    <a href="${CONFIG.cfBaseUrl}/profile/${friendObj.handle}" 
                       class="friend-name friend-profile-link ${friendObj.cssClass}" 
                       target="_blank">
                       ${friendObj.handle}
                    </a>

                    <span class="friend-status-info">
                        ${language} 
                        <span style="font-size: 0.8rem; opacity: 0.6;">▼</span>
                    </span>
                </div>
                <div id="${uniqueId}" class="accordion-content">
                    </div>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', html);
    },

    toggleCode: async (submissionId, contestId, language, headerElement) => {
        const contentDiv = document.getElementById(`sub-${submissionId}`);
        const isClosed = contentDiv.style.display === '' || contentDiv.style.display === 'none';

        if (isClosed) {
            contentDiv.style.display = 'block';
            headerElement.classList.add('active');
            if (contentDiv.innerHTML.trim() === "") {
                await UI.loadCodeIntoDiv(contentDiv, submissionId, contestId, language);
            }
        } else {
            contentDiv.style.display = 'none';
            headerElement.classList.remove('active');
        }
    },

    loadCodeIntoDiv: async (containerDiv, submissionId, contestId, language) => {
        containerDiv.innerHTML = `<div class="loading-spinner">Fetching Code...</div>`;
        
        let cached = CODE_CACHE.get(submissionId);
        let result;

        // 1. Check Cache
        if (cached) {
            result = { status: "OK", content: cached };
        } else {
            // 2. Fetch Fresh
            result = await API.fetchCode(contestId, submissionId);
            if (result.status === "OK") {
                CODE_CACHE.set(submissionId, result.content);
            }
        }

        // Case 1: Success
        if (result.status === "OK") {
            UI.renderCode(containerDiv, result.content, language, submissionId, contestId);
            return;
        }

        // Case 2: Not Logged In (Session Expired) -> WITH RETRY
        if (result.status === "AUTH_ERROR") {
            const uniqueBtnId = `retry-btn-${submissionId}`;
            
            containerDiv.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #e06c75; background: #fff0f0; border: 1px solid #ffcccc; border-radius: 6px;">
                    <strong>Session Expired</strong><br>
                    <span style="font-size: 0.9em; color: #666; display:block; margin: 5px 0 15px 0;">
                        Please login to view solutions, then click Retry.
                    </span>
                    
                    <div style="display: flex; justify-content: center; gap: 10px;">
                        <a href="https://codeforces.com/enter" target="_blank" 
                           style="background: #0054aa; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 0.9em; border: 1px solid #004080;">
                           Login ↗
                        </a>
                        
                        <button id="${uniqueBtnId}" 
                           style="background: #fff; color: #333; padding: 6px 12px; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; font-weight: bold; font-size: 0.9em;">
                           ↻ Retry
                        </button>
                    </div>
                </div>`;

            // CRITICAL: Attach event listener dynamically (Content Scripts cannot use inline onclick)
            const retryBtn = document.getElementById(uniqueBtnId);
            if (retryBtn) {
                retryBtn.onclick = (e) => {
                    e.stopPropagation(); // Prevent accordion from toggling
                    // Recursive call to try again
                    UI.loadCodeIntoDiv(containerDiv, submissionId, contestId, language);
                };
            }
            return;
        }

        // Case 3: Submission Hidden
        if (result.status === "LOCKED_ERROR") {
            containerDiv.innerHTML = `
                <div style="padding: 20px; color: #888; text-align: center; background: #f8f9fa; border-radius: 6px;">
                    <strong>Restricted Access</strong><br>
                    <span style="font-size: 0.9em;">
                        This user has hidden their submissions or this is a private contest.
                    </span>
                </div>`;
            return;
        }

        // Case 4: Generic/Network Error
        const originalLink = `${CONFIG.cfBaseUrl}/contest/${contestId}/submission/${submissionId}`;
        containerDiv.innerHTML = `
            <div style="padding: 20px; color: #666; text-align: center;">
                Unable to fetch automatically.<br>
                <a href="${originalLink}" target="_blank" style="color: #0054aa; font-weight: bold; font-size: 0.9em;">
                    View original submission ↗
                </a>
            </div>`;
    },

    renderCode: (containerDiv, code, langClass, submissionId, contestId) => {
        const submissionUrl = `${CONFIG.cfBaseUrl}/contest/${contestId}/submission/${submissionId}`;

        const submissionLink = `
            <div style="padding: 8px 20px; background:#f8f9fa; border-bottom:1px solid #eee; text-align:right;">
                <a href="${submissionUrl}" target="_blank" style="color:#0054aa; font-weight:bold; text-decoration:none; font-size: 0.9rem;">
                    View original submission ↗
                </a>
            </div>`;

        containerDiv.innerHTML = `
            ${submissionLink}
            <pre class="prettyprint ${langClass}">${code}</pre>
        `;
        
        if (typeof PR !== 'undefined' && PR.prettyPrint) {
            PR.prettyPrint();
        } else if (window.PR && window.PR.prettyPrint) {
            window.PR.prettyPrint();
        }
    }
};

// ==========================================
// 3. API LAYER
// ==========================================
const API = {
    getFriendsList: async () => {
        try {
            const res = await fetch(`${CONFIG.cfBaseUrl}/friends`);
            const html = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const friendsElements = Array.from(doc.querySelectorAll('.datatable .rated-user'));
            return friendsElements.map(el => ({
                handle: el.innerText.trim(),
                cssClass: el.className 
            }));
        } catch (err) { return []; }
    },

    getSubmissionData: async (contestId, problemId, handle) => {
        try {
            const url = `${CONFIG.apiBaseUrl}/contest.status?contestId=${contestId}&handle=${handle}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.status === "OK" && data.result) {
                const accepted = data.result.find(sub => 
                    sub.contestId == contestId && 
                    sub.problem.index == problemId && 
                    sub.verdict === "OK"
                );
                if (accepted) {
                    return { id: accepted.id, language: accepted.programmingLanguage };
                }
            }
            return null;
        } catch (err) { return null; }
    },

    fetchCode: async (contestId, submissionId) => {
        try {
            await Utils.sleep(200);
            const url = `${CONFIG.cfBaseUrl}/contest/${contestId}/submission/${submissionId}`;
            const res = await fetch(url);

            // Check for Redirects (Home screen or Login screen)
            if (res.redirected) {
                const newUrl = new URL(res.url);
                if (newUrl.pathname === '/' || newUrl.pathname.includes('/enter')) {
                    return { status: "AUTH_ERROR" };
                }
            }

            const text = await res.text();

            const match = text.match(/<pre[^>]*id="program-source-text"[^>]*>(.*?)<\/pre>/s);
            if (match && match[1]) {
                return { status: "OK", content: match[1] };
            }

            // Check for specific indicators that user is NOT logged in
            if (text.includes('href="/enter?back') || text.includes('class="register-link"')) {
                return { status: "AUTH_ERROR" };
            }

            // If user is logged in (no register link) but code is missing,
            // it means the submission is explicitly hidden/locked by the friend.
            return { status: "LOCKED_ERROR" };

        } catch (e) { 
            console.error("Fetch Error:", e);
            return { status: "GENERIC_ERROR" }; 
        }
    }
};

// ==========================================
// 4. MAIN LOGIC
// ==========================================
async function initExtension() {
    const contestId = Utils.getContestIdFromUrl();
    const problemId = Utils.getProblemIdFromUrl();
    if (!contestId || !problemId) return;

    UI.init();

    const friends = await API.getFriendsList();
    if (friends.length === 0) {
        UI.updateProgress(0, 0);
        document.getElementById(UI.progressTextId).innerText = "No friends found.";
        return;
    }

    friends.sort(() => Math.random() - 0.5);
    const totalFriends = friends.length;
    UI.updateProgress(0, totalFriends);

    let checkedCount = 0;

    for (const friend of friends) {
        if (checkedCount > 0 && checkedCount % CONFIG.batchSize === 0) {
            await Utils.sleep(CONFIG.batchRestTime);
        } else {
            await Utils.humanSleep();
        }

        const submissionData = await API.getSubmissionData(contestId, problemId, friend.handle);

        if (submissionData) {
            UI.addFriendToList(friend, contestId, submissionData.id, submissionData.language);
        }

        checkedCount++;
        UI.updateProgress(checkedCount, totalFriends);
    }
}

initExtension();
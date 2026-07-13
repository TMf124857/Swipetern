// Swipetern Frontend Core Application state & routing

class SwipeternApp {
    constructor() {
        this.token = localStorage.getItem("token") || null;
        this.user = JSON.parse(localStorage.getItem("user")) || null;
        this.profile = JSON.parse(localStorage.getItem("profile")) || null;

        this.currentTab = "discovery";
        this.discoveryCards = [];
        this.currentCardIndex = 0;

        this.matches = [];
        this.activeMatchId = null;
        this.chatMessages = [];
        this.chatInterval = null;
        this.complianceInterval = null;

        this.authTab = "login"; // login or register
    }

    // Initialize the Application on page load
    async init() {
        console.log("Initializing Swipetern...");
        if (this.token) {
            await this.fetchMe();
        } else {
            this.showScreen("welcome");
        }
    }

    // Setup network request headers
    getHeaders() {
        const headers = {
            "Content-Type": "application/json"
        };
        if (this.token) {
            headers["Authorization"] = `Bearer ${this.token}`;
        }
        return headers;
    }

    // Central HTTP Request handler with error handling
    async request(url, options = {}) {
        this.showSpinner(true);
        this.hideError();

        options.headers = Object.assign(this.getHeaders(), options.headers || {});

        try {
            const res = await fetch(url, options);
            if (res.status === 401) {
                // Unauthorized -> Logout
                this.logout();
                throw new Error("Session expired. Please log in again.");
            }

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || "Something went wrong.");
            }
            return data;
        } catch (err) {
            console.error("HTTP Error:", err);
            this.showError(err.message);
            throw err;
        } finally {
            this.showSpinner(false);
        }
    }

    // Show/Hide global loading spinner
    showSpinner(show) {
        const spinner = document.getElementById("global-spinner");
        if (spinner) {
            if (show) spinner.classList.remove("hidden");
            else spinner.classList.add("hidden");
        }
    }

    // Toast notifications
    showToast(msg) {
        const toast = document.getElementById("toast");
        const toastMsg = document.getElementById("toast-message");
        if (toast && toastMsg) {
            toastMsg.innerText = msg;
            toast.classList.remove("hidden");
            setTimeout(() => {
                toast.classList.remove("opacity-0", "translate-y-[-20px]");
            }, 50);

            setTimeout(() => {
                toast.classList.add("opacity-0", "translate-y-[-20px]");
                setTimeout(() => {
                    toast.classList.add("hidden");
                }, 300);
            }, 3000);
        }
    }

    // Error banner control
    showError(msg) {
        const errBanner = document.getElementById("error-banner");
        const errText = document.getElementById("error-banner-text");
        if (errBanner && errText) {
            errText.innerText = msg;
            errBanner.classList.remove("hidden");
            errBanner.scrollIntoView({ behavior: "smooth" });
        }
    }

    hideError() {
        const errBanner = document.getElementById("error-banner");
        if (errBanner) errBanner.classList.add("hidden");
    }

    // Render screen based on auth/onboarding status
    showScreen(screenName) {
        document.getElementById("screen-welcome").classList.add("hidden");
        document.getElementById("screen-onboarding").classList.add("hidden");
        document.getElementById("screen-workspace").classList.add("hidden");
        document.getElementById("nav-authed").classList.add("hidden");

        if (screenName === "welcome") {
            document.getElementById("screen-welcome").classList.remove("hidden");
        } else if (screenName === "onboarding") {
            document.getElementById("screen-onboarding").classList.remove("hidden");
            document.getElementById("nav-authed").classList.remove("hidden");
            this.setupOnboardingFields();
        } else if (screenName === "workspace") {
            document.getElementById("screen-workspace").classList.remove("hidden");
            document.getElementById("nav-authed").classList.remove("hidden");
            this.updateNavbarBadges();
            this.setupWorkspace();
        }
    }

    // Toggle Welcome / Register tabs
    setAuthTab(tab) {
        this.authTab = tab;
        const loginTab = document.getElementById("tab-btn-login");
        const regTab = document.getElementById("tab-btn-register");
        const loginForm = document.getElementById("form-login");
        const regForm = document.getElementById("form-register");

        if (tab === "login") {
            loginTab.className = "flex-1 py-2 text-sm font-bold rounded-lg bg-white text-indigo-600 shadow-xs transition duration-200";
            regTab.className = "flex-1 py-2 text-sm font-bold rounded-lg text-slate-600 hover:text-slate-900 transition duration-200";
            loginForm.classList.remove("hidden");
            regForm.classList.add("hidden");
        } else {
            regTab.className = "flex-1 py-2 text-sm font-bold rounded-lg bg-white text-indigo-600 shadow-xs transition duration-200";
            loginTab.className = "flex-1 py-2 text-sm font-bold rounded-lg text-slate-600 hover:text-slate-900 transition duration-200";
            regForm.classList.remove("hidden");
            loginForm.classList.add("hidden");
        }
    }

    // Custom toggle visual for radio buttons
    toggleRoleLabel(role) {
        const studLabel = document.getElementById("role-label-student");
        const empLabel = document.getElementById("role-label-employer");
        if (role === "student") {
            studLabel.className = "border-2 border-indigo-500 bg-indigo-50/50 p-3 rounded-xl flex items-center justify-center space-x-2 cursor-pointer";
            empLabel.className = "border-2 border-slate-200 p-3 rounded-xl flex items-center justify-center space-x-2 cursor-pointer";
        } else {
            empLabel.className = "border-2 border-indigo-500 bg-indigo-50/50 p-3 rounded-xl flex items-center justify-center space-x-2 cursor-pointer";
            studLabel.className = "border-2 border-slate-200 p-3 rounded-xl flex items-center justify-center space-x-2 cursor-pointer";
        }
    }

    // Auth actions
    async handleRegister(e) {
        e.preventDefault();
        const email = document.getElementById("reg-email").value;
        const password = document.getElementById("reg-password").value;
        const role = document.querySelector('input[name="reg-role"]:checked').value;

        try {
            await this.request("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({ email, password, role })
            });
            // Immediately login
            await this.executeLogin(email, password);
        } catch (err) {}
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        await this.executeLogin(email, password);
    }

    async executeLogin(email, password) {
        try {
            const data = await this.request("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });

            this.token = data.token;
            this.user = data.user;
            this.profile = data.profile;

            localStorage.setItem("token", this.token);
            localStorage.setItem("user", JSON.stringify(this.user));
            localStorage.setItem("profile", JSON.stringify(this.profile));

            this.showToast("Logged in successfully!");

            if (!this.user.is_onboarded) {
                this.showScreen("onboarding");
            } else {
                this.showScreen("workspace");
            }
        } catch (err) {}
    }

    logout() {
        if (this.token) {
            fetch("/api/auth/logout", {
                method: "POST",
                headers: this.getHeaders()
            }).catch(e => {});
        }
        this.token = null;
        this.user = null;
        this.profile = null;
        this.currentTab = "discovery";
        this.discoveryCards = [];
        this.activeMatchId = null;

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("profile");

        this.stopPolling();
        this.setAuthTab("login");
        this.showScreen("welcome");
    }

    // Fetch user self details
    async fetchMe() {
        try {
            const data = await this.request("/api/auth/me");
            this.user = data.user;
            this.profile = data.profile;
            localStorage.setItem("user", JSON.stringify(this.user));
            localStorage.setItem("profile", JSON.stringify(this.profile));

            if (!this.user.is_onboarded) {
                this.showScreen("onboarding");
            } else {
                this.showScreen("workspace");
            }
        } catch (err) {
            this.logout();
        }
    }

    // Profile Onboarding Form Config
    setupOnboardingFields() {
        const studentFields = document.getElementById("fields-student");
        const employerFields = document.getElementById("fields-employer");

        if (this.user.role === "student") {
            studentFields.classList.remove("hidden");
            employerFields.classList.add("hidden");
        } else {
            studentFields.classList.add("hidden");
            employerFields.classList.remove("hidden");
        }

        // Fill fields with any existing values
        if (this.profile) {
            document.getElementById("prof-name").value = this.profile.name || "";
            document.getElementById("prof-bio").value = this.profile.bio || "";
            if (this.user.role === "student") {
                document.getElementById("prof-education").value = this.profile.education || "";
                document.getElementById("prof-skills").value = this.profile.skills || "";
                document.getElementById("prof-job-titles").value = this.profile.target_job_titles || "";
                document.getElementById("prof-visa-status").value = this.profile.visa_status || "not_required";
            } else {
                document.getElementById("prof-company").value = this.profile.company_name || "";
                document.getElementById("prof-industry").value = this.profile.industry || "";
            }
        }
    }

    // Onboarding profile save
    async saveProfile(e) {
        e.preventDefault();
        const name = document.getElementById("prof-name").value;
        const bio = document.getElementById("prof-bio").value;

        const payload = { name, bio };

        if (this.user.role === "student") {
            payload.education = document.getElementById("prof-education").value;
            payload.skills = document.getElementById("prof-skills").value;
            payload.target_job_titles = document.getElementById("prof-job-titles").value;
            payload.visa_status = document.getElementById("prof-visa-status").value;
        } else {
            payload.company_name = document.getElementById("prof-company").value;
            payload.industry = document.getElementById("prof-industry").value;
        }

        try {
            const updatedProfile = await this.request("/api/profile", {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            this.profile = updatedProfile;
            this.user.is_onboarded = true;

            localStorage.setItem("user", JSON.stringify(this.user));
            localStorage.setItem("profile", JSON.stringify(this.profile));

            this.showToast("Profile saved successfully!");
            this.showScreen("workspace");
        } catch (err) {}
    }

    // Set badges in Navbar
    updateNavbarBadges() {
        const userBadge = document.getElementById("nav-user-badge");
        const userEmail = document.getElementById("nav-user-email");
        const roleIcon = document.getElementById("nav-user-role-icon");

        if (userBadge && userEmail && roleIcon) {
            userEmail.innerText = this.user.email;
            if (this.user.role === "student") {
                roleIcon.innerHTML = `<i class="fa-solid fa-graduation-cap text-yellow-300"></i>`;
                userBadge.className = "bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wide flex items-center space-x-1";
            } else if (this.user.role === "employer") {
                roleIcon.innerHTML = `<i class="fa-solid fa-building text-amber-300"></i>`;
                userBadge.className = "bg-gradient-to-r from-amber-600 to-orange-600 border border-amber-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wide flex items-center space-x-1";
            } else {
                roleIcon.innerHTML = `<i class="fa-solid fa-user-shield text-rose-300"></i>`;
                userBadge.className = "bg-gradient-to-r from-rose-600 to-red-600 border border-rose-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wide flex items-center space-x-1";
            }
        }
    }

    // Set workspaces, sidebar badges, and initial data query
    setupWorkspace() {
        // Initials / name in sidebar
        const initials = document.getElementById("sidebar-initials");
        const nameText = document.getElementById("sidebar-user-name");
        const roleText = document.getElementById("sidebar-user-role");

        const displayName = this.user.role === "employer" ? (this.profile?.company_name || "Employer") : (this.profile?.name || "Student");
        if (nameText) nameText.innerText = displayName;
        if (roleText) roleText.innerText = this.user.role.toUpperCase();
        if (initials) initials.innerText = displayName.substring(0, 2).toUpperCase();

        // Employer job management tab visibility
        const btnTabJobs = document.getElementById("btn-tab-jobs");
        if (this.user.role === "employer") {
            btnTabJobs.classList.remove("hidden");
        } else {
            btnTabJobs.classList.add("hidden");
        }

        // Admin tab visibility
        const btnTabAdmin = document.getElementById("btn-tab-admin");
        if (this.user.role === "admin") {
            btnTabAdmin.classList.remove("hidden");
        } else {
            btnTabAdmin.classList.add("hidden");
        }

        // Load Tab Data
        this.showTab(this.currentTab);
    }

    // Tab view switcher
    showTab(tabName) {
        this.currentTab = tabName;
        this.stopPolling();

        // Reset sidebar button classes
        const tabs = ["discovery", "chat", "jobs", "analytics", "admin"];
        tabs.forEach(t => {
            const btn = document.getElementById(`btn-tab-${t}`);
            const pane = document.getElementById(`tab-${t}`);
            if (btn) {
                if (t === tabName) {
                    btn.className = "flex-1 md:flex-initial flex items-center justify-center md:justify-start space-x-3 px-4 py-3 rounded-xl text-indigo-600 bg-indigo-50/70 font-bold transition duration-200";
                } else {
                    btn.className = "flex-1 md:flex-initial flex items-center justify-center md:justify-start space-x-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 font-bold transition duration-200";
                }
            }
            if (pane) {
                if (t === tabName) pane.classList.remove("hidden");
                else pane.classList.add("hidden");
            }
        });

        // Trigger action based on active tab
        if (tabName === "discovery") {
            this.fetchDiscoveryFeed();
        } else if (tabName === "chat") {
            this.fetchMatches();
        } else if (tabName === "jobs") {
            this.fetchEmployerJobs();
        } else if (tabName === "analytics") {
            this.fetchAnalytics();
        } else if (tabName === "admin") {
            this.fetchAdminReports();
        }
    }

    // --- DISCOVERY DECK FLOW ---
    async fetchDiscoveryFeed() {
        try {
            const data = await this.request("/api/discovery");
            this.discoveryCards = data;
            this.currentCardIndex = 0;
            this.renderDeck();
        } catch (err) {}
    }

    renderDeck() {
        const deck = document.getElementById("deck-container");
        const controls = document.getElementById("deck-controls");

        if (this.currentCardIndex >= this.discoveryCards.length) {
            deck.innerHTML = `
                <div class="text-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center h-full w-full">
                    <i class="fa-solid fa-face-laugh-beam text-4xl text-indigo-500 mb-3 animate-pulse"></i>
                    <h4 class="font-bold text-slate-700">All caught up!</h4>
                    <p class="text-xs text-slate-400 mt-1 px-4">There are no new cards in your discovery feed. Refresh to look for updates.</p>
                    <button onclick="app.fetchDiscoveryFeed()" class="mt-4 bg-indigo-600 text-white text-xs px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition">
                        <i class="fa-solid fa-rotate mr-1"></i> Refresh Feed
                    </button>
                </div>
            `;
            controls.style.display = "none";
            return;
        }

        controls.style.display = "flex";
        const card = this.discoveryCards[this.currentCardIndex];

        let detailsHtml = "";
        if (this.user.role === "student") {
            // Card is an Opportunity
            detailsHtml = `
                <div class="bg-indigo-600 text-white px-6 py-8 rounded-t-3xl flex-grow flex flex-col justify-end">
                    <span class="bg-white/20 text-white px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider self-start mb-2">${card.industry || 'Tech'}</span>
                    <h3 class="text-2xl font-black truncate">${card.title}</h3>
                    <h4 class="text-indigo-200 text-sm font-semibold truncate"><i class="fa-solid fa-building mr-1"></i> ${card.company_name}</h4>
                </div>
                <div class="p-6 flex flex-col justify-between flex-grow overflow-y-auto max-h-[160px]">
                    <div>
                        <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Company Description</h5>
                        <p class="text-xs text-slate-600 line-clamp-2 mb-3">${card.employer_bio || 'No description provided.'}</p>

                        <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Requirements</h5>
                        <p class="text-xs text-slate-700 leading-relaxed font-medium mb-3">${card.description}</p>
                    </div>
                    <div class="flex flex-wrap gap-1 mt-auto pt-2">
                        ${card.skills_required.split(',').map(s => s.trim()).filter(Boolean).map(s => `<span class="bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full font-bold border border-indigo-100">${s}</span>`).join('')}
                    </div>
                </div>
            `;
        } else {
            // Card is a Student profile
            detailsHtml = `
                <div class="bg-gradient-to-br from-violet-600 to-indigo-700 text-white px-6 py-8 rounded-t-3xl flex-grow flex flex-col justify-end">
                    <span class="bg-white/20 text-white px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider self-start mb-2"><i class="fa-solid fa-graduation-cap mr-1"></i> Student</span>
                    <h3 class="text-2xl font-black truncate">${card.name}</h3>
                    <h4 class="text-violet-200 text-sm font-semibold truncate">${card.education || 'Waterloo Student'}</h4>
                </div>
                <div class="p-6 flex flex-col justify-between flex-grow overflow-y-auto max-h-[160px]">
                    <div>
                        <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">About Me</h5>
                        <p class="text-xs text-slate-600 line-clamp-2 mb-3">${card.bio || 'Hello, looking for awesome internships!'}</p>

                        <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Target Roles</h5>
                        <p class="text-xs text-slate-700 font-bold mb-3">${card.target_job_titles || 'Software Engineer'}</p>
                    </div>
                    <div class="flex flex-wrap gap-1 mt-auto pt-2">
                        ${card.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => `<span class="bg-violet-50 text-violet-600 text-[10px] px-2 py-0.5 rounded-full font-bold border border-violet-100">${s}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        deck.innerHTML = `
            <div id="active-swipe-card" class="absolute inset-0 bg-white border border-slate-100 shadow-xl rounded-3xl flex flex-col overflow-hidden swipe-card">
                ${detailsHtml}
            </div>
        `;
    }

    // Trigger swiping action
    async swipe(direction) {
        if (this.currentCardIndex >= this.discoveryCards.length) return;

        const cardEl = document.getElementById("active-swipe-card");
        if (cardEl) {
            cardEl.classList.add(direction === "like" ? "swipe-right" : "swipe-left");
        }

        const card = this.discoveryCards[this.currentCardIndex];
        const payload = { direction };

        if (this.user.role === "student") {
            payload.target_opportunity_id = card.id;
        } else {
            payload.target_user_id = card.id;
        }

        this.currentCardIndex++;

        // Delay updating current view slightly so animation plays nicely!
        setTimeout(async () => {
            try {
                const res = await fetch("/api/swipe", {
                    method: "POST",
                    headers: this.getHeaders(),
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (data.matched) {
                    this.showMatchModal(data.match);
                }

                this.renderDeck();
            } catch (err) {
                console.error("Swipe failed:", err);
            }
        }, 300);
    }

    // Match Congratulations Modal
    showMatchModal(match) {
        document.getElementById("match-student-name").innerText = match.student_name;
        document.getElementById("match-employer-name").innerText = match.employer_name;
        document.getElementById("match-opp-title").innerText = match.opportunity_title;

        document.getElementById("modal-match-success").classList.remove("hidden");
    }

    closeMatchModal() {
        document.getElementById("modal-match-success").classList.add("hidden");
        // Open the chat tab directly to view this match!
        this.showTab("chat");
    }

    // --- MATCHES & LIVE CHAT FLOW ---
    async fetchMatches() {
        try {
            const matches = await this.request("/api/matches");
            this.matches = matches;
            this.renderMatchesList();
        } catch (err) {}
    }

    renderMatchesList() {
        const listContainer = document.getElementById("matches-list");
        const badge = document.getElementById("match-badge");
        badge.innerText = this.matches.length;

        if (this.matches.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-10 text-slate-400 text-xs">
                    <i class="fa-regular fa-comment-dots text-3xl mb-2"></i>
                    <p>No matches yet. Keep swiping to connect!</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = this.matches.map(m => {
            const isActive = m.id === this.activeMatchId;
            const displayName = this.user.role === "student" ? m.employer_name : m.student_name;
            const subtitle = m.opportunity_title;
            const initial = displayName.charAt(0).toUpperCase();

            return `
                <div onclick="app.selectMatch(${m.id})" class="flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition ${isActive ? 'bg-indigo-50 border border-indigo-100 text-indigo-900' : 'hover:bg-slate-50 text-slate-700'}">
                    <div class="h-10 w-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                        ${initial}
                    </div>
                    <div class="flex-grow min-w-0">
                        <div class="font-extrabold text-sm truncate">${displayName}</div>
                        <div class="text-xs text-slate-400 truncate font-semibold">${subtitle}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    selectMatch(matchId) {
        this.activeMatchId = matchId;
        this.renderMatchesList();

        document.getElementById("chat-empty").classList.add("hidden");
        document.getElementById("chat-workspace").classList.remove("hidden");

        const match = this.matches.find(m => m.id === matchId);
        if (match) {
            const name = this.user.role === "student" ? match.employer_name : match.student_name;
            document.getElementById("chat-header-title").innerText = name;
            document.getElementById("chat-header-subtitle").innerText = match.opportunity_title;
            document.getElementById("chat-header-initials").innerText = name.charAt(0).toUpperCase();
        }

        // Load chat history & compliance requirements immediately
        this.fetchChatMessages();
        this.fetchCompliance();

        // Start polling logs every 2 seconds for interactive real-time experience!
        this.startPolling();
    }

    async fetchChatMessages() {
        if (!this.activeMatchId) return;
        try {
            const res = await fetch(`/api/matches/${this.activeMatchId}/messages`, {
                headers: this.getHeaders()
            });
            if (res.ok) {
                const messages = await res.json();
                this.chatMessages = messages;
                this.renderChatMessages();
            }
        } catch (e) {}
    }

    renderChatMessages() {
        const container = document.getElementById("chat-messages");
        const scrollAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 40;

        container.innerHTML = this.chatMessages.map(m => {
            const isMe = m.sender_id === this.user.id;
            const bubbleClass = isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-slate-100 text-slate-800 rounded-bl-none";
            const alignClass = isMe ? "justify-end" : "justify-start";

            return `
                <div class="flex ${alignClass}">
                    <div class="max-w-[75%] p-3 rounded-2xl text-xs font-semibold leading-relaxed ${bubbleClass}">
                        ${m.text}
                    </div>
                </div>
            `;
        }).join('');

        // Scroll to bottom if we were already near bottom
        if (scrollAtBottom) {
            container.scrollTop = container.scrollHeight;
        }
    }

    async sendMessage(e) {
        e.preventDefault();
        const input = document.getElementById("chat-message-input");
        const text = input.value.trim();
        if (!text || !this.activeMatchId) return;

        input.value = "";

        try {
            const res = await fetch(`/api/matches/${this.activeMatchId}/messages`, {
                method: "POST",
                headers: this.getHeaders(),
                body: JSON.stringify({ text })
            });
            if (res.ok) {
                const newMsg = await res.json();
                this.chatMessages.push(newMsg);
                this.renderChatMessages();
            }
        } catch (err) {}
    }

    // --- COMPLIANCE TRACKER FLOW ---
    async fetchCompliance() {
        if (!this.activeMatchId) return;
        try {
            const res = await fetch(`/api/matches/${this.activeMatchId}/compliance`, {
                headers: this.getHeaders()
            });
            if (res.ok) {
                const comp = await res.json();
                this.updateComplianceUI(comp);
            }
        } catch (e) {}
    }

    updateComplianceUI(comp) {
        // Set values in selectors/checkboxes
        document.getElementById("comp-school").value = comp.school_approval;
        document.getElementById("comp-visa").value = comp.visa_status;
        document.getElementById("comp-travel").value = comp.travel_docs;
        document.getElementById("comp-interview").checked = comp.interview_scheduled;

        // Update badge and bar
        const badge = document.getElementById("compliance-readiness-badge");
        if (comp.readiness === "ready") {
            badge.innerText = "Ready / Compliant";
            badge.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700";
        } else if (comp.readiness === "in_progress") {
            badge.innerText = "In Progress";
            badge.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700";
        } else {
            badge.innerText = "Not Ready";
            badge.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700";
        }

        // Calculate progress percentage dynamically for display
        let stepsCompleted = 0;
        if (comp.school_approval !== "pending") stepsCompleted++;
        if (comp.visa_status !== "pending") stepsCompleted++;
        if (comp.travel_docs !== "pending") stepsCompleted++;
        if (comp.interview_scheduled) stepsCompleted++;

        const percent = Math.round((stepsCompleted / 4) * 100);
        document.getElementById("compliance-percent").innerText = `${percent}%`;
        document.getElementById("compliance-bar").style.width = `${percent}%`;
    }

    async updateCompliance(step, value) {
        if (!this.activeMatchId) return;
        try {
            const res = await fetch(`/api/matches/${this.activeMatchId}/compliance`, {
                method: "PUT",
                headers: this.getHeaders(),
                body: JSON.stringify({ step, status: value })
            });
            if (res.ok) {
                const comp = await res.json();
                this.updateComplianceUI(comp);
                this.showToast("Compliance step updated successfully!");
            }
        } catch (e) {
            console.error(e);
        }
    }

    // --- EMPLOYER JOB POSTING FLOW ---
    async fetchEmployerJobs() {
        try {
            const jobs = await this.request("/api/profile/opportunities");
            this.renderEmployerJobsList(jobs);
        } catch (e) {}
    }

    renderEmployerJobsList(jobs) {
        const container = document.getElementById("posted-jobs-list");
        if (jobs.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12 text-slate-400 text-sm">
                    <i class="fa-solid fa-briefcase text-4xl mb-2 text-indigo-200"></i>
                    <p>No job postings yet. Post your first opportunity!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = jobs.map(j => `
            <div class="bg-slate-50 border border-slate-100 p-5 rounded-2xl shadow-xs">
                <span class="bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Active Listing</span>
                <h4 class="font-extrabold text-slate-800 text-base mt-2">${j.title}</h4>
                <p class="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">${j.description}</p>
                <div class="flex flex-wrap gap-1 mt-4">
                    ${j.skills_required.split(',').map(s => s.trim()).filter(Boolean).map(s => `<span class="bg-slate-200 text-slate-600 text-[9px] px-1.5 py-0.5 rounded-md font-bold">${s}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    showAddJobModal() {
        document.getElementById("modal-add-job").classList.remove("hidden");
    }

    async handleAddJob(e) {
        e.preventDefault();
        const title = document.getElementById("add-job-title").value;
        const description = document.getElementById("add-job-desc").value;
        const skills_required = document.getElementById("add-job-skills").value;

        try {
            await this.request("/api/profile/opportunity", {
                method: "POST",
                body: JSON.stringify({ title, description, skills_required })
            });

            document.getElementById("modal-add-job").classList.add("hidden");
            document.getElementById("add-job-title").value = "";
            document.getElementById("add-job-desc").value = "";
            document.getElementById("add-job-skills").value = "";

            this.showToast("Internship opportunity posted successfully!");
            this.fetchEmployerJobs();
        } catch (err) {}
    }

    // --- MODERATION REPORT FLOW ---
    showReportModal() {
        document.getElementById("modal-report").classList.remove("hidden");
    }

    async handleReportSubmit(e) {
        e.preventDefault();
        const reason = document.getElementById("report-reason").value.trim();
        if (!reason || !this.activeMatchId) return;

        const match = this.matches.find(m => m.id === this.activeMatchId);
        if (!match) return;

        const reported_user_id = this.user.role === "student" ? match.employer_id : match.student_id;

        try {
            await this.request("/api/reports", {
                method: "POST",
                body: JSON.stringify({ reported_user_id, reason })
            });

            document.getElementById("modal-report").classList.add("hidden");
            document.getElementById("report-reason").value = "";
            this.showToast("Report submitted. Our moderation team will investigate.");
        } catch (err) {}
    }

    async fetchAdminReports() {
        try {
            const reports = await this.request("/api/reports");
            this.renderReportsTable(reports);
        } catch (e) {}
    }

    renderReportsTable(reports) {
        const tableBody = document.getElementById("admin-reports-table");
        if (reports.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-10 text-slate-400">No safety reports recorded. Good work!</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = reports.map(r => {
            let statusBadge = "";
            if (r.status === "pending") statusBadge = `<span class="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Pending</span>`;
            else if (r.status === "ignored") statusBadge = `<span class="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-bold">Ignored</span>`;
            else if (r.status === "warned") statusBadge = `<span class="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Warned</span>`;
            else statusBadge = `<span class="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Suspended</span>`;

            const isPending = r.status === "pending";

            return `
                <tr>
                    <td class="px-4 py-3 font-semibold text-slate-500">#${r.id}</td>
                    <td class="px-4 py-3">User #${r.reporter_id}</td>
                    <td class="px-4 py-3 font-bold text-slate-700">User #${r.reported_user_id}</td>
                    <td class="px-4 py-3 max-w-xs truncate font-medium text-slate-600" title="${r.reason}">${r.reason}</td>
                    <td class="px-4 py-3">${statusBadge}</td>
                    <td class="px-4 py-3 text-right space-x-1.5">
                        ${isPending ? `
                            <button onclick="app.executeAdminAction(${r.id}, 'ignore')" class="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2 py-1 rounded">Ignore</button>
                            <button onclick="app.executeAdminAction(${r.id}, 'warn')" class="text-[10px] bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold px-2 py-1 rounded">Warn</button>
                            <button onclick="app.executeAdminAction(${r.id}, 'suspend')" class="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-2 py-1 rounded">Suspend</button>
                        ` : `<span class="text-[10px] font-semibold text-slate-300">Reviewed</span>`}
                    </td>
                </tr>
            `;
        }).join('');
    }

    async executeAdminAction(reportId, action) {
        try {
            await this.request(`/api/reports/${reportId}/action?action=${action}`, {
                method: "POST"
            });
            this.showToast(`Report action [${action.toUpperCase()}] applied.`);
            this.fetchAdminReports();
        } catch (e) {}
    }

    // --- ANALYTICS DASHBOARD FLOW ---
    async fetchAnalytics() {
        try {
            const data = await this.request("/api/analytics");
            this.renderAnalytics(data);
        } catch (e) {}
    }

    renderAnalytics(data) {
        const met = data.metrics;
        document.getElementById("metric-users").innerText = met.users;
        document.getElementById("metric-jobs").innerText = met.opportunities;
        document.getElementById("metric-matches").innerText = met.matches;
        document.getElementById("metric-swipes").innerText = met.swipes;

        // Bars
        const likesPercent = met.swipes > 0 ? Math.round((met.likes / met.swipes) * 100) : 0;
        const passesPercent = met.swipes > 0 ? Math.round((met.passes / met.swipes) * 100) : 0;

        document.getElementById("metric-likes").innerText = `${met.likes} (${likesPercent}%)`;
        document.getElementById("bar-likes").style.width = `${likesPercent}%`;
        document.getElementById("metric-passes").innerText = `${met.passes} (${passesPercent}%)`;
        document.getElementById("bar-passes").style.width = `${passesPercent}%`;

        const totalCompliance = met.compliance.ready + met.compliance.in_progress + met.compliance.not_ready;
        const readyPercent = totalCompliance > 0 ? Math.round((met.compliance.ready / totalCompliance) * 100) : 0;
        const progPercent = totalCompliance > 0 ? Math.round((met.compliance.in_progress / totalCompliance) * 100) : 0;

        document.getElementById("metric-comp-ready").innerText = `${met.compliance.ready} (${readyPercent}%)`;
        document.getElementById("bar-ready").style.width = `${readyPercent}%`;
        document.getElementById("metric-comp-progress").innerText = `${met.compliance.in_progress} (${progPercent}%)`;
        document.getElementById("bar-progress").style.width = `${progPercent}%`;

        // Label splitter helper to respect AGENTS.md guardrails
        const splitLabel = (label) => {
            if (label.length <= 16) return label;
            const words = label.split(' ');
            let lines = [];
            let currentLine = '';
            for (let word of words) {
                if ((currentLine + ' ' + word).trim().length <= 16) {
                    currentLine = (currentLine + ' ' + word).trim();
                } else {
                    if (currentLine) lines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine) lines.push(currentLine);
            return lines;
        };

        const cacLabels = ['Student Acquisition', 'Startup Recruiter', 'Enterprise Partner'].map(splitLabel);
        const tamLabels = ['Total Addressable Market', 'Serviceable Addressable Market', 'Serviceable Obtainable Market'].map(splitLabel);

        // Render CAC Chart
        const ctxCac = document.getElementById('cacChart').getContext('2d');
        if (window.myCacChart) window.myCacChart.destroy();
        window.myCacChart = new Chart(ctxCac, {
            type: 'bar',
            data: {
                labels: cacLabels,
                datasets: [
                    {
                        label: 'CAC ($)',
                        data: [15, 120, 500],
                        backgroundColor: '#f43f5e',
                        borderRadius: 6
                    },
                    {
                        label: 'LTV ($)',
                        data: [180, 1600, 8000],
                        backgroundColor: '#10b981',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#64748b', font: { weight: 'bold', size: 10 } } },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const label = context[0].label || '';
                                return Array.isArray(label) ? label.join(' ') : label;
                            }
                        }
                    }
                },
                scales: {
                    x: { ticks: { color: '#64748b', font: { weight: 'bold', size: 9 } } },
                    y: { ticks: { color: '#64748b', font: { weight: 'bold', size: 9 } } }
                }
            }
        });

        // Render TAM/SAM/SOM Chart
        const ctxTam = document.getElementById('tamChart').getContext('2d');
        if (window.myTamChart) window.myTamChart.destroy();
        window.myTamChart = new Chart(ctxTam, {
            type: 'doughnut',
            data: {
                labels: tamLabels,
                datasets: [{
                    data: [43, 12, 0.35],
                    backgroundColor: ['#6366f1', '#14b8a6', '#f59e0b'],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#64748b', font: { weight: 'bold', size: 10 } } },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const label = context[0].label || '';
                                return Array.isArray(label) ? label.join(' ') : label;
                            }
                        }
                    }
                }
            }
        });

        // Raw logs
        const logContainer = document.getElementById("analytics-events-list");
        if (data.recent_events.length === 0) {
            logContainer.innerHTML = `<div class="text-slate-500">No system events logged yet.</div>`;
            return;
        }

        logContainer.innerHTML = data.recent_events.map(ev => {
            const dateStr = new Date(ev.created_at).toLocaleTimeString();
            return `
                <div class="flex space-x-2 py-0.5 border-b border-slate-800 last:border-0 hover:bg-slate-850">
                    <span class="text-indigo-400 font-bold shrink-0">[${dateStr}]</span>
                    <span class="text-emerald-400 font-bold shrink-0">${ev.event_name.toUpperCase()}</span>
                    <span class="text-slate-400 shrink-0">User #${ev.user_id || 'SYS'}</span>
                    <span class="text-slate-300 truncate font-semibold" title='${ev.payload}'>${ev.payload}</span>
                </div>
            `;
        }).join('');
    }

    // Convenience utility to switch roles / elevate to admin for ease of testing
    async elevateToAdmin() {
        if (!this.user) {
            this.showError("Please register or log in first.");
            return;
        }

        try {
            // We register/promote this email to admin manually in DB or register a new one
            const adminEmail = "admin_mock_" + Math.floor(Math.random() * 1000) + "@swipetern.com";
            await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: adminEmail, password: "password", role: "admin" })
            });

            const data = await this.request("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email: adminEmail, password: "password" })
            });

            this.token = data.token;
            this.user = data.user;
            this.profile = data.profile;

            localStorage.setItem("token", this.token);
            localStorage.setItem("user", JSON.stringify(this.user));
            localStorage.setItem("profile", JSON.stringify(this.profile));

            this.showToast("MOCKED ADMIN SUCCESS! Welcome to Safety Center!");

            // Fast onboard admin
            await this.request("/api/profile", {
                method: "PUT",
                body: JSON.stringify({ name: "System Admin" })
            });
            this.user.is_onboarded = true;
            localStorage.setItem("user", JSON.stringify(this.user));

            this.showScreen("workspace");
            this.showTab("admin");

        } catch (e) {
            this.showError("Could not mock elevate role: " + e.message);
        }
    }

    // Polling control for chat dynamic messages
    startPolling() {
        this.stopPolling();
        this.chatInterval = setInterval(() => this.fetchChatMessages(), 2000);
        this.complianceInterval = setInterval(() => this.fetchCompliance(), 2000);
    }

    stopPolling() {
        if (this.chatInterval) clearInterval(this.chatInterval);
        if (this.complianceInterval) clearInterval(this.complianceInterval);
        this.chatInterval = null;
        this.complianceInterval = null;
    }
}

// Instantiate Global App
const app = new SwipeternApp();
document.addEventListener("DOMContentLoaded", () => app.init());

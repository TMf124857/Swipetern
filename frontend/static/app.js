// Swipetern Frontend Core Application state & routing

class SwipeternApp {
    constructor() {
        this.token = localStorage.getItem("token") || null;
        this.user = JSON.parse(localStorage.getItem("user")) || null;
        this.profile = JSON.parse(localStorage.getItem("profile")) || null;

        this.currentTab = "discovery";
        this.discoveryCards = [];
        this.currentCardIndex = 0;
        this.discoveryViewMode = "swipe"; // "swipe" or "ats"

        this.matches = [];
        this.activeMatchId = null;
        this.chatMessages = [];
        this.chatInterval = null;
        this.complianceInterval = null;

        this.authTab = "login"; // login or register

        // --- Sandbox State Properties ---
        this.sandboxMode = "student"; // 'student' or 'employer'
        this.sandStudentIndex = 0;
        this.sandRoleIndex = 0;

        this.sandStudents = [
            {
                id: "STU-101",
                name: "Emma Janssen",
                education: "Ghent University (Belgium)",
                skills: "React, TypeScript, Node.js, UI/UX Design",
                bio: "Next.js enthusiast looking to build modern, high-impact web and mobile applications in Kampala's booming tech scene.",
                vibe: "High Energy, tech-community organizer, coffee lover.",
                avatar: "fa-solid fa-graduation-cap text-indigo-400"
            },
            {
                id: "STU-102",
                name: "Lucas de Jong",
                education: "TU Delft (Netherlands)",
                skills: "Python, SQL, Data Analysis, TensorFlow",
                bio: "Data science student passionate about applying machine learning to optimize East African smallholder supply chains.",
                vibe: "Highly focused, field trip enthusiast, quiet execution.",
                avatar: "fa-solid fa-user-graduate text-violet-400"
            },
            {
                id: "STU-103",
                name: "Marie Dubois",
                education: "Université de Paris (France)",
                skills: "Clinical Medicine, Global Health Policy, Swahili (Basic)",
                bio: "Nursing & public health student eager to assist local clinics in community triage and outreach.",
                vibe: "Highly empathetic, triage pro, community focused.",
                avatar: "fa-solid fa-user-doctor text-pink-400"
            },
            {
                id: "STU-104",
                name: "Derrick Okello",
                education: "Makerere University (Uganda)",
                skills: "Django, Postgres, Mobile Money APIs, IoT",
                bio: "Kampala local dev ready to assist international ventures land in East Africa smoothly.",
                vibe: "Fast builder, IoT wizard, mobile money integrations specialist.",
                avatar: "fa-solid fa-laptop-code text-emerald-400"
            },
            {
                id: "STU-105",
                name: "Florence Nabakooza",
                education: "Makerere University (Uganda)",
                skills: "Python, GIS Mapping, IoT, Hardware Prototyping",
                bio: "Enthusiastic developer focused on building smart, low-cost climate-tech soil sensors to optimize crop yield predictability.",
                vibe: "Eco-tech advocate, physical hardware enthusiast, field explorer.",
                avatar: "fa-solid fa-microchip text-fuchsia-400"
            },
            {
                id: "STU-106",
                name: "Nils Lindqvist",
                education: "KTH Royal Institute (Sweden)",
                skills: "Rust, C++, Embedded Systems, LoRaWAN",
                bio: "Embedded hardware developer looking to test off-grid mesh network arrays for clean water distribution systems.",
                vibe: "Low-level coding master, clean water advocate, micro-controller explorer.",
                avatar: "fa-solid fa-network-wired text-teal-400"
            }
        ];

        this.sandRoles = [
            {
                id: "OP-201",
                company_name: "Phynx Tech Solutions",
                industry: "Kampala • ICT / Fintech",
                skills_required: "React, TailwindCSS, REST APIs",
                description: "Help construct our lightning-fast mobile money gateway interfaces for small businesses.",
                employer_bio: "💡 Fast-paced startup, Friday developer syncs, flat hierarchies.",
                avatar: "fa-solid fa-building text-fuchsia-400"
            },
            {
                id: "OP-202",
                company_name: "Enum Agribusiness",
                industry: "Kigali • Agritech",
                skills_required: "Python, Pandas, SQL",
                description: "Coordinate with regional maize networks to analyze crop telemetry data logs.",
                employer_bio: "🌱 Sustainable impact, field trips to farming cooperatives, high analytical autonomy.",
                avatar: "fa-solid fa-seedling text-emerald-400"
            },
            {
                id: "OP-203",
                company_name: "Kampala Community Clinic",
                industry: "Kampala • Healthcare",
                skills_required: "Clinical Foundations, Empathy, Triage",
                description: "Support active triage protocols and optimize record verification databases.",
                employer_bio: "❤️ Mission-first, incredibly rewarding patient relationships.",
                avatar: "fa-solid fa-house-medical text-teal-400"
            },
            {
                id: "OP-204",
                company_name: "Jibu Water Rwanda",
                industry: "Kigali • Utilities / IoT",
                skills_required: "C++, LoRaWAN, Hardware Debugging",
                description: "Clean water advocacy, hands-on lab experimentation, close mentorship.",
                employer_bio: "💧 Clean water advocacy, hands-on lab experimentation, close mentorship.",
                avatar: "fa-solid fa-faucet-drip text-blue-400"
            },
            {
                id: "OP-205",
                company_name: "SafeBoda",
                industry: "Kampala • Mobility",
                skills_required: "Elixir, Erlang, Postgres, GIS Routing",
                description: "High scale mobility platform, energetic team, fast weekly sprint iterations.",
                employer_bio: "🏍️ High scale mobility platform, energetic team, fast weekly sprint iterations.",
                avatar: "fa-solid fa-motorcycle text-orange-400"
            }
        ];

        this.sandSwipes = {
            likesFromStudents: {
                "STU-101": ["OP-201", "OP-202"],
                "STU-102": ["OP-202"],
                "STU-103": ["OP-203"]
            },
            likesFromEmployers: {
                "OP-201": ["STU-101"], // Triggers instant match
                "OP-202": ["STU-102"],
                "OP-203": ["STU-103"]
            }
        };

        this.sandMatches = [
            {
                id: "MCH-4819",
                student_id: "STU-101",
                student_name: "Emma Janssen",
                opportunity_id: "OP-201",
                employer_name: "Phynx Tech Solutions",
                opportunity_title: "Frontend Developer Intern",
                timestamp: "Just Now"
            },
            {
                id: "MCH-8291",
                student_id: "STU-104",
                student_name: "Derrick Okello",
                opportunity_id: "OP-201",
                employer_name: "Phynx Tech Solutions",
                opportunity_title: "Frontend Developer Intern",
                timestamp: "2 hours ago"
            },
            {
                id: "MCH-9182",
                student_id: "STU-105",
                student_name: "Florence Nabakooza",
                opportunity_id: "OP-202",
                employer_name: "Enum Agribusiness",
                opportunity_title: "Agri-Data Analyst Intern",
                timestamp: "1 day ago"
            },
            {
                id: "MCH-3042",
                student_id: "STU-106",
                student_name: "Nils Lindqvist",
                opportunity_id: "OP-204",
                employer_name: "Jibu Water Rwanda",
                opportunity_title: "IoT Systems Engineering Intern",
                timestamp: "2 days ago"
            }
        ];

        this.sandChats = {
            "MCH-4819": [
                { sender: "system", text: "Double Opt-In Match! Instant chat channel initialized.", time: "Just Now" },
                { sender: "employer", text: "Hey! We loved your portfolio. That responsive layout looks perfect. When are you free for a call?", time: "Just Now" }
            ],
            "MCH-8291": [
                { sender: "system", text: "Double Opt-In Match! Instant chat channel initialized.", time: "2 hours ago" },
                { sender: "employer", text: "Mambo Derrick! Ready to test mobile money integrations this week?", time: "1 hour ago" },
                { sender: "student", text: "Mambo! Yes, absolutely ready. Makerere labs approved the API signoffs already.", time: "Just Now" }
            ],
            "MCH-9182": [
                { sender: "system", text: "Double Opt-In Match! Instant chat channel initialized.", time: "1 day ago" },
                { sender: "employer", text: "Welcome to the team Florence! Our cooperative field visits start next Monday.", time: "20 hours ago" }
            ],
            "MCH-3042": [
                { sender: "system", text: "Double Opt-In Match! Instant chat channel initialized.", time: "2 days ago" },
                { sender: "employer", text: "Hej Nils! Your embedded Rust and LoRa experience is incredibly unique. Our water filtration meters currently run custom firmware. Are you free for a brief call next Tuesday?", time: "1 day ago" },
                { sender: "student", text: "Thanks for the outreach! I am absolutely free. My KTH academic advisor has already approved the syllabus mapping for 15 credits. Looking forward to it!", time: "Just Now" }
            ]
        };

        this.activeSandMatchId = "MCH-4819";
    }

    // Initialize the Application on page load
    async init() {
        console.log("Initializing Swipetern...");
        if (this.token) {
            await this.fetchMe();
        } else {
            this.showScreen("landing");
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

    // Hide error banner
    hideError() {
        const errBanner = document.getElementById("error-banner");
        if (errBanner) errBanner.classList.add("hidden");
    }

    // Render screen based on auth/onboarding status with robust null guards
    showScreen(screenName) {
        const welcome = document.getElementById("screen-welcome");
        const onboarding = document.getElementById("screen-onboarding");
        const workspace = document.getElementById("screen-workspace");
        const landing = document.getElementById("screen-landing");
        const explainer = document.getElementById("screen-explainer");

        if (welcome) welcome.classList.add("hidden");
        if (onboarding) onboarding.classList.add("hidden");
        if (workspace) workspace.classList.add("hidden");
        if (landing) landing.classList.add("hidden");
        if (explainer) explainer.classList.add("hidden");

        const navAuthed = document.getElementById("nav-authed");
        const navGuest = document.getElementById("nav-guest");
        if (navAuthed) navAuthed.classList.add("hidden");
        if (navGuest) navGuest.classList.add("hidden");

        if (screenName === "explainer") {
            if (explainer) explainer.classList.remove("hidden");
            if (navGuest) navGuest.classList.remove("hidden");
        } else if (screenName === "landing") {
            if (landing) landing.classList.remove("hidden");
            if (navGuest) navGuest.classList.remove("hidden");
            this.initSandbox();
        } else if (screenName === "welcome") {
            if (welcome) welcome.classList.remove("hidden");
            if (navGuest) navGuest.classList.remove("hidden");
        } else if (screenName === "onboarding") {
            if (onboarding) onboarding.classList.remove("hidden");
            if (navAuthed) navAuthed.classList.remove("hidden");
            this.setupOnboardingFields();
        } else if (screenName === "workspace") {
            if (workspace) workspace.classList.remove("hidden");
            if (navAuthed) navAuthed.classList.remove("hidden");
            this.updateNavbarBadges();
            this.setupWorkspace();
        }
    }

    showExplainerPage() {
        this.showScreen("explainer");
    }

    // Auth Dialog modal triggers
    showAuthModal() {
        document.getElementById("modal-auth").classList.remove("hidden");
    }

    hideAuthModal() {
        document.getElementById("modal-auth").classList.add("hidden");
    }

    // Toggle Welcome / Register tabs
    setAuthTab(tab) {
        this.authTab = tab;
        const loginTab = document.getElementById("modal-btn-login");
        const regTab = document.getElementById("modal-btn-register");
        const loginForm = document.getElementById("modal-form-login");
        const regForm = document.getElementById("modal-form-register");

        if (tab === "login") {
            loginTab.className = "flex-1 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-fuchsia-400 shadow-sm transition uppercase tracking-wider";
            regTab.className = "flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-400 transition uppercase tracking-wider";
            loginForm.classList.remove("hidden");
            regForm.classList.add("hidden");
        } else {
            regTab.className = "flex-1 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-fuchsia-400 shadow-sm transition uppercase tracking-wider";
            loginTab.className = "flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-400 transition uppercase tracking-wider";
            regForm.classList.remove("hidden");
            loginForm.classList.add("hidden");
        }
    }

    // Custom toggle visual for radio buttons
    toggleRoleLabel(role) {
        const studLabel = document.getElementById("role-label-student");
        const empLabel = document.getElementById("role-label-employer");
        if (role === "student") {
            studLabel.className = "border-2 border-fuchsia-500 bg-fuchsia-500/10 p-2.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer text-[10px] font-black uppercase tracking-wider";
            empLabel.className = "border border-slate-700 p-2.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer text-[10px] font-black uppercase tracking-wider";
        } else {
            empLabel.className = "border-2 border-fuchsia-500 bg-fuchsia-500/10 p-2.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer text-[10px] font-black uppercase tracking-wider";
            studLabel.className = "border border-slate-700 p-2.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer text-[10px] font-black uppercase tracking-wider";
        }
    }

    // Auth actions
    async handleRegister(e) {
        e.preventDefault();
        const email = document.querySelector('#modal-form-register input[type="email"]').value;
        const password = document.querySelector('#modal-form-register input[type="password"]').value;
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
        const email = document.querySelector('#modal-form-login input[type="email"]').value;
        const password = document.querySelector('#modal-form-login input[type="password"]').value;
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

            this.hideAuthModal();
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
        this.showScreen("landing");
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
        // Build onboarding workspace dynamically
        const container = document.getElementById("screen-onboarding");

        const studentFields = `
            <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Education / Institution</label>
                <input type="text" id="prof-education" placeholder="e.g. Stanford University, BS Comp Sci" class="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-955 text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-fuchsia-500 text-sm font-medium" style="min-height: 44px;">
            </div>
            <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Your Skills (Comma separated)</label>
                <input type="text" id="prof-skills" placeholder="e.g. Python, React, Figma" class="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-955 text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-fuchsia-500 text-sm font-medium" style="min-height: 44px;">
            </div>
            <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Target Job Titles (Comma separated)</label>
                <input type="text" id="prof-job-titles" placeholder="e.g. Software Engineer, Designer" class="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-955 text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-fuchsia-500 text-sm font-medium" style="min-height: 44px;">
            </div>
            <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Visa / Work Permit Status</label>
                <select id="prof-visa-status" class="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-955 text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-fuchsia-500 text-sm font-bold" style="min-height: 44px;">
                    <option value="not_required">Citizen / PR (No sponsorship needed)</option>
                    <option value="pending">F-1 Visa / Needs Sponsorship</option>
                    <option value="approved">Already Approved Work Visa</option>
                </select>
            </div>
        `;

        const employerFields = `
            <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Company Name</label>
                <input type="text" id="prof-company" placeholder="e.g. Stripe, Inc." class="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-955 text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-fuchsia-500 text-sm font-medium" style="min-height: 44px;">
            </div>
            <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Industry Sector</label>
                <input type="text" id="prof-industry" placeholder="e.g. Fintech, Web3, SpaceTech" class="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-955 text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-fuchsia-500 text-sm font-medium" style="min-height: 44px;">
            </div>
        `;

        container.innerHTML = `
            <div class="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                <div class="mb-6">
                    <span class="text-xs font-extrabold tracking-widest text-fuchsia-500 uppercase">Onboarding</span>
                    <h2 class="text-3xl font-black text-slate-100 mt-1">Design Your Vibe Card</h2>
                    <p class="text-slate-400 text-sm mt-1.5">Stand out with skills, target roles, and work status.</p>
                </div>

                <form onsubmit="app.saveProfile(event)" class="space-y-5">
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Display Name</label>
                        <input type="text" id="prof-name" required placeholder="Jane Doe" class="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-955 text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-fuchsia-500 text-sm font-medium" style="min-height: 44px;">
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Pitch (Bio)</label>
                        <textarea id="prof-bio" rows="3" placeholder="A brief hook about you or your company vision..." class="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-955 text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-fuchsia-500 text-sm font-medium"></textarea>
                    </div>

                    <div class="space-y-4">
                        ${this.user.role === "student" ? studentFields : employerFields}
                    </div>

                    <button type="submit" class="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3.5 rounded-2xl shadow-lg transition duration-200 uppercase tracking-wider text-xs focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-fuchsia-500 focus:outline-hidden" style="min-height: 44px;">
                        Enter Platform
                    </button>
                </form>
            </div>
        `;

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
                roleIcon.innerHTML = `<i class="fa-solid fa-graduation-cap text-fuchsia-400"></i>`;
                userBadge.className = "bg-slate-955 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide flex items-center space-x-1.5 text-fuchsia-400";
            } else if (this.user.role === "employer") {
                roleIcon.innerHTML = `<i class="fa-solid fa-building text-indigo-400"></i>`;
                userBadge.className = "bg-slate-955 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide flex items-center space-x-1.5 text-indigo-400";
            } else {
                roleIcon.innerHTML = `<i class="fa-solid fa-user-shield text-rose-400"></i>`;
                userBadge.className = "bg-slate-955 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide flex items-center space-x-1.5 text-rose-400";
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
                    btn.className = "flex-1 md:flex-initial flex items-center justify-center md:justify-start space-x-3 px-4 py-3 rounded-2xl text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 font-black transition duration-200 focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden";
                } else {
                    btn.className = "flex-1 md:flex-initial flex items-center justify-center md:justify-start space-x-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-slate-200 font-bold transition duration-200 focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden";
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

    // --- INTERACTIVE SANDBOX SIMULATOR (GUESTS CAN PLAY FIRST) ---
    initSandbox() {
        this.renderSandboxCard();
        this.renderSandboxMatches();
        this.renderSandboxChat();
    }

    setSandboxMode(mode) {
        this.sandboxMode = mode;
        const btnStud = document.getElementById('btn-sand-student');
        const btnRecr = document.getElementById('btn-sand-employer');
        const identityLabel = document.getElementById('landing-identity');

        if (mode === 'student') {
            btnStud.className = "px-3.5 py-1.5 text-[10px] font-black rounded-lg bg-slate-900 text-fuchsia-400 shadow-sm transition-all uppercase tracking-wider";
            btnRecr.className = "px-3.5 py-1.5 text-[10px] font-black rounded-lg text-slate-500 hover:text-slate-800 transition-all uppercase tracking-wider";
            identityLabel.innerText = "Candidate View (Europe/NA)";
        } else {
            btnStud.className = "px-3.5 py-1.5 text-[10px] font-black rounded-lg text-slate-500 hover:text-slate-800 transition-all uppercase tracking-wider";
            btnRecr.className = "px-3.5 py-1.5 text-[10px] font-black rounded-lg bg-slate-900 text-fuchsia-400 shadow-sm transition-all uppercase tracking-wider";
            identityLabel.innerText = "Employer View (East Africa)";
        }
        this.renderSandboxCard();
    }

    renderSandboxCard() {
        const viewport = document.getElementById('sandbox-deck-container');

        if (this.sandboxMode === 'student') {
            if (this.sandRoleIndex >= this.sandRoles.length) {
                viewport.innerHTML = `
                    <div class="text-center py-6">
                        <i class="fa-solid fa-trophy text-4xl text-fuchsia-500 mb-3 animate-bounce" aria-hidden="true"></i>
                        <h4 class="text-slate-200 font-extrabold text-sm mt-2">End of Roles Stack</h4>
                        <p class="text-xs text-slate-400 max-w-xs mx-auto mt-1 px-4">Toggle over to "Employer View" to review incoming students!</p>
                        <button onclick="app.resetSandboxFeeds()" class="mt-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden" style="min-height: 44px;">Reset Swipe Cards</button>
                    </div>
                `;
                return;
            }
            const role = this.sandRoles[this.sandRoleIndex];
            viewport.innerHTML = `
                <div class="space-y-4 animate-scale-in w-full text-left">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center space-x-3">
                            <div class="w-11 h-11 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shadow-xs">
                                <i class="${role.avatar}"></i>
                            </div>
                            <div>
                                <h4 class="text-slate-200 font-extrabold text-sm">${role.company_name}</h4>
                                <p class="text-[11px] text-slate-400 font-bold">${role.industry}</p>
                            </div>
                        </div>
                        <span class="text-[9px] bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">15 ECTS Equivalent</span>
                    </div>
                    <div class="space-y-1">
                        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Culture Vibe Check:</div>
                        <p class="text-xs italic text-fuchsia-400 font-bold">${role.employer_bio}</p>
                    </div>
                    <div class="space-y-1">
                        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Requirements:</div>
                        <p class="text-xs text-slate-300 leading-relaxed font-semibold line-clamp-2">${role.description}</p>
                    </div>
                    <div class="flex flex-wrap gap-1 pt-1">
                        ${role.skills_required.split(', ').map(tag => `<span class="text-[9px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-400 font-bold">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        } else {
            if (this.sandStudentIndex >= this.sandStudents.length) {
                viewport.innerHTML = `
                    <div class="text-center py-6">
                        <i class="fa-solid fa-users text-4xl text-fuchsia-500 mb-3 animate-bounce" aria-hidden="true"></i>
                        <h4 class="text-slate-200 font-extrabold text-sm mt-2">End of Candidate Stack</h4>
                        <p class="text-xs text-slate-400 max-w-xs mx-auto mt-1 px-4">Toggle back to "Student" to see opportunity cards!</p>
                        <button onclick="app.resetSandboxFeeds()" class="mt-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden" style="min-height: 44px;">Reset Swipe Cards</button>
                    </div>
                `;
                return;
            }
            const student = this.sandStudents[this.sandStudentIndex];
            viewport.innerHTML = `
                <div class="space-y-4 animate-scale-in w-full text-left">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center space-x-3">
                            <div class="w-11 h-11 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shadow-xs">
                                <i class="${student.avatar}"></i>
                            </div>
                            <div>
                                <h4 class="text-slate-200 font-extrabold text-sm">${student.name}</h4>
                                <p class="text-[11px] text-slate-400 font-bold">${student.education}</p>
                            </div>
                        </div>
                        <span class="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Vetted student</span>
                    </div>
                    <div class="space-y-1">
                        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pitch Script & Bio Snippet:</div>
                        <p class="text-xs italic text-fuchsia-400 font-bold">"${student.bio}"</p>
                    </div>
                    <div class="space-y-1">
                        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Sector:</div>
                        <p class="text-xs text-slate-300 leading-relaxed font-semibold">${student.vibe}</p>
                    </div>
                    <div class="flex flex-wrap gap-1 pt-1">
                        ${student.skills.split(', ').map(tag => `<span class="text-[9px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-400 font-bold">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        }
    }

    resetSandboxFeeds() {
        this.sandStudentIndex = 0;
        this.sandRoleIndex = 0;
        this.renderSandboxCard();
    }

    swipeSandbox(direction) {
        if (this.sandboxMode === 'student') {
            if (this.sandRoleIndex >= this.sandRoles.length) return;
            const role = this.sandRoles[this.sandRoleIndex];

            if (direction === 'like') {
                if (!this.sandSwipes.likesFromStudents["STU-101"].includes(role.id)) {
                    this.sandSwipes.likesFromStudents["STU-101"].push(role.id);
                }
                if (this.sandSwipes.likesFromEmployers[role.id] && this.sandSwipes.likesFromEmployers[role.id].includes("STU-101")) {
                    this.triggerSandboxMatch("STU-101", "Emma Janssen", role.id, role.company_name, "Frontend Intern");
                }
            }
            this.sandRoleIndex++;
        } else {
            if (this.sandStudentIndex >= this.sandStudents.length) return;
            const student = this.sandStudents[this.sandStudentIndex];

            if (direction === 'like') {
                if (!this.sandSwipes.likesFromEmployers["OP-201"].includes(student.id)) {
                    this.sandSwipes.likesFromEmployers["OP-201"].push(student.id);
                }
                if (this.sandSwipes.likesFromStudents[student.id] && this.sandSwipes.likesFromStudents[student.id].includes("OP-201")) {
                    this.triggerSandboxMatch(student.id, student.name, "OP-201", "Phynx Tech Solutions", "Frontend Developer Intern");
                }
            }
            this.sandStudentIndex++;
        }
        this.renderSandboxCard();
    }

    triggerSandboxMatch(studentId, studentName, roleId, companyName, roleName) {
        const matchId = "MCH-" + Math.floor(1000 + Math.random() * 9000);
        const newMatch = {
            id: matchId,
            student_id: studentId,
            student_name: studentName,
            opportunity_id: roleId,
            employer_name: companyName,
            opportunity_title: roleName,
            timestamp: "Just Now"
        };

        this.sandMatches.unshift(newMatch);
        this.sandChats[matchId] = [
            { sender: "system", text: "Double Opt-In Match! Instant chat channel initialized.", time: "Just Now" },
            { sender: "employer", text: `Welcome to the connection channel, ${studentName}! Ready to complete travel compliance?`, time: "Just Now" }
        ];

        this.activeSandMatchId = matchId;

        // Show celebrate success
        document.getElementById("match-student-name").innerText = studentName;
        document.getElementById("match-employer-name").innerText = companyName;
        document.getElementById("match-opp-title").innerText = roleName;
        document.getElementById("modal-match-success").classList.remove("hidden");

        this.renderSandboxMatches();
        this.renderSandboxChat();
    }

    renderSandboxMatches() {
        const container = document.getElementById('sandbox-matches-list');
        const badge = document.getElementById('sandbox-match-badge');
        badge.innerText = this.sandMatches.length;

        container.innerHTML = this.sandMatches.map(match => `
            <div onclick="app.selectSandboxMatch('${match.id}')" class="p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${this.activeSandMatchId === match.id ? 'bg-fuchsia-500/10 border-fuchsia-500/40 text-fuchsia-400 font-bold' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}" style="min-height: 44px;">
                <div>
                    <div class="text-xs font-bold flex items-center gap-1.5">
                        <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        ${match.student_name}
                    </div>
                    <div class="text-[10px] text-slate-400 mt-0.5">${match.employer_name} • ${match.opportunity_title}</div>
                </div>
            </div>
        `).join('');
    }

    selectSandboxMatch(matchId) {
        this.activeSandMatchId = matchId;
        this.renderSandboxMatches();
        this.renderSandboxChat();
    }

    renderSandboxChat() {
        const chatBox = document.getElementById('sandbox-chat-messages');
        const partnerTitle = document.getElementById('sandbox-chat-title');

        if (!this.activeSandMatchId || !this.sandChats[this.activeSandMatchId]) {
            chatBox.innerHTML = `<div class="text-center text-slate-400 italic py-6">Select a connection above to chat.</div>`;
            return;
        }

        const activeMatch = this.sandMatches.find(m => m.id === this.activeSandMatchId);
        partnerTitle.innerText = `Chat with ${activeMatch.student_name}`;

        const log = this.sandChats[this.activeSandMatchId];
        chatBox.innerHTML = log.map(msg => {
            if (msg.sender === 'system') {
                return `<div class="p-2 bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 text-[10px] text-center rounded-xl font-bold uppercase tracking-wider">${msg.text}</div>`;
            }
            const isStudent = msg.sender === 'student';
            const align = isStudent ? 'justify-end' : 'justify-start';
            const color = isStudent ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-850 text-slate-200 border border-slate-800 rounded-bl-none';

            return `
                <div class="flex ${align}">
                    <div class="p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${color}">
                        ${msg.text}
                    </div>
                </div>
            `;
        }).join('');

        chatBox.scrollTop = chatBox.scrollHeight;
    }

    sendSandboxTemplate(type) {
        if (!this.activeSandMatchId || !this.sandChats[this.activeSandMatchId]) return;

        let messageText = "";
        if (type === 'request_interview') {
            messageText = `Google Meet invite request dispatched. Let's arrange a 15-minute call.`;
        } else if (type === 'ects_check') {
            messageText = `Academic Compliance: Dynamic 15 ECTS logging parameters initiated.`;
        }

        this.sandChats[this.activeSandMatchId].push({
            sender: "employer",
            text: messageText,
            time: "Just Now"
        });

        this.renderSandboxChat();

        setTimeout(() => {
            let response = "";
            if (type === 'request_interview') response = "Slot accepted! Tuesday morning works perfectly for me.";
            else if (type === 'ects_check') response = "Done! My university co-op signoff forms have been logged.";

            this.sandChats[this.activeSandMatchId].push({
                sender: "student",
                text: response,
                time: "Just Now"
            });
            this.renderSandboxChat();
        }, 1500);
    }

    toggleSandboxCheck(step) {
        const check = document.getElementById(`sand-check-${step}`);
        if (check.checked) {
            this.showToast(`Checkpoint ${step} verified!`);
        }
    }

    // --- DISCOVERY DECK FLOW ---
    async fetchDiscoveryFeed() {
        try {
            const data = await this.request("/api/discovery");
            this.discoveryCards = data;
            this.currentCardIndex = 0;

            // Show/hide view toggle for employer
            const toggleEl = document.getElementById("recruiter-view-toggle");
            if (toggleEl) {
                if (this.user && this.user.role === "employer") {
                    toggleEl.classList.remove("hidden");
                } else {
                    toggleEl.classList.add("hidden");
                }
            }

            // Enforce default view on load
            this.setDiscoveryViewMode(this.discoveryViewMode || "swipe");
        } catch (err) {}
    }

    setDiscoveryViewMode(mode) {
        this.discoveryViewMode = mode;
        const btnSwipe = document.getElementById("btn-view-swipe");
        const btnAts = document.getElementById("btn-view-ats");
        const deckContainer = document.getElementById("deck-container");
        const deckControls = document.getElementById("deck-controls");
        const atsView = document.getElementById("employer-ats-view");

        if (mode === "swipe") {
            if (btnSwipe) btnSwipe.className = "px-3.5 py-1.5 text-[10px] font-black rounded-lg bg-slate-900 text-fuchsia-400 shadow-sm transition-all uppercase tracking-wider";
            if (btnAts) btnAts.className = "px-3.5 py-1.5 text-[10px] font-black rounded-lg text-slate-400 hover:text-slate-200 transition-all uppercase tracking-wider";
            if (deckContainer) deckContainer.classList.remove("hidden");
            if (deckControls) deckControls.style.display = "flex";
            if (atsView) atsView.classList.add("hidden");
            this.renderDeck();
        } else {
            if (btnAts) btnAts.className = "px-3.5 py-1.5 text-[10px] font-black rounded-lg bg-slate-900 text-fuchsia-400 shadow-sm transition-all uppercase tracking-wider";
            if (btnSwipe) btnSwipe.className = "px-3.5 py-1.5 text-[10px] font-black rounded-lg text-slate-400 hover:text-slate-200 transition-all uppercase tracking-wider";
            if (deckContainer) deckContainer.classList.add("hidden");
            if (deckControls) deckControls.style.display = "none";
            if (atsView) atsView.classList.remove("hidden");
            this.renderAtsBoard();
        }
    }

    renderAtsBoard() {
        const listContainer = document.getElementById("ats-available-list");
        const countLabel = document.getElementById("ats-avail-count");
        if (!listContainer) return;

        const available = this.discoveryCards.slice(this.currentCardIndex);
        if (countLabel) countLabel.innerText = available.length;

        if (available.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-6 text-slate-500 text-xs">
                    <p class="font-bold">No more candidates available.</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = available.map((candidate, idx) => {
            const originalIndex = this.currentCardIndex + idx;
            return `
                <div class="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2 text-left relative group">
                    <div class="flex items-start justify-between">
                        <div>
                            <h5 class="text-xs font-extrabold text-slate-200">${candidate.name}</h5>
                            <p class="text-[10px] text-slate-400 font-bold">${candidate.education || 'Student'}</p>
                        </div>
                        <div class="flex space-x-1">
                            <button onclick="app.swipeAts(${originalIndex}, 'pass')" class="p-1 text-rose-500 hover:bg-rose-955 rounded transition" title="Pass" style="min-height: 28px; min-width: 28px;">
                                <i class="fa-solid fa-xmark text-xs"></i>
                            </button>
                            <button onclick="app.swipeAts(${originalIndex}, 'like')" class="p-1 text-emerald-500 hover:bg-emerald-955 rounded transition" title="Like" style="min-height: 28px; min-width: 28px;">
                                <i class="fa-solid fa-heart text-xs animate-pulse"></i>
                            </button>
                        </div>
                    </div>
                    <p class="text-[11px] text-slate-400 line-clamp-2 italic">"${candidate.bio || 'Ready to deploy!'}"</p>
                    <div class="flex flex-wrap gap-1">
                        ${candidate.skills.split(',').slice(0,3).map(s => `<span class="bg-slate-950 px-1.5 py-0.5 rounded text-[8px] text-slate-400 font-bold">${s.trim()}</span>`).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    async swipeAts(cardIndex, direction) {
        if (cardIndex < 0 || cardIndex >= this.discoveryCards.length) return;
        const card = this.discoveryCards[cardIndex];
        const payload = { direction };

        if (this.user.role === "student") {
            payload.target_opportunity_id = card.id;
        } else {
            payload.target_user_id = card.id;
        }

        // Remove the candidate from available cards array
        this.discoveryCards.splice(cardIndex, 1);

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
            this.showToast(`Swiped ${direction === 'like' ? 'Like' : 'Pass'} on ${card.name}!`);
            this.renderAtsBoard();
        } catch (err) {
            console.error("ATS swipe failed:", err);
        }
    }

    renderDeck() {
        const deck = document.getElementById("deck-container");
        const controls = document.getElementById("deck-controls");

        if (this.currentCardIndex >= this.discoveryCards.length) {
            deck.innerHTML = `
                <div class="text-center p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center justify-center h-full w-full">
                    <i class="fa-solid fa-face-laugh-beam text-4xl text-fuchsia-500 mb-3 animate-pulse" aria-hidden="true"></i>
                    <h4 class="font-bold text-slate-200">All caught up!</h4>
                    <p class="text-xs text-slate-400 mt-1 px-4">There are no new cards in your discovery feed. Refresh to look for updates.</p>
                    <button onclick="app.fetchDiscoveryFeed()" class="mt-4 bg-fuchsia-600 text-white text-xs px-4 py-2.5 rounded-xl font-bold hover:bg-fuchsia-700 transition focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden" style="min-height: 44px;">
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
                <div class="p-6 flex flex-col justify-between flex-grow overflow-y-auto max-h-[160px] bg-slate-900 border-t border-slate-800">
                    <div>
                        <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Company Description</h5>
                        <p class="text-xs text-slate-355 line-clamp-2 mb-3">${card.employer_bio || 'No description provided.'}</p>

                        <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Requirements</h5>
                        <p class="text-xs text-slate-200 leading-relaxed font-medium mb-3">${card.description}</p>
                    </div>
                    <div class="flex flex-wrap gap-1 mt-auto pt-2">
                        ${card.skills_required.split(',').map(s => s.trim()).filter(Boolean).map(s => `<span class="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold">${s}</span>`).join('')}
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
                <div class="p-6 flex flex-col justify-between flex-grow overflow-y-auto max-h-[160px] bg-slate-900 border-t border-slate-800">
                    <div>
                        <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">About Me</h5>
                        <p class="text-xs text-slate-355 line-clamp-2 mb-3">${card.bio || 'Hello, looking for awesome internships!'}</p>

                        <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Target Roles</h5>
                        <p class="text-xs text-slate-200 font-bold mb-3">${card.target_job_titles || 'Software Engineer'}</p>
                    </div>
                    <div class="flex flex-wrap gap-1 mt-auto pt-2">
                        ${card.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => `<span class="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold">${s}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        deck.innerHTML = `
            <div id="active-swipe-card" class="absolute inset-0 bg-slate-900 border border-slate-800 shadow-xl rounded-3xl flex flex-col overflow-hidden swipe-card">
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
                <div class="text-center py-10 text-slate-500 text-xs">
                    <i class="fa-regular fa-comment-dots text-3xl mb-2" aria-hidden="true"></i>
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
                <div onclick="app.selectMatch(${m.id})" class="flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition ${isActive ? 'bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 font-bold' : 'hover:bg-slate-850 text-slate-300'}" style="min-height: 44px;">
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
            const bubbleClass = isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-slate-850 text-slate-200 border border-slate-800 rounded-bl-none";
            const alignClass = isMe ? "justify-end" : "justify-start";

            // Safely assign text content rather than rendering raw un-sanitized HTML to avoid XSS issues
            const safeText = m.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

            return `
                <div class="flex ${alignClass}">
                    <div class="max-w-[75%] p-3 rounded-2xl text-xs font-semibold leading-relaxed ${bubbleClass}">
                        ${safeText}
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
            badge.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
        } else if (comp.readiness === "in_progress") {
            badge.innerText = "In Progress";
            badge.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20";
        } else {
            badge.innerText = "Not Ready";
            badge.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700";
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

    async dispatchEctsMagicLink() {
        const emailInput = document.getElementById("magic-advisor-email");
        if (!emailInput) return;
        const email = emailInput.value.trim();
        if (!email) {
            this.showError("Please provide a valid university advisor email.");
            return;
        }

        this.showToast(`Magic link sent to ${email}! Simulating instant advisor sign-off...`);
        emailInput.value = "";

        // Wait 1.5 seconds, then set the university approval checkbox status to APPROVED!
        setTimeout(async () => {
            await this.updateCompliance("schoolApproval", "approved");
            this.showToast("Success: University advisor clicked magic-link. Co-op approved!");
        }, 1500);
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
                <div class="col-span-full text-center py-12 text-slate-500 text-sm">
                    <i class="fa-solid fa-briefcase text-4xl mb-2 text-indigo-500/25" aria-hidden="true"></i>
                    <p>No job postings yet. Post your first opportunity!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = jobs.map(j => `
            <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xs text-left">
                <span class="bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Active Listing</span>
                <h4 class="font-extrabold text-slate-200 text-base mt-2">${j.title}</h4>
                <p class="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">${j.description}</p>
                <div class="flex flex-wrap gap-1 mt-4">
                    ${j.skills_required.split(',').map(s => s.trim()).filter(Boolean).map(s => `<span class="bg-slate-950 border border-slate-850 text-slate-400 text-[9px] px-1.5 py-0.5 rounded-md font-bold">${s}</span>`).join('')}
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
            if (r.status === "pending") statusBadge = `<span class="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">Pending</span>`;
            else if (r.status === "ignored") statusBadge = `<span class="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Ignored</span>`;
            else if (r.status === "warned") statusBadge = `<span class="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">Warned</span>`;
            else statusBadge = `<span class="bg-rose-500/10 text-rose-450 border border-rose-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">Suspended</span>`;

            const isPending = r.status === "pending";

            return `
                <tr>
                    <td class="px-4 py-3 font-semibold text-slate-500">#${r.id}</td>
                    <td class="px-4 py-3">User #${r.reporter_id}</td>
                    <td class="px-4 py-3 font-bold text-slate-300">User #${r.reported_user_id}</td>
                    <td class="px-4 py-3 max-w-xs truncate font-medium text-slate-400" title="${r.reason}">${r.reason}</td>
                    <td class="px-4 py-3">${statusBadge}</td>
                    <td class="px-4 py-3 text-right space-x-1.5">
                        ${isPending ? `
                            <button onclick="app.executeAdminAction(${r.id}, 'ignore')" class="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold px-2.5 py-1.5 rounded focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden" style="min-height: 32px;">Ignore</button>
                            <button onclick="app.executeAdminAction(${r.id}, 'warn')" class="text-[10px] bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 font-bold px-2.5 py-1.5 rounded focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden" style="min-height: 32px;">Warn</button>
                            <button onclick="app.executeAdminAction(${r.id}, 'suspend')" class="text-[10px] bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-455 font-bold px-2.5 py-1.5 rounded focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden" style="min-height: 32px;">Suspend</button>
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

        // Render CAC Chart with clean High-Contrast styling
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
                        backgroundColor: '#d946ef', // Neon fuchsia
                        borderRadius: 6
                    },
                    {
                        label: 'LTV ($)',
                        data: [180, 1600, 8000],
                        backgroundColor: '#10b981', // Neon emerald
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#94a3b8', font: { weight: 'bold', size: 10 } } },
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
                    x: { ticks: { color: '#64748b', font: { weight: 'bold', size: 9 } }, grid: { color: '#1e293b' } },
                    y: { ticks: { color: '#64748b', font: { weight: 'bold', size: 9 } }, grid: { color: '#1e293b' } }
                }
            }
        });

        // Render TAM/SAM/SOM Chart with clean High-Contrast styling
        const ctxTam = document.getElementById('tamChart').getContext('2d');
        if (window.myTamChart) window.myTamChart.destroy();
        window.myTamChart = new Chart(ctxTam, {
            type: 'doughnut',
            data: {
                labels: tamLabels,
                datasets: [{
                    data: [43, 12, 0.35],
                    backgroundColor: ['#6366f1', '#14b8a6', '#f59e0b'],
                    borderColor: '#0f172a',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#94a3b8', font: { weight: 'bold', size: 10 } } },
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
                <div class="flex space-x-2 py-1 border-b border-slate-800 last:border-0 hover:bg-slate-900/50">
                    <span class="text-indigo-400 font-bold shrink-0">[${dateStr}]</span>
                    <span class="text-fuchsia-400 font-bold shrink-0">${ev.event_name.toUpperCase()}</span>
                    <span class="text-slate-500 shrink-0">User #${ev.user_id || 'SYS'}</span>
                    <span class="text-slate-350 truncate font-semibold" title='${ev.payload}'>${ev.payload}</span>
                </div>
            `;
        }).join('');
    }

    // Convenience utility to switch roles / elevate to admin for ease of testing
    async elevateToAdmin() {
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

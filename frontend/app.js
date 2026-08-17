// ===========================================================================
// SOLIS — Daily Gratitude Journal
// Pure Minimalist React (Zero Emojis, Zero Gradients, Clean SVG Icons)
// ===========================================================================

const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;
const { createRoot } = ReactDOM;
const h = React.createElement;

// ---------------------------------------------------------------------------
// 1. Clean SVG Icons Library (Lucide/Feather stroke standard)
// ---------------------------------------------------------------------------
function Icon({ d, size = 16, className = "", strokeWidth = 2 }) {
  return h("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: className,
  }, typeof d === "string" ? h("path", { d }) : d);
}

const Icons = {
  Book: (props) => h(Icon, {
    ...props,
    d: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z M4 6h16"
  }),
  Calendar: (props) => h(Icon, {
    ...props,
    d: [
      h("rect", { key: "r", x: "3", y: "4", width: "18", height: "18", rx: "2", ry: "2" }),
      h("line", { key: "l1", x1: "16", y1: "2", x2: "16", y2: "6" }),
      h("line", { key: "l2", x1: "8", y1: "2", x2: "8", y2: "6" }),
      h("line", { key: "l3", x1: "3", y1: "10", x2: "21", y2: "10" })
    ]
  }),
  Timeline: (props) => h(Icon, {
    ...props,
    d: [
      h("circle", { key: "c", cx: "12", cy: "12", r: "10" }),
      h("polyline", { key: "p", points: "12 6 12 12 16 14" })
    ]
  }),
  Flame: (props) => h(Icon, {
    ...props,
    d: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
  }),
  Sparkles: (props) => h(Icon, {
    ...props,
    d: [
      h("path", { key: "p1", d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" }),
      h("path", { key: "p2", d: "M5 3v4" }),
      h("path", { key: "p3", d: "M19 17v4" }),
      h("path", { key: "p4", d: "M3 5h4" }),
      h("path", { key: "p5", d: "M17 19h4" })
    ]
  }),
  Bell: (props) => h(Icon, {
    ...props,
    d: [
      h("path", { key: "p1", d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" }),
      h("path", { key: "p2", d: "M10.3 21a1.94 1.94 0 0 0 3.4 0" })
    ]
  }),
  BellOff: (props) => h(Icon, {
    ...props,
    d: [
      h("path", { key: "p1", d: "M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5" }),
      h("path", { key: "p2", d: "M17 17H3s3-2 3-9a6 6 0 0 1 .4-2.1" }),
      h("path", { key: "p3", d: "M10.3 21a1.94 1.94 0 0 0 3.4 0" }),
      h("line", { key: "l", x1: "2", y1: "2", x2: "22", y2: "22" })
    ]
  }),
  Check: (props) => h(Icon, {
    ...props,
    d: "M20 6 9 17l-5-5"
  }),
  ChevronLeft: (props) => h(Icon, {
    ...props,
    d: "m15 18-6-6 6-6"
  }),
  ChevronRight: (props) => h(Icon, {
    ...props,
    d: "m9 18 6-6-6-6"
  }),
  Trash: (props) => h(Icon, {
    ...props,
    d: [
      h("path", { key: "p1", d: "M3 6h18" }),
      h("path", { key: "p2", d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }),
      h("path", { key: "p3", d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" })
    ]
  }),
  Edit: (props) => h(Icon, {
    ...props,
    d: [
      h("path", { key: "p1", d: "M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" }),
      h("path", { key: "p2", d: "m15 5 4 4" })
    ]
  }),
  Download: (props) => h(Icon, {
    ...props,
    d: [
      h("path", { key: "p1", d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
      h("polyline", { key: "p2", points: "7 10 12 15 17 10" }),
      h("line", { key: "l", x1: "12", y1: "15", x2: "12", y2: "3" })
    ]
  }),
  Search: (props) => h(Icon, {
    ...props,
    d: [
      h("circle", { key: "c", cx: "11", cy: "11", r: "8" }),
      h("line", { key: "l", x1: "21", y1: "21", x2: "16.65", y2: "16.65" })
    ]
  }),
  User: (props) => h(Icon, {
    ...props,
    d: [
      h("path", { key: "p1", d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }),
      h("circle", { key: "c", cx: "12", cy: "7", r: "4" })
    ]
  }),
  LogOut: (props) => h(Icon, {
    ...props,
    d: [
      h("path", { key: "p1", d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }),
      h("polyline", { key: "p2", points: "16 17 21 12 16 7" }),
      h("line", { key: "l", x1: "21", y1: "12", x2: "9", y2: "12" })
    ]
  }),
  Refresh: (props) => h(Icon, {
    ...props,
    d: [
      h("path", { key: "p1", d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" }),
      h("path", { key: "p2", d: "M21 3v5h-5" }),
      h("path", { key: "p3", d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" }),
      h("path", { key: "p4", d: "M8 16H3v5" })
    ]
  }),
  BarChart: (props) => h(Icon, {
    ...props,
    d: [
      h("line", { key: "l1", x1: "18", y1: "20", x2: "18", y2: "10" }),
      h("line", { key: "l2", x1: "12", y1: "20", x2: "12", y2: "4" }),
      h("line", { key: "l3", x1: "6", y1: "20", x2: "6", y2: "14" })
    ]
  }),
  X: (props) => h(Icon, {
    ...props,
    d: [
      h("line", { key: "l1", x1: "18", y1: "6", x2: "6", y2: "18" }),
      h("line", { key: "l2", x1: "6", y1: "6", x2: "18", y2: "18" })
    ]
  }),
  ArrowRight: (props) => h(Icon, {
    ...props,
    d: [
      h("line", { key: "l", x1: "5", y1: "12", x2: "19", y2: "12" }),
      h("polyline", { key: "p", points: "12 5 19 12 12 19" })
    ]
  }),
  Quote: (props) => h(Icon, {
    ...props,
    d: [
      h("path", { key: "p1", d: "M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" }),
      h("path", { key: "p2", d: "M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" })
    ]
  }),
  AlertCircle: (props) => h(Icon, {
    ...props,
    d: [
      h("circle", { key: "c", cx: "12", cy: "12", r: "10" }),
      h("line", { key: "l1", x1: "12", y1: "8", x2: "12", y2: "12" }),
      h("line", { key: "l2", x1: "12", y1: "16", x2: "12.01", y2: "16" })
    ]
  }),
};

// ---------------------------------------------------------------------------
// 2. Audio Chime (Web Audio API Synthesizer - Minimalist Harmonic Tone)
// ---------------------------------------------------------------------------
function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      const startTime = ctx.currentTime + idx * 0.06;
      const duration = 1.0;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.05, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (e) {
    // User interaction policy
  }
}

// ---------------------------------------------------------------------------
// 3. Curated Prompts & Quotes
// ---------------------------------------------------------------------------
const GRATITUDE_PROMPTS = [
  {
    category: "Sensory Details",
    prompt: "What simple comfort or small sensory detail (warm morning tea, clean air, soft light) brought quiet satisfaction today?"
  },
  {
    category: "Human Connection",
    prompt: "Who offered you patience, attentive listening, or thoughtful kindness recently?"
  },
  {
    category: "Resilience",
    prompt: "What challenge, delay, or friction did you handle today with composure and calm?"
  },
  {
    category: "Surroundings",
    prompt: "What detail in your physical surroundings or the weather made you pause with appreciation?"
  },
  {
    category: "Self Regard",
    prompt: "What constructive or healthy choice did you make for your mind or body today?"
  },
  {
    category: "Serendipity",
    prompt: "What unexpected small coincidence or pleasant moment occurred today?"
  },
  {
    category: "Perspective",
    prompt: "What past difficulty are you now grateful to have resolved and learned from?"
  },
  {
    category: "Stillness",
    prompt: "Where did you experience a brief moment of stillness today, and how did it feel?"
  }
];

const INSPIRATIONAL_QUOTES = [
  { quote: "Gratitude turns what we have into enough.", author: "Aesop" },
  { quote: "Enjoy the little things, for one day you may look back and realize they were the big things.", author: "Robert Brault" },
  { quote: "The soul that gives thanks can find comfort in everything.", author: "Hannah Whitall Smith" },
  { quote: "Gratitude is not only the greatest of virtues, but the parent of all the others.", author: "Cicero" },
  { quote: "In ordinary life, we hardly realize that we receive a great deal more than we give.", author: "Dietrich Bonhoeffer" }
];

// ---------------------------------------------------------------------------
// 4. Axios Interceptor & Authentication Architecture
// ---------------------------------------------------------------------------
const api = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("solis_access_token");
    if (accessToken) {
      config.headers.Authorization = "Bearer " + accessToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/api/auth/")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("solis_refresh_token");

      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem("solis_access_token");
        localStorage.removeItem("solis_refresh_token");
        window.dispatchEvent(new CustomEvent("auth:expired"));
        return Promise.reject(error);
      }

      try {
        const response = await axios.post("/api/auth/refresh/", {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem("solis_access_token", newAccessToken);
        if (response.data.refresh) {
          localStorage.setItem("solis_refresh_token", response.data.refresh);
        }

        api.defaults.headers.common.Authorization = "Bearer " + newAccessToken;
        originalRequest.headers.Authorization = "Bearer " + newAccessToken;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("solis_access_token");
        localStorage.removeItem("solis_refresh_token");
        window.dispatchEvent(new CustomEvent("auth:expired"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// 5. Global Auth Context
// ---------------------------------------------------------------------------
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem("solis_access_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const response = await api.get("/api/auth/me/");
      setUser(response.data);
      setAuthError(null);
    } catch (err) {
      console.warn("User profile fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    const handleAuthExpired = () => {
      setUser(null);
      setAuthError("Session expired. Please sign in again.");
    };

    window.addEventListener("auth:expired", handleAuthExpired);
    return () => window.removeEventListener("auth:expired", handleAuthExpired);
  }, [fetchCurrentUser]);

  const login = async (username, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await api.post("/api/auth/login/", {
        username,
        password,
      });

      const { access, refresh } = response.data;
      localStorage.setItem("solis_access_token", access);
      localStorage.setItem("solis_refresh_token", refresh);

      const userRes = await api.get("/api/auth/me/");
      setUser(userRes.data);
      setLoading(false);
      return { success: true, user: userRes.data };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.detail || "Invalid username or password.";
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (username, email, password, passwordConfirm) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await api.post("/api/auth/register/", {
        username,
        email,
        password,
        password_confirm: passwordConfirm,
      });

      const { access, refresh, user: registeredUser } = response.data;
      localStorage.setItem("solis_access_token", access);
      localStorage.setItem("solis_refresh_token", refresh);

      setUser(registeredUser);
      setLoading(false);
      return { success: true, user: registeredUser };
    } catch (err) {
      setLoading(false);
      let msg = "Registration failed. Please review your credentials.";
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          const val = data[firstKey];
          msg = Array.isArray(val) ? val[0] : String(val);
        }
      }
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem("solis_access_token");
    localStorage.removeItem("solis_refresh_token");
    setUser(null);
    setAuthError(null);
  };

  const value = {
    user,
    loading,
    authError,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser: fetchCurrentUser,
  };

  return h(AuthContext.Provider, { value }, children);
}

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// 6. ProtectedRoute Wrapper
// ---------------------------------------------------------------------------
function ProtectedRoute({ children, fallback }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return h("div", { className: "min-h-screen flex flex-col items-center justify-center bg-[#FBF9F5] text-[#78716C] p-6" },
      h("div", { className: "w-6 h-6 rounded-full border-2 border-[#E7E5E0] border-t-[#1C1917] animate-spin mb-3" }),
      h("p", { className: "font-serif text-sm italic text-[#44403C]" }, "Loading journal...")
    );
  }

  if (!isAuthenticated) {
    return fallback;
  }

  return children;
}

// ---------------------------------------------------------------------------
// 7. Navbar Component (Minimalist Clean Header)
// ---------------------------------------------------------------------------
function Navbar({ activeTab, setActiveTab, stats, onOpenPromptModal, onOpenStatsModal, soundEnabled, setSoundEnabled }) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) playChime();
  };

  return h("header", { className: "bg-[#FBF9F5] border-b border-[#E7E5E0] sticky top-0 z-30 px-4 md:px-8 py-3" },
    h("div", { className: "max-w-5xl mx-auto flex items-center justify-between" },
      
      // Brand
      h("div", { className: "flex items-center gap-3" },
        h("div", { className: "w-8 h-8 rounded-lg bg-[#1C1917] text-white flex items-center justify-center" },
          h(Icons.Book, { size: 16 })
        ),
        h("div", { className: "flex items-baseline gap-2" },
          h("span", { className: "font-serif text-xl font-semibold tracking-tight text-[#1C1917]" }, "Solis"),
          h("span", { className: "text-xs font-mono text-[#78716C] uppercase tracking-wider hidden sm:inline" }, "Journal")
        )
      ),

      // Center Tabs
      h("nav", { className: "hidden md:flex items-center bg-[#F0EDE6] p-1 rounded-lg border border-[#E7E5E0]" },
        h("button", {
          onClick: () => setActiveTab("calendar"),
          className: "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors " +
            (activeTab === "calendar" ? "bg-white text-[#1C1917] shadow-sm font-semibold" : "text-[#78716C] hover:text-[#1C1917]")
        },
          h(Icons.Calendar, { size: 14 }),
          "Calendar"
        ),
        h("button", {
          onClick: () => setActiveTab("timeline"),
          className: "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors " +
            (activeTab === "timeline" ? "bg-white text-[#1C1917] shadow-sm font-semibold" : "text-[#78716C] hover:text-[#1C1917]")
        },
          h(Icons.Timeline, { size: 14 }),
          "Timeline"
        )
      ),

      // Right Action Group
      h("div", { className: "flex items-center gap-2" },
        
        // Streak Badge
        h("button", {
          onClick: onOpenStatsModal,
          "aria-label": "Streak insights",
          title: "Streak insights",
          className: "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white border border-[#E7E5E0] hover:border-[#D6D3D1] text-xs transition-colors shadow-subtle"
        },
          h(Icons.Flame, { size: 14, className: "text-[#854D0E]" }),
          h("span", { className: "font-mono font-semibold text-[#1C1917]" }, stats?.current_streak || 0),
          h("span", { className: "text-[#78716C] text-[11px] hidden sm:inline" }, (stats?.current_streak === 1 ? "day" : "days"))
        ),

        // Prompts Modal Button
        h("button", {
          onClick: onOpenPromptModal,
          "aria-label": "Browse prompts",
          title: "Browse prompts",
          className: "p-2 rounded-md bg-white border border-[#E7E5E0] hover:border-[#D6D3D1] text-[#57534E] hover:text-[#1C1917] transition-colors shadow-subtle"
        },
          h(Icons.Sparkles, { size: 15 })
        ),

        // Sound Toggle
        h("button", {
          onClick: toggleSound,
          "aria-label": soundEnabled ? "Mute chimes" : "Enable chimes",
          title: soundEnabled ? "Chime enabled" : "Chime muted",
          className: "p-2 rounded-md bg-white border border-[#E7E5E0] hover:border-[#D6D3D1] text-[#57534E] hover:text-[#1C1917] transition-colors shadow-subtle"
        },
          soundEnabled ? h(Icons.Bell, { size: 15 }) : h(Icons.BellOff, { size: 15 })
        ),

        // User Dropdown
        h("div", { className: "relative ml-1" },
          h("button", {
            onClick: () => setShowMenu(!showMenu),
            "aria-label": "User menu",
            className: "flex items-center gap-2 p-1.5 rounded-md hover:bg-[#F0EDE6] transition-colors"
          },
            h("div", { className: "w-7 h-7 rounded-md bg-[#E7E5E0] text-[#1C1917] flex items-center justify-center text-xs font-semibold font-mono" },
              (user?.username?.charAt(0).toUpperCase() || "U")
            ),
            h("span", { className: "text-xs font-medium text-[#1C1917] hidden sm:inline" }, user?.username)
          ),

          showMenu && h("div", {
            className: "absolute right-0 mt-1 w-44 rounded-lg bg-white border border-[#E7E5E0] shadow-modal p-1.5 z-50",
            onClick: () => setShowMenu(false)
          },
            h("div", { className: "px-2.5 py-1.5 border-b border-[#F0EDE6] mb-1" },
              h("p", { className: "text-[10px] text-[#78716C] font-mono" }, "Signed in as"),
              h("p", { className: "text-xs font-semibold text-[#1C1917] truncate" }, user?.username)
            ),
            h("button", {
              onClick: onOpenStatsModal,
              className: "w-full flex items-center gap-2 text-left px-2.5 py-1.5 rounded-md text-xs text-[#44403C] hover:bg-[#F7F5F0] transition-colors"
            },
              h(Icons.BarChart, { size: 14 }),
              "Statistics"
            ),
            h("button", {
              onClick: logout,
              className: "w-full flex items-center gap-2 text-left px-2.5 py-1.5 rounded-md text-xs text-rose-700 hover:bg-rose-50 transition-colors mt-0.5"
            },
              h(Icons.LogOut, { size: 14 }),
              "Sign out"
            )
          )
        )

      )
    ),

    // Mobile Navigation Bar
    h("div", { className: "md:hidden flex justify-center mt-2 pt-2 border-t border-[#E7E5E0]" },
      h("nav", { className: "flex items-center bg-[#F0EDE6] p-0.5 rounded-lg border border-[#E7E5E0] w-full max-w-xs" },
        h("button", {
          onClick: () => setActiveTab("calendar"),
          className: "flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md text-xs font-medium " +
            (activeTab === "calendar" ? "bg-white text-[#1C1917] shadow-sm font-semibold" : "text-[#78716C]")
        },
          h(Icons.Calendar, { size: 13 }),
          "Calendar"
        ),
        h("button", {
          onClick: () => setActiveTab("timeline"),
          className: "flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md text-xs font-medium " +
            (activeTab === "timeline" ? "bg-white text-[#1C1917] shadow-sm font-semibold" : "text-[#78716C]")
        },
          h(Icons.Timeline, { size: 13 }),
          "Timeline"
        )
      )
    )
  );
}

// ---------------------------------------------------------------------------
// 8. Calendar View Component (Refined Proportions & Clean Minimal Grid)
// ---------------------------------------------------------------------------
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CalendarView({ selectedDate, onSelectDate, activeDatesSet, entriesMap, todayStr }) {
  const initialDate = selectedDate ? new Date(selectedDate + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    if (todayStr) onSelectDate(todayStr);
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);

    let startDay = firstDay.getDay() - 1;
    if (startDay === -1) startDay = 6;

    const daysInMonth = lastDay.getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = startDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        isFuture: dateStr > todayStr,
        hasEntry: activeDatesSet.has(dateStr),
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = viewYear + "-" + String(viewMonth + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        isFuture: dateStr > todayStr,
        hasEntry: activeDatesSet.has(dateStr),
      });
    }

    // Next month padding
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = y + "-" + String(m + 1).padStart(2, "0") + "-" + String(i).padStart(2, "0");
      days.push({
        dayNumber: i,
        dateStr,
        isCurrentMonth: false,
        isFuture: dateStr > todayStr,
        hasEntry: activeDatesSet.has(dateStr),
      });
    }

    return days;
  }, [viewYear, viewMonth, todayStr, activeDatesSet]);

  const monthStats = useMemo(() => {
    let count = 0;
    calendarDays.forEach((d) => {
      if (d.isCurrentMonth && d.hasEntry) count++;
    });
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    return {
      count,
      total: totalDays,
      percentage: Math.round((count / totalDays) * 100),
    };
  }, [calendarDays, viewYear, viewMonth]);

  return h("div", { className: "journal-card p-5 md:p-6" },
    
    // Month Navigator Header
    h("div", { className: "flex items-center justify-between pb-4 border-b border-[#E7E5E0]" },
      h("div", null,
        h("span", { className: "text-[11px] font-mono text-[#78716C] uppercase tracking-wider" }, "Calendar"),
        h("h2", { className: "font-serif text-2xl font-semibold text-[#1C1917] mt-0.5" },
          MONTH_NAMES[viewMonth] + " " + viewYear
        )
      ),
      h("div", { className: "flex items-center gap-1.5" },
        h("button", {
          onClick: handleJumpToToday,
          className: "btn-secondary text-xs px-2.5 py-1"
        }, "Today"),
        h("div", { className: "flex items-center bg-[#F7F5F0] border border-[#E7E5E0] rounded-md" },
          h("button", {
            onClick: handlePrevMonth,
            "aria-label": "Previous month",
            className: "p-1.5 hover:bg-white text-[#57534E] hover:text-[#1C1917] rounded-l-md transition-colors"
          }, h(Icons.ChevronLeft, { size: 14 })),
          h("button", {
            onClick: handleNextMonth,
            "aria-label": "Next month",
            className: "p-1.5 hover:bg-white text-[#57534E] hover:text-[#1C1917] rounded-r-md transition-colors"
          }, h(Icons.ChevronRight, { size: 14 }))
        )
      )
    ),

    // Day of Week Header
    h("div", { className: "grid grid-cols-7 gap-1 mt-3 mb-1 text-center" },
      WEEK_DAYS.map((day) =>
        h("div", { key: day, className: "text-[11px] font-mono font-medium text-[#78716C] py-1" }, day)
      )
    ),

    // Calendar Matrix Grid
    h("div", { className: "grid grid-cols-7 gap-1" },
      calendarDays.map((item, idx) => {
        const isSelected = item.dateStr === selectedDate;
        const isToday = item.dateStr === todayStr;

        return h("button", {
          key: idx,
          onClick: () => onSelectDate(item.dateStr),
          disabled: item.isFuture,
          "aria-label": "Select date " + item.dateStr,
          className: "relative flex flex-col items-center justify-between p-1.5 rounded-md min-h-[52px] transition-all " +
            (isSelected
              ? "bg-[#1C1917] text-white font-medium"
              : isToday
              ? "bg-[#FEF9C3] border border-[#CA8A04] text-[#713F12]"
              : item.isCurrentMonth
              ? "bg-[#FAF8F5] hover:bg-[#F0EDE6] text-[#292524]"
              : "bg-transparent text-[#A8A29E] opacity-50") +
            (item.isFuture ? " cursor-not-allowed opacity-25" : " cursor-pointer")
        },
          // Day number
          h("span", {
            className: "text-xs font-mono " + (isSelected ? "text-white font-semibold" : "")
          }, item.dayNumber),

          // Indicator Dot / Check
          h("div", { className: "h-3 flex items-center justify-center" },
            item.hasEntry ? (
              h("div", {
                className: "w-2 h-2 rounded-full " + (isSelected ? "bg-[#FEF9C3]" : "bg-[#854D0E]")
              })
            ) : null
          )
        );
      })
    ),

    // Summary Footer
    h("div", { className: "mt-4 pt-3 border-t border-[#E7E5E0] flex items-center justify-between text-xs text-[#78716C]" },
      h("div", { className: "flex items-center gap-3" },
        h("div", { className: "flex items-center gap-1.5" },
          h("div", { className: "w-2 h-2 rounded-full bg-[#854D0E]" }),
          h("span", { className: "text-[11px]" }, "Reflected")
        ),
        h("div", { className: "flex items-center gap-1.5" },
          h("div", { className: "w-2 h-2 rounded-full bg-[#E7E5E0]" }),
          h("span", { className: "text-[11px]" }, "Empty")
        )
      ),
      h("span", { className: "font-mono text-[11px]" },
        monthStats.count + " / " + monthStats.total + " days (" + monthStats.percentage + "%)"
      )
    )

  );
}

// ---------------------------------------------------------------------------
// 9. Entry Editor Component (Refined Typography & Distraction-Free Writing)
// ---------------------------------------------------------------------------
function EntryEditor({ dateStr, initialContent, onSave, onDelete, onNavigateDate, todayStr, soundEnabled }) {
  const [content, setContent] = useState(initialContent || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activePromptIdx, setActivePromptIdx] = useState(0);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    setContent(initialContent || "");
    setIsSaved(false);
    setErrorMsg(null);
    setShowConfirmDelete(false);
  }, [dateStr, initialContent]);

  const formattedDate = useMemo(() => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [dateStr]);

  const wordCount = useMemo(() => {
    if (!content || !content.trim()) return 0;
    return content.trim().split(/\s+/).length;
  }, [content]);

  const paragraphStatus = useMemo(() => {
    if (wordCount === 0) return { label: "Empty draft", color: "text-[#78716C]" };
    if (wordCount < 25) return { label: "Opening lines...", color: "text-[#854D0E]" };
    if (wordCount <= 120) return { label: "1 thoughtful paragraph", color: "text-emerald-700 font-medium" };
    return { label: "Extended entry", color: "text-[#44403C]" };
  }, [wordCount]);

  const handleRollPrompt = () => {
    setActivePromptIdx((prev) => (prev + 1) % GRATITUDE_PROMPTS.length);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      setErrorMsg("Please write your reflection before saving.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    try {
      await onSave(dateStr, content.trim());
      setIsSaving(false);
      setIsSaved(true);

      if (soundEnabled) playChime();

      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      setIsSaving(false);
      setErrorMsg(err.message || "Failed to save reflection.");
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsSaving(true);
    try {
      await onDelete(dateStr);
      setContent("");
      setIsSaving(false);
      setShowConfirmDelete(false);
    } catch (err) {
      setIsSaving(false);
      setErrorMsg("Failed to delete reflection.");
    }
  };

  const isToday = dateStr === todayStr;

  return h("div", { className: "journal-card p-5 md:p-6 flex flex-col justify-between" },
    
    h("div", null,
      
      // Top Date Navigation
      h("div", { className: "flex items-center justify-between pb-3 border-b border-[#E7E5E0]" },
        h("div", { className: "flex items-center gap-1" },
          h("button", {
            onClick: () => onNavigateDate(-1),
            "aria-label": "Previous day",
            className: "btn-secondary text-xs px-2 py-1"
          },
            h(Icons.ChevronLeft, { size: 14 }),
            "Prev"
          ),
          h("button", {
            onClick: () => onNavigateDate(1),
            disabled: dateStr >= todayStr,
            "aria-label": "Next day",
            className: "btn-secondary text-xs px-2 py-1 " + (dateStr >= todayStr ? "opacity-30 cursor-not-allowed" : "")
          },
            "Next",
            h(Icons.ChevronRight, { size: 14 })
          )
        ),
        h("div", { className: "flex items-center gap-2" },
          isToday && h("span", { className: "px-2 py-0.5 rounded bg-[#FEF9C3] text-[#713F12] text-[10px] font-mono font-medium border border-[#E7E5E0]" }, "Today"),
          h("span", { className: "text-xs font-mono text-[#78716C]" }, dateStr)
        )
      ),

      // Date Heading
      h("div", { className: "mt-4 mb-3" },
        h("h3", { className: "font-serif text-2xl font-semibold text-[#1C1917]" }, formattedDate),
        h("p", { className: "text-xs text-[#78716C] mt-0.5" }, "One paragraph to capture quiet gratitude.")
      ),

      // Prompt Suggestion Box
      h("div", { className: "my-3.5 p-3.5 rounded-lg bg-[#F7F5F0] border border-[#E7E5E0] flex items-start justify-between gap-3" },
        h("div", null,
          h("span", { className: "text-[10px] font-mono uppercase tracking-wider text-[#78716C] font-semibold" },
            "Prompt: " + GRATITUDE_PROMPTS[activePromptIdx].category
          ),
          h("p", { className: "font-serif text-sm italic text-[#44403C] mt-1 leading-relaxed" },
            "\"" + GRATITUDE_PROMPTS[activePromptIdx].prompt + "\""
          )
        ),
        h("button", {
          onClick: handleRollPrompt,
          "aria-label": "Next prompt",
          title: "Next prompt",
          className: "p-1.5 rounded hover:bg-white text-[#78716C] hover:text-[#1C1917] transition-colors shrink-0"
        },
          h(Icons.Refresh, { size: 14 })
        )
      ),

      // Error Alert
      errorMsg && h("div", { className: "mb-3 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2" },
        h(Icons.AlertCircle, { size: 14, className: "text-rose-700 shrink-0" }),
        errorMsg
      ),

      // Textarea
      h("div", { className: "relative mt-2" },
        h("textarea", {
          ref: textareaRef,
          value: content,
          onChange: (e) => setContent(e.target.value),
          onKeyDown: (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
          },
          placeholder: "What brought peace, quiet progress, or genuine warmth to your day? Write your one paragraph...",
          rows: 7,
          "aria-label": "Gratitude entry content",
          className: "w-full rounded-lg bg-[#FAF8F5] border border-[#E7E5E0] focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] p-4 text-[#1C1917] text-base font-serif placeholder:font-sans placeholder:text-[#A8A29E] placeholder:text-xs leading-relaxed focus:outline-none transition-all resize-none"
        }),
        h("div", { className: "absolute bottom-3 right-3 hidden sm:block text-[10px] font-mono text-[#A8A29E] pointer-events-none" },
          "Ctrl + Enter to save"
        )
      )
    ),

    // Footer Actions
    h("div", { className: "mt-4 pt-3 border-t border-[#E7E5E0] flex flex-col sm:flex-row items-center justify-between gap-3" },
      h("div", { className: "flex items-center gap-2 text-xs" },
        h("span", { className: "font-mono font-medium text-[#44403C]" }, wordCount + (wordCount === 1 ? " word" : " words")),
        h("span", { className: "text-[#D6D3D1]" }, "•"),
        h("span", { className: paragraphStatus.color }, paragraphStatus.label)
      ),

      h("div", { className: "flex items-center gap-2 self-end sm:self-auto" },
        initialContent && !showConfirmDelete && (
          h("button", {
            onClick: () => setShowConfirmDelete(true),
            "aria-label": "Delete entry",
            title: "Delete entry",
            className: "p-2 rounded-md hover:bg-rose-50 text-[#78716C] hover:text-rose-700 transition-colors"
          },
            h(Icons.Trash, { size: 15 })
          )
        ),

        showConfirmDelete && h("div", { className: "flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-md text-xs" },
          h("span", { className: "text-rose-800 text-[11px] px-1" }, "Delete?"),
          h("button", {
            onClick: handleDelete,
            className: "px-2 py-0.5 bg-rose-700 hover:bg-rose-800 text-white rounded text-[10px] font-medium"
          }, "Yes"),
          h("button", {
            onClick: () => setShowConfirmDelete(false),
            className: "px-1.5 py-0.5 text-[#78716C] hover:text-black text-[10px]"
          }, "Cancel")
        ),

        h("button", {
          onClick: handleSave,
          disabled: isSaving,
          className: "btn-primary text-xs"
        },
          isSaving ? (
            "Saving..."
          ) : isSaved ? (
            h("span", { className: "flex items-center gap-1.5" },
              h(Icons.Check, { size: 14 }),
              "Saved"
            )
          ) : (
            h("span", { className: "flex items-center gap-1.5" },
              h(Icons.Check, { size: 14 }),
              "Save Reflection"
            )
          )
        )
      )
    )

  );
}

// ---------------------------------------------------------------------------
// 10. Timeline View Component (Minimalist Chronicle Archive)
// ---------------------------------------------------------------------------
function TimelineView({ entries, onSelectEntryDate }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("ALL");

  const quote = useMemo(() => {
    const idx = Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length);
    return INSPIRATIONAL_QUOTES[idx];
  }, []);

  const filtered = useMemo(() => {
    return (entries || []).filter((e) => {
      const matchSearch = !searchTerm.trim() ||
        e.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.date.includes(searchTerm);
      if (!matchSearch) return false;
      if (selectedMonth !== "ALL") return e.date.startsWith(selectedMonth);
      return true;
    });
  }, [entries, searchTerm, selectedMonth]);

  const availableMonths = useMemo(() => {
    const set = new Set();
    (entries || []).forEach((e) => set.add(e.date.substring(0, 7)));
    return Array.from(set).sort().reverse();
  }, [entries]);

  const handleExport = () => {
    const textContent = (entries || [])
      .slice()
      .reverse()
      .map((e) => `DATE: ${e.date}\n----------------------------------------\n${e.content}\n\n`)
      .join("");
    
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Solis_Gratitude_Journal_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return h("div", { className: "space-y-5" },
    
    // Quote Banner
    h("div", { className: "journal-card p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#F7F5F0]" },
      h("div", { className: "flex items-start gap-3" },
        h(Icons.Quote, { size: 20, className: "text-[#78716C] shrink-0 mt-0.5" }),
        h("div", null,
          h("p", { className: "font-serif text-base text-[#1C1917] italic" },
            "\"" + quote.quote + "\""
          ),
          h("p", { className: "text-xs font-mono text-[#78716C] uppercase tracking-wider mt-1" },
            "— " + quote.author
          )
        )
      ),
      h("button", {
        onClick: handleExport,
        disabled: !entries || entries.length === 0,
        className: "btn-secondary text-xs shrink-0"
      },
        h(Icons.Download, { size: 14 }),
        "Export (.txt)"
      )
    ),

    // Search and Month Filter
    h("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-3" },
      h("div", { className: "relative w-full sm:w-72" },
        h("div", { className: "absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#78716C]" },
          h(Icons.Search, { size: 14 })
        ),
        h("input", {
          type: "text",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          placeholder: "Search reflections or date...",
          className: "w-full pl-9 pr-3 py-1.5 bg-white border border-[#E7E5E0] focus:border-[#1C1917] rounded-md text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none"
        })
      ),

      availableMonths.length > 0 && h("div", { className: "flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1" },
        h("button", {
          onClick: () => setSelectedMonth("ALL"),
          className: "px-2.5 py-1 rounded-md text-xs font-mono transition-colors " +
            (selectedMonth === "ALL" ? "bg-[#1C1917] text-white font-medium" : "bg-white text-[#78716C] border border-[#E7E5E0] hover:text-[#1C1917]")
        }, "All"),
        availableMonths.map((m) =>
          h("button", {
            key: m,
            onClick: () => setSelectedMonth(m),
            className: "px-2.5 py-1 rounded-md text-xs font-mono transition-colors " +
              (selectedMonth === m ? "bg-[#1C1917] text-white font-medium" : "bg-white text-[#78716C] border border-[#E7E5E0] hover:text-[#1C1917]")
          }, m)
        )
      )
    ),

    // List of Reflection Cards
    filtered.length === 0 ? (
      h("div", { className: "journal-card p-10 text-center" },
        h("p", { className: "font-serif text-base text-[#44403C] italic" }, "No reflections found."),
        h("p", { className: "text-xs text-[#78716C] mt-1" },
          searchTerm ? "Try another search term." : "Write your first entry in the calendar tab."
        )
      )
    ) : (
      h("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
        filtered.map((entry) => {
          const d = new Date(entry.date + "T00:00:00");
          const dayNum = d.getDate();
          const monthName = d.toLocaleDateString("en-US", { month: "short" });
          const yearNum = d.getFullYear();
          const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
          const words = entry.content.trim().split(/\s+/).length;

          return h("div", {
            key: entry.id,
            className: "journal-card p-5 flex flex-col justify-between hover:border-[#A8A29E] transition-colors"
          },
            h("div", null,
              h("div", { className: "flex items-center justify-between pb-3 border-b border-[#E7E5E0]" },
                h("div", { className: "flex items-baseline gap-2" },
                  h("span", { className: "font-mono font-semibold text-sm text-[#1C1917]" }, `${monthName} ${dayNum}, ${yearNum}`),
                  h("span", { className: "text-xs text-[#78716C]" }, `(${weekday})`)
                ),
                h("button", {
                  onClick: () => onSelectEntryDate(entry.date),
                  "aria-label": "Edit reflection",
                  className: "p-1 rounded text-[#78716C] hover:text-[#1C1917] transition-colors"
                },
                  h(Icons.Edit, { size: 14 })
                )
              ),

              h("div", { className: "my-4" },
                h("p", { className: "font-serif text-base text-[#292524] leading-relaxed" },
                  entry.content
                )
              )
            ),

            h("div", { className: "pt-3 border-t border-[#E7E5E0] flex items-center justify-between text-xs text-[#78716C]" },
              h("span", { className: "font-mono text-[11px]" }, words + (words === 1 ? " word" : " words")),
              h("button", {
                onClick: () => onSelectEntryDate(entry.date),
                className: "text-[#1C1917] hover:underline text-xs font-medium"
              }, "Open in Editor →")
            )
          );
        })
      )
    )

  );
}

// ---------------------------------------------------------------------------
// 11. Prompts & Stats Modals (Clean Minimal Layout)
// ---------------------------------------------------------------------------
function PromptModal({ isOpen, onClose, onSelectPrompt }) {
  if (!isOpen) return null;

  return h("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/30 backdrop-blur-sm" },
    h("div", { className: "w-full max-w-xl journal-card p-6 max-h-[85vh] overflow-y-auto shadow-modal" },
      
      h("div", { className: "flex items-center justify-between pb-3 border-b border-[#E7E5E0]" },
        h("div", null,
          h("h3", { className: "font-serif text-xl font-semibold text-[#1C1917]" }, "Writing Prompts"),
          h("p", { className: "text-xs text-[#78716C]" }, "Curated angles for mindful observation.")
        ),
        h("button", {
          onClick: onClose,
          "aria-label": "Close",
          className: "p-1 rounded text-[#78716C] hover:text-[#1C1917] transition-colors"
        },
          h(Icons.X, { size: 16 })
        )
      ),

      h("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 my-4" },
        GRATITUDE_PROMPTS.map((item, idx) =>
          h("div", {
            key: idx,
            className: "p-3.5 rounded-lg border border-[#E7E5E0] bg-[#FAF8F5] flex flex-col justify-between"
          },
            h("div", null,
              h("span", { className: "text-[10px] font-mono uppercase tracking-wider text-[#78716C] font-semibold" }, item.category),
              h("p", { className: "font-serif italic text-sm text-[#292524] mt-1.5 leading-relaxed" }, "\"" + item.prompt + "\"")
            ),
            h("div", { className: "mt-3 pt-2 border-t border-[#E7E5E0] flex justify-end" },
              h("button", {
                onClick: () => {
                  onSelectPrompt(item.prompt);
                  onClose();
                },
                className: "btn-secondary text-xs px-2.5 py-1"
              }, "Use Prompt")
            )
          )
        )
      )

    )
  );
}

function StatsModal({ isOpen, onClose, stats }) {
  if (!isOpen) return null;

  return h("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/30 backdrop-blur-sm" },
    h("div", { className: "w-full max-w-md journal-card p-6 shadow-modal" },
      
      h("div", { className: "flex items-center justify-between pb-3 border-b border-[#E7E5E0]" },
        h("div", null,
          h("h3", { className: "font-serif text-xl font-semibold text-[#1C1917]" }, "Statistics"),
          h("p", { className: "text-xs text-[#78716C]" }, "Your gratitude journaling progress.")
        ),
        h("button", {
          onClick: onClose,
          "aria-label": "Close",
          className: "p-1 rounded text-[#78716C] hover:text-[#1C1917] transition-colors"
        },
          h(Icons.X, { size: 16 })
        )
      ),

      h("div", { className: "grid grid-cols-2 gap-3 my-4" },
        h("div", { className: "p-3.5 rounded-lg border border-[#E7E5E0] bg-[#FAF8F5]" },
          h("span", { className: "text-[10px] font-mono uppercase tracking-wider text-[#78716C]" }, "Current Streak"),
          h("div", { className: "mt-1 flex items-baseline gap-1" },
            h("span", { className: "text-2xl font-mono font-semibold text-[#1C1917]" }, stats?.current_streak || 0),
            h("span", { className: "text-xs text-[#78716C]" }, "days")
          )
        ),
        h("div", { className: "p-3.5 rounded-lg border border-[#E7E5E0] bg-[#FAF8F5]" },
          h("span", { className: "text-[10px] font-mono uppercase tracking-wider text-[#78716C]" }, "Longest Streak"),
          h("div", { className: "mt-1 flex items-baseline gap-1" },
            h("span", { className: "text-2xl font-mono font-semibold text-[#1C1917]" }, stats?.longest_streak || 0),
            h("span", { className: "text-xs text-[#78716C]" }, "days")
          )
        ),
        h("div", { className: "p-3.5 rounded-lg border border-[#E7E5E0] bg-[#FAF8F5]" },
          h("span", { className: "text-[10px] font-mono uppercase tracking-wider text-[#78716C]" }, "Total Entries"),
          h("div", { className: "mt-1 flex items-baseline gap-1" },
            h("span", { className: "text-2xl font-mono font-semibold text-[#1C1917]" }, stats?.total_entries || 0),
            h("span", { className: "text-xs text-[#78716C]" }, "entries")
          )
        ),
        h("div", { className: "p-3.5 rounded-lg border border-[#E7E5E0] bg-[#FAF8F5]" },
          h("span", { className: "text-[10px] font-mono uppercase tracking-wider text-[#78716C]" }, "This Month"),
          h("div", { className: "mt-1 flex items-baseline gap-1" },
            h("span", { className: "text-2xl font-mono font-semibold text-[#1C1917]" }, stats?.this_month_count || 0),
            h("span", { className: "text-xs text-[#78716C]" }, "days")
          )
        )
      )

    )
  );
}

// ---------------------------------------------------------------------------
// 12. Auth Screens (Clean Minimalist Forms)
// ---------------------------------------------------------------------------
function Login({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await login(username.trim(), password);
    setLoading(false);
    if (!res.success) setError(res.error);
  };

  const handleFillDemo = () => {
    setUsername("alice");
    setPassword("ComplexPassword123!");
  };

  return h("div", { className: "min-h-screen flex items-center justify-center p-4 bg-[#FBF9F5]" },
    h("div", { className: "w-full max-w-sm journal-card p-8 shadow-card" },
      
      h("div", { className: "text-center mb-6" },
        h("div", { className: "w-9 h-9 rounded-lg bg-[#1C1917] text-white flex items-center justify-center mx-auto mb-3" },
          h(Icons.Book, { size: 18 })
        ),
        h("h1", { className: "font-serif text-2xl font-semibold text-[#1C1917]" }, "Solis"),
        h("p", { className: "text-xs text-[#78716C] mt-1" }, "A daily gratitude journal")
      ),

      error && h("div", { className: "mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2" },
        h(Icons.AlertCircle, { size: 14, className: "text-rose-700 shrink-0" }),
        error
      ),

      h("form", { onSubmit: handleSubmit, className: "space-y-3.5" },
        h("div", null,
          h("label", { className: "block text-xs font-medium text-[#44403C] mb-1" }, "Username"),
          h("input", {
            type: "text",
            required: true,
            value: username,
            onChange: (e) => setUsername(e.target.value),
            placeholder: "alice",
            className: "w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E0] focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] rounded-md text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none"
          })
        ),

        h("div", null,
          h("label", { className: "block text-xs font-medium text-[#44403C] mb-1" }, "Password"),
          h("input", {
            type: "password",
            required: true,
            value: password,
            onChange: (e) => setPassword(e.target.value),
            placeholder: "••••••••••••",
            className: "w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E5E0] focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] rounded-md text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none"
          })
        ),

        h("button", {
          type: "submit",
          disabled: loading,
          className: "btn-primary w-full py-2.5 mt-2"
        },
          loading ? "Signing in..." : "Sign In",
          h(Icons.ArrowRight, { size: 14 })
        )
      ),

      h("div", { className: "mt-6 pt-4 border-t border-[#E7E5E0] flex items-center justify-between text-xs" },
        h("button", {
          type: "button",
          onClick: handleFillDemo,
          className: "text-[#854D0E] hover:underline font-medium"
        }, "Fill Demo User"),
        h("button", {
          type: "button",
          onClick: onSwitchToRegister,
          className: "text-[#78716C] hover:text-[#1C1917]"
        }, "Create account →")
      )

    )
  );
}

function Register({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    const res = await register(username.trim(), email.trim(), password, passwordConfirm);
    setLoading(false);
    if (!res.success) setError(res.error);
  };

  return h("div", { className: "min-h-screen flex items-center justify-center p-4 bg-[#FBF9F5]" },
    h("div", { className: "w-full max-w-sm journal-card p-8 shadow-card" },
      
      h("div", { className: "text-center mb-6" },
        h("div", { className: "w-9 h-9 rounded-lg bg-[#1C1917] text-white flex items-center justify-center mx-auto mb-3" },
          h(Icons.Book, { size: 18 })
        ),
        h("h1", { className: "font-serif text-2xl font-semibold text-[#1C1917]" }, "Create Account"),
        h("p", { className: "text-xs text-[#78716C] mt-1" }, "Begin your daily gratitude habit")
      ),

      error && h("div", { className: "mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2" },
        h(Icons.AlertCircle, { size: 14, className: "text-rose-700 shrink-0" }),
        error
      ),

      h("form", { onSubmit: handleSubmit, className: "space-y-3" },
        h("div", null,
          h("label", { className: "block text-xs font-medium text-[#44403C] mb-1" }, "Username *"),
          h("input", {
            type: "text",
            required: true,
            value: username,
            onChange: (e) => setUsername(e.target.value),
            placeholder: "username",
            className: "w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#E7E5E0] focus:border-[#1C1917] rounded-md text-sm text-[#1C1917] focus:outline-none"
          })
        ),

        h("div", null,
          h("label", { className: "block text-xs font-medium text-[#44403C] mb-1" }, "Email (Optional)"),
          h("input", {
            type: "email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            placeholder: "email@domain.com",
            className: "w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#E7E5E0] focus:border-[#1C1917] rounded-md text-sm text-[#1C1917] focus:outline-none"
          })
        ),

        h("div", null,
          h("label", { className: "block text-xs font-medium text-[#44403C] mb-1" }, "Password *"),
          h("input", {
            type: "password",
            required: true,
            value: password,
            onChange: (e) => setPassword(e.target.value),
            placeholder: "Min 8 characters",
            className: "w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#E7E5E0] focus:border-[#1C1917] rounded-md text-sm text-[#1C1917] focus:outline-none"
          })
        ),

        h("div", null,
          h("label", { className: "block text-xs font-medium text-[#44403C] mb-1" }, "Confirm Password *"),
          h("input", {
            type: "password",
            required: true,
            value: passwordConfirm,
            onChange: (e) => setPasswordConfirm(e.target.value),
            placeholder: "Re-enter password",
            className: "w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#E7E5E0] focus:border-[#1C1917] rounded-md text-sm text-[#1C1917] focus:outline-none"
          })
        ),

        h("button", {
          type: "submit",
          disabled: loading,
          className: "btn-primary w-full py-2.5 mt-2"
        },
          loading ? "Creating account..." : "Register",
          h(Icons.ArrowRight, { size: 14 })
        )
      ),

      h("div", { className: "mt-5 pt-3 border-t border-[#E7E5E0] text-center text-xs" },
        h("span", { className: "text-[#78716C]" }, "Already have an account? "),
        h("button", {
          type: "button",
          onClick: onSwitchToLogin,
          className: "text-[#1C1917] font-semibold hover:underline"
        }, "Sign in")
      )

    )
  );
}

// ---------------------------------------------------------------------------
// 13. Main Dashboard Component
// ---------------------------------------------------------------------------
function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("calendar");
  
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [entries, setEntries] = useState([]);
  const [currentEntryContent, setCurrentEntryContent] = useState("");
  const [stats, setStats] = useState({
    total_entries: 0,
    current_streak: 0,
    longest_streak: 0,
    this_month_count: 0,
    active_dates: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const activeDatesSet = useMemo(() => {
    return new Set(stats.active_dates || []);
  }, [stats.active_dates]);

  const entriesMap = useMemo(() => {
    const map = {};
    (entries || []).forEach((e) => {
      map[e.date] = e;
    });
    return map;
  }, [entries]);

  const loadSanctuaryData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      const [entriesRes, statsRes] = await Promise.all([
        api.get("/api/entries/"),
        api.get("/api/entries/stats/"),
      ]);
      setEntries(entriesRes.data || []);
      setStats(statsRes.data || {});

      const current = (entriesRes.data || []).find((e) => e.date === selectedDate);
      setCurrentEntryContent(current ? current.content : "");
    } catch (err) {
      console.error("Failed to load records:", err);
      setError("Unable to sync records with the server.");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadSanctuaryData(true);
  }, []);

  useEffect(() => {
    const existing = (entries || []).find((e) => e.date === selectedDate);
    if (existing) {
      setCurrentEntryContent(existing.content);
    } else {
      api.get("/api/entries/by-date/?date=" + selectedDate)
        .then((res) => {
          if (res.data?.entry) setCurrentEntryContent(res.data.entry.content);
          else setCurrentEntryContent("");
        })
        .catch(() => setCurrentEntryContent(""));
    }
  }, [selectedDate, entries]);

  const handleSaveEntry = async (dateStr, content) => {
    try {
      const response = await api.post("/api/entries/upsert/", {
        date: dateStr,
        content: content,
      });

      const updated = response.data;
      setEntries((prev) => {
        const idx = prev.findIndex((e) => e.date === dateStr);
        if (idx >= 0) {
          const clone = [...prev];
          clone[idx] = updated;
          return clone;
        }
        return [updated, ...prev];
      });

      setCurrentEntryContent(updated.content);

      const statsRes = await api.get("/api/entries/stats/");
      setStats(statsRes.data || {});
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to save reflection.";
      throw new Error(msg);
    }
  };

  const handleDeleteEntry = async (dateStr) => {
    const entry = (entries || []).find((e) => e.date === dateStr);
    if (!entry) return;

    try {
      await api.delete("/api/entries/" + entry.id + "/");
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
      setCurrentEntryContent("");

      const statsRes = await api.get("/api/entries/stats/");
      setStats(statsRes.data || {});
    } catch (err) {
      throw new Error("Failed to delete entry.");
    }
  };

  const handleNavigateDate = (offset) => {
    const curr = new Date(selectedDate + "T00:00:00");
    curr.setDate(curr.getDate() + offset);
    const nextStr = curr.toISOString().slice(0, 10);
    if (nextStr <= todayStr) setSelectedDate(nextStr);
  };

  const handleSelectPrompt = (promptText) => {
    if (!currentEntryContent.trim()) {
      setCurrentEntryContent(promptText + "\n\n");
    } else {
      setCurrentEntryContent((prev) => prev + "\n\n" + promptText + " ");
    }
    setActiveTab("calendar");
  };

  return h("div", { className: "min-h-screen bg-[#FBF9F5] text-[#1C1917]" },
    
    // Header
    h(Navbar, {
      activeTab,
      setActiveTab,
      stats,
      onOpenPromptModal: () => setIsPromptModalOpen(true),
      onOpenStatsModal: () => setIsStatsModalOpen(true),
      soundEnabled,
      setSoundEnabled,
    }),

    // Main Container
    h("main", { className: "max-w-5xl mx-auto px-4 md:px-8 py-8" },
      
      error && h("div", { className: "mb-6 p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-800 text-xs" },
        h("span", { className: "flex items-center gap-2" },
          h(Icons.AlertCircle, { size: 14 }),
          error
        ),
        h("button", {
          onClick: () => loadSanctuaryData(false),
          className: "underline font-medium"
        }, "Retry")
      ),

      activeTab === "calendar" ? (
        h("div", { className: "space-y-6" },
          
          // Greetings
          h("div", { className: "flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-2" },
            h("div", null,
              h("h1", { className: "font-serif text-3xl font-semibold text-[#1C1917]" },
                "Welcome, " + (user?.username || "Writer")
              ),
              h("p", { className: "text-xs text-[#78716C] mt-0.5" },
                "Select a day from the calendar to write or review your gratitude entry."
              )
            ),
            h("button", {
              onClick: () => setIsPromptModalOpen(true),
              className: "btn-secondary text-xs"
            },
              h(Icons.Sparkles, { size: 13 }),
              "Daily Prompts"
            )
          ),

          // Two Column: Calendar + Editor
          h("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" },
            h("div", { className: "lg:col-span-6 w-full" },
              h(CalendarView, {
                selectedDate,
                onSelectDate: (d) => setSelectedDate(d),
                activeDatesSet,
                entriesMap,
                todayStr,
              })
            ),
            h("div", { className: "lg:col-span-6 w-full" },
              h(EntryEditor, {
                dateStr: selectedDate,
                initialContent: currentEntryContent,
                onSave: handleSaveEntry,
                onDelete: handleDeleteEntry,
                onNavigateDate: handleNavigateDate,
                todayStr,
                soundEnabled,
              })
            )
          )

        )
      ) : (
        h("div", { className: "space-y-6" },
          h("div", null,
            h("h1", { className: "font-serif text-3xl font-semibold text-[#1C1917]" }, "Timeline Archive"),
            h("p", { className: "text-xs text-[#78716C] mt-0.5" },
              "Search and browse all your past reflections."
            )
          ),
          h(TimelineView, {
            entries,
            onSelectEntryDate: (d) => {
              setSelectedDate(d);
              setActiveTab("calendar");
            }
          })
        )
      )

    ),

    // Modals
    h(PromptModal, {
      isOpen: isPromptModalOpen,
      onClose: () => setIsPromptModalOpen(false),
      onSelectPrompt: handleSelectPrompt,
    }),

    h(StatsModal, {
      isOpen: isStatsModalOpen,
      onClose: () => setIsStatsModalOpen(false),
      stats,
    })

  );
}

// ---------------------------------------------------------------------------
// 14. Root App
// ---------------------------------------------------------------------------
function MainApp() {
  const [authView, setAuthView] = useState("login");

  return h(ProtectedRoute, {
    fallback: authView === "login" ? (
      h(Login, { onSwitchToRegister: () => setAuthView("register") })
    ) : (
      h(Register, { onSwitchToLogin: () => setAuthView("login") })
    )
  }, h(Dashboard));
}

function App() {
  return h(AuthProvider, null, h(MainApp));
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(h(App));
  container.dataset.mounted = "true";
}

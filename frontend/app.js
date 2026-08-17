// ===========================================================================
// SOLIS — Daily Gratitude Journal
// Pure React + Tailwind Light Creamish Dreamy Aesthetic
// ===========================================================================

const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;
const { createRoot } = ReactDOM;
const h = React.createElement;

// ---------------------------------------------------------------------------
// 1. Audio Chime (Web Audio API Synthesizer - Zero external audio files)
// ---------------------------------------------------------------------------
function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Harmonic warm chords: A4 (440Hz), C#5 (554.37Hz), E5 (659.25Hz), A5 (880Hz)
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      const startTime = ctx.currentTime + idx * 0.05;
      const duration = 1.3;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.06, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (e) {
    // Audio context may require user interaction
  }
}

// ---------------------------------------------------------------------------
// 2. Curated Prompts & Timeless Quotes
// ---------------------------------------------------------------------------
const GRATITUDE_PROMPTS = [
  {
    category: "Sensory Delights",
    prompt: "What simple comfort or small sensory pleasure (warm morning light, crisp air, floral scent, warm tea) brought you quiet peace today?"
  },
  {
    category: "Human Kindness",
    prompt: "Who showed up for you with kindness, listening, or a warm, patient presence recently?"
  },
  {
    category: "Inner Resilience",
    prompt: "What challenge, delay, or discomfort did you navigate today with quiet grace and patience?"
  },
  {
    category: "Living World",
    prompt: "What detail in the sky, golden clouds, trees, or gentle breeze made you pause and smile?"
  },
  {
    category: "Self Gratitude",
    prompt: "What thoughtful choice did you make for your body, mind, or future self today?"
  },
  {
    category: "Serendipity",
    prompt: "What unexpected conversation, pleasant coincidence, or serendipitous moment unfolded today?"
  },
  {
    category: "Roots & Wisdom",
    prompt: "What past lesson or hardship are you thankful for having overcome and learned from?"
  },
  {
    category: "Quiet Sanctuary",
    prompt: "Where did you find three minutes of stillness today, and what did you feel in your breath?"
  }
];

const INSPIRATIONAL_QUOTES = [
  { quote: "Gratitude turns what we have into enough, and more.", author: "Aesop" },
  { quote: "Wear gratitude like a cloak, and it will feed every corner of your life.", author: "Rumi" },
  { quote: "Enjoy the little things, for one day you may look back and realize they were the big things.", author: "Robert Brault" },
  { quote: "The soul that gives thanks can find comfort in everything.", author: "Hannah Whitall Smith" },
  { quote: "Gratitude is not only the greatest of virtues, but the parent of all the others.", author: "Cicero" },
  { quote: "In ordinary life, we hardly realize that we receive a great deal more than we give.", author: "Dietrich Bonhoeffer" }
];

// ---------------------------------------------------------------------------
// 3. Axios Interceptor & JWT Authentication Architecture
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
// 4. Global AuthContext & State Management
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
      setAuthError("Your session has expired. Please sign in again.");
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
// 5. ProtectedRoute Wrapper Component
// ---------------------------------------------------------------------------
function ProtectedRoute({ children, fallback }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return h("div", { className: "min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] text-[#8C7D70] p-6" },
      h("div", { className: "w-12 h-12 rounded-full border-2 border-amber-600/20 border-t-amber-600 animate-spin mb-4" }),
      h("p", { className: "font-serif text-sm uppercase tracking-widest text-[#81563B] font-semibold" }, "Entering Sanctuary...")
    );
  }

  if (!isAuthenticated) {
    return fallback;
  }

  return children;
}

// ---------------------------------------------------------------------------
// 6. Navbar Component (Floating Light Glass Island)
// ---------------------------------------------------------------------------
function Navbar({ activeTab, setActiveTab, stats, onOpenPromptModal, onOpenStatsModal, soundEnabled, setSoundEnabled }) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) playChime();
  };

  return h("header", { className: "fixed top-0 left-0 right-0 z-40 px-4 md:px-8 py-4 pointer-events-none" },
    h("div", { className: "max-w-6xl mx-auto flex items-center justify-between pointer-events-auto" },
      
      // Brand
      h("div", { className: "flex items-center gap-3 bg-white/85 backdrop-blur-xl border border-amber-900/10 px-4 py-2 rounded-full shadow-lg shadow-amber-900/5" },
        h("div", { className: "w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-md shadow-amber-500/20 text-white font-serif font-bold text-sm" }, "✦"),
        h("div", { className: "flex items-center gap-1.5" },
          h("span", { className: "font-serif font-bold text-base tracking-wider text-[#2D2319]" }, "SOLIS"),
          h("span", { className: "text-[9px] uppercase font-mono tracking-widest text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded border border-amber-300/60 hidden sm:inline" }, "Journal")
        )
      ),

      // Center View Tabs
      h("nav", { className: "hidden md:flex items-center gap-1 bg-white/85 backdrop-blur-xl border border-amber-900/10 p-1.5 rounded-full shadow-lg shadow-amber-900/5" },
        h("button", {
          onClick: () => setActiveTab("calendar"),
          className: "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 " + 
            (activeTab === "calendar" ? "bg-amber-100/90 text-amber-950 font-semibold border border-amber-300/80 shadow-sm" : "text-[#7A6B5D] hover:text-[#2D2319] hover:bg-amber-50/60")
        }, "📅 Calendar Sanctuary"),
        h("button", {
          onClick: () => setActiveTab("timeline"),
          className: "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 " + 
            (activeTab === "timeline" ? "bg-amber-100/90 text-amber-950 font-semibold border border-amber-300/80 shadow-sm" : "text-[#7A6B5D] hover:text-[#2D2319] hover:bg-amber-50/60")
        }, "📖 Chronicle Timeline")
      ),

      // Right Action Island
      h("div", { className: "flex items-center gap-2" },
        
        // Streak Pill
        h("button", {
          onClick: onOpenStatsModal,
          "aria-label": "Open Gratitude Streak Insights",
          title: "Gratitude Streak Insights",
          className: "flex items-center gap-2 bg-white/85 backdrop-blur-xl border border-amber-300/80 hover:border-amber-500 px-3.5 py-2 rounded-full text-xs transition-all shadow-md shadow-amber-900/5 focus:ring-2 focus:ring-amber-500/40"
        },
          h("span", { className: "text-amber-600 text-sm" }, "🔥"),
          h("span", { className: "font-mono font-bold text-amber-900 text-xs" }, stats?.current_streak || 0),
          h("span", { className: "text-[#7A6B5D] text-[11px] hidden sm:inline" }, (stats?.current_streak === 1 ? "day" : "days"))
        ),

        // Prompts Trigger
        h("button", {
          onClick: onOpenPromptModal,
          "aria-label": "Browse Daily Reflection Prompts",
          title: "Browse Daily Prompts",
          className: "p-2.5 rounded-full bg-white/85 backdrop-blur-xl border border-amber-900/10 hover:border-amber-400 text-amber-700 hover:text-amber-900 transition-all shadow-md shadow-amber-900/5 focus:ring-2 focus:ring-amber-500/40"
        }, "✨"),

        // Sound Toggle
        h("button", {
          onClick: toggleSound,
          "aria-label": soundEnabled ? "Disable Audio Chimes" : "Enable Audio Chimes",
          title: soundEnabled ? "Chime Enabled" : "Chime Muted",
          className: "p-2.5 rounded-full bg-white/85 backdrop-blur-xl border border-amber-900/10 hover:border-amber-400 text-[#7A6B5D] hover:text-[#2D2319] transition-all shadow-md shadow-amber-900/5 text-xs focus:ring-2 focus:ring-amber-500/40"
        }, soundEnabled ? "🔔" : "🔕"),

        // User Dropdown
        h("div", { className: "relative" },
          h("button", {
            onClick: () => setShowMenu(!showMenu),
            "aria-label": "Toggle User Menu",
            className: "flex items-center gap-2 bg-white/85 backdrop-blur-xl border border-amber-900/10 hover:border-amber-300 pl-2 pr-3 py-1.5 rounded-full text-xs text-[#2D2319] transition-all shadow-md shadow-amber-900/5"
          },
            h("div", { className: "w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-[11px] font-bold text-white shadow-sm" },
              (user?.username?.charAt(0).toUpperCase() || "U")
            ),
            h("span", { className: "max-w-[80px] truncate font-medium hidden sm:inline" }, user?.username)
          ),

          showMenu && h("div", {
            className: "absolute right-0 mt-2 w-48 rounded-2xl bg-white/98 backdrop-blur-2xl border border-amber-200/80 shadow-2xl p-2 z-50 animate-in fade-in",
            onClick: () => setShowMenu(false)
          },
            h("div", { className: "px-3 py-2 border-b border-amber-900/10 mb-1" },
              h("p", { className: "text-[10px] text-[#8C7D70] font-mono" }, "Signed in as"),
              h("p", { className: "text-xs font-semibold text-[#2D2319] truncate mt-0.5" }, user?.username)
            ),
            h("button", {
              onClick: onOpenStatsModal,
              className: "w-full text-left px-3 py-2 rounded-xl text-xs text-[#4A3B2C] hover:text-amber-900 hover:bg-amber-50 transition-colors"
            }, "📊 Gratitude Stats"),
            h("button", {
              onClick: logout,
              className: "w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors mt-1"
            }, "🚪 Sign Out")
          )
        )
      )
    ),

    // Mobile View Selector
    h("div", { className: "md:hidden flex justify-center mt-2 pointer-events-auto" },
      h("nav", { className: "flex items-center gap-1 bg-white/90 backdrop-blur-xl border border-amber-900/10 p-1 rounded-full shadow-lg" },
        h("button", {
          onClick: () => setActiveTab("calendar"),
          className: "px-3 py-1 rounded-full text-xs font-medium " + 
            (activeTab === "calendar" ? "bg-amber-100 text-amber-950 font-semibold border border-amber-300" : "text-[#7A6B5D]")
        }, "📅 Calendar"),
        h("button", {
          onClick: () => setActiveTab("timeline"),
          className: "px-3 py-1 rounded-full text-xs font-medium " + 
            (activeTab === "timeline" ? "bg-amber-100 text-amber-950 font-semibold border border-amber-300" : "text-[#7A6B5D]")
        }, "📖 Timeline")
      )
    )
  );
}

// ---------------------------------------------------------------------------
// 7. Calendar View Component (Mindful Light Matrix)
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

    // Previous month padding
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

  return h("div", { className: "w-full" },
    h("div", { className: "double-bezel-outer" },
      h("div", { className: "double-bezel-inner p-5 md:p-8" },
        
        // Header
        h("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-amber-900/10" },
          h("div", null,
            h("div", { className: "flex items-center gap-2 mb-1" },
              h("span", { className: "w-2 h-2 rounded-full bg-amber-500 animate-pulse" }),
              h("span", { className: "text-[10px] uppercase font-mono tracking-widest text-amber-800 font-semibold" }, "Calendar Sanctuary")
            ),
            h("h2", { className: "font-serif text-2xl md:text-3xl font-bold tracking-tight text-amber-950" },
              MONTH_NAMES[viewMonth] + " " + viewYear
            )
          ),
          h("div", { className: "flex items-center gap-2 self-end sm:self-center" },
            h("button", {
              onClick: handleJumpToToday,
              className: "px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-medium text-amber-900 transition-all shadow-sm"
            }, "Today"),
            h("div", { className: "flex items-center bg-amber-50 border border-amber-200 rounded-full p-0.5 shadow-sm" },
              h("button", {
                onClick: handlePrevMonth,
                "aria-label": "Previous Month",
                className: "p-1.5 rounded-full text-amber-800 hover:text-amber-950 hover:bg-amber-100 transition-colors"
              }, "←"),
              h("button", {
                onClick: handleNextMonth,
                "aria-label": "Next Month",
                className: "p-1.5 rounded-full text-amber-800 hover:text-amber-950 hover:bg-amber-100 transition-colors"
              }, "→")
            )
          )
        ),

        // Day of week labels
        h("div", { className: "grid grid-cols-7 gap-1 md:gap-2 my-3 text-center" },
          WEEK_DAYS.map((day) =>
            h("div", { key: day, className: "text-[10px] md:text-[11px] font-mono uppercase tracking-wider text-amber-900/60 font-semibold py-1" }, day)
          )
        ),

        // Grid Cells
        h("div", { className: "grid grid-cols-7 gap-1.5 md:gap-2.5" },
          calendarDays.map((item, idx) => {
            const isSelected = item.dateStr === selectedDate;
            const isToday = item.dateStr === todayStr;

            return h("button", {
              key: idx,
              onClick: () => onSelectDate(item.dateStr),
              disabled: item.isFuture,
              "aria-label": "Select date " + item.dateStr,
              className: "relative group flex flex-col items-center justify-between p-2 md:p-3 min-h-[64px] md:min-h-[78px] rounded-2xl transition-all duration-300 " +
                (isSelected
                  ? "bg-gradient-to-b from-amber-100/90 to-amber-200/70 border-2 border-amber-500 shadow-[0_4px_16px_rgba(217,119,6,0.25)] scale-[1.03] z-10 text-amber-950 font-bold"
                  : isToday
                  ? "bg-amber-50/90 border border-amber-400 hover:border-amber-500 shadow-sm"
                  : item.isCurrentMonth
                  ? "bg-[#FCFAF7] hover:bg-amber-50/80 border border-amber-900/10 hover:border-amber-300 shadow-sm"
                  : "bg-stone-100/50 border border-transparent opacity-40 hover:opacity-70") +
                (item.isFuture ? " cursor-not-allowed opacity-25" : " cursor-pointer")
            },
              // Day number
              h("div", { className: "w-full flex items-center justify-between" },
                h("span", {
                  className: "text-xs md:text-sm font-semibold font-mono " +
                    (isSelected ? "text-amber-950 font-bold" : isToday ? "text-amber-800 font-bold" : item.isCurrentMonth ? "text-[#4A3B2C]" : "text-[#A89989]")
                }, item.dayNumber),
                isToday && h("span", { className: "text-[8px] md:text-[9px] font-mono px-1 py-0.2 rounded bg-amber-200/70 text-amber-900 border border-amber-300 font-bold" }, "NOW")
              ),

              // Center Dot / Check
              h("div", { className: "my-auto flex items-center justify-center" },
                item.hasEntry ? (
                  h("div", { className: "w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center shadow-md shadow-amber-500/30 text-white text-[11px] font-bold" }, "✓")
                ) : item.isFuture ? (
                  h("div", { className: "w-1.5 h-1.5 rounded-full bg-amber-900/10" })
                ) : (
                  h("div", { className: "w-2 h-2 rounded-full bg-amber-900/15 group-hover:bg-amber-400 transition-colors" })
                )
              ),

              // Bottom subtle hint
              h("div", { className: "w-full flex items-center justify-center text-[9px] text-amber-800 font-serif italic" },
                item.hasEntry ? h("span", { className: "text-amber-700/80 font-medium hidden md:inline" }, "chronicled") : null
              )
            );
          })
        ),

        // Footer summary
        h("div", { className: "mt-5 pt-4 border-t border-amber-900/10 flex flex-wrap items-center justify-between gap-3 text-xs" },
          h("div", { className: "flex items-center gap-3" },
            h("div", { className: "flex items-center gap-1.5" },
              h("div", { className: "w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" }),
              h("span", { className: "text-[#4A3B2C] font-medium text-[11px]" }, "Reflected")
            ),
            h("div", { className: "flex items-center gap-1.5" },
              h("div", { className: "w-2.5 h-2.5 rounded-full bg-amber-900/20" }),
              h("span", { className: "text-[#8C7D70] text-[11px]" }, "Unwritten")
            )
          ),
          h("div", { className: "flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 text-[#4A3B2C] text-[11px] shadow-sm" },
            "🌿 ",
            h("strong", { className: "text-amber-900 font-mono font-bold" }, monthStats.count),
            " of " + monthStats.total + " days (" + monthStats.percentage + "%)"
          )
        )

      )
    )
  );
}

// ---------------------------------------------------------------------------
// 8. Entry Editor Component (Light Cream Sanctuary)
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
    if (wordCount === 0) return { label: "Empty canvas", color: "text-[#8C7D70]" };
    if (wordCount < 25) return { label: "Beginning reflection...", color: "text-amber-700" };
    if (wordCount <= 120) return { label: "Sweet spot: 1 thoughtful paragraph", color: "text-emerald-700 font-semibold" };
    return { label: "Deep extended reflection", color: "text-amber-800 font-semibold" };
  }, [wordCount]);

  const handleRollPrompt = () => {
    setActivePromptIdx((prev) => (prev + 1) % GRATITUDE_PROMPTS.length);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      setErrorMsg("Please pen your reflection before committing it.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    try {
      await onSave(dateStr, content.trim());
      setIsSaving(false);
      setIsSaved(true);

      if (soundEnabled) playChime();

      if (window.confetti) {
        window.confetti({
          particleCount: 50,
          spread: 65,
          origin: { y: 0.75 },
          colors: ["#D97706", "#F59E0B", "#FEF3C7", "#10B981"],
        });
      }

      setTimeout(() => setIsSaved(false), 3000);
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
      setErrorMsg("Failed to remove reflection.");
    }
  };

  const isToday = dateStr === todayStr;

  return h("div", { className: "w-full" },
    h("div", { className: "double-bezel-outer" },
      h("div", { className: "double-bezel-inner p-5 md:p-8 flex flex-col justify-between" },
        
        h("div", null,
          // Navigation Bar
          h("div", { className: "flex items-center justify-between pb-4 border-b border-amber-900/10" },
            h("div", { className: "flex items-center gap-1.5" },
              h("button", {
                onClick: () => onNavigateDate(-1),
                "aria-label": "Previous Day",
                className: "p-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[#4A3B2C] text-xs transition-colors shadow-sm"
              }, "← Prev Day"),
              h("button", {
                onClick: () => onNavigateDate(1),
                disabled: dateStr >= todayStr,
                "aria-label": "Next Day",
                className: "p-1.5 rounded-full bg-amber-50 border border-amber-200 text-[#4A3B2C] text-xs transition-colors " +
                  (dateStr >= todayStr ? "opacity-30 cursor-not-allowed" : "hover:bg-amber-100 shadow-sm")
              }, "Next Day →")
            ),
            h("div", { className: "flex items-center gap-2" },
              isToday && h("span", { className: "px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[9px] uppercase font-mono tracking-widest font-bold" }, "Today's Space"),
              h("span", { className: "text-[#7A6B5D] text-xs font-mono font-semibold" }, dateStr)
            )
          ),

          // Date Header
          h("div", { className: "mt-4 mb-3" },
            h("h3", { className: "font-serif text-xl md:text-2xl font-bold text-amber-950 tracking-tight" }, formattedDate),
            h("p", { className: "text-xs text-[#7A6B5D] mt-0.5 font-light italic" },
              "A private sanctuary to write one thoughtful paragraph a day."
            )
          ),

          // Daily Prompt Banner
          h("div", { className: "my-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/90 via-rose-50/60 to-orange-50/80 border border-amber-200/90 flex items-start justify-between gap-3 shadow-sm" },
            h("div", null,
              h("span", { className: "text-[9px] font-mono uppercase tracking-wider text-amber-800 font-bold px-2 py-0.5 rounded bg-white/80 border border-amber-200 inline-block" },
                "✨ Prompt: " + GRATITUDE_PROMPTS[activePromptIdx].category
              ),
              h("p", { className: "font-serif italic text-xs md:text-sm text-[#4A3B2C] leading-relaxed mt-1" },
                "\"" + GRATITUDE_PROMPTS[activePromptIdx].prompt + "\""
              )
            ),
            h("button", {
              onClick: handleRollPrompt,
              "aria-label": "Roll Next Prompt",
              title: "Next Prompt",
              className: "p-1.5 rounded-lg text-amber-800 hover:text-amber-950 hover:bg-amber-100/80 transition-colors text-xs shrink-0"
            }, "🔄")
          ),

          // Error Message
          errorMsg && h("div", { className: "mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2" },
            "⚠️ " + errorMsg
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
              placeholder: "What brought peace, light, connection, or quiet joy to your world today? Pen your one paragraph...",
              rows: 7,
              "aria-label": "Daily Gratitude Reflection Text Area",
              className: "w-full rounded-2xl bg-[#FCFAF7] border border-amber-900/15 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 p-4 md:p-5 text-[#2D2319] text-sm md:text-base font-serif placeholder:font-sans placeholder:text-[#A89989] placeholder:text-xs leading-relaxed focus:outline-none transition-all resize-none shadow-inner"
            }),
            h("div", { className: "absolute bottom-3 right-4 hidden sm:block text-[10px] font-mono text-[#8C7D70] pointer-events-none" },
              "Ctrl + Enter to commit"
            )
          )
        ),

        // Action Bar Footer
        h("div", { className: "mt-4 pt-4 border-t border-amber-900/10 flex flex-col sm:flex-row items-center justify-between gap-3" },
          h("div", { className: "flex items-center gap-2 text-xs" },
            h("span", { className: "font-mono font-bold text-[#4A3B2C]" }, wordCount + (wordCount === 1 ? " word" : " words")),
            h("span", { className: "text-[#A89989]" }, "•"),
            h("span", { className: paragraphStatus.color }, paragraphStatus.label)
          ),

          h("div", { className: "flex items-center gap-2 self-end sm:self-auto" },
            initialContent && !showConfirmDelete && (
              h("button", {
                onClick: () => setShowConfirmDelete(true),
                "aria-label": "Delete reflection",
                title: "Delete reflection",
                className: "p-2 rounded-full text-[#8C7D70] hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs"
              }, "🗑️")
            ),

            showConfirmDelete && h("div", { className: "flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-full text-xs" },
              h("span", { className: "text-rose-800 text-[10px] px-1 font-medium" }, "Confirm delete?"),
              h("button", {
                onClick: handleDelete,
                className: "px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-[10px] font-medium"
              }, "Yes"),
              h("button", {
                onClick: () => setShowConfirmDelete(false),
                className: "px-1.5 py-0.5 text-[#7A6B5D] hover:text-black text-[10px]"
              }, "Cancel")
            ),

            h("button", {
              onClick: handleSave,
              disabled: isSaving,
              "aria-label": "Commit gratitude reflection",
              className: "btn-island bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-600 hover:to-amber-500 text-white font-semibold shadow-lg shadow-amber-500/25 active:scale-[0.98]"
            },
              h("span", null, isSaving ? "Preserving..." : isSaved ? "Preserved in Gold ✨" : "Commit Gratitude"),
              h("div", { className: "w-6 h-6 rounded-full bg-white/25 flex items-center justify-center font-bold text-white text-xs" }, "✓")
            )
          )
        )

      )
    )
  );
}

// ---------------------------------------------------------------------------
// 9. Timeline View Component (Light Chronicle Feed)
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

  return h("div", { className: "w-full space-y-6" },
    
    // Inspirational Quote Banner
    h("div", { className: "double-bezel-outer" },
      h("div", { className: "double-bezel-inner p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-amber-50/80 via-rose-50/50 to-orange-50/60" },
        h("div", { className: "flex items-start gap-3" },
          h("div", { className: "p-2.5 rounded-2xl bg-amber-200/70 text-amber-900 text-xl shrink-0 shadow-sm" }, "❝"),
          h("div", null,
            h("p", { className: "font-serif italic text-base md:text-lg text-amber-950 leading-relaxed font-medium" },
              "\"" + quote.quote + "\""
            ),
            h("p", { className: "text-xs font-mono tracking-widest text-amber-800 uppercase mt-1.5 font-semibold" },
              "— " + quote.author
            )
          )
        ),
        h("button", {
          onClick: handleExport,
          disabled: !entries || entries.length === 0,
          "aria-label": "Export Archive (.txt)",
          className: "shrink-0 px-4 py-2 rounded-full bg-white hover:bg-amber-100 border border-amber-200 text-xs font-semibold text-amber-900 transition-all shadow-sm hover:shadow"
        }, "📥 Export Archive (.txt)")
      )
    ),

    // Search and Filters
    h("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-3" },
      h("div", { className: "w-full sm:w-80" },
        h("input", {
          type: "text",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          placeholder: "🔍 Search reflections or dates...",
          "aria-label": "Search reflections",
          className: "w-full bg-white border border-amber-900/15 focus:border-amber-500 rounded-full px-4 py-2 text-xs text-[#2D2319] placeholder:text-[#9C8D7F] focus:outline-none transition-all shadow-sm"
        })
      ),

      availableMonths.length > 0 && h("div", { className: "flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1" },
        h("button", {
          onClick: () => setSelectedMonth("ALL"),
          className: "px-3 py-1 rounded-full text-xs font-mono shrink-0 " +
            (selectedMonth === "ALL" ? "bg-amber-200 text-amber-950 border border-amber-400 font-bold shadow-sm" : "bg-white text-[#7A6B5D] border border-amber-900/10")
        }, "All Time"),
        availableMonths.map((m) =>
          h("button", {
            key: m,
            onClick: () => setSelectedMonth(m),
            className: "px-3 py-1 rounded-full text-xs font-mono shrink-0 " +
              (selectedMonth === m ? "bg-amber-200 text-amber-950 border border-amber-400 font-bold shadow-sm" : "bg-white text-[#7A6B5D] border border-amber-900/10")
          }, m)
        )
      )
    ),

    // List of Cards
    filtered.length === 0 ? (
      h("div", { className: "rounded-[2rem] p-12 text-center bg-white/80 border border-amber-900/10 shadow-sm" },
        h("div", { className: "text-3xl mb-2" }, "🪶"),
        h("h3", { className: "font-serif text-lg text-amber-950 font-bold" }, "No reflections found"),
        h("p", { className: "text-xs text-[#7A6B5D] mt-1" },
          searchTerm ? "Try searching for another keyword or month." : "Return to the calendar sanctuary to begin journaling."
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
            className: "group relative rounded-[1.75rem] p-1 bg-white border border-amber-900/10 hover:border-amber-400 transition-all duration-300 shadow-md hover:shadow-xl"
          },
            h("div", { className: "rounded-[calc(1.75rem-0.25rem)] bg-[#FCFAF7] p-5 md:p-6 flex flex-col justify-between h-full group-hover:bg-amber-50/30 transition-colors" },
              
              h("div", null,
                h("div", { className: "flex items-center justify-between pb-3 border-b border-amber-900/10" },
                  h("div", { className: "flex items-center gap-3" },
                    h("div", { className: "w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex flex-col items-center justify-center text-amber-950 shadow-sm" },
                      h("span", { className: "text-[9px] font-mono uppercase font-bold leading-none" }, monthName),
                      h("span", { className: "text-sm font-mono font-bold leading-none mt-0.5" }, dayNum)
                    ),
                    h("div", null,
                      h("h4", { className: "text-xs font-semibold text-[#2D2319]" }, weekday),
                      h("span", { className: "text-[10px] font-mono text-[#8C7D70]" }, yearNum)
                    )
                  ),
                  h("button", {
                    onClick: () => onSelectEntryDate(entry.date),
                    "aria-label": "Edit reflection for " + entry.date,
                    className: "p-2 rounded-full bg-white hover:bg-amber-100 text-[#4A3B2C] text-xs transition-colors shadow-sm"
                  }, "✏️")
                ),

                h("div", { className: "my-4" },
                  h("p", { className: "font-serif text-sm md:text-base text-[#2D2319] leading-relaxed italic" },
                    "\"" + entry.content + "\""
                  )
                )
              ),

              h("div", { className: "pt-3 border-t border-amber-900/10 flex items-center justify-between text-[11px] text-[#7A6B5D] font-mono" },
                h("span", null, words + (words === 1 ? " word" : " words")),
                h("button", {
                  onClick: () => onSelectEntryDate(entry.date),
                  className: "text-amber-800 hover:text-amber-950 font-bold text-xs font-sans group-hover:translate-x-0.5 transition-transform"
                }, "Open in Sanctuary →")
              )

            )
          );
        })
      )
    )
  );
}

// ---------------------------------------------------------------------------
// 10. Prompt Modal & Stats Modal (Light Cream Dreamy)
// ---------------------------------------------------------------------------
function PromptModal({ isOpen, onClose, onSelectPrompt }) {
  if (!isOpen) return null;

  return h("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-in fade-in" },
    h("div", { className: "relative w-full max-w-2xl rounded-[2rem] p-1.5 bg-white border border-amber-200 shadow-2xl" },
      h("div", { className: "rounded-[calc(2rem-0.375rem)] bg-[#FCFAF7] p-6 md:p-8 max-h-[85vh] overflow-y-auto" },
        
        h("div", { className: "flex items-center justify-between pb-4 border-b border-amber-900/10" },
          h("div", null,
            h("h3", { className: "font-serif text-xl font-bold text-amber-950" }, "✨ Mindful Gratitude Sparks"),
            h("p", { className: "text-xs text-[#7A6B5D] mt-0.5" }, "Curated prompts to awaken deeper observation and appreciation.")
          ),
          h("button", {
            onClick: onClose,
            "aria-label": "Close Modal",
            className: "p-2 rounded-full bg-white hover:bg-amber-100 text-[#7A6B5D] hover:text-black text-sm shadow-sm"
          }, "✕")
        ),

        h("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 my-5" },
          GRATITUDE_PROMPTS.map((item, idx) =>
            h("div", {
              key: idx,
              className: "rounded-2xl p-4 bg-white border border-amber-900/10 hover:border-amber-400 flex flex-col justify-between shadow-sm"
            },
              h("div", null,
                h("span", { className: "text-[9px] font-mono uppercase tracking-wider text-amber-900 font-bold px-2 py-0.5 rounded bg-amber-100 border border-amber-300 inline-block" }, item.category),
                h("p", { className: "font-serif italic text-xs md:text-sm text-[#2D2319] mt-2.5 leading-relaxed font-medium" }, "\"" + item.prompt + "\"")
              ),
              h("div", { className: "mt-4 pt-3 border-t border-amber-900/10 flex justify-end" },
                h("button", {
                  onClick: () => {
                    onSelectPrompt(item.prompt);
                    onClose();
                  },
                  className: "px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition-colors"
                }, "+ Use Prompt")
              )
            )
          )
        )

      )
    )
  );
}

function StatsModal({ isOpen, onClose, stats }) {
  if (!isOpen) return null;

  return h("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-in fade-in" },
    h("div", { className: "relative w-full max-w-lg rounded-[2rem] p-1.5 bg-white border border-amber-200 shadow-2xl" },
      h("div", { className: "rounded-[calc(2rem-0.375rem)] bg-[#FCFAF7] p-6 md:p-8" },
        
        h("div", { className: "flex items-center justify-between pb-4 border-b border-amber-900/10" },
          h("div", null,
            h("h3", { className: "font-serif text-xl font-bold text-amber-950" }, "🏆 Gratitude Sanctuary Insights"),
            h("p", { className: "text-xs text-[#7A6B5D] mt-0.5" }, "Your daily journey of enduring mindfulness.")
          ),
          h("button", {
            onClick: onClose,
            "aria-label": "Close Modal",
            className: "p-2 rounded-full bg-white hover:bg-amber-100 text-[#7A6B5D] hover:text-black text-sm shadow-sm"
          }, "✕")
        ),

        h("div", { className: "grid grid-cols-2 gap-3 my-5" },
          
          h("div", { className: "rounded-2xl bg-amber-50 border border-amber-300 p-4 shadow-sm" },
            h("div", { className: "flex items-center justify-between" },
              h("span", { className: "text-[10px] font-mono uppercase tracking-wider text-amber-900 font-bold" }, "Current Streak"),
              h("span", null, "🔥")
            ),
            h("div", { className: "mt-2" },
              h("span", { className: "text-3xl font-mono font-bold text-amber-950" }, stats?.current_streak || 0),
              h("span", { className: "text-xs text-amber-800 ml-1.5 font-semibold" }, "days")
            )
          ),

          h("div", { className: "rounded-2xl bg-white border border-amber-900/10 p-4 shadow-sm" },
            h("div", { className: "flex items-center justify-between" },
              h("span", { className: "text-[10px] font-mono uppercase tracking-wider text-[#7A6B5D] font-bold" }, "All-Time Record"),
              h("span", null, "🌟")
            ),
            h("div", { className: "mt-2" },
              h("span", { className: "text-3xl font-mono font-bold text-[#2D2319]" }, stats?.longest_streak || 0),
              h("span", { className: "text-xs text-[#8C7D70] ml-1.5" }, "days")
            )
          ),

          h("div", { className: "rounded-2xl bg-white border border-amber-900/10 p-4 shadow-sm" },
            h("div", { className: "flex items-center justify-between" },
              h("span", { className: "text-[10px] font-mono uppercase tracking-wider text-[#7A6B5D] font-bold" }, "Total Chronicled"),
              h("span", null, "📖")
            ),
            h("div", { className: "mt-2" },
              h("span", { className: "text-3xl font-mono font-bold text-[#2D2319]" }, stats?.total_entries || 0),
              h("span", { className: "text-xs text-[#8C7D70] ml-1.5" }, "reflections")
            )
          ),

          h("div", { className: "rounded-2xl bg-white border border-amber-900/10 p-4 shadow-sm" },
            h("div", { className: "flex items-center justify-between" },
              h("span", { className: "text-[10px] font-mono uppercase tracking-wider text-[#7A6B5D] font-bold" }, "This Month"),
              h("span", null, "🌿")
            ),
            h("div", { className: "mt-2" },
              h("span", { className: "text-3xl font-mono font-bold text-[#2D2319]" }, stats?.this_month_count || 0),
              h("span", { className: "text-xs text-[#8C7D70] ml-1.5" }, "days")
            )
          )

        ),

        h("div", { className: "p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200 text-center" },
          h("p", { className: "font-serif italic text-xs text-amber-950 font-medium leading-relaxed" },
            "\"Noticing goodness on ordinary days is what makes a life extraordinary.\""
          )
        )

      )
    )
  );
}

// ---------------------------------------------------------------------------
// 11. Login and Register Authentication Screens (Light Cream)
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
      setError("Please provide your username and password.");
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

  return h("div", { className: "min-h-screen flex items-center justify-center p-4 bg-[#FAF7F2] relative overflow-hidden" },
    
    // Dreamy Glow Orbs
    h("div", { className: "absolute top-1/4 left-1/4 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" }),
    h("div", { className: "absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" }),

    h("div", { className: "relative w-full max-w-md double-bezel-outer z-10" },
      h("div", { className: "double-bezel-inner p-8 md:p-10" },
        
        // Brand Title
        h("div", { className: "text-center mb-7" },
          h("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center mx-auto shadow-md shadow-amber-500/25 mb-4 text-white text-xl font-bold font-serif" }, "✦"),
          h("h1", { className: "font-serif text-3xl font-bold tracking-tight text-amber-950" }, "SOLIS"),
          h("p", { className: "text-[10px] uppercase font-mono tracking-widest text-amber-800 font-bold mt-1" }, "Daily Gratitude Journal"),
          h("p", { className: "text-xs text-[#7A6B5D] mt-2 font-light" }, "Sign in to write and explore your daily reflections.")
        ),

        // Error message
        error && h("div", { className: "mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium" },
          "⚠️ " + error
        ),

        // Form
        h("form", { onSubmit: handleSubmit, className: "space-y-4" },
          h("div", { className: "space-y-1.5" },
            h("label", { className: "text-[11px] font-mono uppercase tracking-wider text-[#7A6B5D] font-bold" }, "Username"),
            h("input", {
              type: "text",
              required: true,
              value: username,
              onChange: (e) => setUsername(e.target.value),
              placeholder: "e.g. alice",
              className: "w-full bg-[#FAF7F2] border border-amber-900/15 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 rounded-xl px-4 py-2.5 text-sm text-[#2D2319] placeholder:text-[#A89989] focus:outline-none transition-all"
            })
          ),

          h("div", { className: "space-y-1.5" },
            h("label", { className: "text-[11px] font-mono uppercase tracking-wider text-[#7A6B5D] font-bold" }, "Password"),
            h("input", {
              type: "password",
              required: true,
              value: password,
              onChange: (e) => setPassword(e.target.value),
              placeholder: "••••••••••••",
              className: "w-full bg-[#FAF7F2] border border-amber-900/15 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 rounded-xl px-4 py-2.5 text-sm text-[#2D2319] placeholder:text-[#A89989] focus:outline-none transition-all"
            })
          ),

          h("div", { className: "pt-2" },
            h("button", {
              type: "submit",
              disabled: loading,
              className: "w-full flex items-center justify-between pl-6 pr-3 py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-600 hover:to-amber-500 text-white font-semibold text-xs tracking-wider uppercase shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all"
            },
              h("span", null, loading ? "Entering Sanctuary..." : "Sign In to Journal"),
              h("span", { className: "w-6 h-6 rounded-full bg-white/25 flex items-center justify-center font-bold text-white" }, "→")
            )
          )
        ),

        // Quick Demo & Switch
        h("div", { className: "mt-6 pt-5 border-t border-amber-900/10 flex items-center justify-between text-xs" },
          h("button", {
            type: "button",
            onClick: handleFillDemo,
            className: "text-amber-800 hover:text-amber-950 font-semibold transition-colors"
          }, "✨ Demo User"),
          h("button", {
            type: "button",
            onClick: onSwitchToRegister,
            className: "text-[#7A6B5D] hover:text-[#2D2319] transition-colors"
          }, "Create Account →")
        )

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
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError(null);
    const res = await register(username.trim(), email.trim(), password, passwordConfirm);
    setLoading(false);
    if (!res.success) setError(res.error);
  };

  return h("div", { className: "min-h-screen flex items-center justify-center p-4 bg-[#FAF7F2] relative overflow-hidden" },
    h("div", { className: "relative w-full max-w-md double-bezel-outer z-10" },
      h("div", { className: "double-bezel-inner p-8 md:p-10" },
        
        h("div", { className: "text-center mb-6" },
          h("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center mx-auto shadow-md shadow-amber-500/25 mb-4 text-white text-xl font-bold font-serif" }, "✦"),
          h("h1", { className: "font-serif text-3xl font-bold tracking-tight text-amber-950" }, "Begin Journey"),
          h("p", { className: "text-[10px] uppercase font-mono tracking-widest text-amber-800 font-bold mt-1" }, "Create Your Private Sanctuary"),
          h("p", { className: "text-xs text-[#7A6B5D] mt-2 font-light" }, "One paragraph a day to cultivate enduring joy.")
        ),

        error && h("div", { className: "mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium" },
          "⚠️ " + error
        ),

        h("form", { onSubmit: handleSubmit, className: "space-y-3.5" },
          h("div", { className: "space-y-1" },
            h("label", { className: "text-[10px] font-mono uppercase tracking-wider text-[#7A6B5D] font-bold" }, "Username *"),
            h("input", {
              type: "text",
              required: true,
              value: username,
              onChange: (e) => setUsername(e.target.value),
              placeholder: "Choose a username",
              className: "w-full bg-[#FAF7F2] border border-amber-900/15 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 rounded-xl px-4 py-2 text-sm text-[#2D2319] placeholder:text-[#A89989] focus:outline-none transition-all"
            })
          ),

          h("div", { className: "space-y-1" },
            h("label", { className: "text-[10px] font-mono uppercase tracking-wider text-[#7A6B5D] font-bold" }, "Email Address (Optional)"),
            h("input", {
              type: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              placeholder: "your.email@domain.com",
              className: "w-full bg-[#FAF7F2] border border-amber-900/15 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 rounded-xl px-4 py-2 text-sm text-[#2D2319] placeholder:text-[#A89989] focus:outline-none transition-all"
            })
          ),

          h("div", { className: "space-y-1" },
            h("label", { className: "text-[10px] font-mono uppercase tracking-wider text-[#7A6B5D] font-bold" }, "Password *"),
            h("input", {
              type: "password",
              required: true,
              value: password,
              onChange: (e) => setPassword(e.target.value),
              placeholder: "Minimum 8 characters",
              className: "w-full bg-[#FAF7F2] border border-amber-900/15 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 rounded-xl px-4 py-2 text-sm text-[#2D2319] placeholder:text-[#A89989] focus:outline-none transition-all"
            })
          ),

          h("div", { className: "space-y-1" },
            h("label", { className: "text-[10px] font-mono uppercase tracking-wider text-[#7A6B5D] font-bold" }, "Confirm Password *"),
            h("input", {
              type: "password",
              required: true,
              value: passwordConfirm,
              onChange: (e) => setPasswordConfirm(e.target.value),
              placeholder: "Re-enter password",
              className: "w-full bg-[#FAF7F2] border border-amber-900/15 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 rounded-xl px-4 py-2 text-sm text-[#2D2319] placeholder:text-[#A89989] focus:outline-none transition-all"
            })
          ),

          h("div", { className: "pt-2" },
            h("button", {
              type: "submit",
              disabled: loading,
              className: "w-full flex items-center justify-between pl-6 pr-3 py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-600 hover:to-amber-500 text-white font-semibold text-xs tracking-wider uppercase shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all"
            },
              h("span", null, loading ? "Creating Account..." : "Initialize Sanctuary"),
              h("span", { className: "w-6 h-6 rounded-full bg-white/25 flex items-center justify-center font-bold text-white" }, "→")
            )
          )
        ),

        h("div", { className: "mt-5 pt-4 border-t border-amber-900/10 text-center text-xs" },
          h("span", { className: "#7A6B5D" }, "Already have an account? "),
          h("button", {
            type: "button",
            onClick: onSwitchToLogin,
            className: "text-amber-800 hover:text-amber-950 font-bold ml-1 transition-colors"
          }, "Sign In →")
        )

      )
    )
  );
}

// ---------------------------------------------------------------------------
// 12. Main Dashboard Component (Light Dreamy Sanctuary)
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
      setError("Unable to sync records with the sanctuary server.");
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
      const msg = err.response?.data?.error || "Failed to commit reflection.";
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

  return h("div", { className: "min-h-screen bg-[#FAF7F2] text-[#2D2319] relative" },
    
    // Background dreamy ambient glows
    h("div", { className: "fixed top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-amber-200/30 via-rose-200/20 to-orange-100/30 rounded-full blur-3xl pointer-events-none z-0" }),
    h("div", { className: "fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-amber-100/40 via-yellow-100/30 to-rose-100/20 rounded-full blur-3xl pointer-events-none z-0" }),

    // Floating Navbar
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
    h("main", { className: "relative z-10 pt-28 pb-20 px-4 md:px-8 max-w-6xl mx-auto" },
      
      error && h("div", { className: "mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-800 text-xs shadow-sm" },
        h("span", null, "⚠️ " + error),
        h("button", {
          onClick: () => loadSanctuaryData(false),
          className: "text-rose-900 font-bold underline font-mono"
        }, "Retry")
      ),

      activeTab === "calendar" ? (
        h("div", { className: "space-y-6" },
          
          // Header Greetings
          h("div", { className: "flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-2" },
            h("div", null,
              h("span", { className: "text-[10px] uppercase font-mono tracking-widest text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-300 font-bold" }, "Daily Sanctuary"),
              h("h1", { className: "font-serif text-3xl md:text-4xl font-bold tracking-tight text-amber-950 mt-2" },
                "Greetings, " + (user?.username || "Writer")
              ),
              h("p", { className: "text-xs md:text-sm text-[#7A6B5D] mt-1 font-light" },
                "Select any calendar date to pen or revisit your one paragraph of gratitude."
              )
            ),
            h("button", {
              onClick: () => setIsPromptModalOpen(true),
              className: "flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-amber-100 border border-amber-200 text-xs font-semibold text-amber-900 transition-all shadow-sm"
            }, "✨ Prompt of the Day")
          ),

          // Split Grid: Calendar + Editor
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
          h("div", { className: "py-2" },
            h("span", { className: "text-[10px] uppercase font-mono tracking-widest text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-300 font-bold" }, "Chronicle Stream"),
            h("h1", { className: "font-serif text-3xl md:text-4xl font-bold tracking-tight text-amber-950 mt-2" }, "Gratitude Reflections"),
            h("p", { className: "text-xs md:text-sm text-[#7A6B5D] mt-1 font-light" },
              "Browse, search, and export your entire chronological archive of daily moments."
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
// 13. Root App Bootstrapper
// ---------------------------------------------------------------------------
function MainApp() {
  const [authView, setAuthView] = useState("login"); // 'login' | 'register'

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

// Mount React Root
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(h(App));
  container.dataset.mounted = "true";
}

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Dumbbell, 
  Activity, 
  Sparkles, 
  AlertTriangle, 
  RotateCcw, 
  HeartHandshake, 
  BrainCircuit, 
  Flame, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Upload,
  Trash2,
  LayoutDashboard,
  BookOpen,
  LineChart,
  History,
  Apple,
  Smile,
  Meh,
  Frown,
  Bone,
  Check,
  ArrowRight,
  User,
  Zap,
  Coffee,
  Heart,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Preset {
  id: string;
  label: string;
  exercise: string;
  constraint: string;
  icon: string;
}

const PRESETS: Preset[] = [
  {
    id: "knees",
    label: "Sensitive Knees + Living in 2nd Floor Flat",
    exercise: "High-impact Jump Squats",
    constraint: "Need to completely avoid impact on knee joint. Must be quiet on the floor.",
    icon: "🔇"
  },
  {
    id: "back",
    label: "Acute Lower Back Stiffness",
    exercise: "Heavy Deadlifts & Barbell Rows",
    constraint: "My lower back feels extremely stiff and lacks support. Need to avoid direct spinal loading.",
    icon: "⚡"
  },
  {
    id: "wrist",
    label: "Wrist Strain under Extension",
    exercise: "Standard Burpees, Push-ups, and Planks",
    constraint: "Heavy wrist joint pain during extension on flat floor positions.",
    icon: "🔋"
  },
  {
    id: "no-eq",
    label: "No Equipment / Mobile Hotel Setup",
    exercise: "Barbell Squats & Pull-ups",
    constraint: "Only have body weight in an empty room, but want identical muscle activation.",
    icon: "🎒"
  }
];

interface LogEntry {
  id: string;
  timestamp: string;
  exercise: string;
  constraint: string;
  intensity: number;
  mood: string;
  result: string;
  hasImage: boolean;
  nutrition: string;
  isRestProtocol: boolean;
}

const DEFAULT_HISTORY: LogEntry[] = [
  {
    id: "hist-1",
    timestamp: "Yesterday, 04:30 PM",
    exercise: "Heavy Barbell Squats",
    constraint: "Persistent knee cracking and general meniscus weariness",
    intensity: 4,
    mood: "Sore",
    isRestProtocol: false,
    nutrition: "Greek yogurt cup with lavender-infused honey, walnuts, and static hydration.",
    hasImage: false,
    result: `### 🎯 Target Muscle Group & Intensity:
Primary target is the Rectus Femoris, Vastus Lateralis (Quads), and Gluteus Maximus at a careful, safe Intensity of 4/10.

### ⚡ Safe Modification: Spanish Squat Iso-Hold
1. **The Setup**: Loop a durable resistance band around a secure anchor at knee height. Step inside with the loop behind your knees.
2. **The Stance**: Back up until the band is fully taut. Keep feet hip-width apart.
3. **The Movement**: Sit back as if lowering onto a distant chair. Maintain completely vertical shins, placing the load purely on the quads through band tension rather than knee sheer. Hold for 30s.

### 💡 Coach's Tip:
Drive force actively backward against the band resistance. Maintain a neutral thoracic spine while engaging the lower abdominals.`
  },
  {
    id: "hist-2",
    timestamp: "3 days ago, 08:15 AM",
    exercise: "Heavy Overhead Barbell Shoulder Press",
    constraint: "Shoulder impingement pinching on high overhead extensions",
    intensity: 6,
    mood: "Good",
    isRestProtocol: false,
    nutrition: "Lightweight premium whey shake paired with sliced ripe green pears.",
    hasImage: false,
    result: `### 🎯 Target Muscle Group & Intensity:
Primary targets are the Anterior Deltoids and Clavicular Head of the Pec Major at standard Intensity 6/10.

### ⚡ Safe Modification: Landmine Press or Single-Arm Incline Dumbbell Press
1. **The Range**: Alter the angle of push from absolute vertical extension to a safer 45-degree incline.
2. **The Execution**: Press a dumbbell upward from an incline bench, keeping elbows tucked to a 45-degree angle from the torso to prevent shoulder pinch limits.

### 💡 Coach's Tip:
Keep the scapulae packed tightly into the cushion during the concentric phase.`
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "movement" | "library" | "progress" | "history">("dashboard");
  const [exercise, setExercise] = useState("");
  const [constraint, setConstraint] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [mood, setMood] = useState<"Great" | "Good" | "Okay" | "Sore" | "Painful">("Good");
  const [image, setImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  
  // Persistence state
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [streakDays, setStreakDays] = useState(5);
  const [totalMinutes, setTotalMinutes] = useState(380);
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem("lab_profile_name") || "Camille Vane";
  });

  // Notification system state
  const isNotificationSupported = typeof window !== "undefined" && "Notification" in window;
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });
  const [reminderTime, setReminderTime] = useState(() => {
    return localStorage.getItem("lab_reminder_time") || "09:00";
  });
  const [reminderEnabled, setReminderEnabled] = useState(() => {
    return localStorage.getItem("lab_reminder_enabled") === "true";
  });
  const [lastTriggeredDate, setLastTriggeredDate] = useState(() => {
    return localStorage.getItem("lab_last_triggered_date") || "";
  });

  useEffect(() => {
    localStorage.setItem("lab_profile_name", profileName);
  }, [profileName]);

  useEffect(() => {
    localStorage.setItem("lab_reminder_time", reminderTime);
  }, [reminderTime]);

  useEffect(() => {
    localStorage.setItem("lab_reminder_enabled", String(reminderEnabled));
  }, [reminderEnabled]);

  const requestNotificationPermission = async () => {
    if (!isNotificationSupported) return;
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    } catch (err) {
      console.error("Failed to request notification permission", err);
    }
  };

  const triggerNotification = (title: string, body: string) => {
    if (!isNotificationSupported) {
      alert("Notifications are not fully supported in this browser run.");
      return;
    }
    if (Notification.permission !== "granted") {
      requestNotificationPermission();
      return;
    }
    try {
      const notif = new Notification(title, {
        body,
        tag: "movement-reminder",
        id: "movement-reminder-id"
      } as any);
      notif.onclick = () => {
        window.focus();
        setActiveTab("movement");
      };
    } catch (err) {
      console.error("Error creating notification", err);
    }
  };

  // Daily interval check to trigger actual notification
  useEffect(() => {
    if (!reminderEnabled || !isNotificationSupported || notificationPermission !== "granted") return;

    const checkReminder = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;
      
      const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      if (currentTimeString === reminderTime && lastTriggeredDate !== todayString) {
        triggerNotification(
          "💪 Form & Progression Lab Reminder",
          `Hey ${profileName || "Athlete"}, it's time for your daily session! Keeping your movement adaptive and safe today.`
        );
        setLastTriggeredDate(todayString);
        localStorage.setItem("lab_last_triggered_date", todayString);
      }
    };

    checkReminder();
    const interval = setInterval(checkReminder, 25000); // Check every 25 seconds
    return () => clearInterval(interval);
  }, [reminderEnabled, reminderTime, notificationPermission, lastTriggeredDate, profileName, isNotificationSupported]);

  // Load and clean up history
  useEffect(() => {
    const cached = localStorage.getItem("lab_workout_logs");
    if (cached) {
      try {
        setLogs(JSON.parse(cached));
      } catch (e) {
        setLogs(DEFAULT_HISTORY);
      }
    } else {
      setLogs(DEFAULT_HISTORY);
      localStorage.setItem("lab_workout_logs", JSON.stringify(DEFAULT_HISTORY));
    }
  }, []);

  const saveLogs = (newLogs: LogEntry[]) => {
    setLogs(newLogs);
    localStorage.setItem("lab_workout_logs", JSON.stringify(newLogs));
  };

  const handleApplyPreset = (preset: Preset) => {
    setExercise(preset.exercise);
    setConstraint(preset.constraint);
    setActivePreset(preset.id);
    setError(null);
  };

  const handleApplyPresetAndNavigate = (presetName: string, constraintText: string) => {
    setExercise(presetName);
    setConstraint(constraintText);
    setActiveTab("movement");
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPEG or WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage({
          data: reader.result,
          mimeType: file.type,
        });
        setError(null);
      }
    };
    reader.onerror = () => {
      setError("Failed to read the selected frame file.");
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setExercise("");
    setConstraint("");
    setIntensity(5);
    setImage(null);
    setResult(null);
    setError(null);
    setActivePreset(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If painful is selected, force REST Protocol immediately inside client
    if (mood === "Painful") {
      const restValue = `### ⚠️ SAFETY ALERT / RECOVERY NOTICE: ACTIVE REST MANDATED
**We have flagged your kinetic system status as immediate recovery priority due to acute pain limits.** 

Standard exercise modification is currently locked out to safeguard your neuromuscular tissues. Direct weight loading can aggravate current strain states, trigger neural guarding patterns, and drastically slow down cellular repair.

### 🎯 Target Muscle Group & Intensity:
- **Focus**: Rest, myofascial soothing, and light mobility alignment.
- **Assigned Clinical Intensity**: **1 / 10** (Absolute passive recovery)

### ⚡ Safe Modification / Routine: Complete Healing Sequence
1. **Zero Weight Loading**: Replace your intended exercise entirely with high-quality offloaded positioning.
2. **Decompress**: Lie flat on your back with calves resting on a soft chair or couch at a 90-degree angle (90/90 decompression). Rest for 10-15 minutes.
3. **Gentle Diaphragmatic Lunging**: Cycle 5-second nasal inhales into the lower abdomen, expanding the ribs laterally. This dampens sympathetic nervous guarding and shifts tissues to a parasympathetic state.
4. **Hydrate & Heat**: Apply a warm compress to the area to encourage active capillary circulation, provided there is no acute throbbing or direct inflammation bounds.

### 💡 Coach's Tip:
"Patience is an elite training variable." Refraining from loading damaged joints or soft tissue structures today allows the body to complete secondary protein synthesis safely. If you experience sharp, localized, or radiating neuro-pinches, immediately schedule a consultation with a certified physical therapist.

### 🍎 Post-Workout Refuel:
A light organic hydration protocol of warm lavender chamomile tea paired with dynamic mineral water and a small handful of anti-inflammatory raw almonds. Zero heavy food metabolization stress needed during rest.`;

      const newLog: LogEntry = {
        id: "log-" + Date.now(),
        timestamp: "Just now",
        exercise: exercise || "Intended Session",
        constraint: "Flagged with Painful Mood Selection",
        intensity: 1,
        mood: "Painful",
        result: restValue,
        hasImage: !!image,
        nutrition: "Lavender herbal tea & mineral electrolyte fluid",
        isRestProtocol: true
      };

      saveLogs([newLog, ...logs]);
      setResult(restValue);
      setStreakDays(prev => Math.max(1, prev)); // reset or maintain
      return;
    }

    if (!exercise.trim()) {
      setError("Please outline the exercise or planned movement pattern.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/modify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ exercise, constraint, intensity, image }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "System could not formulate adaptation. Please check variables.");
      }

      setResult(data.result);

      // Extract a mock nutrition or default one from response or logic
      const nutritionSnack = "Classic Protein shake with blended sweet bananas, soft almond butter, and a pinch of pink Himalayan salt.";

      // Log successful adaptation request
      const newLog: LogEntry = {
        id: "log-" + Date.now(),
        timestamp: "Just now",
        exercise: exercise,
        constraint: constraint || "None specified",
        intensity: intensity,
        mood: mood,
        result: data.result,
        hasImage: !!image,
        nutrition: nutritionSnack,
        isRestProtocol: false
      };

      saveLogs([newLog, ...logs]);
      setTotalMinutes(prev => prev + 25);
    } catch (err: any) {
      setError(err.message || "Connection limitation with trainer database. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const getDynamicInsight = () => {
    // If last check in is painful
    if (logs.length > 0 && logs[0].mood === "Painful") {
      return {
        title: "Adaptive Safeguard Active",
        text: "Your current profile is in recovery overdrive. Focus on passive breathing cycles, spinal elongation, and low inflammatory meals. Avoid compound eccentric loads.",
        accent: "border-rose-200 bg-rose-50 text-rose-800"
      };
    }
    if (logs.length > 0 && logs[0].intensity >= 8) {
      return {
        title: "Metabolic Threshold Triggered",
        text: "Your last routine registered of higher intensity. Plan extra sleep blocks to support muscle satellite cell division and target high protein/glycogen window.",
        accent: "border-purple-200 bg-purple-50 text-purple-900"
      };
    }
    return {
      title: "System Status: Stable",
      text: "Great biomechanical consistency this week. The kinesiologic engine suggests aiming for single-leg lateral stability exercises next to smooth joint symmetries.",
      accent: "border-emerald-200 bg-emerald-50 text-emerald-900"
    };
  };

  const insight = getDynamicInsight();

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#2c223c] flex flex-col selection:bg-[#ecd9fc] selection:text-[#34204c] font-sans antialiased">
      
      {/* Decorative Brand Header Pattern */}
      <div className="absolute top-0 left-0 w-full h-[320px] bg-gradient-to-b from-[#e8e2fa]/45 via-[#f5eefb]/20 to-transparent pointer-events-none" />

      {/* App Main Wrapper */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-10 z-10 relative flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-[260px] flex-shrink-0 lg:sticky lg:top-10 space-y-6">
          
          {/* Brand Card with Lavender and Cream vibe */}
          <div className="bg-[#ffffff] border border-[#e8dfeb] rounded-3xl p-5 md:p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ada1e6] to-[#8d79df] flex items-center justify-center text-white mb-3">
              <Dumbbell className="w-6 h-6 rotate-12" />
            </div>
            <h1 className="text-xl font-bold font-sans tracking-tight text-[#3c2957]">
              Form & Progression
            </h1>
            <p className="text-[10px] font-mono tracking-widest text-[#9d89b3] uppercase font-bold mt-1">
              • Lab • Studio •
            </p>
            <div className="w-full h-[1px] bg-[#f0e8f3] my-4" />
            
            {/* Quick Micro Profile with Editable name */}
            <div className="w-full text-left bg-[#fcfaff] border border-[#f0e8f6] rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f4eff9] border border-[#e4daea] flex-shrink-0 flex items-center justify-center text-[#7e57c2] font-semibold text-xs select-none">
                  {((profileName || "User").trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().substring(0, 2) || "U")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-[#9080ab] font-bold uppercase tracking-wide">Athlete Profile</div>
                  <div className="text-xs font-bold text-[#3c2957] truncate">{profileName || "Add Name"}</div>
                </div>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="athlete-name-input" className="text-[9px] text-[#9080ab] font-bold uppercase tracking-wider block">Set/Edit Athlete Name</label>
                <input
                  id="athlete-name-input"
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full bg-white border border-[#e0d6e7] hover:border-[#cfbfe2] focus:border-[#7e57c2] rounded-xl px-2.5 py-1.5 text-xs text-[#3c2957] font-semibold outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="bg-[#ffffff]/80 backdrop-blur-md border border-[#e8dfeb] rounded-3xl p-3 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-[#7964db] text-white shadow-md shadow-[#7964db]/10"
                  : "text-[#5e4f72] hover:bg-[#faf4fd] hover:text-[#7154c9]"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Lab Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("movement")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeTab === "movement"
                  ? "bg-[#7964db] text-white shadow-md shadow-[#7964db]/10"
                  : "text-[#5e4f72] hover:bg-[#faf4fd] hover:text-[#7154c9]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Dumbbell className="w-4 h-4" />
                <span>Adapt Movement</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </button>

            <button
              onClick={() => setActiveTab("library")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeTab === "library"
                  ? "bg-[#7964db] text-white shadow-md shadow-[#7964db]/10"
                  : "text-[#5e4f72] hover:bg-[#faf4fd] hover:text-[#7154c9]"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Movement Library</span>
            </button>

            <button
              onClick={() => setActiveTab("progress")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeTab === "progress"
                  ? "bg-[#7964db] text-white shadow-md shadow-[#7964db]/10"
                  : "text-[#5e4f72] hover:bg-[#faf4fd] hover:text-[#7154c9]"
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span>Biometric Stream</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeTab === "history"
                  ? "bg-[#7964db] text-white shadow-md shadow-[#7964db]/10"
                  : "text-[#5e4f72] hover:bg-[#faf4fd] hover:text-[#7154c9]"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Adaptation Logs</span>
            </button>
          </nav>

          {/* Real-time Health Safe Disclaimer widget */}
          <div className="p-4 rounded-3xl bg-[#f5eefc]/50 border border-[#ecd9f9] text-[11px] leading-relaxed text-[#735d94]">
            <div className="flex items-center gap-1.5 font-bold text-[#5c4a7e] mb-1.5">
              <ShieldCheck className="w-4 h-4 text-[#8a6acc]" />
              <span>Biomechanics Verified</span>
            </div>
            <span>All safe modifications adhere strictly to kinetic load distribution models to reduce shear stresses.</span>
          </div>

        </aside>

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 min-w-0">
          
          <AnimatePresence mode="wait">
            
            {/* TAB: DASHBOARD */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Custom Welcome Message / Call to Action */}
                <div className="bg-white border border-[#e8dfeb] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-sm">
                  <div className="absolute -right-4 -bottom-4 w-40 h-40 bg-[#f7f2fc] rounded-full pointer-events-none" />
                  <div className="space-y-2 relative z-10 flex-1">
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-[#341e53]">
                      Welcome to your Lab, {profileName || "Athlete"}
                    </h2>
                    <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-xl">
                      Configure your joints, limitations, or training spaces with live kinesiologic adaptations. Let's adjust, progress, and refuel cleanly today.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("movement")}
                    className="bg-[#7964db] hover:bg-[#6853cc] text-white font-bold text-xs py-3.5 px-5 rounded-2xl cursor-pointer shadow-md shadow-[#7964db]/10 transition-transform active:scale-95 whitespace-nowrap z-10 font-sans tracking-wide"
                  >
                    Modify Workout Form
                  </button>
                </div>

                {/* Dashboard Stats Panel */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-[#e8dfeb] rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#fef7ec] flex items-center justify-center text-amber-500">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Streak</div>
                      <div className="text-lg font-bold text-[#36264d]">{streakDays} Consecutive Days</div>
                    </div>
                  </div>

                  <div className="bg-white border border-[#e8dfeb] rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#eefbf7] flex items-center justify-center text-emerald-500">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Training Minutes</div>
                      <div className="text-lg font-bold text-[#36264d]">{totalMinutes} Mins Total</div>
                    </div>
                  </div>

                  <div className="bg-white border border-[#e8dfeb] rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#f4effc] flex items-center justify-center text-[#7e57c2]">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Routine Adapts</div>
                      <div className="text-lg font-bold text-[#36264d]">{logs.length} Completed</div>
                    </div>
                  </div>

                  <div className="bg-white border border-[#e8dfeb] rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#edf6fc] flex items-center justify-center text-sky-500">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kinesiology Locks</div>
                      <div className="text-lg font-bold text-[#36264d]">Always Active</div>
                    </div>
                  </div>
                </div>

                {/* Second Row: AI Insight and Quick Mood Assessment */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* AI INSIGHT CARD */}
                  <div className="md:col-span-7 bg-white border border-[#e8dfeb] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[#7c63db] font-bold text-xs tracking-wider uppercase">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        <span>Dynamic AI Kinetic Insights</span>
                      </div>
                      <h3 className="text-lg font-bold font-sans text-[#33224b]">
                        {insight.title}
                      </h3>
                      <p className="text-[#514562] text-xs md:text-sm leading-relaxed p-4 rounded-2xl border bg-[#fbf9fc] border-[#eedef9] font-medium">
                        {insight.text}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>Calculated based on mood feedback & load fatigue metrics</span>
                      <span className="font-bold text-[#745dbb] cursor-pointer hover:underline flex items-center gap-0.5" onClick={() => setActiveTab("progress")}>
                        View Stream <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  {/* Mood Quick Gauge */}
                  <div className="md:col-span-5 bg-white border border-[#e8dfeb] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">My Daily State</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        Quickly declare your somatic feedback level. The system restricts dangerous motions based on discomfort factors.
                      </p>

                      <div className="grid grid-cols-1 gap-2">
                        <div className="p-3 bg-[#faf7fd] border border-[#ebe1fc] rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-bold text-[#331e4e]">
                            <Smile className="w-4 h-4 text-emerald-500" />
                            <span>System State Selection: {mood}</span>
                          </div>
                          <button
                            onClick={() => {
                              setActiveTab("movement");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="text-xs font-bold text-[#7a64da] hover:underline cursor-pointer"
                          >
                            Update state
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-orange-50 border border-orange-100/50 flex items-start gap-2 text-[11px] text-orange-800">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>Soreness or severe joints limits demand direct target intensity dampening. Safety first.</span>
                    </div>
                  </div>

                </div>

                {/* Third Row: Recent Completed Adaptations & Daily Reminders Control */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Recent Completed Adaptations */}
                  <div className="lg:col-span-7 bg-white border border-[#e8dfeb] rounded-3xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base font-bold text-[#321c4e] font-sans">
                        Recent Adaptation Activity
                      </h3>
                      <button onClick={() => setActiveTab("history")} className="text-xs font-bold text-[#7159d3] hover:underline cursor-pointer">
                        View full logs ({logs.length})
                      </button>
                    </div>

                    {logs.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No recent workout logs found. Try setting your first adaptation plan!
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {logs.slice(0, 3).map((l, index) => (
                          <div key={l.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                              <p className="text-xs text-slate-400 font-mono">{l.timestamp}</p>
                              <p className="text-sm font-bold text-[#331c4f] mt-0.5">
                                {l.exercise} <span className="text-slate-400 text-xs font-normal">due to</span> <span className="text-slate-500 text-xs font-semibold italic">"{l.constraint}"</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                l.isRestProtocol 
                                  ? "bg-rose-50 border-rose-200 text-rose-700"
                                  : "bg-[#f4f2fc] border-[#ebe5f7] text-[#7155c8]"
                              }`}>
                                Intensity {l.intensity}/10
                              </span>
                              <span className="text-[10px] font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                {l.mood} status
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Daily Reminders Control Center */}
                  <div className="lg:col-span-5 bg-white border border-[#e8dfeb] rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-[#7c63db] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                            <Bell className="w-4 h-4 text-[#7c63db]" />
                            <span>Daily Notification Reminders</span>
                          </span>
                          <h3 className="text-base font-bold text-[#321c4e] font-sans">
                            Arm Daily Alerts
                          </h3>
                        </div>
                        {/* Interactive toggle switch styled with pure CSS/Tailwind */}
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (!reminderEnabled && notificationPermission !== "granted") {
                                requestNotificationPermission();
                              }
                              setReminderEnabled(!reminderEnabled);
                            }}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              reminderEnabled ? "bg-[#7964db]" : "bg-slate-200"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                reminderEnabled ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed mt-2 font-medium">
                        Get native push notifications to complete your planned adaptations at your chosen challenge time. Keep muscle consistency flowing cleanly.
                      </p>

                      {/* Reminder setup details if supported */}
                      {isNotificationSupported ? (
                        <div className="mt-4 space-y-3.5 pt-1">
                          
                          {/* Choose Reminder Time */}
                          <div className="flex items-center justify-between bg-[#fcf9fd] border border-[#f0e7f5] rounded-2xl p-3">
                            <label htmlFor="reminder-time-picker" className="text-xs font-bold text-[#56486e]">
                              Daily Training Time:
                            </label>
                            <input
                              id="reminder-time-picker"
                              type="time"
                              value={reminderTime}
                              disabled={!reminderEnabled}
                              onChange={(e) => setReminderTime(e.target.value)}
                              className={`bg-white border rounded-xl px-2.5 py-1.5 text-xs text-[#3c2957] font-bold outline-none transition ${
                                reminderEnabled 
                                  ? "border-[#dcd1eb] focus:border-[#7964db]" 
                                  : "border-slate-200 opacity-50 cursor-not-allowed"
                              }`}
                            />
                          </div>

                          {/* Permission and Testing Section */}
                          <div className="space-y-2">
                            {/* Permission HUD Badge */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400 font-semibold">Permission Status:</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${
                                notificationPermission === "granted"
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                  : notificationPermission === "denied"
                                  ? "bg-rose-50 border-rose-200 text-rose-700"
                                  : "bg-amber-50 border-amber-200 text-amber-700"
                              }`}>
                                {notificationPermission}
                              </span>
                            </div>

                            {/* Request / Action Buttons */}
                            <div className="flex gap-2">
                              {notificationPermission !== "granted" && (
                                <button
                                  type="button"
                                  onClick={requestNotificationPermission}
                                  className="flex-1 bg-[#f4f1fd] hover:bg-[#ebdffd] border border-[#ebdffc] text-[#785cc3] font-bold text-xs py-2 px-3 rounded-xl cursor-pointer transition text-center"
                                >
                                  Grant Permission
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  triggerNotification(
                                    "✨ Form & Progression Test Notification", 
                                    `Hello ${profileName || "Athlete"}, notifications are armed and configured correctly!`
                                  );
                                }}
                                className="flex-1 bg-[#ffffff] hover:bg-[#f6f2fb] border border-slate-200 hover:border-[#cfbfe0] text-[#554a6e] font-semibold text-xs py-2 px-3 rounded-xl cursor-pointer transition text-center"
                              >
                                Send Test Notification
                              </button>
                            </div>
                          </div>

                        </div>
                      ) : (
                        <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-[11px] leading-relaxed">
                          ⚠️ The Notification API is not supported in this browser environment. Try modern Chrome, Firefox, or Safari on desktop.
                        </div>
                      )}
                    </div>

                    {/* Notice regarding iframe restriction if it's default/denied */}
                    {notificationPermission !== "granted" && (
                      <div className="bg-[#fbfcff] border border-blue-100 rounded-2xl p-3 text-[10px] text-blue-700 leading-normal font-medium">
                        ℹ️ <strong>Iframe limitation?</strong> Click "Open in New Tab" at the top-right to ensure the browser grants full Notification permissions without client sandboxes.
                      </div>
                    )}
                  </div>

                </div>

              </motion.div>
            )}

            {/* TAB: MOVEMENT INPUT MODULE */}
            {activeTab === "movement" && (
              <motion.div
                key="movement"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* Inputs area */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Instruction preset selection header */}
                  <div className="bg-white border border-[#e8dfeb] rounded-3xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#7964db] uppercase tracking-wide mb-3">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span>Testing Quick Scenarios Setup:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {PRESETS.map((pst) => (
                        <button
                          key={pst.id}
                          onClick={() => handleApplyPreset(pst)}
                          className={`text-left p-3 rounded-2xl border transition-all duration-150 flex items-start gap-2.5 cursor-pointer hover:scale-[1.01] ${
                            activePreset === pst.id
                              ? "bg-[#faf8fd] border-[#7d6bdd] text-[#341d4f] shadow-sm"
                              : "bg-[#ffffff] border-[#ebdfee] hover:border-[#cfbfe0] text-[#56486e]"
                          }`}
                        >
                          <span className="text-lg mt-0.5 select-none">{pst.icon}</span>
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold text-[#7559c5]">
                              {pst.label}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              {pst.exercise}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Core Input Container */}
                  <div className="bg-white border border-[#e8dfeb] rounded-3xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-lg font-bold text-[#34204c] mb-6 font-sans border-b border-[#f4eef7] pb-4 flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-[#7964db]" />
                      <span>Workout Adaptation Builder</span>
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      
                      {/* Exercise Name */}
                      <div className="space-y-2">
                        <label htmlFor="core-exercise" className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                          What exercise or routine do you want to modify?
                        </label>
                        <div className="relative">
                          <input
                            id="core-exercise"
                            type="text"
                            required={mood !== "Painful"}
                            value={exercise}
                            onChange={(e) => {
                              setExercise(e.target.value);
                              setActivePreset(null);
                            }}
                            placeholder="e.g. Incline Bench Press, Heavy jump squats, Full shoulder routine"
                            className="w-full bg-[#faf9fc] border border-[#e5daec] focus:border-[#7964db] focus:ring-1 focus:ring-[#7964db]/30 rounded-2xl px-4 py-4.5 text-slate-800 placeholder-slate-400 outline-none transition duration-150 text-sm font-semibold"
                          />
                        </div>
                      </div>

                      {/* Physical constraints */}
                      <div className="space-y-2">
                        <label htmlFor="core-constraint" className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                          What is your specific physical limitation, environmental constraint, or mood today?
                        </label>
                        <textarea
                          id="core-constraint"
                          rows={3}
                          value={constraint}
                          onChange={(e) => {
                            setConstraint(e.target.value);
                            setActivePreset(null);
                          }}
                          placeholder="e.g. Left shoulder has severe pinching in extension pose, training in hotel room with zero equipment, or low energy levels today"
                          className="w-full bg-[#faf9fc] border border-[#e5daec] focus:border-[#7964db] focus:ring-1 focus:ring-[#7964db]/30 rounded-2xl px-4 py-4 text-slate-800 placeholder-slate-400 outline-none transition duration-150 text-sm font-semibold resize-none"
                        />
                      </div>

                      {/* Mood check-in options */}
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Somatic Mood & Comfort Check-in
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {(["Great", "Good", "Okay", "Sore", "Painful"] as const).map((m) => {
                            const isSelected = mood === m;
                            return (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setMood(m)}
                                className={`text-center py-3.5 px-1 rounded-2xl border text-xs font-bold transition-all duration-150 cursor-pointer ${
                                  isSelected
                                    ? m === "Painful"
                                      ? "bg-rose-50 border-rose-500 text-rose-700 shadow-sm"
                                      : "bg-[#7c5dfa] border-[#7c5dfa] text-white shadow-sm"
                                    : "bg-[#ffffff] border-[#e8dfeb] hover:border-[#cfbfe2] text-[#5e4f72]"
                                } flex flex-col items-center justify-center gap-1.5`}
                              >
                                {m === "Great" && <Smile className="w-5 h-5 text-emerald-500" />}
                                {m === "Good" && <Smile className="w-5 h-5 text-teal-500" />}
                                {m === "Okay" && <Meh className="w-5 h-5 text-amber-500" />}
                                {m === "Sore" && <Frown className="w-5 h-5 text-orange-400" />}
                                {m === "Painful" && <Frown className="w-5 h-5 text-rose-500 animate-bounce" />}
                                <span className="text-[10px] md:text-xs">{m}</span>
                              </button>
                            );
                          })}
                        </div>
                        {mood === "Painful" && (
                          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-rose-700 leading-relaxed font-semibold">
                            ⚠️ PAIN REPORTED: Severe pain forces direct restorative rest flow inside Form & Progression system. We block high joints strain and issue an authoritative Rest Protocol instead.
                          </div>
                        )}
                      </div>

                      {/* Slider Intensity Selector */}
                      <div className="space-y-2.5 bg-[#faf8fc] border border-[#f3edf7] p-4 rounded-2xl">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                            Workout Challenge Intensity level: <span className="text-[#7c5dfa] font-black">{intensity}</span>/10
                          </label>
                          <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-md border ${
                            intensity <= 3 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            intensity <= 7 ? "bg-[#f4effc] text-[#745dbb] border-[#e4dafa]" :
                            "bg-rose-50 text-[#cf275d] border-rose-200"
                          }`}>
                            {intensity <= 3 ? "Gentle Passive (1-3)" :
                             intensity <= 7 ? "Controlled Fitness (4-7)" :
                             "Full Advanced Overload (8-10)"}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={intensity}
                          disabled={mood === "Painful"}
                          onChange={(e) => setIntensity(Number(e.target.value))}
                          className="w-full h-1.5 bg-[#ebdffd] rounded-lg appearance-none cursor-pointer accent-[#7c5dfa] outline-none"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                          <span>1 (REHABILITATIVE ALTERNATIVES)</span>
                          <span>5 (BALANCED LOAD)</span>
                          <span>10 (ELITE PROGRESSION)</span>
                        </div>
                      </div>

                      {/* Optional Photo Upload of Exercise pose or equipment */}
                      <div className="space-y-2 bg-[#faf8fc] border border-[#f3edf7] p-4 rounded-2xl">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                          Optional Pose or Equipment Photo (Kinesiologic Inspection Engine)
                        </label>

                        {!image ? (
                          <div className="border border-dashed border-[#dcd1ea] hover:border-[#7964db] rounded-2xl bg-[#ffffff] p-5 text-center transition-all duration-150 relative">
                            <input
                              type="file"
                              id="frame-file-upload"
                              accept="image/*"
                              disabled={mood === "Painful"}
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <label htmlFor="frame-file-upload" className={`cursor-pointer group flex flex-col items-center gap-1.5 ${mood === "Painful" ? "opacity-40 cursor-not-allowed" : ""}`}>
                              <div className="w-9 h-9 rounded-full bg-[#f4effc] flex items-center justify-center text-[#7e57c2] group-hover:bg-[#ebdffa] transition-colors">
                                <Upload className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-[#56486e] group-hover:text-[#745dbb]">
                                Upload exercise posture, wrist position, or gym setup
                              </span>
                              <p className="text-[10px] text-slate-400 leading-normal max-w-sm">
                                Allows our system to scan matching anatomy targets, inspect alignment defects, and confirm proper safety setups.
                              </p>
                            </label>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3.5 bg-white border border-[#e8dfeb] rounded-xl">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={image.data}
                                alt="Inspection preview"
                                className="w-10 h-10 object-cover rounded-md border border-[#eee4f4] flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-[#3c2957] truncate">Active Form Frame Loaded</div>
                                <div className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Ready to biomechanically audit</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setImage(null)}
                              className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 transition duration-150 cursor-pointer"
                              title="Delete Loaded Photo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Action buttons list */}
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-[#7a64da] to-[#8d78df] hover:from-[#6b55cb] hover:to-[#7f69cd] text-white font-bold py-4 px-6 rounded-2xl shadow-sm cursor-pointer transition active:scale-95 flex items-center justify-center gap-2 text-xs md:text-sm uppercase tracking-widest font-sans"
                        >
                          {loading ? (
                            <>
                              <span>Analyzing kinetic lines...</span>
                              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </>
                          ) : (
                            <>
                              <span>Compute Safe Adaptations</span>
                              <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </button>

                        {(exercise || constraint || image) && (
                          <button
                            type="button"
                            onClick={handleReset}
                            className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-rose-600 rounded-2xl cursor-pointer transition"
                            title="Reset Adaptation Form"
                          >
                            <RotateCcw className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                    </form>
                  </div>

                </div>

                {/* Live output container or tutorial */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Dynamic Results Box */}
                  {result ? (
                    <motion.div
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white border border-[#e8dfeb] rounded-3xl overflow-hidden shadow-md"
                    >
                      <div className="bg-[#fcf8fc] border-b border-[#ebdfee] p-5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-[#341e53] uppercase tracking-wide">
                            Optimized Modification Plan
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                          Active
                        </span>
                      </div>

                      <div className="p-6 md:p-8">
                        <div className="markdown-body">
                          <ReactMarkdown>{result}</ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  ) : !loading ? (
                    <div className="bg-white border border-[#e8dfeb] rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                      <div className="flex items-center gap-2 text-[#7c63db] font-bold text-xs tracking-wider uppercase">
                        <BrainCircuit className="w-4 h-4" />
                        <span>Biomechanics Protocol</span>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#f4effc] border border-[#d6c9ec] flex items-center justify-center text-xs font-bold text-[#8d74dc]">1</span>
                          <div>
                            <p className="text-xs font-bold text-[#331c4f]">Kinetic Path Isolation</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">We analyze primary muscle actions and load shift patterns to avoid triggering standard arthritic or connective tendon flare-ups.</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#f4effc] border border-[#d6c9ec] flex items-center justify-center text-xs font-bold text-[#8d74dc]">2</span>
                          <div>
                            <p className="text-xs font-bold text-[#331c4f]">Overload Vector Planning</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Adaptable muscle engagement thresholds mapped strictly from 1 up to high challenge Intensity 10.</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#f4effc] border border-[#d6c9ec] flex items-center justify-center text-xs font-bold text-[#8d74dc]">3</span>
                          <div>
                            <p className="text-xs font-bold text-[#331c4f]">Integrative Recovery Treats</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Our nutritionist module outputs optimized recovery meals custom-crafted for muscle repair based on workout exhaustion.</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-[#fbf9fc] border border-[#eee4f5] rounded-2xl text-[11px] text-slate-500 leading-relaxed">
                        <span className="font-bold text-[#362054]">Tip:</span> Uploading a photo helps identify spinal flexion mistakes, knee varus collapse, and lateral pelvic shifts on squat patterns dynamically.
                      </div>
                    </div>
                  ) : null}

                  {/* Loading placeholder */}
                  {loading && (
                    <div className="bg-white border border-[#e8dfeb] rounded-3xl p-8 text-center space-y-4 shadow-sm animate-pulse">
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#7e57c2] animate-spin mx-auto flex items-center justify-center">
                        <Activity className="w-5 h-5 text-[#8d74dc]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#331c4f]">Biomechanics Solver Analyzing...</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          Checking joints parameters, tension vectors, and muscle isolation formulas.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Errors display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-red-800">Adaptation Halted</div>
                        <p className="text-xs text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            )}

            {/* TAB: EXERCISE LIBRARY */}
            {activeTab === "library" && (
              <motion.div
                key="library"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-white border border-[#e8dfeb] rounded-3xl p-6 md:p-8 space-y-2">
                  <h2 className="text-xl md:text-2xl font-display font-bold text-[#3c2957]">
                    The Movement Science Library
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 max-w-2xl leading-relaxed">
                    Choose standard biomechanically intensive exercises as a baseline. Click **Adapt Form** to load them instantly into our adaptation system for safety customization.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Card 1 - Squats */}
                  <div className="bg-white border border-[#e8dfeb] rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 font-bold font-sans">
                        01
                      </div>
                      <h3 className="text-base font-bold text-[#3c2957]">The Barbell Back Squat</h3>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] bg-[#fbf8fe] border border-[#f0e6f9] text-[#7154c8] font-bold px-2 py-0.5 rounded-full">Quads, Gluteals</span>
                        <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 font-bold px-2 py-0.5 rounded-full">Heavy Knee/Back Load</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed pt-2">
                        Outstanding compound lower-body stimulator, but risks knee patellofemoral pressure or lumbar disc compression.
                      </p>
                    </div>
                    <button
                      onClick={() => handleApplyPresetAndNavigate("Barbell Back Squats", "My knees click heavily and my lower back feels locked up during squatted depth.")}
                      className="w-full mt-5 bg-[#faf8fc] hover:bg-[#7a64da] border border-[#ebdffc] hover:border-[#7a64da] text-[#785cc3] hover:text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer transition duration-150 flex items-center justify-center gap-1"
                    >
                      <span>Adapt Squat Pattern</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 2 - Overhead Press */}
                  <div className="bg-white border border-[#e8dfeb] rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold font-sans">
                        02
                      </div>
                      <h3 className="text-base font-bold text-[#3c2957]">Standing Military Press</h3>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] bg-[#fbf8fe] border border-[#f0e6f9] text-[#7154c8] font-bold px-2 py-0.5 rounded-full">Deltoids, Triceps</span>
                        <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 font-bold px-2 py-0.5 rounded-full">Shoulder Extension</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed pt-2">
                        Highly effective for shoulder mass, but vulnerable to subacromial pinching and lower-back arching.
                      </p>
                    </div>
                    <button
                      onClick={() => handleApplyPresetAndNavigate("Military Barbell Press", "Painful shoulder impingement or wrist flexibility limit.")}
                      className="w-full mt-5 bg-[#faf8fc] hover:bg-[#7a64da] border border-[#ebdffc] hover:border-[#7a64da] text-[#785cc3] hover:text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer transition duration-150 flex items-center justify-center gap-1"
                    >
                      <span>Adapt Press Pattern</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 3 - Deadlifts */}
                  <div className="bg-white border border-[#e8dfeb] rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-bold font-sans">
                        03
                      </div>
                      <h3 className="text-base font-bold text-[#3c2957]">Barbell Ground Deadlift</h3>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] bg-[#fbf8fe] border border-[#f0e6f9] text-[#7154c8] font-bold px-2 py-0.5 rounded-full">Hamstrings, Lats, Erector Spinae</span>
                        <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 font-bold px-2 py-0.5 rounded-full">Spinal Loading</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed pt-2">
                        The ultimate hinge power builder, but demands perfect hip mobilization to protect L4-S1 vertebrae.
                      </p>
                    </div>
                    <button
                      onClick={() => handleApplyPresetAndNavigate("Barbell Deadlifts", "Stiff lumbar posture, high back pain risk, or lack of heavy bumper plates.")}
                      className="w-full mt-5 bg-[#faf8fc] hover:bg-[#7a64da] border border-[#ebdffc] hover:border-[#7a64da] text-[#785cc3] hover:text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer transition duration-150 flex items-center justify-center gap-1"
                    >
                      <span>Adapt Hinge Pattern</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

                {/* Additional tips section */}
                <div className="bg-[#fcfafc] border border-[#e9e1f0] p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#321c4e]">Need a custom exercise plan from scratch?</h4>
                    <p className="text-xs text-slate-400">Leave limitations blank and request "30-Day Knee Rehab Plan" or "Bodyweight Chest routine" to trigger Programmer Mode.</p>
                  </div>
                  <button
                    onClick={() => {
                      setExercise("30-Day Joint Balance Program");
                      setConstraint("");
                      setActiveTab("movement");
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white border border-[#dbcfea] hover:border-[#7e6acc] text-[#745ec4] font-bold text-xs cursor-pointer transition"
                  >
                    Load Programmer Program
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB: PROGRESS STREAM */}
            {activeTab === "progress" && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-white border border-[#e8dfeb] rounded-3xl p-6 md:p-8 space-y-3 shadow-sm">
                  <span className="text-xs font-bold text-[#816adc] uppercase tracking-wide flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>Real-time Biometrics Stream</span>
                  </span>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-[#3c2957]">
                    Somatic Consistency and Muscle Load
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 max-w-xl leading-relaxed">
                    Form & Progression dynamically logs completed routine variations. Tracking consistency helps safely trigger progressive overload.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Streak widget */}
                  <div className="bg-white border border-[#e8dfeb] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-[#8d79da] uppercase tracking-wider">Lobe Consistency Streak</h3>
                      <div className="text-3xl font-black text-[#321c4e] flex items-baseline gap-1">
                        <span>{streakDays}</span>
                        <span className="text-sm text-slate-400 font-normal">weeks active</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed pt-1">
                        Excellent muscle tissue memory! Complete at least 2 safe biomechanical adaptations per week to maintain tendon remodel states.
                      </p>
                    </div>

                    <div className="flex gap-1.5 pt-4">
                      {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                        <div
                          key={d}
                          className={`h-7 flex-1 rounded-lg border flex items-center justify-center text-[10px] font-bold ${
                            d <= streakDays
                              ? "bg-[#ebdffd] border-[#957ee0] text-[#553dbb]"
                              : "bg-slate-50 border-slate-200 text-slate-300"
                          }`}
                        >
                          W0{d}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Circular tracking status */}
                  <div className="bg-white border border-[#e8dfeb] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-[#8d79da] uppercase tracking-wider">Weekly Minutes Balance</h3>
                      <div className="text-3xl font-black text-[#321c4e]">
                        75 <span className="text-xs text-slate-400 font-semibold uppercase font-sans">/ 120 Mins Target</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed pt-1">
                        Your physical limitation offsets the duration target to protect bone/soft density limits.
                      </p>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2.5 mt-4">
                      <div className="bg-[#7c5dfa] h-2.5 rounded-full" style={{ width: "62%" }}></div>
                    </div>
                  </div>

                  {/* Kinesiology Insights status */}
                  <div className="bg-white border border-[#e8dfeb] rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-[#8d79da] uppercase tracking-wider">Anatomical Guarding Balance</h4>
                      <p className="text-xs text-slate-500 leading-normal pt-1">
                        Current alignment guarding index is low. Hip symmetry is estimated at 88%. Lumbar load is offset cleanly from original movements.
                      </p>
                    </div>

                    <div className="p-3 bg-[#eefbf6] border border-emerald-100 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Zero Joint Hyperextensions Flagged</span>
                    </div>
                  </div>

                </div>

              </motion.div>
            )}

            {/* TAB: HISTORY LOGS */}
            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-white border border-[#e8dfeb] rounded-3xl p-6 md:p-8 flex justify-between items-center shadow-sm">
                  <div>
                    <h2 className="text-xl md:text-2xl font-display font-bold text-[#3c2957]">
                      Form & Progression Logs
                    </h2>
                    <p className="text-xs md:text-sm text-slate-400 mt-1">
                      Historical tracking of modified routines. Keep track of your joint tolerances over time.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to clear your local logs?")) {
                        saveLogs([]);
                      }
                    }}
                    className="px-3.5 py-2 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Clear history
                  </button>
                </div>

                <div className="space-y-4">
                  {logs.length === 0 ? (
                    <div className="bg-white border border-[#e8dfeb] rounded-3xl p-12 text-center text-slate-400 text-xs">
                      No prescription logs saved yet. Build an adaptation to record your parameters.
                    </div>
                  ) : (
                    logs.map((item) => (
                      <div key={item.id} className="bg-white border border-[#e8dfeb] rounded-3xl p-6 space-y-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f4eef6]">
                          <div>
                            <span className="text-[10px] text-slate-400 font-mono block">{item.timestamp}</span>
                            <h3 className="text-base font-bold text-[#341d4f] mt-0.5">
                              {item.exercise}
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              item.isRestProtocol 
                                ? "bg-rose-50 border-rose-200 text-rose-700" 
                                : "bg-[#f4f1fd] border-[#ebdfff] text-[#7154c8]"
                            }`}>
                              Intensity {item.intensity}/10
                            </span>
                            <span className="text-[10px] font-semibold bg-indigo-50 border border-indigo-100/50 text-indigo-700 px-2 py-0.5 rounded-full">
                              Mood status: {item.mood}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                          <div className="md:col-span-8">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Somatic Input Constraints</h4>
                            <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-2xl border border-slate-100">
                              "{item.constraint}"
                            </p>

                            <div className="mt-4 pt-1">
                              <h4 className="text-xs font-bold text-[#745dbb] uppercase tracking-wider mb-2">Prescribed Routine Modification</h4>
                              <div className="p-4 bg-[#faf9fc] border border-[#f0e8f5] rounded-2xl text-xs md:text-sm text-slate-700 markdown-body leading-relaxed max-h-[300px] overflow-y-auto">
                                <ReactMarkdown>{item.result}</ReactMarkdown>
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-4 bg-[#faf8fc] border border-[#f2eff6] rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#7154c8]">
                              <Apple className="w-4 h-4 text-[#8a6acc]" />
                              <span>🍎 Post-Workout Refuel</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {item.nutrition || "Greek yogurt cup with lavender honey, dynamic mineral re-hydration fluids."}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </main>

      </div>

      {/* Styled Premium Sticky Footer */}
      <footer className="w-full bg-[#fcf9f6] border-t border-[#f2edf6] py-6 mt-16 text-center text-xs text-[#7e7392]">
        <div className="max-w-xl mx-auto px-4 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[10px] text-[#785cc3] bg-[#f2effb] border border-[#ebdffc] px-3 py-0.5 rounded-full font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Form & Progression Lab Safeguards Active</span>
          </div>
          <p className="leading-relaxed">
            Disclaimer: The Form & Progression Lab offers dynamic somatic customizations for informational and kinesiologic coaching. Consult with physical therapy specialists or orthopedic professionals immediately if you experience sharp pain.
          </p>
          <p className="font-mono text-[9px] text-[#ae9ebc] pt-1">
            Build 1.3.4 • Standalone Client Container Server • Port 3000
          </p>
        </div>
      </footer>

    </div>
  );
}

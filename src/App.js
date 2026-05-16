import { useState, useEffect } from "react";

const STORAGE_KEY = "nebiyu_lifeos_v1";

const defaultData = {
  phase: "survival", // "survival" | "full"
  day: 6,
  streak: 6,
  fiverr_orders: 0,
  fiverr_income: 0,
  chinese_words: 20,
  telegram_subs: 268,
  telegram_videos: 0,
  buildings_done: 1,
  content_posted: 0,
  portfolio_started: false,
  lane2_unlocked: false,
  log: [
    { day: 1, date: "May 1", win: "Morning movement, Blender session, Fiverr opened", note: "Slept past midnight" },
    { day: "2–3", date: "May 2–4", win: "Architecture design project, all-nighter", note: "Streak reset" },
    { day: 4, date: "May 5", win: "Blender continued, Tadao Ando study + sketch", note: "Studied alone" },
    { day: 5, date: "May 7", win: "10 pushups on waking", note: "Anchor habit starting" },
    { day: 6, date: "May 12", win: "Mid exam done, soccer + breakfast", note: "Survival mode" },
  ],
};

const schedule = [
  { time: "6:00", task: "Wake. 10 pushups. No phone.", cat: "Body" },
  { time: "6:10", task: "Cold shower", cat: "Body" },
  { time: "6:30", task: "Breakfast", cat: "Reset" },
  { time: "7:00", task: "Chinese — 20 min, speak aloud", cat: "Lang" },
  { time: "7:20", task: "Architecture deep study", cat: "Arch" },
  { time: "8:00", task: "Blender / Fiverr work", cat: "Skill" },
  { time: "9:30", task: "University / class", cat: "Arch" },
  { time: "13:00", task: "Eat. Walk 10 min. No screen.", cat: "Reset" },
  { time: "13:30", task: "Film or edit 30 min", cat: "Content" },
  { time: "14:00", task: "Arch viz / Fiverr block 2", cat: "Money" },
  { time: "15:30", task: "Assignments + portfolio", cat: "Arch" },
  { time: "17:00", task: "Free time — earned", cat: "Rest" },
  { time: "19:00", task: "Fill Daily Tracker · journal", cat: "Reset" },
  { time: "21:00", task: "Plan tomorrow", cat: "Reset" },
  { time: "21:30", task: "No screens. Wind down.", cat: "Rest" },
];

const buildings = [
  { name: "Tadao Ando — Church of the Light", done: true },
  { name: "Le Corbusier — Villa Savoye", done: false },
  { name: "Zaha Hadid — MAXXI Museum", done: false },
  { name: "Mies van der Rohe — Barcelona Pavilion", done: false },
  { name: "Alvar Aalto — Viipuri Library", done: false },
  { name: "Louis Kahn — Salk Institute", done: false },
  { name: "Renzo Piano — Centre Pompidou", done: false },
  { name: "Peter Zumthor — Therme Vals", done: false },
  { name: "Diébédo Francis Kéré — Gando Primary School", done: false },
  { name: "WOHA — Kampung Admiralty", done: false },
  { name: "Snøhetta — Oslo Opera House", done: false },
  { name: "Your own design — Addis Ababa problem", done: false },
];

const catColors = {
  Body: "#22c98a",
  Reset: "#8b8680",
  Lang: "#f5a623",
  Arch: "#4a9eff",
  Skill: "#a78bfa",
  Content: "#f472b6",
  Money: "#34d399",
  Rest: "#6b7280",
};

const notionLinks = [
  { label: "30-Day Plan", url: "https://www.notion.so/35efe61d89d9815e8b10d77c2495de96", icon: "📅" },
  { label: "Lane 1 — Arch Viz & Fiverr", url: "https://www.notion.so/354fe61d89d981908807d3221557fdc4", icon: "🧱" },
  { label: "Lane 2 — Dev Path (Python) 🔒", url: "https://www.notion.so/354fe61d89d981728f37cb5eca57795f", icon: "💻" },
  { label: "Lane 3 — Content & Channel", url: "https://www.notion.so/354fe61d89d981c19d8ac289efbc76d9", icon: "📡" },
  { label: "Architecture — Study Path", url: "https://www.notion.so/354fe61d89d98198ab23caa68e47744d", icon: "🏛️" },
  { label: "Chinese — HSK1 Path", url: "https://www.notion.so/354fe61d89d9811a9496dfc4ac3d6873", icon: "🇨🇳" },
];

const rules = [
  "No sugarcoating. Ever.",
  "Sleep before midnight.",
  "10 pushups the second you wake up.",
  "One lane at a time.",
  "Post ugly. Improve in public.",
  "Drink water first thing.",
  "Fresh Claude chat every 2 weeks.",
  "Never create a new top-level Notion page.",
  "Fill Daily Tracker every night at 19:00.",
];

function useData() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
    } catch { return defaultData; }
  });

  const update = (key, val) => {
    setData(prev => {
      const next = { ...prev, [key]: val };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return [data, update];
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
      padding: "14px 16px",
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ fontSize: 11, color: "#666", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.6px", fontFamily: "'DM Mono', monospace" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent || "#fff", fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function EditableStat({ label, value, sub, accent, field, update, type = "number" }) {
  const [editing, setEditing] = useState(false);
  const [tmp, setTmp] = useState(value);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: editing ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "14px 16px",
        flex: 1,
        minWidth: 0,
        cursor: "pointer",
        transition: "border 0.2s",
        position: "relative",
      }}
      onClick={() => { setEditing(true); setTmp(value); }}
    >
      <div style={{ fontSize: 11, color: "#666", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.6px", fontFamily: "'DM Mono', monospace" }}>{label}</div>
      {editing ? (
        <input
          autoFocus
          type={type}
          value={tmp}
          onChange={e => setTmp(e.target.value)}
          onBlur={() => { update(field, type === "number" ? Number(tmp) : tmp); setEditing(false); }}
          onKeyDown={e => { if (e.key === "Enter") { update(field, type === "number" ? Number(tmp) : tmp); setEditing(false); } if (e.key === "Escape") setEditing(false); }}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 28,
            fontWeight: 700,
            color: accent || "#fff",
            fontFamily: "'Syne', sans-serif",
            width: "100%",
          }}
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <div style={{ fontSize: 28, fontWeight: 700, color: accent || "#fff", fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{value}</div>
      )}
      {sub && <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{sub}</div>}
      {!editing && <div style={{ position: "absolute", top: 10, right: 10, fontSize: 10, color: "#444" }}>tap to edit</div>}
    </div>
  );
}

function ProgressBar({ pct, color }) {
  return (
    <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden", marginTop: 10 }}>
      <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 2, transition: "width 0.6s ease" }} />
    </div>
  );
}

function LaneCard({ icon, name, tag, tagColor, focus, pct, barColor, locked }) {
  return (
    <div style={{
      background: locked ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14,
      padding: "16px 18px",
      flex: 1,
      minWidth: 0,
      opacity: locked ? 0.6 : 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "'Syne', sans-serif" }}>{icon} {name}</div>
        <div style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, background: tagColor + "22", color: tagColor, fontWeight: 600, letterSpacing: "0.4px" }}>{tag}</div>
      </div>
      <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>{focus}</div>
      <ProgressBar pct={pct} color={barColor} />
      <div style={{ fontSize: 10, color: "#444", marginTop: 5, fontFamily: "'DM Mono', monospace" }}>{pct}% complete</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.2px", color: "#444", marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>{title}</div>
      {children}
    </div>
  );
}

export default function LifeOS() {
  const [data, update] = useData();
  const [activeTab, setActiveTab] = useState("home");
  const [newWin, setNewWin] = useState("");
  const [newNote, setNewNote] = useState("");

  const tabs = ["home", "schedule", "arch", "log", "links"];

  const addLog = () => {
    if (!newWin.trim()) return;
    const next = [...data.log, {
      day: data.day,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      win: newWin,
      note: newNote,
    }];
    update("log", next);
    update("day", data.day + 1);
    setNewWin("");
    setNewNote("");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#fff",
      fontFamily: "'DM Sans', sans-serif",
      padding: "0 0 60px 0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "24px 20px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        marginBottom: 0,
        position: "sticky",
        top: 0,
        background: "#0a0a0a",
        zIndex: 100,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "#444", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>LIFE OS</div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif", letterSpacing: "-0.5px" }}>Nebiyu Ali</div>
          </div>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "6px 14px",
            borderRadius: 20,
            background: data.phase === "survival" ? "rgba(245,166,35,0.15)" : "rgba(34,201,138,0.15)",
            color: data.phase === "survival" ? "#f5a623" : "#22c98a",
            letterSpacing: "0.5px",
            cursor: "pointer",
            border: `1px solid ${data.phase === "survival" ? "rgba(245,166,35,0.3)" : "rgba(34,201,138,0.3)"}`,
          }}
            onClick={() => update("phase", data.phase === "survival" ? "full" : "survival")}
          >
            {data.phase === "survival" ? "SURVIVAL MODE" : "FULL REGIME"}
          </div>
        </div>

        {/* Phase callout */}
        <div style={{
          fontSize: 12,
          color: data.phase === "survival" ? "#f5a623" : "#22c98a",
          marginBottom: 16,
          padding: "8px 12px",
          background: data.phase === "survival" ? "rgba(245,166,35,0.06)" : "rgba(34,201,138,0.06)",
          borderRadius: 8,
          borderLeft: `2px solid ${data.phase === "survival" ? "#f5a623" : "#22c98a"}`,
        }}>
          {data.phase === "survival"
            ? "May 12–25 · Jury + Finals only · Pushups, eat, sleep. Nothing else. Full Regime May 26."
            : "Full Regime active · All lanes running · Execute the plan."}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: -1 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              background: "none",
              border: "none",
              borderBottom: activeTab === t ? "2px solid #fff" : "2px solid transparent",
              color: activeTab === t ? "#fff" : "#444",
              fontSize: 12,
              fontWeight: 500,
              padding: "8px 14px",
              cursor: "pointer",
              textTransform: "capitalize",
              fontFamily: "'DM Sans', sans-serif",
              transition: "color 0.2s",
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 20px 0" }}>

        {/* HOME TAB */}
        {activeTab === "home" && (
          <>
            <Section title="Status — tap any card to edit">
              <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <EditableStat label="Day" value={data.day} sub="of 30" field="day" update={update} />
                <EditableStat label="Streak" value={data.streak} sub="days" accent="#22c98a" field="streak" update={update} />
                <EditableStat label="Fiverr $" value={`$${data.fiverr_income}`} sub={`${data.fiverr_orders} orders`} accent="#34d399" field="fiverr_income" update={update} />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <EditableStat label="Chinese" value={data.chinese_words} sub="/ 150 words (HSK1)" accent="#f5a623" field="chinese_words" update={update} />
                <EditableStat label="Telegram" value={data.telegram_subs} sub="@extraordinaryos" accent="#4a9eff" field="telegram_subs" update={update} />
                <EditableStat label="Videos" value={data.telegram_videos} sub="posted" field="telegram_videos" update={update} />
              </div>
            </Section>

            <Section title="The 3 Lanes">
              <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                <LaneCard
                  icon="🧱" name="Money Now — Arch Viz" tag="ACTIVE" tagColor="#22c98a"
                  focus="Blender renders → Fiverr gig. Basic $15 / Standard $30 / Premium $55. Gallery images needed → then publish."
                  pct={30} barColor="#22c98a" locked={false}
                />
                <LaneCard
                  icon="💻" name="Dev Path — Python" tag="LOCKED" tagColor="#f5a623"
                  focus="Opens after first Fiverr income. Full roadmap in Notion. Don't touch this until Lane 1 earns."
                  pct={0} barColor="#f5a623" locked={true}
                />
                <LaneCard
                  icon="📡" name="Content & Channel" tag="BUILDING" tagColor="#a78bfa"
                  focus="@extraordinaryos · Architecture + philosophy + coding. First video target: June 9. Post ugly. Improve in public."
                  pct={15} barColor="#a78bfa" locked={false}
                />
              </div>
            </Section>

            <Section title="Rules">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {rules.map((r, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 12, alignItems: "flex-start",
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 8, fontSize: 12, color: "#aaa",
                  }}>
                    <span style={{ color: "#333", fontFamily: "'DM Mono', monospace", fontSize: 10, minWidth: 16, marginTop: 1 }}>{String(i + 1).padStart(2, "0")}</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, padding: "14px 16px", borderLeft: "2px solid #222", fontSize: 13, color: "#444", fontStyle: "italic" }}>
                "Rank 1 is not given. It is built — one day at a time."
              </div>
            </Section>
          </>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === "schedule" && (
          <Section title="Daily Schedule — Full Regime (starts May 26)">
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {schedule.map((s, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px",
                  background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  borderRadius: 8,
                }}>
                  <span style={{ fontSize: 11, color: "#444", fontFamily: "'DM Mono', monospace", minWidth: 36 }}>{s.time}</span>
                  <span style={{ fontSize: 12, color: "#ccc", flex: 1 }}>{s.task}</span>
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 20,
                    background: (catColors[s.cat] || "#666") + "22",
                    color: catColors[s.cat] || "#666",
                    fontWeight: 500, whiteSpace: "nowrap",
                  }}>{s.cat}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ARCH TAB */}
        {activeTab === "arch" && (
          <>
            <Section title="12 Buildings — Weekly Study">
              <div style={{ fontSize: 12, color: "#555", marginBottom: 12 }}>
                For each: draw by hand, answer 5 questions (problem, concept, light, materials, what you'd do differently).
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {buildings.map((b, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px",
                    background: b.done ? "rgba(34,201,138,0.06)" : "rgba(255,255,255,0.02)",
                    borderRadius: 8,
                    border: b.done ? "1px solid rgba(34,201,138,0.15)" : "1px solid transparent",
                  }}>
                    <span style={{ fontSize: 14, minWidth: 20 }}>{b.done ? "✅" : "⬜"}</span>
                    <span style={{ fontSize: 12, color: b.done ? "#22c98a" : "#888", flex: 1 }}>
                      <span style={{ color: "#444", fontFamily: "'DM Mono', monospace", fontSize: 10, marginRight: 8 }}>W{i + 1}</span>
                      {b.name}
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Books — In Order">
              {["Architecture: Form, Space, and Order — Francis Ching", "Towards a New Architecture — Le Corbusier", "The Eyes of the Skin — Juhani Pallasmaa", "Thinking Architecture — Peter Zumthor"].map((book, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8, marginBottom: 4, fontSize: 12, color: "#888", alignItems: "center" }}>
                  <span style={{ color: "#333", fontFamily: "'DM Mono', monospace", fontSize: 10, minWidth: 16 }}>{i + 1}</span>
                  {book}
                </div>
              ))}
            </Section>
          </>
        )}

        {/* LOG TAB */}
        {activeTab === "log" && (
          <>
            <Section title="Add Today's Entry">
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                <input
                  placeholder="Key win today..."
                  value={newWin}
                  onChange={e => setNewWin(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif", outline: "none",
                  }}
                />
                <input
                  placeholder="Notes (optional)..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif", outline: "none",
                  }}
                />
                <button onClick={addLog} style={{
                  background: "#22c98a", border: "none", borderRadius: 8,
                  padding: "10px", color: "#000", fontWeight: 700, fontSize: 13,
                  cursor: "pointer", fontFamily: "'Syne', sans-serif",
                }}>Log Day {data.day} →</button>
              </div>
            </Section>

            <Section title="Progress Log">
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[...data.log].reverse().map((entry, i) => (
                  <div key={i} style={{
                    padding: "12px 14px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: "#444", fontFamily: "'DM Mono', monospace" }}>DAY {entry.day}</span>
                      <span style={{ fontSize: 10, color: "#333" }}>{entry.date}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#ccc", marginBottom: entry.note ? 4 : 0 }}>{entry.win}</div>
                    {entry.note && <div style={{ fontSize: 11, color: "#555" }}>{entry.note}</div>}
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}

        {/* LINKS TAB */}
        {activeTab === "links" && (
          <Section title="Notion — Open These Only">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {notionLinks.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noreferrer" style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  textDecoration: "none",
                  color: "#ccc",
                  fontSize: 13,
                  transition: "background 0.2s",
                }}>
                  <span style={{ fontSize: 18 }}>{link.icon}</span>
                  <span style={{ flex: 1 }}>{link.label}</span>
                  <span style={{ color: "#333", fontSize: 16 }}>→</span>
                </a>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.2px", color: "#444", marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>Quick Actions</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => update("streak", data.streak + 1)} style={{ background: "rgba(34,201,138,0.1)", border: "1px solid rgba(34,201,138,0.2)", color: "#22c98a", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer" }}>
                  ✓ Pushups done (+1 streak)
                </button>
                <button onClick={() => update("fiverr_orders", data.fiverr_orders + 1)} style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer" }}>
                  + Fiverr order
                </button>
                <button onClick={() => update("telegram_videos", data.telegram_videos + 1)} style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", color: "#a78bfa", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer" }}>
                  + Video posted
                </button>
                <button onClick={() => update("chinese_words", data.chinese_words + 5)} style={{ background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.2)", color: "#f5a623", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer" }}>
                  + 5 Chinese words
                </button>
              </div>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

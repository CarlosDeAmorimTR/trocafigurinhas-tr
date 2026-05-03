import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./lib/supabase";
import { COUNTRY_FLAGS, GROUP_NAMES, CATEGORY_LABELS } from "./data/countries";
import ProfilePage from "./components/ProfilePage";
import MatchesPage from "./components/MatchesPage";
import Dashboard   from "./components/Dashboard";

const C = {
  green: "#1A4233", greenLight: "#2A5C47", orange: "#C84B1E",
  beige: "#F5E6D8", beigeDeep: "#EDD5BF", black: "#1A1A1A",
  white: "#FFFFFF", gray: "#6B7280", grayLight: "#F3F4F6",
};

const TRLogo = ({ size = 32 }) => {
  const dots = Array.from({ length: 16 }, (_, i) => {
    const angle  = (i / 16) * 2 * Math.PI - Math.PI / 2;
    const radius = size * 0.38;
    const cx     = size / 2 + radius * Math.cos(angle);
    const cy     = size / 2 + radius * Math.sin(angle);
    const r      = i % 4 === 0 ? size * 0.09 : size * 0.065;
    return { cx, cy, r, delay: i * 0.06 };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="#C84B1E">
          <animate attributeName="opacity" values="1;0.4;1"
            dur="2.4s" begin={`${d.delay}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
};

function AlternatingIcon({ size = 18 }) {
  const [show, setShow] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setShow(s => (s + 1) % 2), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ fontSize: size, display: "inline-block", transition: "opacity 0.4s ease" }}>
      {show === 0 ? "⚽" : "🏆"}
    </span>
  );
}

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #F5E6D8;
      color: #1A1A1A;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #EDD5BF; }
    ::-webkit-scrollbar-thumb { background: #1A4233; border-radius: 3px; }
    button { cursor: pointer; font-family: inherit; }
    input, textarea, select { font-family: inherit; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeSlideLeft {
      from { opacity: 0; transform: translateX(24px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeSlideRight {
      from { opacity: 0; transform: translateX(-24px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes floatBall {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50%       { transform: translateY(-8px) rotate(180deg); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50%       { transform: scale(1.06); }
    }
    .fade-in    { animation: fadeIn 0.35s ease forwards; }
    .slide-left { animation: fadeSlideLeft  0.3s ease forwards; }
    .slide-right{ animation: fadeSlideRight 0.3s ease forwards; }
    .sticker-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
    .sticker-card:hover  { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.14) !important; }
    .sticker-card:active { transform: scale(0.96); }
    .nav-tab {
      flex: 1; padding: 16px 8px; background: none; border: none;
      border-bottom: 3px solid transparent; font-weight: 500; font-size: 14px;
      color: #6B7280; transition: all 0.2s ease; white-space: nowrap;
      text-align: center; position: relative;
    }
    .nav-tab::after {
      content: ''; position: absolute; bottom: 0; left: 50%;
      width: 0; height: 3px; background: #C84B1E;
      border-radius: 2px 2px 0 0; transition: width 0.25s ease, left 0.25s ease;
    }
    .nav-tab.active { color: #C84B1E; font-weight: 700; }
    .nav-tab.active::after { width: 100%; left: 0; }
    .nav-tab:hover:not(.active) { color: #1A4233; background: rgba(26,66,51,0.04); }
    .group-btn { transition: all 0.2s ease; }
    .group-btn:hover { transform: translateY(-1px); }
    @media (max-width: 640px) {
      .nav-tab { font-size: 12px; padding: 14px 4px; }
    }
  `}</style>
);

function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg = type === "error" ? "#DC2626" : C.green;
  return (
    <div style={{
      position: "fixed", bottom: "28px", right: "28px",
      background: bg, color: C.white, padding: "16px 22px",
      borderRadius: "14px", fontWeight: "600", fontSize: "14px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.25)", zIndex: 9999,
      animation: "fadeIn 0.3s ease", maxWidth: "340px",
      display: "flex", alignItems: "center", gap: "10px",
    }}>
      {message}
      <button onClick={onClose} style={{
        background: "rgba(255,255,255,0.2)", border: "none",
        borderRadius: "6px", color: C.white, padding: "2px 8px", fontSize: "13px",
      }}>✕</button>
    </div>
  );
}

function StickerCard({ sticker, isMarked, onToggle }) {
  const cd = COUNTRY_FLAGS[sticker.country] || { flag: "⚽", color: C.green };

  return (
    <button className="sticker-card" onClick={() => onToggle(sticker)} style={{
      background: sticker.is_metallic && !isMarked
        ? "linear-gradient(135deg,#f5f0e8,#e8d5a3,#f5f0e8)" : (isMarked ? C.green : C.white),
      border: `2px solid ${isMarked ? "transparent" : (sticker.is_metallic ? "#C9A84C" : "#E5E7EB")}`,
      borderRadius: "12px", padding: "12px 8px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
      minHeight: "110px", width: "100%",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "4px",
        background: isMarked ? "rgba(255,255,255,0.4)" : cd.color,
        borderRadius: "10px 10px 0 0",
      }} />
      <span style={{ fontSize: "10px", fontWeight: "700", color: isMarked ? "rgba(255,255,255,0.7)" : C.gray }}>
        #{sticker.number}
      </span>
      <span style={{ fontSize: "28px", lineHeight: 1 }}>
        {sticker.group_code === "INTRO" ? "🏆" : sticker.group_code === "CC" ? "🥤" : cd.flag}
      </span>
      <span style={{ fontSize: "10px", fontWeight: "600", color: isMarked ? "rgba(255,255,255,0.85)" : C.gray, textAlign: "center", lineHeight: 1.2 }}>
        {CATEGORY_LABELS[sticker.category]?.replace(/^[^\s]+\s/, "") || sticker.category}
      </span>
      {sticker.is_metallic && (
        <span style={{ position: "absolute", top: "8px", right: "6px", fontSize: "12px" }}>⭐</span>
      )}
      {isMarked && (
        <div style={{
          position: "absolute", bottom: "6px", right: "6px",
          width: "18px", height: "18px",
          background: "rgba(255,255,255,0.25)", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "10px", color: C.white,
        }}>✓</div>
      )}
    </button>
  );
}

function CountrySection({ country, stickers, markedSet, onToggle }) {
  const cd     = COUNTRY_FLAGS[country] || { flag: "⚽", color: C.green };
  const total  = stickers.length;
  const marked = stickers.filter(s => markedSet.has(String(s.id))).length;
  const pct    = total > 0 ? Math.round((marked / total) * 100) : 0;

  return (
    <div style={{ marginBottom: "32px" }} className="fade-in">
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "14px 18px", background: C.green,
        borderRadius: "14px 14px 0 0", borderLeft: `5px solid ${cd.color}`,
      }}>
        <span style={{ fontSize: "32px" }}>{cd.flag}</span>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: C.white, fontSize: "18px", fontWeight: "700", fontFamily: "'Playfair Display', serif" }}>
            {country}
          </h3>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px" }}>{marked}/{total} marcadas</p>
        </div>
        <span style={{ color: pct === 100 ? "#4ADE80" : C.orange, fontWeight: "800", fontSize: "22px" }}>
          {pct}%
        </span>
      </div>
      <div style={{ background: C.beigeDeep, height: "6px" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: pct === 100
            ? "linear-gradient(90deg,#16A34A,#4ADE80)"
            : `linear-gradient(90deg,${cd.color},${C.orange})`,
          transition: "width 0.6s ease",
        }} />
      </div>
      <div style={{
        background: C.white, borderRadius: "0 0 14px 14px", padding: "16px",
        display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(88px,1fr))", gap: "10px",
        border: `1px solid ${C.beigeDeep}`, borderTop: "none",
      }}>
        {stickers.map(s => (
          <StickerCard key={s.id} sticker={s}
            isMarked={markedSet.has(String(s.id))} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}

// ── LoginScreen ───────────────────────────────────────────────
function LoginScreen() {
  const [isNew, setIsNew]       = useState(false);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [animDir, setAnimDir]   = useState("slide-left");

  // Após criar conta com sucesso, volta para login após 2s
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => {
      setSuccess(false);
      setIsNew(false);
      setEmail("");
      setPassword("");
      setName("");
      setAnimDir("slide-right");
    }, 2500);
    return () => clearTimeout(t);
  }, [success]);

  const switchMode = (toNew) => {
    setAnimDir(toNew ? "slide-left" : "slide-right");
    setError(""); setSuccess(false);
    setIsNew(toNew);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      if (isNew) {
        const { data, error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        if (data?.user) {
          await supabase.from("users").upsert({
            id: data.user.id,
            full_name: name,
            updated_at: new Date().toISOString(),
          });
        }
        setSuccess(true);
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    width: "100%", padding: "14px 16px", borderRadius: "12px",
    border: `2px solid ${C.beigeDeep}`, fontSize: "15px",
    outline: "none", transition: "border-color 0.2s", background: C.white,
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      background: `linear-gradient(135deg, ${C.green} 0%, #0F2A1F 60%, #1A3A2A 100%)`,
    }}>
      {/* Painel esquerdo */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "48px", gap: "32px",
      }} className="fade-in">
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "80px", marginBottom: "16px",
            animation: "floatBall 4s ease-in-out infinite", display: "inline-block",
          }}>⚽</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "36px", color: C.white, fontWeight: "700", marginBottom: "8px",
          }}>TrocaFigurinhas</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "16px" }}>
            Thomson Reuters · Copa do Mundo 2026
          </p>
        </div>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { icon: "🔄", label: "Trocas inteligentes" },
            { icon: "🏆", label: "994 figurinhas"      },
            { icon: "👥", label: "Colegas TR"          },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.15)", borderRadius: "14px",
              padding: "16px 20px", textAlign: "center", color: C.white,
            }}>
              <div style={{ fontSize: "28px", marginBottom: "6px" }}>{icon}</div>
              <p style={{ fontSize: "13px", opacity: 0.85 }}>{label}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", opacity: 0.7 }}>
          <TRLogo size={28} />
          <span style={{ color: C.white, fontSize: "14px", fontWeight: "600" }}>Thomson Reuters</span>
        </div>
      </div>

      {/* Painel direito */}
      <div style={{
        width: "440px", flexShrink: 0, background: C.white,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "48px 40px", boxShadow: "-8px 0 40px rgba(0,0,0,0.2)",
      }}>

        {/* ── TELA DE SUCESSO ── */}
        {success ? (
          <div className="fade-in" style={{ textAlign: "center", width: "100%" }}>
            <div style={{
              fontSize: "72px", marginBottom: "20px",
              animation: "floatBall 2s ease-in-out infinite", display: "inline-block",
            }}>🎉</div>
            <h2 style={{ fontSize: "26px", fontWeight: "800", color: C.green, marginBottom: "10px" }}>
              Conta criada!
            </h2>
            <p style={{ color: C.gray, fontSize: "15px", marginBottom: "24px", lineHeight: 1.6 }}>
              Seu cadastro foi realizado com sucesso.<br />
              Redirecionando para o login...
            </p>
            <div style={{
              background: "#D1FAE5", border: "1px solid #6EE7B7",
              borderRadius: "12px", padding: "14px 18px",
              color: "#065F46", fontSize: "14px", fontWeight: "600",
            }}>
              ✅ Usuário criado com sucesso!
            </div>
          </div>
        ) : (
          <>
            {/* Toggle Entrar / Criar conta */}
            <div style={{
              display: "flex", background: C.grayLight,
              borderRadius: "12px", padding: "4px", gap: "4px",
              width: "100%", marginBottom: "32px",
            }}>
              {[
                { label: "🔐 Entrar",      val: false },
                { label: "🚀 Criar conta", val: true  },
              ].map(opt => (
                <button key={String(opt.val)} onClick={() => switchMode(opt.val)} style={{
                  flex: 1, padding: "12px", borderRadius: "10px", border: "none",
                  background: isNew === opt.val
                    ? (opt.val ? C.orange : C.green) : "transparent",
                  color: isNew === opt.val ? C.white : C.gray,
                  fontWeight: isNew === opt.val ? "700" : "500",
                  fontSize: "14px", transition: "all 0.25s ease",
                  boxShadow: isNew === opt.val ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                }}>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Form */}
            <div key={String(isNew)} className={animDir} style={{ width: "100%" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: C.black, marginBottom: "6px" }}>
                {isNew ? "Criar sua conta" : "Bem-vindo de volta!"}
              </h2>
              <p style={{ color: C.gray, fontSize: "14px", marginBottom: "28px" }}>
                {isNew ? "Junte-se aos colegas da TR" : "Entre para gerenciar suas figurinhas"}
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {isNew && (
                  <div>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: C.gray, display: "block", marginBottom: "6px" }}>
                      Seu nome
                    </label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Carlos Silva" required={isNew} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = C.green}
                      onBlur={e => e.target.style.borderColor = C.beigeDeep}
                    />
                  </div>
                )}
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: C.gray, display: "block", marginBottom: "6px" }}>
                    E-mail Thomson Reuters
                  </label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="seu@thomsonreuters.com" required style={inputStyle}
                    onFocus={e => e.target.style.borderColor = C.green}
                    onBlur={e => e.target.style.borderColor = C.beigeDeep}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: C.gray, display: "block", marginBottom: "6px" }}>
                    Senha
                  </label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required style={inputStyle}
                    onFocus={e => e.target.style.borderColor = C.green}
                    onBlur={e => e.target.style.borderColor = C.beigeDeep}
                  />
                </div>

                {error && (
                  <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "10px", padding: "12px 16px", color: "#DC2626", fontSize: "14px" }}>
                    ⚠️ {error}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  padding: "16px", marginTop: "4px",
                  background: loading ? C.gray : (isNew
                    ? `linear-gradient(135deg,${C.orange},#E05A2A)`
                    : `linear-gradient(135deg,${C.green},${C.greenLight})`),
                  color: C.white, border: "none", borderRadius: "12px",
                  fontSize: "16px", fontWeight: "700",
                  boxShadow: loading ? "none" : "0 4px 16px rgba(0,0,0,0.2)",
                  transition: "all 0.2s ease",
                }}>
                  {loading ? "⏳ Aguarde..." : (isNew ? "🚀 Criar Conta" : "🔐 Entrar")}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── App Principal ─────────────────────────────────────────────
export default function App() {
  const [session, setSession]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [stickers, setStickers]       = useState([]);
  const [hasSet, setHasSet]           = useState(new Set());
  const [needsSet, setNeedsSet]       = useState(new Set());
  const [pastedSet, setPastedSet]     = useState(new Set());
  const [activeTab, setActiveTab]     = useState("colecao");
  const [activeGroup, setActiveGroup] = useState("INTRO");
  const [searchTerm, setSearchTerm]   = useState("");
  const [toast, setToast]             = useState(null);
  const [pendingTrades, setPendingTrades] = useState(0);
  const groupScrollRef = useRef(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Figurinhas
  useEffect(() => {
    supabase.from("stickers").select("*").order("id").then(({ data }) => {
      if (data) setStickers(data);
    });
  }, []);

  // Coladas (localStorage)
  useEffect(() => {
    if (!session) return;
    try {
      const stored = localStorage.getItem(`pasted-${session.user.id}`);
      if (stored) setPastedSet(new Set(JSON.parse(stored)));
    } catch {}
  }, [session]);

  // Coleção — needsSet calculado automaticamente
  const loadCollection = useCallback(async () => {
    if (!session || stickers.length === 0) return;
    const uid = session.user.id;
    const { data: h } = await supabase
      .from("user_has")
      .select("sticker_id")
      .eq("user_id", uid);

    const newHasSet = new Set(h?.map(r => String(r.sticker_id)) || []);
    setHasSet(newHasSet);

    // Tudo que não tem marcado e não está colada = precisa
    const allIds = stickers.map(s => String(s.id));
    setNeedsSet(new Set(allIds.filter(id => !newHasSet.has(id) && !pastedSet.has(id))));
  }, [session, stickers, pastedSet]);

  useEffect(() => { loadCollection(); }, [loadCollection]);

  // Badge trocas pendentes
  useEffect(() => {
    if (!session) return;
    supabase.from("trades").select("id", { count: "exact" })
      .or(`user_a.eq.${session.user.id},user_b.eq.${session.user.id}`)
      .in("status", ["pending", "accepted"])
      .then(({ count }) => setPendingTrades(count || 0));
  }, [session]);

  // Realtime
  useEffect(() => {
    if (!session) return;
    const channel = supabase.channel("realtime-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_has" }, loadCollection)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "trades" }, (payload) => {
        if (payload.new?.user_b === session.user.id) {
          showToast("🤝 Você recebeu uma proposta de troca!", "success");
          setPendingTrades(p => p + 1);
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [session, loadCollection]);

  // Toggle figurinha — só modo "has" agora
  const toggleSticker = useCallback(async (sticker) => {
    if (!session) return;
    const uid    = session.user.id;
    const sid    = String(sticker.id);
    const newHas = new Set(hasSet);

    if (newHas.has(sid)) {
      newHas.delete(sid);
      await supabase.from("user_has").delete().match({ user_id: uid, sticker_id: sticker.id });
    } else {
      newHas.add(sid);
      await supabase.from("user_has").upsert({ user_id: uid, sticker_id: sticker.id });
    }

    setHasSet(newHas);
    // Recalcula needs automaticamente
    const allIds = stickers.map(s => String(s.id));
    setNeedsSet(new Set(allIds.filter(id => !newHas.has(id) && !pastedSet.has(id))));
  }, [session, hasSet, stickers, pastedSet]);

  // Toggle colada — também recalcula needs
  const togglePasted = useCallback((sticker) => {
    if (!session) return;
    const sid       = String(sticker.id);
    const newPasted = new Set(pastedSet);
    if (newPasted.has(sid)) newPasted.delete(sid);
    else newPasted.add(sid);
    setPastedSet(newPasted);
    localStorage.setItem(`pasted-${session.user.id}`, JSON.stringify([...newPasted]));

    const allIds = stickers.map(s => String(s.id));
    setNeedsSet(new Set(allIds.filter(id => !hasSet.has(id) && !newPasted.has(id))));
  }, [session, pastedSet, stickers, hasSet]);

  const scrollGroups = (dir) => {
    if (groupScrollRef.current)
      groupScrollRef.current.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  const groups        = [...new Set(stickers.map(s => s.group_code))];
  const groupStickers = stickers.filter(s => s.group_code === activeGroup);
  const countries     = [...new Set(groupStickers.map(s => s.country || "Introdução"))];
  const filteredBySearch = searchTerm
    ? stickers.filter(s =>
        (s.label   || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.number  || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.country || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : null;

  const TABS = [
    { id: "colecao",   label: "📚 Coleção"   },
    { id: "dashboard", label: "📖 Meu Álbum"  },
    { id: "trocas",    label: "🔄 Trocas", badge: pendingTrades },
    { id: "perfil",    label: "👤 Perfil"    },
  ];

  if (loading) return (
    <>
      <GlobalStyles />
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center", background: C.green,
      }}>
        <div style={{ textAlign: "center", color: C.white }}>
          <div style={{ fontSize: "56px", marginBottom: "16px", animation: "floatBall 2s ease-in-out infinite", display: "inline-block" }}>⚽</div>
          <p style={{ fontSize: "18px", opacity: 0.8 }}>Carregando...</p>
        </div>
      </div>
    </>
  );

  if (!session) return (<><GlobalStyles /><LoginScreen /></>);

  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: "100vh", background: C.beige }}>

        {/* HEADER */}
        <header style={{
          background: `linear-gradient(135deg, ${C.green} 0%, #0F2A1F 100%)`,
          position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 2px 20px rgba(0,0,0,0.2)",
        }}>
          <div style={{
            maxWidth: "1200px", margin: "0 auto", padding: "0 24px",
            height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
              <div style={{ flexShrink: 0 }}><TRLogo size={36} /></div>
              <div style={{ borderLeft: "1px solid rgba(255,255,255,0.25)", paddingLeft: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <AlternatingIcon size={16} />
                  <span style={{
                    color: C.white, fontFamily: "'Playfair Display', serif",
                    fontSize: "16px", fontWeight: "700", whiteSpace: "nowrap",
                  }}>TrocaFigurinhas</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "10px", marginTop: "1px", whiteSpace: "nowrap" }}>
                  Thomson Reuters · Copa 2026
                </p>
              </div>
            </div>
            <button onClick={() => supabase.auth.signOut()} style={{
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "10px", padding: "8px 18px", color: C.white,
              fontSize: "13px", fontWeight: "600", flexShrink: 0, transition: "background 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            >Sair</button>
          </div>
        </header>

        {/* NAV TABS */}
        <nav style={{
          background: C.white, boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          position: "sticky", top: "64px", zIndex: 99,
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", display: "flex" }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}>
                {tab.label}
                {tab.badge > 0 && (
                  <span style={{
                    marginLeft: "6px", background: C.orange, color: C.white,
                    borderRadius: "10px", padding: "2px 7px",
                    fontSize: "11px", fontWeight: "700",
                    animation: "pulse 2s infinite", display: "inline-block",
                  }}>{tab.badge}</span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* CONTEÚDO */}
        <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "28px 24px" }}>

          {/* ABA COLEÇÃO */}
          {activeTab === "colecao" && (
            <div className="fade-in">

              {/* Stats bar */}
              <div style={{
                background: `linear-gradient(135deg,${C.green},#0F2A1F)`,
                borderRadius: "16px", padding: "20px 28px", marginBottom: "24px",
                display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px",
                boxShadow: "0 4px 24px rgba(26,66,51,0.25)",
              }}>
                {[
                  { label: "Total no álbum", value: stickers.length, color: "#93C5FD" },
                  { label: "Tenho repetida", value: hasSet.size,     color: "#4ADE80" },
                  { label: "Faltam",         value: needsSet.size,   color: "#FB923C" },
                  { label: "Coladas",        value: pastedSet.size,  color: "#FCD34D" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ color, fontSize: "30px", fontWeight: "800", lineHeight: 1 }}>{value}</div>
                    <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", marginTop: "5px" }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Info box — substituiu os botões Tenho/Preciso */}
              <div style={{
                background: C.white, borderRadius: "14px", padding: "16px 20px",
                marginBottom: "24px", border: `2px solid ${C.green}`,
                display: "flex", alignItems: "center", gap: "14px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}>
                <span style={{ fontSize: "28px" }}>✅</span>
                <div>
                  <p style={{ fontWeight: "700", fontSize: "15px", color: C.green }}>
                    Marque as figurinhas que você tem repetidas
                  </p>
                  <p style={{ fontSize: "13px", color: C.gray, marginTop: "2px" }}>
                    As que você <strong>não marcar</strong> serão automaticamente consideradas como <strong>faltam</strong>
                  </p>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: "22px", fontWeight: "800", color: C.green }}>{hasSet.size}</div>
                  <div style={{ fontSize: "11px", color: C.gray }}>marcadas</div>
                </div>
              </div>

              {/* Busca */}
              <div style={{ marginBottom: "20px" }}>
                <input
                  type="text"
                  placeholder="🔍 Buscar figurinha, país ou número..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: "12px",
                    border: `2px solid ${C.beigeDeep}`, fontSize: "15px",
                    background: C.white, outline: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)", transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={e => { e.target.style.borderColor = C.green; e.target.style.boxShadow = "0 0 0 3px rgba(26,66,51,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = C.beigeDeep; e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"; }}
                />
              </div>

              {/* Resultado busca */}
              {searchTerm && filteredBySearch && (
                <div className="fade-in">
                  <p style={{ color: C.gray, marginBottom: "16px", fontSize: "14px" }}>
                    {filteredBySearch.length} resultado(s) para "{searchTerm}"
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(88px,1fr))", gap: "10px" }}>
                    {filteredBySearch.map(s => (
                      <StickerCard key={s.id} sticker={s}
                        isMarked={hasSet.has(String(s.id))} onToggle={toggleSticker} />
                    ))}
                  </div>
                </div>
              )}

              {/* Grupos */}
              {!searchTerm && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                    <button onClick={() => scrollGroups(-1)} style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      border: `2px solid ${C.beigeDeep}`, background: C.white,
                      fontSize: "16px", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = C.beigeDeep}
                      onMouseLeave={e => e.currentTarget.style.background = C.white}
                    >◀</button>
                    <div ref={groupScrollRef} style={{
                      flex: 1, display: "flex", gap: "6px",
                      overflowX: "auto", scrollbarWidth: "none", scrollBehavior: "smooth",
                    }}>
                      {groups.map(g => (
                        <button key={g} className="group-btn" onClick={() => setActiveGroup(g)} style={{
                          padding: "10px 18px", borderRadius: "10px", border: "none", flexShrink: 0,
                          background: activeGroup === g ? C.green : C.white,
                          color: activeGroup === g ? C.white : C.gray,
                          fontWeight: activeGroup === g ? "700" : "500", fontSize: "14px",
                          boxShadow: activeGroup === g
                            ? "0 4px 14px rgba(26,66,51,0.3)" : "0 1px 4px rgba(0,0,0,0.08)",
                        }}>
                          {GROUP_NAMES[g] || g}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => scrollGroups(1)} style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      border: `2px solid ${C.beigeDeep}`, background: C.white,
                      fontSize: "16px", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = C.beigeDeep}
                      onMouseLeave={e => e.currentTarget.style.background = C.white}
                    >▶</button>
                  </div>

                  {["INTRO", "CC"].includes(activeGroup) ? (
                    <CountrySection
                      country={activeGroup === "INTRO" ? "Introdução" : "Especial"}
                      stickers={groupStickers}
                      markedSet={hasSet} onToggle={toggleSticker}
                    />
                  ) : (
                    countries.map(country => (
                      <CountrySection key={country} country={country}
                        stickers={groupStickers.filter(s => (s.country || "Introdução") === country)}
                        markedSet={hasSet} onToggle={toggleSticker}
                      />
                    ))
                  )}
                </>
              )}
            </div>
          )}

          {/* ABA MEU ÁLBUM */}
          {activeTab === "dashboard" && (
            <div className="fade-in">
              <Dashboard
                stickers={stickers}
                hasSet={hasSet}
                needsSet={needsSet}
                pastedSet={pastedSet}
                onPaste={togglePasted}
              />
            </div>
          )}

          {/* ABA TROCAS */}
          {activeTab === "trocas" && (
            <div className="fade-in">
              <MatchesPage session={session} stickers={stickers} />
            </div>
          )}

          {/* ABA PERFIL */}
          {activeTab === "perfil" && (
            <div className="fade-in">
              <ProfilePage
                session={session}
                hasCount={hasSet.size}
                needsCount={needsSet.size}
                totalStickers={stickers.length}
                pastedCount={pastedSet.size}
              />
            </div>
          )}

        </main>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
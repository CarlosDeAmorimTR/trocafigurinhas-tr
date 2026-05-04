import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const C = {
  green: "#1A4233", greenLight: "#2A5C47", orange: "#C84B1E",
  beige: "#F5E6D8", beigeDeep: "#EDD5BF", black: "#1A1A1A",
  white: "#FFFFFF", gray: "#6B7280", grayLight: "#F3F4F6",
};

const PVLogo = ({ size = 32 }) => {
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

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: C.white, borderRadius: "14px", padding: "18px 14px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: `1px solid ${C.beigeDeep}`,
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)"; }}
    >
      <span style={{ fontSize: "28px" }}>{icon}</span>
      <span style={{ fontSize: "26px", fontWeight: "800", color: color || C.green, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: "11px", color: C.gray, fontWeight: "500", textAlign: "center" }}>{label}</span>
    </div>
  );
}

function OfficeCalendar({ userId, readOnly = false }) {
  const [selectedDates, setSelectedDates] = useState([]);
  const [currentMonth, setCurrentMonth]   = useState(new Date());

  const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("office_dates")
      .select("date")
      .eq("user_id", userId)
      .ilike("date", `${monthKey}%`)
      .then(({ data }) => {
        if (data) setSelectedDates(data.map(r => r.date));
      });
  }, [userId, monthKey]);

  const toggleDate = async (dateStr) => {
    if (readOnly) return;
    if (selectedDates.includes(dateStr)) {
      await supabase.from("office_dates").delete()
        .eq("user_id", userId).eq("date", dateStr);
      setSelectedDates(prev => prev.filter(d => d !== dateStr));
    } else {
      await supabase.from("office_dates").upsert({ user_id: userId, date: dateStr });
      setSelectedDates(prev => [...prev, dateStr]);
    }
  };

  const getDaysInMonth = () => {
    const year  = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const first = new Date(year, month, 1).getDay();
    const total = new Date(year, month + 1, 0).getDate();
    return { first, total, year, month };
  };

  const { first, total, year, month } = getDaysInMonth();
  const today      = new Date().toISOString().slice(0, 10);
  const weekDays   = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  return (
    <div style={{ background: C.white, borderRadius: "14px", padding: "20px", border: `1px solid ${C.beigeDeep}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} style={{
          background: C.grayLight, border: "none", borderRadius: "8px",
          width: "32px", height: "32px", cursor: "pointer", fontSize: "14px",
        }}>◀</button>
        <span style={{ fontWeight: "700", fontSize: "15px", color: C.black }}>
          {monthNames[month]} {year}
        </span>
        <button onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} style={{
          background: C.grayLight, border: "none", borderRadius: "8px",
          width: "32px", height: "32px", cursor: "pointer", fontSize: "14px",
        }}>▶</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "6px" }}>
        {weekDays.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: "600", color: C.gray, padding: "4px 0" }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
        {Array.from({ length: first }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: total }, (_, i) => {
          const day        = i + 1;
          const dateStr    = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = selectedDates.includes(dateStr);
          const isToday    = dateStr === today;
          const isPast     = dateStr < today;
          const dayOfWeek  = new Date(year, month, day).getDay();
          const isWeekend  = dayOfWeek === 0 || dayOfWeek === 6;

          return (
            <button key={day}
              onClick={() => !isPast && !isWeekend && toggleDate(dateStr)}
              disabled={isPast || isWeekend}
              style={{
                padding: "8px 0", borderRadius: "8px", border: "none",
                fontSize: "13px", fontWeight: isSelected ? "700" : "500",
                background: isSelected
                  ? `linear-gradient(135deg, ${C.green}, ${C.greenLight})`
                  : isToday ? C.beigeDeep : "transparent",
                color: isSelected ? C.white : isPast || isWeekend ? "#D1D5DB" : C.black,
                cursor: isPast || isWeekend ? "default" : "pointer",
                outline: isToday && !isSelected ? `2px solid ${C.orange}` : "none",
                transition: "all 0.15s",
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {!readOnly && (
        <p style={{ fontSize: "12px", color: C.gray, marginTop: "12px", textAlign: "center" }}>
          Clique nos dias úteis para marcar quando estará no escritório
        </p>
      )}

      {selectedDates.length > 0 && (
        <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {selectedDates.sort().map(d => (
            <span key={d} style={{
              background: `${C.green}22`, color: C.green,
              borderRadius: "6px", padding: "3px 10px",
              fontSize: "12px", fontWeight: "600",
            }}>
              📅 {new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage({
  session,
  hasCount = 0,
  needsCount = 0,
  totalStickers = 0,
  pastedCount = 0,
}) {
  const [profile, setProfile] = useState({
    full_name: "", avatar_url: "",
    tr_area: "", tr_office: "", whatsapp: "", teams_email: "",
  });
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved]         = useState(false);
  const [form, setForm]           = useState({
    full_name: "", tr_area: "", tr_office: "", whatsapp: "", teams_email: "",
  });

  useEffect(() => {
    if (!session) return;
    supabase
      .from("users")
      .select("full_name, avatar_url, tr_area, tr_office, whatsapp, teams_email")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          setForm({
            full_name:   data.full_name   || "",
            tr_area:     data.tr_area     || "",
            tr_office:   data.tr_office   || "",
            whatsapp:    data.whatsapp    || "",
            teams_email: data.teams_email || session.user.email || "",
          });
        } else {
          setForm(f => ({ ...f, teams_email: session.user.email || "" }));
        }
      });
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("users").upsert({
      id:          session.user.id,
      full_name:   form.full_name,
      tr_area:     form.tr_area,
      tr_office:   form.tr_office,
      whatsapp:    form.whatsapp,
      teams_email: form.teams_email,
      updated_at:  new Date().toISOString(),
    });
    if (!error) {
      setProfile(prev => ({ ...prev, ...form }));
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext  = file.name.split(".").pop();
      const path = `${session.user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage
        .from("avatars").getPublicUrl(path);
      await supabase.from("users")
        .update({ avatar_url: publicUrl }).eq("id", session.user.id);
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (err) {
      alert("Erro no upload: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const completionPct = totalStickers > 0
    ? Math.round((pastedCount / totalStickers) * 100) : 0;

  const initials = profile.full_name
    ? profile.full_name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : session?.user?.email?.[0]?.toUpperCase() || "?";

  const teamsUrl    = profile.teams_email
    ? `https://teams.microsoft.com/l/chat/0/0?users=${profile.teams_email}` : null;
  const whatsappUrl = profile.whatsapp
    ? `https://wa.me/55${profile.whatsapp.replace(/\D/g, "")}` : null;

  return (
    <div style={{ maxWidth: "780px", margin: "0 auto" }} className="fade-in">

      {/* Card principal */}
      <div style={{
        background: C.white, borderRadius: "20px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        marginBottom: "20px", position: "relative",
      }}>

        {/* Banner verde */}
        <div style={{
          height: "130px",
          background: `linear-gradient(135deg, ${C.green} 0%, #0F2A1F 60%, #1A3A2A 100%)`,
          borderRadius: "20px 20px 0 0",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: "14px", right: "20px",
            display: "flex", alignItems: "center", gap: "8px", opacity: 0.4,
          }}>
            <PVLogo size={22} />
            <span style={{ color: C.white, fontSize: "12px", fontWeight: "600" }}>
              Praça Virtual
            </span>
          </div>
          <span style={{ position: "absolute", bottom: "10px", left: "160px", fontSize: "48px", opacity: 0.07 }}>⚽</span>
          <span style={{ position: "absolute", top: "16px", left: "45%", fontSize: "30px", opacity: 0.06 }}>🏆</span>
        </div>

        {/* Avatar */}
        <div style={{
          position: "absolute", top: "84px", left: "28px",
          width: "92px", height: "92px", borderRadius: "50%",
          border: `4px solid ${C.white}`, boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          overflow: "hidden", background: C.orange, zIndex: 10,
        }}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "30px", fontWeight: "800", color: C.white,
            }}>
              {uploading ? "⏳" : initials}
            </div>
          )}
          <label style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.50)", opacity: 0,
            cursor: "pointer", transition: "opacity 0.2s",
            fontSize: "22px", borderRadius: "50%",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0}
            title="Trocar foto"
          >
            📷
            <input type="file" accept="image/*"
              style={{ display: "none" }} onChange={handleAvatarUpload} />
          </label>
        </div>

        {/* Corpo */}
        <div style={{ padding: "64px 28px 28px" }}>

          <div style={{ marginBottom: "20px" }}>
            <h2 style={{
              fontSize: "22px", fontWeight: "800", color: C.black,
              fontFamily: "'Playfair Display', serif", marginBottom: "2px",
            }}>
              {profile.full_name || session?.user?.email?.split("@")[0] || "Sem nome"}
            </h2>
            <p style={{ color: C.gray, fontSize: "13px", marginBottom: "8px" }}>
              {session?.user?.email}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {profile.tr_area && (
                <span style={{
                  background: `${C.green}18`, color: C.green,
                  borderRadius: "20px", padding: "4px 12px",
                  fontSize: "12px", fontWeight: "600",
                }}>
                  🏢 {profile.tr_area}
                </span>
              )}
              {profile.tr_office && (
                <span style={{
                  background: `${C.orange}18`, color: C.orange,
                  borderRadius: "20px", padding: "4px 12px",
                  fontSize: "12px", fontWeight: "600",
                }}>
                  📍 {profile.tr_office}
                </span>
              )}
            </div>
          </div>

          {(teamsUrl || whatsappUrl) && (
            <div style={{
              display: "grid",
              gridTemplateColumns: teamsUrl && whatsappUrl ? "1fr 1fr" : "1fr",
              gap: "12px", marginBottom: "20px",
            }}>
              {teamsUrl && (
                <a href={teamsUrl} target="_blank" rel="noreferrer" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  padding: "12px 18px", borderRadius: "12px",
                  background: "#5059C9", color: C.white,
                  textDecoration: "none", fontWeight: "700", fontSize: "14px",
                  boxShadow: "0 3px 10px rgba(80,89,201,0.3)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(80,89,201,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 10px rgba(80,89,201,0.3)"; }}
                >
                  💬 Chamar no Teams
                </a>
              )}
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noreferrer" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  padding: "12px 18px", borderRadius: "12px",
                  background: "#25D366", color: C.white,
                  textDecoration: "none", fontWeight: "700", fontSize: "14px",
                  boxShadow: "0 3px 10px rgba(37,211,102,0.3)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(37,211,102,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 10px rgba(37,211,102,0.3)"; }}
                >
                  📱 WhatsApp
                </a>
              )}
            </div>
          )}

          <div style={{
            background: C.grayLight, borderRadius: "12px",
            padding: "14px 18px", marginBottom: "20px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: C.black }}>📖 Progresso do álbum</span>
              <span style={{ fontSize: "16px", fontWeight: "800", color: completionPct === 100 ? "#16A34A" : C.orange }}>
                {completionPct}%
              </span>
            </div>
            <div style={{ height: "8px", background: C.beigeDeep, borderRadius: "4px", overflow: "hidden" }}>
              <div style={{
                width: `${completionPct}%`, height: "100%",
                background: completionPct === 100
                  ? "linear-gradient(90deg,#16A34A,#4ADE80)"
                  : `linear-gradient(90deg,${C.green},${C.orange})`,
                transition: "width 0.8s ease",
              }} />
            </div>
            <p style={{ fontSize: "11px", color: C.gray, marginTop: "6px" }}>
              {pastedCount} de {totalStickers} figurinhas coladas
            </p>
          </div>

          {!editing ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <button onClick={() => setEditing(true)} style={{
                padding: "13px",
                background: `linear-gradient(135deg,${C.green},${C.greenLight})`,
                color: C.white, border: "none", borderRadius: "12px",
                fontWeight: "700", fontSize: "14px",
                boxShadow: "0 4px 12px rgba(26,66,51,0.2)",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                ✏️ Editar perfil
              </button>
              <button onClick={() => supabase.auth.signOut()} style={{
                padding: "13px", background: C.white, color: "#DC2626",
                border: "2px solid #FCA5A5", borderRadius: "12px",
                fontWeight: "700", fontSize: "14px", transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                🚪 Sair da conta
              </button>
            </div>
          ) : (
            <div className="fade-in" style={{ background: C.grayLight, borderRadius: "14px", padding: "20px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: C.black, marginBottom: "16px" }}>
                ✏️ Editar perfil
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: C.gray, display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Nome completo
                  </label>
                  <input type="text" value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    placeholder="Seu nome completo"
                    style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: `2px solid ${C.beigeDeep}`, fontSize: "14px", outline: "none", background: C.white }}
                    onFocus={e => e.target.style.borderColor = C.green}
                    onBlur={e => e.target.style.borderColor = C.beigeDeep}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: C.gray, display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Área na PV
                  </label>
                  <input type="text" value={form.tr_area}
                    onChange={e => setForm(f => ({ ...f, tr_area: e.target.value }))}
                    placeholder="Ex: Jurídico, Fiscal, TI..."
                    style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: `2px solid ${C.beigeDeep}`, fontSize: "14px", outline: "none", background: C.white }}
                    onFocus={e => e.target.style.borderColor = C.green}
                    onBlur={e => e.target.style.borderColor = C.beigeDeep}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: C.gray, display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Escritório / Cidade
                  </label>
                  <input type="text" value={form.tr_office}
                    onChange={e => setForm(f => ({ ...f, tr_office: e.target.value }))}
                    placeholder="Ex: São Paulo - Faria Lima"
                    style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: `2px solid ${C.beigeDeep}`, fontSize: "14px", outline: "none", background: C.white }}
                    onFocus={e => e.target.style.borderColor = C.green}
                    onBlur={e => e.target.style.borderColor = C.beigeDeep}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: C.gray, display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    E-mail Teams
                  </label>
                  <input type="email" value={form.teams_email}
                    onChange={e => setForm(f => ({ ...f, teams_email: e.target.value }))}
                    placeholder="seu@pracavirtual.com.br"
                    style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: `2px solid ${C.beigeDeep}`, fontSize: "14px", outline: "none", background: C.white }}
                    onFocus={e => e.target.style.borderColor = C.green}
                    onBlur={e => e.target.style.borderColor = C.beigeDeep}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: C.gray, display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    WhatsApp (só números)
                  </label>
                  <input type="tel" value={form.whatsapp}
                    onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                    placeholder="11999999999"
                    style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: `2px solid ${C.beigeDeep}`, fontSize: "14px", outline: "none", background: C.white }}
                    onFocus={e => e.target.style.borderColor = C.green}
                    onBlur={e => e.target.style.borderColor = C.beigeDeep}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "4px" }}>
                  <button onClick={handleSave} disabled={saving} style={{
                    padding: "12px",
                    background: saving ? C.gray : `linear-gradient(135deg,${C.green},${C.greenLight})`,
                    color: C.white, border: "none", borderRadius: "10px",
                    fontWeight: "700", fontSize: "14px",
                    boxShadow: "0 4px 12px rgba(26,66,51,0.25)",
                  }}>
                    {saving ? "⏳ Salvando..." : "✅ Salvar"}
                  </button>
                  <button onClick={() => setEditing(false)} style={{
                    padding: "12px", background: C.white, color: C.gray,
                    border: `2px solid ${C.beigeDeep}`, borderRadius: "10px",
                    fontWeight: "600", fontSize: "14px",
                  }}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {saved && (
            <div className="fade-in" style={{
              background: "#D1FAE5", border: "1px solid #6EE7B7",
              borderRadius: "10px", padding: "11px 16px",
              color: "#065F46", fontSize: "13px", fontWeight: "600", marginTop: "12px",
            }}>
              ✅ Perfil atualizado com sucesso!
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px", marginBottom: "20px",
      }}>
        <StatCard icon="✅" label="Repetidas"  value={hasCount}      color={C.green}  />
        <StatCard icon="❌" label="Faltam"      value={needsCount}    color={C.orange} />
        <StatCard icon="📖" label="Coladas"     value={pastedCount}   color="#2563EB"  />
        <StatCard icon="🎯" label="Total álbum" value={totalStickers} color={C.gray}   />
      </div>

      {/* Calendário */}
      <div style={{
        background: C.white, borderRadius: "20px", padding: "24px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)", marginBottom: "20px",
        border: `1px solid ${C.beigeDeep}`,
      }}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: C.black, marginBottom: "4px" }}>
          🏢 Dias no escritório
        </h3>
        <p style={{ fontSize: "13px", color: C.gray, marginBottom: "16px" }}>
          Marque os dias que você estará presencialmente. Quem quiser trocar figurinha com você verá essas datas.
        </p>
        <OfficeCalendar userId={session?.user?.id} readOnly={false} />
      </div>

      {/* Informações da conta */}
      <div style={{
        background: C.white, borderRadius: "16px", padding: "22px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: `1px solid ${C.beigeDeep}`,
      }}>
        <h3 style={{ fontSize: "14px", fontWeight: "700", color: C.black, marginBottom: "14px" }}>
          🔐 Informações da conta
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { label: "E-mail",       value: session?.user?.email },
            { label: "ID",           value: session?.user?.id?.slice(0, 20) + "..." },
            { label: "Membro desde", value: new Date(session?.user?.created_at).toLocaleDateString("pt-BR") },
            { label: "Último login", value: new Date(session?.user?.last_sign_in_at).toLocaleDateString("pt-BR") },
          ].map(({ label, value }) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 14px", background: C.grayLight, borderRadius: "8px",
            }}>
              <span style={{ fontSize: "12px", color: C.gray, fontWeight: "500" }}>{label}</span>
              <span style={{ fontSize: "12px", color: C.black, fontWeight: "600", fontFamily: "monospace" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
import { useState, useMemo } from "react";
import { COUNTRY_FLAGS, CATEGORY_LABELS } from "../data/countries";

const C = {
  green: "#1A4233", orange: "#C84B1E", beige: "#F5E6D8",
  beigeDeep: "#EDD5BF", black: "#1A1A1A", white: "#FFFFFF",
  gray: "#6B7280", grayLight: "#F3F4F6", success: "#16A34A",
};

const FILTERS = [
  { id: 'all',    label: '📚 Todas'    },
  { id: 'has',    label: '✅ Repetidas' },
  { id: 'needs',  label: '❌ Faltam'   },
  { id: 'pasted', label: '📌 Coladas'  },
];

export default function Dashboard({ stickers, hasSet, needsSet, pastedSet, onPaste }) {
  const [filter, setFilter]           = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [search, setSearch]           = useState('');

  const groups = ['all', ...new Set(stickers.map(s => s.group_code))];

  const filtered = useMemo(() => {
    let list = stickers;
    if (filter === 'has')    list = list.filter(s => hasSet.has(String(s.id)));
    if (filter === 'needs')  list = list.filter(s => needsSet.has(String(s.id)));
    if (filter === 'pasted') list = list.filter(s => pastedSet?.has(String(s.id)));
    if (groupFilter !== 'all') list = list.filter(s => s.group_code === groupFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        (s.label || '').toLowerCase().includes(q) ||
        (s.number || '').toLowerCase().includes(q) ||
        (s.country || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [stickers, filter, groupFilter, search, hasSet, needsSet, pastedSet]);

  const statsByCategory = useMemo(() => {
    const cats = {};
    stickers.forEach(s => {
      if (!cats[s.category]) cats[s.category] = { total: 0, has: 0, needs: 0 };
      cats[s.category].total++;
      if (hasSet.has(String(s.id)))   cats[s.category].has++;
      if (needsSet.has(String(s.id))) cats[s.category].needs++;
    });
    return cats;
  }, [stickers, hasSet, needsSet]);

  return (
    <div>
      {/* Stats por categoria */}
      <div style={{
        background: C.white, borderRadius: '16px', padding: '20px',
        marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        <h3 style={{ color: C.green, fontWeight: '700', fontSize: '16px', marginBottom: '14px' }}>
          📊 Por Categoria
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
          {Object.entries(statsByCategory).map(([cat, data]) => {
            const pct = data.total > 0 ? Math.round((data.has / data.total) * 100) : 0;
            return (
              <div key={cat} style={{ background: C.grayLight, borderRadius: '12px', padding: '12px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: C.black, marginBottom: '6px' }}>
                  {CATEGORY_LABELS[cat] || cat}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: C.success }}>✅ {data.has}</span>
                  <span style={{ fontSize: '12px', color: C.orange }}>❌ {data.needs}</span>
                  <span style={{ fontSize: '12px', color: C.gray }}>{pct}%</span>
                </div>
                <div style={{ background: C.beigeDeep, borderRadius: '4px', height: '4px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: C.green, borderRadius: '4px' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtros de status */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: '10px 16px', borderRadius: '10px', border: 'none',
            background: filter === f.id ? C.green : C.white,
            color: filter === f.id ? C.white : C.gray,
            fontWeight: filter === f.id ? '700' : '500',
            fontSize: '14px', cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)', transition: 'all 0.15s',
          }}>
            {f.label}
            <span style={{ marginLeft: '6px', fontSize: '12px', opacity: 0.8 }}>
              {f.id === 'all'    ? stickers.length :
               f.id === 'has'   ? hasSet.size :
               f.id === 'needs' ? needsSet.size :
               pastedSet?.size || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Busca + filtro de grupo */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text" placeholder="🔍 Buscar figurinha, país ou número..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: '200px', padding: '12px 16px',
            borderRadius: '10px', border: `2px solid ${C.beigeDeep}`,
            fontSize: '15px', outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = C.green}
          onBlur={e => e.target.style.borderColor = C.beigeDeep}
        />
        <select
          value={groupFilter} onChange={e => setGroupFilter(e.target.value)}
          style={{
            padding: '12px 16px', borderRadius: '10px', border: `2px solid ${C.beigeDeep}`,
            fontSize: '14px', background: C.white, outline: 'none', minWidth: '130px',
          }}
        >
          <option value="all">Todos os grupos</option>
          {groups.filter(g => g !== 'all').map(g => (
            <option key={g} value={g}>Grupo {g}</option>
          ))}
        </select>
      </div>

      <p style={{ color: C.gray, fontSize: '13px', marginBottom: '12px' }}>
        {filtered.length} figurinha(s) encontrada(s)
      </p>

      {/* Lista de figurinhas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
        {filtered.map(s => {
          const isHas    = hasSet.has(String(s.id));
          const isNeeds  = needsSet.has(String(s.id));
          const isPasted = pastedSet?.has(String(s.id));
          const cd       = COUNTRY_FLAGS[s.country] || { flag: '⚽', color: C.green };

          return (
            <div key={s.id} style={{
              background: C.white, borderRadius: '12px', padding: '14px',
              border: `2px solid ${isPasted ? C.success : isHas ? C.green : isNeeds ? C.orange : C.beigeDeep}`,
              display: 'flex', alignItems: 'center', gap: '12px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: '4px', background: cd.color,
              }} />
              <span style={{ fontSize: '24px', marginLeft: '4px' }}>{cd.flag}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: '700', fontSize: '13px', color: C.black }}>#{s.number}</p>
                <p style={{ fontSize: '12px', color: C.gray, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.country || s.label}
                </p>
                <p style={{ fontSize: '11px', color: C.gray }}>
                  {CATEGORY_LABELS[s.category]?.replace(/^[^\s]+\s/, '') || s.category}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0 }}>
                {isHas    && <span style={{ fontSize: '14px' }}>✅</span>}
                {isNeeds  && <span style={{ fontSize: '14px' }}>❌</span>}
                {isPasted && <span style={{ fontSize: '14px' }}>📌</span>}
                {s.is_metallic && <span style={{ fontSize: '12px' }}>⭐</span>}
              </div>
              <button
                onClick={() => onPaste?.(s)}
                title={isPasted ? 'Desmarcar colada' : 'Marcar como colada'}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  border: `2px solid ${isPasted ? C.success : C.beigeDeep}`,
                  background: isPasted ? '#D1FAE5' : C.grayLight,
                  fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                📌
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const C = {
  green: "#1A4233", greenLight: "#2A5C47", orange: "#C84B1E",
  beige: "#F5E6D8", beigeDeep: "#EDD5BF", black: "#1A1A1A",
  white: "#FFFFFF", gray: "#6B7280", grayLight: "#F3F4F6",
  success: "#16A34A", warning: "#D97706",
};

const STATUS_CONFIG = {
  pending:   { label: 'Aguardando', color: '#D97706', bg: '#FEF3C7', icon: '⏳' },
  accepted:  { label: 'Aceita',     color: '#16A34A', bg: '#D1FAE5', icon: '✅' },
  done:      { label: 'Concluída',  color: '#6B7280', bg: '#F3F4F6', icon: '🏆' },
  cancelled: { label: 'Cancelada',  color: '#DC2626', bg: '#FEE2E2', icon: '❌' },
};

function getStickerWeight(sticker) {
  if (!sticker) return 1;
  if (sticker.is_metallic) return 2;
  if (sticker.group_code === "INTRO" || sticker.group_code === "CC") return 2;
  return 1;
}

function calcTotalWeight(ids, stickersMap) {
  return ids.reduce((sum, id) => {
    const s = stickersMap[String(id)];
    return sum + getStickerWeight(s);
  }, 0);
}

function isFairTrade(iGive, iReceive, stickersMap) {
  if (!iGive?.length || !iReceive?.length) return false;
  const weightGive    = calcTotalWeight(iGive,    stickersMap);
  const weightReceive = calcTotalWeight(iReceive, stickersMap);
  return weightGive === weightReceive;
}

function MatchCard({ match, currentUserId, stickers, onPropose }) {
  const [expanded, setExpanded]   = useState(false);
  const [message, setMessage]     = useState('');
  const [proposing, setProposing] = useState(false);
  const [proposed, setProposed]   = useState(false);

  const stickersMap = Object.fromEntries(stickers.map(s => [String(s.id), s]));

  const getStickerLabel = (id) => {
    const s = stickersMap[String(id)];
    if (!s) return `#${id}`;
    const special = s.is_metallic || s.group_code === "INTRO" || s.group_code === "CC";
    return `#${s.number}${special ? ' ⭐' : ''} ${s.country || ''}`.trim();
  };

  const fair = isFairTrade(match.i_give, match.i_receive, stickersMap);

  const handlePropose = async () => {
    if (!fair) {
      alert('⚖️ Troca não é justa!\n\nRegras:\n• 1 especial (⭐) = 2 normais\n• N especiais = N especiais\n• N normais = N normais\n\nAjuste as quantidades para equilibrar a troca.');
      return;
    }
    setProposing(true);
    try {
      await supabase.from('trades').insert({
        user_a: currentUserId,
        user_b: match.partner_id,
        stickers_a_gives: match.i_give,
        stickers_b_gives: match.i_receive,
        message,
        status: 'pending',
      });
      setProposed(true);
      onPropose?.();
    } catch (err) {
      alert('Erro ao propor troca: ' + err.message);
    } finally {
      setProposing(false);
    }
  };

  const weightGive    = calcTotalWeight(match.i_give    || [], stickersMap);
  const weightReceive = calcTotalWeight(match.i_receive || [], stickersMap);

  return (
    <div style={{
      background: C.white, borderRadius: '16px', overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: '16px',
      border: `1px solid ${C.beigeDeep}`,
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '18px 20px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '16px',
          background: expanded ? C.grayLight : C.white, transition: 'background 0.15s',
        }}
      >
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${C.green}, ${C.greenLight})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: C.white, fontWeight: '800', fontSize: '20px',
        }}>
          {match.partner_name?.[0]?.toUpperCase() || '?'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontWeight: '700', fontSize: '16px', color: C.black, marginBottom: '2px' }}>
            {match.partner_name || 'Colega PV'}
          </h4>
          <p style={{ color: C.gray, fontSize: '13px' }}>
            {[match.partner_role, match.partner_city].filter(Boolean).join(' · ')}
          </p>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{
            background: C.green, color: C.white, borderRadius: '20px',
            padding: '6px 14px', fontWeight: '800', fontSize: '15px',
          }}>
            🔄 {match.score}
          </div>
          <p style={{ fontSize: '11px', color: C.gray, marginTop: '4px' }}>trocas possíveis</p>
        </div>
        <span style={{ color: C.gray, fontSize: '18px', marginLeft: '4px' }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {expanded && (
        <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${C.beigeDeep}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div style={{ background: '#F0FDF4', borderRadius: '12px', padding: '14px', border: '1px solid #BBF7D0' }}>
              <p style={{ fontWeight: '700', color: C.success, fontSize: '13px', marginBottom: '10px' }}>
                ✅ Você oferece ({match.i_give_count}) · Peso: {weightGive}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '140px', overflowY: 'auto' }}>
                {(match.i_give || []).map(id => (
                  <span key={id} style={{
                    background: C.white, border: '1px solid #BBF7D0', borderRadius: '6px',
                    padding: '4px 8px', fontSize: '12px', color: C.black,
                  }}>
                    {getStickerLabel(id)}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ background: '#FFF7ED', borderRadius: '12px', padding: '14px', border: '1px solid #FED7AA' }}>
              <p style={{ fontWeight: '700', color: C.orange, fontSize: '13px', marginBottom: '10px' }}>
                📥 Você recebe ({match.i_receive_count}) · Peso: {weightReceive}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '140px', overflowY: 'auto' }}>
                {(match.i_receive || []).map(id => (
                  <span key={id} style={{
                    background: C.white, border: '1px solid #FED7AA', borderRadius: '6px',
                    padding: '4px 8px', fontSize: '12px', color: C.black,
                  }}>
                    {getStickerLabel(id)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Indicador de equilíbrio */}
          <div style={{
            marginTop: '14px', padding: '10px 14px', borderRadius: '10px',
            background: fair ? '#D1FAE5' : '#FEF3C7',
            border: `1px solid ${fair ? '#6EE7B7' : '#FCD34D'}`,
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontSize: '16px' }}>{fair ? '⚖️✅' : '⚖️⚠️'}</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: fair ? '#065F46' : '#92400E' }}>
                {fair ? 'Troca equilibrada!' : 'Troca desequilibrada'}
              </p>
              <p style={{ fontSize: '12px', color: fair ? '#065F46' : '#92400E', marginTop: '2px' }}>
                {fair
                  ? `Peso igual dos dois lados (${weightGive} = ${weightReceive})`
                  : `Você oferece peso ${weightGive}, recebe peso ${weightReceive}. Regra: ⭐especial = 2 normais.`
                }
              </p>
            </div>
          </div>

          {!proposed ? (
            <div style={{ marginTop: '16px' }}>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Mensagem opcional... (ex: 'Posso trocar quinta no escritório!')"
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '10px',
                  border: `2px solid ${C.beigeDeep}`, fontSize: '14px',
                  resize: 'vertical', minHeight: '72px', outline: 'none', fontFamily: 'inherit',
                }}
              />
              <button
                onClick={handlePropose}
                disabled={proposing || !fair}
                style={{
                  width: '100%', marginTop: '10px', padding: '14px',
                  background: proposing ? C.gray : (!fair ? '#D1D5DB' : C.orange),
                  color: !fair ? '#9CA3AF' : C.white,
                  border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px',
                  cursor: proposing || !fair ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {proposing
                  ? '⏳ Enviando...'
                  : !fair
                    ? '⚖️ Equilibre a troca para propor'
                    : '🤝 Propor Troca'}
              </button>
            </div>
          ) : (
            <div style={{
              marginTop: '16px', background: '#D1FAE5', borderRadius: '12px',
              padding: '14px', textAlign: 'center', color: '#065F46', fontWeight: '600',
            }}>
              ✅ Proposta enviada! Aguarde o colega aceitar.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TradeCard({ trade, currentUserId, stickers, onRefresh }) {
  const isUserA        = trade.user_a === currentUserId;
  const partnerProfile = isUserA ? trade.user_b_profile : trade.user_a_profile;
  const myGives        = isUserA ? trade.stickers_a_gives : trade.stickers_b_gives;
  const iReceive       = isUserA ? trade.stickers_b_gives : trade.stickers_a_gives;
  const status         = STATUS_CONFIG[trade.status] || STATUS_CONFIG.pending;
  const [confirming, setConfirming] = useState(false);

  const getStickerLabel = (id) => {
    const s = stickers.find(s => s.id === id);
    return s ? `#${s.number}` : `#${id}`;
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await supabase.from('trades').update({
        status: 'done',
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', trade.id);

      if (trade.stickers_a_gives?.length > 0) {
        await supabase.from('user_has').delete()
          .eq('user_id', trade.user_a).in('sticker_id', trade.stickers_a_gives);
        await supabase.from('user_needs').delete()
          .eq('user_id', trade.user_b).in('sticker_id', trade.stickers_a_gives);
      }
      if (trade.stickers_b_gives?.length > 0) {
        await supabase.from('user_has').delete()
          .eq('user_id', trade.user_b).in('sticker_id', trade.stickers_b_gives);
        await supabase.from('user_needs').delete()
          .eq('user_id', trade.user_a).in('sticker_id', trade.stickers_b_gives);
      }

      if (trade.stickers_b_gives?.length > 0) {
        const rowsForA = trade.stickers_b_gives.map(id => ({
          user_id: trade.user_a, sticker_id: id, quantity: 1,
        }));
        await supabase.from('user_collection').upsert(rowsForA, { onConflict: 'user_id,sticker_id' });
      }
      if (trade.stickers_a_gives?.length > 0) {
        const rowsForB = trade.stickers_a_gives.map(id => ({
          user_id: trade.user_b, sticker_id: id, quantity: 1,
        }));
        await supabase.from('user_collection').upsert(rowsForB, { onConflict: 'user_id,sticker_id' });
      }

      onRefresh?.();
    } catch (err) {
      alert('Erro: ' + err.message);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div style={{
      background: C.white, borderRadius: '16px', padding: '18px 20px',
      marginBottom: '12px', border: `1px solid ${C.beigeDeep}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <h4 style={{ fontWeight: '700', fontSize: '15px', color: C.black }}>
            Com {partnerProfile?.full_name || 'Colega'}
          </h4>
          <p style={{ fontSize: '12px', color: C.gray, marginTop: '2px' }}>
            {new Date(trade.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <span style={{
          background: status.bg, color: status.color,
          borderRadius: '20px', padding: '5px 12px', fontSize: '12px', fontWeight: '700',
        }}>
          {status.icon} {status.label}
        </span>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <p style={{ fontSize: '13px', color: C.success, fontWeight: '600', marginBottom: '4px' }}>
          ✅ Você oferece: {myGives?.map(id => getStickerLabel(id)).join(', ') || '—'}
        </p>
        <p style={{ fontSize: '13px', color: C.orange, fontWeight: '600' }}>
          📥 Você recebe: {iReceive?.map(id => getStickerLabel(id)).join(', ') || '—'}
        </p>
      </div>

      {trade.message && (
        <p style={{
          fontSize: '13px', color: C.gray, fontStyle: 'italic',
          background: C.grayLight, padding: '8px 12px', borderRadius: '8px', marginBottom: '12px',
        }}>
          "{trade.message}"
        </p>
      )}

      {trade.status === 'pending' && !isUserA && (
        <button
          onClick={async () => {
            await supabase.from('trades').update({ status: 'accepted', updated_at: new Date().toISOString() }).eq('id', trade.id);
            onRefresh?.();
          }}
          style={{
            width: '100%', padding: '12px', background: C.success, color: C.white,
            border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
          }}
        >
          ✅ Aceitar Proposta
        </button>
      )}

      {trade.status === 'accepted' && (
        <button onClick={handleConfirm} disabled={confirming} style={{
          width: '100%', padding: '12px',
          background: confirming ? C.gray : C.orange, color: C.white,
          border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px',
          cursor: confirming ? 'default' : 'pointer',
        }}>
          {confirming ? '⏳ Processando...' : '🏆 Troca Realizada! Confirmar e atualizar inventário'}
        </button>
      )}
    </div>
  );
}

export default function MatchesPage({ session, stickers }) {
  const [tab, setTab]         = useState('matches');
  const [matches, setMatches] = useState([]);
  const [trades, setTrades]   = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [{ data: m }, { data: t }] = await Promise.all([
        supabase.rpc('get_matches', { p_user_id: session.user.id }),
        supabase.from('trades').select(`
          *,
          user_a_profile:users!trades_user_a_fkey(full_name, role, city),
          user_b_profile:users!trades_user_b_fkey(full_name, role, city)
        `)
        .or(`user_a.eq.${session.user.id},user_b.eq.${session.user.id}`)
        .order('created_at', { ascending: false }),
      ]);
      setMatches(m || []);
      setTrades(t || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { loadData(); }, [loadData]);

  const pendingCount = trades.filter(t => ['pending', 'accepted'].includes(t.status)).length;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{
        display: 'flex', background: C.white, borderRadius: '14px',
        padding: '4px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {[
          { id: 'matches', label: '🔍 Encontrar Trocas', count: matches.length },
          { id: 'trades',  label: '📋 Minhas Trocas',   count: pendingCount   },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
            background: tab === t.id ? C.green : 'transparent',
            color: tab === t.id ? C.white : C.gray,
            fontWeight: tab === t.id ? '700' : '500',
            fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {t.label}
            {t.count > 0 && (
              <span style={{
                marginLeft: '8px', background: C.orange, color: C.white,
                borderRadius: '12px', padding: '2px 8px', fontSize: '12px', fontWeight: '700',
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: C.gray }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⏳</div>
          <p>Calculando matches...</p>
        </div>
      ) : tab === 'matches' ? (
        matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: C.gray }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ color: C.green, marginBottom: '8px' }}>Nenhum match ainda</h3>
            <p>Marque suas figurinhas repetidas e as que precisa na aba "Coleção" para encontrar trocas!</p>
          </div>
        ) : (
          <>
            <p style={{ color: C.gray, fontSize: '14px', marginBottom: '16px' }}>
              {matches.length} colega(s) com trocas compatíveis
            </p>
            {matches.map(m => (
              <MatchCard key={m.partner_id} match={m} currentUserId={session.user.id} stickers={stickers} onPropose={loadData} />
            ))}
          </>
        )
      ) : (
        trades.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: C.gray }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ color: C.green, marginBottom: '8px' }}>Nenhuma troca ainda</h3>
            <p>Suas propostas de troca aparecerão aqui.</p>
          </div>
        ) : (
          trades.map(t => (
            <TradeCard key={t.id} trade={t} currentUserId={session.user.id} stickers={stickers} onRefresh={loadData} />
          ))
        )
      )}
    </div>
  );
}
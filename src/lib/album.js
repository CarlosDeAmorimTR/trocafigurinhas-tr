// Mapeamento completo do álbum Copa 2026
// 980 figurinhas oficiais + 14 Coca-Cola = 994 total

export const GROUPS = [
  { group: 'A', countries: [{ name: 'Canadá', flag: '🇨🇦', start: 21 }, { name: 'México', flag: '🇲🇽', start: 41 }, { name: 'EUA', flag: '🇺🇸', start: 61 }, { name: 'Honduras', flag: '🇭🇳', start: 81 }] },
  { group: 'B', countries: [{ name: 'Argentina', flag: '🇦🇷', start: 101 }, { name: 'Chile', flag: '🇨🇱', start: 121 }, { name: 'Peru', flag: '🇵🇪', start: 141 }, { name: 'Austrália', flag: '🇦🇺', start: 161 }] },
  { group: 'C', countries: [{ name: 'Espanha', flag: '🇪🇸', start: 181 }, { name: 'Alemanha', flag: '🇩🇪', start: 201 }, { name: 'Japão', flag: '🇯🇵', start: 221 }, { name: 'Marrocos', flag: '🇲🇦', start: 241 }] },
  { group: 'D', countries: [{ name: 'França', flag: '🇫🇷', start: 261 }, { name: 'Inglaterra', flag: '🏴', start: 281 }, { name: 'Portugal', flag: '🇵🇹', start: 301 }, { name: 'Senegal', flag: '🇸🇳', start: 321 }] },
  { group: 'E', countries: [{ name: 'Bélgica', flag: '🇧🇪', start: 341 }, { name: 'Holanda', flag: '🇳🇱', start: 361 }, { name: 'Croácia', flag: '🇭🇷', start: 381 }, { name: 'Polônia', flag: '🇵🇱', start: 401 }] },
  { group: 'F', countries: [{ name: 'Colômbia', flag: '🇨🇴', start: 421 }, { name: 'Equador', flag: '🇪🇨', start: 441 }, { name: 'Venezuela', flag: '🇻🇪', start: 461 }, { name: 'Costa Rica', flag: '🇨🇷', start: 481 }] },
  { group: 'G', countries: [{ name: 'Brasil', flag: '🇧🇷', start: 501 }, { name: 'Uruguai', flag: '🇺🇾', start: 521 }, { name: 'Paraguai', flag: '🇵🇾', start: 541 }, { name: 'Bolívia', flag: '🇧🇴', start: 561 }] },
  { group: 'H', countries: [{ name: 'Itália', flag: '🇮🇹', start: 581 }, { name: 'Suíça', flag: '🇨🇭', start: 601 }, { name: 'Áustria', flag: '🇦🇹', start: 621 }, { name: 'Sérvia', flag: '🇷🇸', start: 641 }] },
  { group: 'I', countries: [{ name: 'Nigéria', flag: '🇳🇬', start: 661 }, { name: 'Costa do Marfim', flag: '🇨🇮', start: 681 }, { name: 'Egito', flag: '🇪🇬', start: 701 }, { name: 'África do Sul', flag: '🇿🇦', start: 721 }] },
  { group: 'J', countries: [{ name: 'Coreia do Sul', flag: '🇰🇷', start: 741 }, { name: 'Irã', flag: '🇮🇷', start: 761 }, { name: 'Arábia Saudita', flag: '🇸🇦', start: 781 }, { name: 'Indonésia', flag: '🇮🇩', start: 801 }] },
  { group: 'K', countries: [{ name: 'Qatar', flag: '🇶🇦', start: 821 }, { name: 'Nova Zelândia', flag: '🇳🇿', start: 841 }, { name: 'Uzbequistão', flag: '🇺🇿', start: 861 }, { name: 'Panamá', flag: '🇵🇦', start: 881 }] },
  { group: 'L', countries: [{ name: 'Dinamarca', flag: '🇩🇰', start: 901 }, { name: 'Suécia', flag: '🇸🇪', start: 921 }, { name: 'Ucrânia', flag: '🇺🇦', start: 941 }, { name: 'Eslováquia', flag: '🇸🇰', start: 961 }] },
]

export const OFFSETS = [
  { o: 0, lb: 'Escudo', cat: 'metal', metal: true },
  { o: 1, lb: 'Foto Time', cat: 'time', metal: false },
  { o: 2, lb: 'Goleiro 1', cat: 'goleiro', metal: false },
  { o: 3, lb: 'Goleiro 2', cat: 'goleiro', metal: false },
  { o: 4, lb: 'Defensor 1', cat: 'defesa', metal: false },
  { o: 5, lb: 'Defensor 2', cat: 'defesa', metal: false },
  { o: 6, lb: 'Defensor 3', cat: 'defesa', metal: false },
  { o: 7, lb: 'Defensor 4', cat: 'defesa', metal: false },
  { o: 8, lb: 'Defensor 5', cat: 'defesa', metal: false },
  { o: 9, lb: 'Meio 1', cat: 'meio', metal: false },
  { o: 10, lb: 'Meio 2', cat: 'meio', metal: false },
  { o: 11, lb: 'Meio 3', cat: 'meio', metal: false },
  { o: 12, lb: 'Meio 4', cat: 'meio', metal: false },
  { o: 13, lb: 'Meio 5', cat: 'meio', metal: false },
  { o: 14, lb: 'Atacante 1', cat: 'ataque', metal: false },
  { o: 15, lb: 'Atacante 2', cat: 'ataque', metal: false },
  { o: 16, lb: 'Atacante 3', cat: 'ataque', metal: false },
  { o: 17, lb: 'Atacante 4', cat: 'ataque', metal: false },
  { o: 18, lb: 'Atacante 5', cat: 'ataque', metal: false },
  { o: 19, lb: 'Atacante 6', cat: 'ataque', metal: false },
]

const INTRO = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1), num: i + 1, group: 'INTRO', country: '',
  flag: i < 2 ? '🏆' : i === 2 ? '🦁' : i === 3 ? '🏆' : i === 4 ? '⚽' : '🏟',
  lb: i === 0 ? 'Emblema Copa (parte 1)' : i === 1 ? 'Emblema Copa (parte 2)' : i === 2 ? 'Mascote Oficial' : i === 3 ? 'Troféu FIFA' : i === 4 ? 'Bola Oficial' : `Estádio/Sede ${i - 4}`,
  cat: i < 2 || i === 3 ? 'metal' : i === 4 || i === 2 ? 'especial' : 'sede',
  metal: i < 2 || i === 3,
}))

const SELECOES = GROUPS.flatMap(({ group, countries }) =>
  countries.flatMap(({ name, flag, start }) =>
    OFFSETS.map(({ o, lb, cat, metal }) => ({
      id: String(start + o), num: start + o, group, country: name, flag,
      lb: o === 0 ? `${name} - Escudo ★` : o === 1 ? `${name} - Foto Time` : `${name} - ${lb}`,
      cat, metal,
    }))
  )
)

const COCACOLA = Array.from({ length: 14 }, (_, i) => ({
  id: `cc-${i + 1}`, num: `CC${i + 1}`, group: 'CC', country: 'Extra',
  flag: '🥤', lb: `Coca-Cola #${i + 1}`, cat: 'especial', metal: false,
}))

export const ALL_STICKERS = [...INTRO, ...SELECOES, ...COCACOLA]

export const catColors = {
  metal: '#C84B1E', goleiro: '#2471a3', defesa: '#1e8449',
  meio: '#7d3c98', ataque: '#C84B1E', time: '#1A4233',
  sede: '#1A4233', especial: '#C84B1E',
}

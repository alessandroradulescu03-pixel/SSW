/* ======== SSW · riconoscimento colori ========
   Usato sia da index.html (sito) che da admin.html (pannello di Andrea).
   Capisce:
   - quasi tutti i nomi di colore italiani usati nell'abbigliamento (beige, tortora, carta da zucchero, verde salvia…)
   - maiuscole/minuscole, accenti, plurali e femminili (rossa, verdi, grigie…)
   - errori di battitura leggeri (beije, bordeau, marone, turcese…)
   - sfumature: chiaro, scuro, pastello, fluo, acceso, spento, polvere, melange, ghiaccio…
   - nomi inglesi (navy, sand, light blue…) e codici tipo #ff1fa9
   Per aggiungere un colore: una riga in BASE, nome tutto minuscolo e senza accenti. */
(function () {
  const BASE = {
    // neri, bianchi, grigi
    'nero':'#000000','nero carbone':'#1c1c1c','carbone':'#2b2b2b','nero opaco':'#161616','bianco':'#ffffff','bianco ottico':'#ffffff',
    'bianco latte':'#fafaf5','latte':'#fafaf5','bianco sporco':'#efebe1','off white':'#f8f6f0','offwhite':'#f8f6f0','neve':'#fffafa',
    'grigio':'#8a8a8a','grigio chiaro':'#c9c9c9','grigio scuro':'#4a4a4a','grigio perla':'#d0d0cc','perla':'#e6e2d8','grigio ghiaccio':'#dfe4e8',
    'ghiaccio':'#e3edf2','grigio topo':'#6e6a65','grigio fumo':'#737373','fumo':'#737373','grigio cenere':'#b2beb5','cenere':'#b2beb5',
    'grigio piombo':'#5a5f63','piombo':'#5a5f63','grigio ardesia':'#5d6670','ardesia':'#5d6670','antracite':'#383e42','grafite':'#41424c',
    'acciaio':'#7b8a95','grigio acciaio':'#7b8a95','cemento':'#9c9c94','grigio melange':'#a9a9a9','melange':'#a9a9a9','argento':'#c0c0c0',
    'argentato':'#c0c0c0','silver':'#c0c0c0','titanio':'#878681','canna di fucile':'#2c3539','asfalto':'#3b3b3b',
    // beige, panna, marroni
    'beige':'#e3d3b5','sabbia':'#d8c39a','duna':'#d6c3a0','crema':'#f3ead3','panna':'#f6f0e1','avorio':'#fffff0','ecru':'#e9dcc3',
    'naturale':'#ede4d3','lino':'#e8dfcf','burro':'#f5e6b8','vaniglia':'#f3e5ab','champagne':'#f1e2c3','biscotto':'#d9b88f','biscuit':'#d9b88f',
    'cappuccino':'#b5947a','caffelatte':'#c3a07e','cammello':'#c19a6b','camel':'#c19a6b','tabacco':'#7d5a3c','cognac':'#9a463d','cuoio':'#8b5a2b',
    'caramello':'#c68e3f','miele':'#d9a441','nocciola':'#a67b5b','noce':'#5d432c','castagna':'#6f4e37','castano':'#6f4e37','marrone':'#6b4226',
    'marrone chiaro':'#a47551','marrone scuro':'#3f2617','testa di moro':'#3b2a20','cioccolato':'#4e2a1e','moka':'#5b3a29','caffe':'#4b3621',
    'tortora':'#a89a8a','talpa':'#7c6e65','fango':'#70604f','corda':'#c8b593','kaki':'#b9a77a','khaki':'#b9a77a','cachi':'#b9a77a',
    'terra':'#8b6c4f','terra di siena':'#a0522d','siena':'#a0522d','terracotta':'#c4623d','mattone':'#a0432a','ruggine':'#b7410e',
    'rame':'#b87333','bronzo':'#cd7f32','oro':'#d4af37','dorato':'#d4af37','ottone':'#b5a642',
    // rossi, rosa
    'rosso':'#d62828','rosso fuoco':'#e3170a','rosso ferrari':'#d40000','ferrari':'#d40000','rosso corsa':'#d40000','rosso ciliegia':'#b5122e',
    'ciliegia':'#b5122e','rosso mattone':'#a0432a','rosso pomodoro':'#e03c28','scarlatto':'#ff2400','cremisi':'#b0102b','carminio':'#960018',
    'porpora':'#8e1c3b','rubino':'#9b111e','granata':'#7b1e2b','amaranto':'#9f2b68','bordeaux':'#6d1a2a','bordo':'#6d1a2a','borgogna':'#800020',
    'vinaccia':'#5e1224','vino':'#5e1224','marsala':'#964f4c','lampone':'#c3215b','fragola':'#e34262',
    'rosa':'#f4a6c0','rosa chiaro':'#f9cfdc','rosa antico':'#c08081','rosa cipria':'#efc6c3','cipria':'#efc6c3','rosa confetto':'#f7c6d3',
    'confetto':'#f7c6d3','rosa baby':'#f4c2c2','rosa shocking':'#fc0fc0','shocking':'#fc0fc0','rosa fluo':'#ff3ea5','rosa barbie':'#e0218a',
    'barbie':'#e0218a','rosa quarzo':'#f2c4c8','quarzo':'#f2c4c8','malva':'#c08ba6','fucsia':'#ff1aa8','fucsia fluo':'#ff1aa8',
    'magenta':'#d0006f','ciclamino':'#d8508f','corallo':'#ff7f6e','salmone':'#fa8072','pesca':'#ffcba4','albicocca':'#fbceb1','nude':'#e3bc9a',
    'carne':'#e8c4a8','phard':'#e8a5a5','blush':'#e8a5a5',
    // arancioni, gialli
    'arancione':'#f28c28','arancio':'#f28c28','arancione fluo':'#ff6f00','mandarino':'#f37a23','zucca':'#e1761b','papaya':'#ff9a5c',
    'giallo':'#f5d000','giallo fluo':'#e6ff00','giallo limone':'#f7e83a','limone':'#f7e83a','giallo canarino':'#ffef00','canarino':'#ffef00',
    'giallo sole':'#ffcc1a','girasole':'#ffc512','giallo pastello':'#fdf1a6','mais':'#fbec5d','zafferano':'#f4c430','senape':'#d4a017',
    'ocra':'#cc7722','ambra':'#ffbf00','paglia':'#e4d96f',
    // verdi
    'verde':'#2e9e44','verde chiaro':'#90d26d','verde scuro':'#1e4d2b','verde militare':'#4b5320','militare':'#4b5320','verde oliva':'#6b6e2e',
    'oliva':'#6b6e2e','verde bosco':'#228b22','bosco':'#228b22','verde bottiglia':'#0b5d1e','bottiglia':'#0b5d1e','verde foresta':'#1f4d2b',
    'verde inglese':'#1b4d3e','verde smeraldo':'#009b77','smeraldo':'#009b77','verde prato':'#4caf50','verde mela':'#8db600','mela':'#8db600',
    'verde pisello':'#94b44a','pistacchio':'#a8c97f','verde pistacchio':'#a8c97f','verde salvia':'#9caf88','salvia':'#9caf88','verde menta':'#98e0c0',
    'menta':'#98e0c0','verde acqua':'#5fd3c4','acquamarina':'#7fffd4','verde petrolio':'#1d5e5a','verde lime':'#9acd32','lime':'#9acd32',
    'verde fluo':'#39ff14','verde acido':'#b0bf1a','acido':'#b0bf1a','verde muschio':'#5b6b3a','muschio':'#5b6b3a','verde kaki':'#7d7a4c',
    'verde mimetico':'#5a6340','mimetico':'#5a6340','camouflage':'#5a6340','camo':'#5a6340','verde jade':'#00a86b','giada':'#00a86b',
    'verde ottanio':'#00646e','ottanio':'#00646e','verde abete':'#2f4f3a','abete':'#2f4f3a','verde felce':'#4f7942','felce':'#4f7942',
    'verde oliva scuro':'#4b4d22','alpino':'#3d5a3a',
    // azzurri, blu
    'blu':'#1f4fd1','blu chiaro':'#5b86e5','blu scuro':'#14275c','blu navy':'#1b2a4a','navy':'#1b2a4a','blu marina':'#1b2a4a','marina':'#1b2a4a',
    'blu notte':'#14213d','notte':'#14213d','blu elettrico':'#2c75ff','elettrico':'#2c75ff','blu royal':'#2a4bd7','royal':'#2a4bd7',
    'blu cobalto':'#0047ab','cobalto':'#0047ab','blu oltremare':'#3f00ff','oltremare':'#3f3fbf','blu zaffiro':'#0f52ba','zaffiro':'#0f52ba',
    'blu indaco':'#3f4a8a','indaco':'#3f4a8a','blu denim':'#3b5b92','denim':'#3b5b92','jeans':'#3b5b92','blu jeans':'#3b5b92',
    'blu petrolio':'#1f5f6b','petrolio':'#1f5f6b','blu avio':'#5d8aa8','avio':'#5d8aa8','blu polvere':'#9fb6cd','carta da zucchero':'#a7c7e7',
    'azzurro':'#6cb4ee','azzurro cielo':'#87ceeb','cielo':'#87ceeb','celeste':'#9fd3f0','azzurro polvere':'#b0c4de','baby blue':'#a1caf1',
    'turchese':'#2bb5b5','tiffany':'#81d8d0','ciano':'#00b7eb','acqua':'#7fd6e0','ottanio blu':'#00646e','blu cina':'#3c5aa6','pervinca':'#8c9fe6',
    'fiordaliso':'#6495ed','blu acciaio':'#4682b4','blu ghiaccio':'#c8e1f0','teal':'#127c7c',
    // viola
    'viola':'#7b3fb0','viola chiaro':'#b18fd6','viola scuro':'#4b1f6f','lilla':'#c8a2d8','lavanda':'#b9a6e0','glicine':'#c9a0dc',
    'orchidea':'#da70d6','ametista':'#9966cc','prugna':'#5e2750','melanzana':'#3d0c45','vinaccia viola':'#4f1f3a','mirtillo':'#4f3a6e',
    'uva':'#5b2c6f','porpora viola':'#69359c','lilla polvere':'#c9b6cf',
    // nomi inglesi frequenti
    'black':'#000000','white':'#ffffff','grey':'#8a8a8a','gray':'#8a8a8a','light grey':'#c9c9c9','light gray':'#c9c9c9','dark grey':'#4a4a4a',
    'dark gray':'#4a4a4a','heather grey':'#a9a9a9','charcoal':'#36454f','cream':'#f3ead3','sand':'#d8c39a','stone':'#bdb3a3','taupe':'#7c6e65',
    'brown':'#6b4226','chocolate':'#4e2a1e','red':'#d62828','burgundy':'#800020','wine':'#5e1224','pink':'#f4a6c0','baby pink':'#f4c2c2',
    'light pink':'#f9cfdc','hot pink':'#ff1aa8','dusty pink':'#d8a7b1','orange':'#f28c28','yellow':'#f5d000','green':'#2e9e44',
    'dark green':'#1e4d2b','forest green':'#228b22','olive':'#6b6e2e','army green':'#4b5320','sage':'#9caf88','mint':'#98e0c0','blue':'#1f4fd1',
    'light blue':'#6cb4ee','sky blue':'#87ceeb','dark blue':'#14275c','royal blue':'#2a4bd7','navy blue':'#1b2a4a','purple':'#7b3fb0',
    'lilac':'#c8a2d8','lavender':'#b9a6e0','gold':'#d4af37'
  };
  // sfumature: [colore con cui mescolare, quanto]
  const MOD = {
    chiaro:['#ffffff',.38], pastello:['#ffffff',.55], baby:['#ffffff',.5], tenue:['#ffffff',.4], polvere:['#b8b0aa',.35], cipria:['#ffffff',.45],
    scuro:['#000000',.38], profondo:['#000000',.3], intenso:['#000000',.15], notte:['#000000',.45],
    spento:['#8a8a8a',.35], slavato:['#c8c8c8',.4], melange:['#a9a9a9',.3], vintage:['#a89a8a',.25], sbiadito:['#c8c8c8',.4], ghiaccio:['#e8f0f4',.5],
    light:['#ffffff',.38], dark:['#000000',.38], dusty:['#b8b0aa',.35], washed:['#c8c8c8',.4], pale:['#ffffff',.5]
  };
  const SAT = { fluo:1, fluorescente:1, neon:1, acceso:.85, vivo:.85, brillante:.85, bright:.85 };
  const STOP = new Set(['e','ed','con','di','del','della','a','in','tinta','tono','colore','color','and','with','unita','unito','effetto']);

  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/['’]/g, ' ').replace(/[\/,;+&_\-.]/g, ' ').replace(/[^a-z0-9# ]/g, '').replace(/\s+/g, ' ').trim();
  // plurali e femminili: rossa/rossi/rosse → rosso, verdi → verde, grigie → grigio, bianche → bianco
  function forms(w) {
    const f = new Set([w]);
    if (/ch[ei]$/.test(w)) f.add(w.replace(/ch[ei]$/, 'co'));
    if (/gh[ei]$/.test(w)) f.add(w.replace(/gh[ei]$/, 'go'));
    if (/gi[ei]?$/.test(w)) f.add(w.replace(/gi[ei]?$/, 'gio'));
    if (/[aeio]$/.test(w) && w.length > 3) { const b = w.slice(0, -1); f.add(b + 'o'); f.add(b + 'e'); f.add(b + 'a'); }
    return [...f];
  }
  const KEYS = Object.keys(BASE);
  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i]; let best = i;
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (cur[j] < best) best = cur[j];
      }
      if (best > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }
  // cerca una frase (una o più parole) nel dizionario: esatta, poi con plurali/femminili, poi con errori di battitura
  function find(words, fuzzy) {
    const exact = words.join(' ');
    if (BASE[exact]) return BASE[exact];
    if (words.length === 1 || words.length === 2) {
      const combos = words.length === 1 ? forms(words[0]) : forms(words[0]).flatMap(a => forms(words[1]).map(b => a + ' ' + b));
      for (const c of combos) if (BASE[c]) return BASE[c];
    }
    if (!fuzzy) return null;
    const max = exact.replace(/ /g, '').length <= 4 ? 0 : exact.length <= 7 ? 1 : 2;
    if (!max) return null;
    let best = null, bd = max + 1;
    for (const k of KEYS) { const d = lev(exact, k, max); if (d < bd) { bd = d; best = k; } }
    return best ? BASE[best] : null;
  }
  const rgb = h => { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
  const hex = a => '#' + a.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return hex(x.map((v, i) => v + (y[i] - v) * t)); };
  function saturate(h, k) {
    let [r, g, b] = rgb(h).map(v => v / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return h;
    const tgt = [r, g, b].map(v => (v - mn) / (mx - mn));             // tinta pura
    const L = k >= 1 ? .55 : l;
    return hex(tgt.map(v => (L + (v - .5) * Math.min(1, k + .3)) * 255));
  }
  function colHex(name) {
    const raw = String(name || '').trim();
    if (!raw) return null;
    const n = norm(raw);
    if (!n) return null;
    if (BASE[n]) return BASE[n];
    // codici (#ff00aa, rgb(...)) e nomi inglesi senza spazi (lightblue…): li capisce il browser
    const css = /^#|^rgb|^hsl/i.test(raw) ? raw : n.replace(/ /g, '');
    if (window.CSS && CSS.supports && CSS.supports('color', css) && !/^(inherit|initial|unset|revert|currentcolor|transparent)$/i.test(css)) return css;
    let words = n.split(' ').filter(w => !STOP.has(w));
    const mods = [], sats = [];
    words = words.filter(w => {
      const m = forms(w).find(f => MOD[f] || SAT[f]);
      if (!m) return true;
      // "chiaro"/"scuro" fanno parte di alcuni nomi (verde chiaro…): li tengo, se il nome intero esiste lo trova prima
      (MOD[m] ? mods : sats).push(m); return false;
    });
    const all = n.split(' ').filter(w => !STOP.has(w));
    let c = find(all, false);                                   // "verde chiaro", "blu notte" così come sono
    if (c) return c;
    if (!words.length) return null;                             // solo "chiaro" o "fluo": nessun colore di base
    c = find(words, false);
    // coppie di parole ("carta da zucchero" → "carta zucchero" non serve: cerco anche le terne)
    for (let len = Math.min(3, words.length); !c && len >= 1; len--)
      for (let i = 0; i + len <= words.length && !c; i++) c = find(words.slice(i, i + len), false);
    for (let len = Math.min(3, words.length); !c && len >= 1; len--)
      for (let i = 0; i + len <= words.length && !c; i++) c = find(words.slice(i, i + len), true);
    if (!c) return null;
    mods.forEach(m => { c = mix(c, MOD[m][0], MOD[m][1]); });
    sats.forEach(s => { c = saturate(c, SAT[s]); });
    return c;
  }
  window.COL_HEX = BASE;
  window.colHex = colHex;
})();

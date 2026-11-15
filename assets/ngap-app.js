/* Interface du calculateur de cotation NGAP — données gardées sur l'appareil (localStorage). */
(function () {
  'use strict';
  var N = window.NGAP, KEY = 'ngapCalcV1';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var today = (function () { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); })();
  var QUICK = ['pdv', 'imsc', 'dsurv', 'dinsu', 'ppnc', 'ppcs', 'plescarre', 'plcompress', 'vacc', 'vaccpres', 'adm', 'prado', 'perfc', 'perfl'];

  var uid = Date.now();
  var S = load() || { passages: [], pctH: '', pctD: '', recu: '' };
  if (!S.passages || !S.passages.length) S.passages = [nouveau()];
  S.passages.forEach(function (p) { p.id = 'p' + (++uid); });

  function nouveau(prev) {
    return { id: 'p' + (++uid), nom: '', date: prev ? prev.date : today, acts: [], horaire: 'jour', dim: prev ? prev.dim : false, enfant: false, pallia: false, mir: false, domicile: true, bsi: '', forfait: true, di: 0, hk: false, km: '', mont: false };
  }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S, function (k, v) { return k === '_r' ? undefined : v; })); } catch (e) {} }
  function num(v) { var x = parseFloat(String(v).replace(',', '.')); return isNaN(x) ? 0 : x; }
  function jour(d) { if (!d) return ''; var p = d.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function estDimanche(d) { return d && new Date(d + 'T12:00:00').getDay() === 0; }

  /* ---------- Catalogue (liste déroulante filtrable) ---------- */
  function catalogue(q) {
    q = (q || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    var html = '';
    N.CATS.forEach(function (c) {
      var list = Object.keys(N.ACTS).map(function (k) { return N.ACTS[k]; }).filter(function (a) {
        if (a.c !== c[0]) return false;
        if (!q) return true;
        var t = (a.l + ' ' + c[1] + ' ' + N.fk(a.k)).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        return q.split(/\s+/).every(function (w) { return t.indexOf(w) > -1; });
      });
      if (!list.length) return;
      html += '<div class="nc-cat">' + esc(c[1]) + '</div>';
      list.forEach(function (a) {
        var k = a.g === 'cia' ? '20 €' : a.g === 'tls' ? '10 €' : a.g === 'tld' ? '15 €' : 'AMI ' + N.fk(a.k);
        html += '<button type="button" class="nc-opt" data-add="' + a.id + '"><span>' + esc(a.l) + '</span><b>' + k + '</b></button>';
      });
    });
    return html || '<p class="nc-empty">Aucun soin ne correspond. Essayez un autre mot (pansement, sonde, perfusion…).</p>';
  }

  /* ---------- Rendu d'un passage ---------- */
  function carte(p, i) {
    var r = N.passage(calcInput(p));
    p._r = r;
    var acts = p.acts.map(function (a) {
      var d = N.ACTS[a.id];
      return '<li><span>' + esc(d.l) + '</span><span class="nc-qty"><button type="button" data-dec="' + a.id + '" aria-label="Retirer un">−</button><b>' + a.n + '</b><button type="button" data-inc="' + a.id + '" aria-label="Ajouter un">+</button></span></li>';
    }).join('');
    var quick = QUICK.map(function (id) { var d = N.ACTS[id]; return '<button type="button" class="nc-chip" data-add="' + id + '">' + esc(court(d)) + '</button>'; }).join('');
    var det = r.lines.map(function (l) {
      return '<tr' + (l.amount === 0 ? ' class="nc-free"' : '') + '><td><b>' + esc(l.code || '—') + '</b><small>' + esc(l.label) + (l.info ? ' · ' + esc(l.info) : '') + '</small></td><td>' + N.eur(l.amount) + '</td></tr>';
    }).join('');
    var msgs = r.warns.map(function (w) { return '<p class="nc-warn">' + esc(w) + '</p>'; }).join('') + r.notes.map(function (w) { return '<p class="nc-note">' + esc(w) + '</p>'; }).join('');
    var dimAuto = estDimanche(p.date) && !p.dim ? '<p class="nc-note">Ce jour est un dimanche : cochez « Dimanche ou férié » si le soin le justifie (prescription quotidienne ou urgence).</p>' : '';
    return '' +
      '<article class="nc-card" data-id="' + p.id + '">' +
      '<header class="nc-head"><span class="nc-num">' + (i + 1) + '</span>' +
      '<input class="nc-nom" data-f="nom" value="' + esc(p.nom) + '" placeholder="Repère (ex. Mme D., matin)" aria-label="Repère du passage" maxlength="40">' +
      '<input type="date" data-f="date" value="' + esc(p.date) + '" aria-label="Date du soin" min="2026-06-21">' +
      '<button type="button" class="nc-icon" data-dup title="Dupliquer ce passage" aria-label="Dupliquer ce passage">⧉</button>' +
      '<button type="button" class="nc-icon" data-del title="Supprimer ce passage" aria-label="Supprimer ce passage">✕</button></header>' +
      '<div class="nc-opts">' +
      '<label class="nc-sel"><span>Horaire</span><select data-f="horaire"><option value="jour"' + sel(p.horaire, 'jour') + '>Journée (8 h-20 h)</option><option value="nuit"' + sel(p.horaire, 'nuit') + '>Nuit 20 h-23 h ou 5 h-8 h</option><option value="nuitp"' + sel(p.horaire, 'nuitp') + '>Nuit 23 h-5 h</option></select></label>' +
      '<label class="nc-sel"><span>Patient dépendant (BSI)</span><select data-f="bsi"><option value="">Non</option><option value="BSA"' + sel(p.bsi, 'BSA') + '>BSA (13 €)</option><option value="BSB"' + sel(p.bsi, 'BSB') + '>BSB (18,20 €)</option><option value="BSC"' + sel(p.bsi, 'BSC') + '>BSC (28,70 €)</option></select></label>' +
      tog('dim', 'Dimanche ou férié', p.dim) +
      '</div>' +
      '<details class="nc-xopts"' + ((p.enfant || p.pallia || p.mir || !p.domicile || p.hk) ? ' open' : '') + '><summary>Autres situations : enfant, soins palliatifs, SAS, IK' + xcount(p) + '</summary><div class="nc-opts">' +
      tog('enfant', 'Enfant de moins de 7 ans', p.enfant) + tog('pallia', 'Soins palliatifs', p.pallia) +
      tog('mir', 'Demande régulée par le SAS ou le 15', p.mir) + tog('domicile', 'Au domicile du patient', p.domicile) +
      (p.domicile ? tog('hk', 'Patient hors de l’agglomération du cabinet (IK)', p.hk) +
        (p.hk ? '<label class="nc-sel nc-km"><span>Distance aller (km)</span><input inputmode="decimal" data-f="km" value="' + esc(p.km) + '" placeholder="ex. 8"></label>' + tog('mont', 'Zone de montagne', p.mont) : '') : '') +
      '</div></details>' +
      (p.bsi ? '<div class="nc-opts nc-sub">' + tog('forfait', 'Forfait du jour facturé sur ce passage', p.forfait) +
        '<label class="nc-sel"><span>Bilan BSI ce jour</span><select data-f="di"><option value="0">Aucun</option><option value="2.5"' + sel(String(p.di), '2.5') + '>Initial (DI 2,5)</option><option value="1.2"' + sel(String(p.di), '1.2') + '>Renouvellement ou intermédiaire (DI 1,2)</option></select></label>' +
        '<p class="nc-hint">Un seul forfait par jour : décochez la case pour les passages suivants. Ces jours-là, tous les actes techniques se cotent en AMX.</p></div>' : '') +
      '<div class="nc-acts"><p class="nc-lab">Soins réalisés</p>' + (acts ? '<ul class="nc-list">' + acts + '</ul>' : '<p class="nc-empty">Ajoutez les soins du passage avec les raccourcis ou la recherche.</p>') +
      '<div class="nc-quick">' + quick + '</div>' +
      '<details class="nc-more"><summary>Rechercher dans tous les soins de la nomenclature</summary><input type="search" class="nc-search" placeholder="Rechercher : sonde, escarre, chimiothérapie…" aria-label="Rechercher un soin"><div class="nc-results">' + catalogue('') + '</div></details></div>' +
      '<div class="nc-res"><div class="nc-total"><span class="nc-cot">' + (esc(r.cotation) || 'Aucune cotation') + '</span><strong>' + N.eur(r.total) + '</strong></div>' +
      (det ? '<details class="nc-det"><summary>Détail du calcul</summary><table>' + det + '</table></details>' : '') + msgs + dimAuto + '</div>' +
      '</article>';
  }
  function court(d) {
    var m = { pdv: 'Prise de sang', imsc: 'Injection IM/SC', dsurv: 'Glycémie (insulino-traité)', dinsu: 'Insuline', ppnc: 'Pansement simple (plaie)', ppcs: 'Pansement post-op simple', plescarre: 'Pansement lourd (escarre)', plcompress: 'Ulcère + compression', vacc: 'Vaccin', vaccpres: 'Vaccin prescrit par l’IDE', adm: 'Aide aux médicaments', prado: 'Séance PRADO', perfc: 'Perfusion ≤ 1 h', perfl: 'Perfusion > 1 h' };
    return m[d.id] || d.l;
  }
  function xcount(p) { var n = [p.enfant, p.pallia, p.mir, !p.domicile, p.hk].filter(Boolean).length; return n ? ' (' + n + ')' : ''; }
  function sel(a, b) { return a === b ? ' selected' : ''; }
  function tog(f, l, v) { return '<label class="nc-tog"><input type="checkbox" data-f="' + f + '"' + (v ? ' checked' : '') + '><span>' + l + '</span></label>'; }
  function calcInput(p) {
    return { date: p.date || today, acts: p.acts, horaire: p.horaire, dim: p.dim, enfant: p.enfant, pallia: p.pallia, mir: p.mir, domicile: p.domicile, bsi: p.bsi, forfait: p.forfait, di: num(p.di), hk: p.hk, km: num(p.km), mont: p.mont };
  }

  /* ---------- Synthèse et rétrocession ---------- */
  function synthese() {
    var days = {}, H = 0, D = 0;
    S.passages.forEach(function (p) {
      var r = p._r || N.passage(calcInput(p));
      var d = p.date || today;
      days[d] = days[d] || { h: 0, d: 0, n: 0, ik: [] };
      days[d].h += r.actes + r.majo; days[d].d += r.depl; days[d].n++;
      if (r.ikKm) days[d].ik.push({ km: r.ikKm, tarif: r.ikTarif });
    });
    var rows = '', plaf = 0;
    Object.keys(days).sort().forEach(function (d) {
      var x = days[d], red = N.plafondIK(x.ik);
      x.d = N.r2(x.d - red); plaf += red;
      H += x.h; D += x.d;
      rows += '<tr><td>' + jour(d) + '<small>' + x.n + ' passage' + (x.n > 1 ? 's' : '') + '</small></td><td>' + N.eur(N.r2(x.h + x.d)) + '</td></tr>';
    });
    H = N.r2(H); D = N.r2(D);
    var pctH = num(S.pctH), pctD = S.pctD === '' ? pctH : num(S.pctD);
    var du = N.r2(H * pctH / 100 + D * pctD / 100);
    var recu = num(S.recu), ecart = N.r2(recu - du);
    var verdict = '';
    if (pctH && S.recu !== '') {
      if (Math.abs(ecart) < 0.5) verdict = '<p class="nc-ok">Le montant reçu correspond à vos cotations.</p>';
      else if (ecart < 0) verdict = '<p class="nc-bad">Il manque <b>' + N.eur(-ecart) + '</b> par rapport à vos cotations. Demandez au titulaire le détail de la facturation de ces jours (relevé de télétransmission) avant d’en conclure quoi que ce soit : rejets, soins non encore payés ou cotation différente peuvent expliquer un écart.</p>';
      else verdict = '<p class="nc-ok">Vous avez reçu ' + N.eur(ecart) + ' de plus que le montant calculé.</p>';
    }
    $('#nc-days').innerHTML = rows + (plaf ? '<tr><td>Plafonnement journalier des IK</td><td>− ' + N.eur(plaf) + '</td></tr>' : '');
    $('#nc-h').textContent = N.eur(H);
    $('#nc-d').textContent = N.eur(D);
    $('#nc-tot').textContent = N.eur(N.r2(H + D));
    $('#nc-du').textContent = pctH ? N.eur(du) : '—';
    $('#nc-verdict').innerHTML = verdict || (pctH ? '' : '<p class="nc-hint">Indiquez le pourcentage prévu par votre contrat de remplacement pour calculer ce qui vous revient.</p>');
    $('#nc-sticky-tot').textContent = N.eur(N.r2(H + D));
    $('#nc-sticky-n').textContent = S.passages.length + ' passage' + (S.passages.length > 1 ? 's' : '');
    return { H: H, D: D, du: du, pctH: pctH, pctD: pctD, ecart: ecart };
  }

  function recap() {
    var out = ['Cotations NGAP (tarifs selon la date du soin, calculateur infirmier-limoges.fr)', ''];
    S.passages.forEach(function (p, i) {
      var r = p._r || N.passage(calcInput(p));
      out.push(jour(p.date) + ' · ' + (p.nom || 'Passage ' + (i + 1)) + ' : ' + (r.cotation || '—') + ' = ' + N.eur(r.total));
    });
    var s = synthese();
    out.push('', 'Honoraires (actes et majorations) : ' + N.eur(s.H), 'Déplacements (IFD, IFI, IK) : ' + N.eur(s.D), 'Total facturé : ' + N.eur(N.r2(s.H + s.D)));
    if (s.pctH) out.push('Rétrocession attendue (' + s.pctH + ' % des honoraires, ' + s.pctD + ' % des déplacements) : ' + N.eur(s.du));
    if (s.pctH && S.recu !== '') out.push('Montant reçu : ' + N.eur(num(S.recu)) + ' · Écart : ' + N.eur(s.ecart));
    return out.join('\n');
  }

  /* ---------- Rendu global et événements ---------- */
  var box = $('#nc-passages');
  function render(keepFocus) {
    var f = keepFocus && document.activeElement, fid = f && f.closest && f.closest('.nc-card') && f.closest('.nc-card').dataset.id, ff = f && f.dataset && f.dataset.f;
    box.innerHTML = S.passages.map(carte).join('');
    synthese(); save();
    if (fid && ff) { var el = box.querySelector('[data-id="' + fid + '"] [data-f="' + ff + '"]'); if (el) { el.focus(); if (el.setSelectionRange && el.type === 'text') { var v = el.value.length; try { el.setSelectionRange(v, v); } catch (e) {} } } }
  }
  function refreshCard(card) {
    var p = find(card.dataset.id), i = S.passages.indexOf(p);
    var openMore = card.querySelector('.nc-more') && card.querySelector('.nc-more').open;
    var q = card.querySelector('.nc-search') ? card.querySelector('.nc-search').value : '';
    var openDet = card.querySelector('.nc-det') && card.querySelector('.nc-det').open;
    var openX = card.querySelector('.nc-xopts').open;
    var tmp = document.createElement('div'); tmp.innerHTML = carte(p, i);
    var n = tmp.firstChild; card.replaceWith(n);
    if (openMore) { n.querySelector('.nc-more').open = true; var s = n.querySelector('.nc-search'); s.value = q; n.querySelector('.nc-results').innerHTML = catalogue(q); }
    if (openDet && n.querySelector('.nc-det')) n.querySelector('.nc-det').open = true;
    if (openX) n.querySelector('.nc-xopts').open = true;
    synthese(); save();
    return n;
  }
  function find(id) { return S.passages.filter(function (p) { return p.id === id; })[0]; }

  box.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return;
    var card = t.closest('.nc-card'), p = find(card.dataset.id);
    if (t.dataset.add) { var a = p.acts.filter(function (x) { return x.id === t.dataset.add; })[0]; if (a) a.n++; else p.acts.push({ id: t.dataset.add, n: 1 }); var n = refreshCard(card); flash(n); return; }
    if (t.dataset.inc) { p.acts.forEach(function (x) { if (x.id === t.dataset.inc) x.n++; }); refreshCard(card); return; }
    if (t.dataset.dec) { p.acts.forEach(function (x) { if (x.id === t.dataset.dec) x.n--; }); p.acts = p.acts.filter(function (x) { return x.n > 0; }); refreshCard(card); return; }
    if (t.hasAttribute('data-del')) { if (S.passages.length === 1) { S.passages = [nouveau()]; } else S.passages.splice(S.passages.indexOf(p), 1); render(); return; }
    if (t.hasAttribute('data-dup')) { var c = JSON.parse(JSON.stringify(p)); delete c._r; c.id = 'p' + (++uid); S.passages.splice(S.passages.indexOf(p) + 1, 0, c); render(); return; }
  });
  function flash(card) { var t = card.querySelector('.nc-total'); if (t) { t.classList.remove('nc-pulse'); void t.offsetWidth; t.classList.add('nc-pulse'); } }
  box.addEventListener('input', function (e) {
    var t = e.target, card = t.closest('.nc-card'); if (!card) return;
    if (t.classList.contains('nc-search')) { card.querySelector('.nc-results').innerHTML = catalogue(t.value); return; }
    var p = find(card.dataset.id), f = t.dataset.f; if (!f) return;
    if (f === 'nom') { p.nom = t.value; save(); return; }
    if (f === 'km') { p.km = t.value; var r = N.passage(calcInput(p)); p._r = r; card.querySelector('.nc-total').innerHTML = '<span class="nc-cot">' + (esc(r.cotation) || 'Aucune cotation') + '</span><strong>' + N.eur(r.total) + '</strong>'; synthese(); save(); }
  });
  box.addEventListener('change', function (e) {
    var t = e.target, card = t.closest('.nc-card'); if (!card) return;
    var p = find(card.dataset.id), f = t.dataset.f; if (!f || f === 'nom' || f === 'km') return;
    p[f] = t.type === 'checkbox' ? t.checked : t.value;
    if (f === 'date' && !p.date) p.date = today;
    if (f === 'bsi' && p.bsi) p.forfait = true;
    refreshCard(card);
  });

  $('#nc-add').addEventListener('click', function () {
    S.passages.push(nouveau(S.passages[S.passages.length - 1])); render();
    var last = box.lastElementChild; if (last) { last.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
  $('#nc-reset').addEventListener('click', function () {
    if (!confirmReset()) return;
    S.passages = [nouveau()]; render();
  });
  var armed = false;
  function confirmReset() {
    var b = $('#nc-reset');
    if (armed) { armed = false; b.textContent = 'Tout effacer'; return true; }
    armed = true; b.textContent = 'Confirmer l’effacement';
    setTimeout(function () { armed = false; b.textContent = 'Tout effacer'; }, 4000);
    return false;
  }
  ['pctH', 'pctD', 'recu'].forEach(function (k) {
    var el = $('#nc-' + k); el.value = S[k];
    el.addEventListener('input', function () { S[k] = el.value; synthese(); save(); });
  });
  $('#nc-copy').addEventListener('click', function () {
    var txt = recap(), b = this;
    function ok() { b.textContent = 'Récapitulatif copié'; setTimeout(function () { b.textContent = 'Copier le récapitulatif'; }, 2500); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, fallback); else fallback();
    function fallback() { var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) {} ta.remove(); }
  });
  $('#nc-print').addEventListener('click', function () { window.print(); });

  render();
})();

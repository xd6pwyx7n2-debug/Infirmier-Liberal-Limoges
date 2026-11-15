/* Moteur de cotation NGAP infirmier (Titre XVI) — Cabinet Beaupuy, Limoges.
   Sources : NGAP version du 21/06/2026 (décision UNCAM du 2 juin 2026), avenant 11 (arrêté du 5 mai 2026),
   tarifs ameli.fr applicables à compter du 6 novembre 2026. Outil indicatif : la NGAP fait foi. */
(function (root) {
  'use strict';

  /* ---------- Tarifs ---------- */
  function lettre(date) {
    if (date >= '2027-11-01') return 3.45;
    if (date >= '2026-11-06') return 3.35;
    return 3.15;
  }
  var T = {
    BSA: 13, BSB: 18.20, BSC: 28.70, DI: 10,
    IFD: 2.75, IFI: 2.75, IKP: 0.35, IKM: 0.50,
    MAU: 1.35, MCI: 5, MIE: 3.15, NUIT: 9.15, NUITP: 18.30, DIM: 8.50,
    MIR: 15, CIA: 20, TLS: 10, TLD: 15
  };
  var AV11 = '2026-11-06'; // entrée en vigueur avenant 11 (AMI 3,35 €, MIR, levée de doute, CIA)
  var UNCAM = '2026-06-21'; // décision UNCAM du 2 juin 2026 (AMI 2,02, suppression AIS)

  /* ---------- Catalogue ---------- */
  // g : type de règle · x : existe en AMX (facturable un jour de forfait BSI) · nm : pas de majoration nuit/dimanche
  var CATS = [
    ['prel', 'Prélèvements et injections'],
    ['vacc', 'Vaccination'],
    ['pans', 'Pansements courants'],
    ['pl', 'Pansements lourds et complexes'],
    ['diab', 'Patient diabétique insulino-traité'],
    ['perf', 'Perfusions'],
    ['immuno', 'Patient immunodéprimé ou cancéreux'],
    ['cath', 'Cathéters, site implantable, PICC'],
    ['surv', 'Surveillance, traitement, PRADO'],
    ['postop', 'Soins post-opératoires (protocole RAAC)'],
    ['uro', 'Appareil génito-urinaire'],
    ['dig', 'Appareil digestif, sondes, alimentation'],
    ['resp', 'Appareil respiratoire, peau'],
    ['autres', 'Consultation, téléconsultation, soins non programmés']
  ];
  var A = [
    // Prélèvements et injections (chap. I art. 1)
    ['pdv', 'prel', 'Prise de sang (ponction veineuse directe)', 1.5, 1, 'pds'],
    ['prelasep', 'prel', 'Prélèvement aseptique (cutané, sécrétions, selles, urines, ECBU)', 1, 0],
    ['saignee', 'prel', 'Saignée', 5, 0],
    ['imsc', 'prel', 'Injection IM, SC ou intradermique (anticoagulant, etc.)', 1, 1, 'inj'],
    ['ivd', 'prel', 'Injection IV directe isolée', 2, 0],
    ['ivdenf', 'prel', 'Injection IV directe chez l’enfant de moins de 5 ans', 2, 0],
    ['ivdserie', 'prel', 'Injection IV directe en série', 1.5, 0],
    ['implant', 'prel', 'Injection d’un implant sous-cutané', 2.5, 0],
    ['besredka', 'prel', 'Injection de sérum d’origine humaine ou animale (Besredka), surveillance comprise', 5, 0],
    ['hyposens', 'prel', 'Injection d’allergène (hyposensibilisation)', 3, 0],
    ['rectal', 'prel', 'Injection en goutte à goutte par voie rectale', 2, 0],
    // Vaccination
    ['vacc', 'vacc', 'Vaccination : vaccin prescrit, ou vaccin sans prescription requise (grippe)', 2.4, 1, 'vacc'],
    ['vaccpres', 'vacc', 'Vaccination avec prescription du vaccin par l’infirmier', 3.05, 1, 'vacc'],
    // Pansements courants (art. 2)
    ['ppnc', 'pans', 'Pansement de plaie non chirurgicale (ulcère, escarre, plaie aiguë ou chronique)', 2.02, 0, 'ppnc'],
    ['ppcs', 'pans', 'Pansement de plaie chirurgicale simple', 2.02, 0, 'ppnc'],
    ['fils10', 'pans', 'Ablation de fils ou d’agrafes (10 ou moins), pansement compris', 2, 0],
    ['fils11', 'pans', 'Ablation de fils ou d’agrafes (plus de 10), pansement compris', 4, 0],
    ['plaieop', 'pans', 'Pansement de plaies opératoires étendues ou multiples', 3, 0],
    ['varices', 'pans', 'Pansement après exérèse de varices ou ligature de perforantes', 3, 0],
    ['stomie', 'pans', 'Pansement de stomie', 3, 0],
    ['tracheo', 'pans', 'Pansement de trachéotomie (aspiration et changement de canule compris)', 3, 0],
    // Pansements lourds et complexes (art. 3)
    ['bilanplaie', 'pl', 'Bilan de première prise en charge d’une plaie (pansement lourd)', 11, 1, 'plbilan'],
    ['plbrulure', 'pl', 'Brûlure étendue ou plaie chimique ou thermique étendue', 4, 1, 'pl'],
    ['plulcere', 'pl', 'Ulcère étendu ou greffe cutanée étendue', 4, 1, 'pl'],
    ['plamput', 'pl', 'Amputation nécessitant détersion, épluchage et régularisation', 4, 1, 'pl'],
    ['plfistule', 'pl', 'Pertes de substance traumatique ou néoplasique, fistule', 4, 1, 'pl'],
    ['plescarre', 'pl', 'Escarre profonde et étendue (muscles, tendons)', 4, 1, 'pl'],
    ['plmechage', 'pl', 'Chirurgie avec méchage ou irrigation', 4, 1, 'pl'],
    ['plosteo', 'pl', 'Pansement d’ostéosynthèse extériorisée', 4, 1, 'pl'],
    ['plcompress', 'pl', 'Pansement d’ulcère ou de greffe avec pose de compression', 5.1, 1, 'pl'],
    ['tpnpose', 'pl', 'Pansement par pression négative (TPN), pose', 4.6, 1, 'pl'],
    ['tpnadd', 'pl', 'Pansement par pression négative (TPN), pansement additionnel', 2.1, 1, 'pl'],
    ['analg', 'pl', 'Analgésie topique préalable à un pansement (ulcère, escarre)', 1.1, 1, 'analg'],
    // Diabète insulino-traité (chap. II art. 5 bis)
    ['dsurv', 'diab', 'Surveillance du patient insulino-traité (glycémie, adaptation des doses)', 1, 1, 'diab'],
    ['dinsu', 'diab', 'Injection sous-cutanée d’insuline', 1, 1, 'diab'],
    ['d75', 'diab', 'Séance hebdomadaire de surveillance, patient de plus de 75 ans', 4, 0, 'diab75'],
    ['dpl', 'diab', 'Pansement lourd et complexe avec détersion (patient diabétique)', 4, 1, 'dpl'],
    ['danalg', 'diab', 'Analgésie topique avant pansement (patient diabétique)', 1.1, 1, 'danalg'],
    // Perfusions (chap. II art. 3)
    ['perfc', 'perf', 'Perfusion courte (1 h ou moins) sous surveillance continue', 9, 1, 'perfC'],
    ['perfsup', 'perf', 'Supplément par heure de surveillance continue au-delà de la 1re heure (5 h max.)', 6, 1, 'perfS'],
    ['perfl', 'perf', 'Perfusion de plus d’une heure avec organisation de la surveillance', 14, 1, 'perfL'],
    ['perfret', 'perf', 'Arrêt et retrait du dispositif de perfusion (pansement compris)', 5, 1, 'perfR'],
    ['perforg', 'perf', 'Organisation de la surveillance d’une perfusion (par jour, hors pose et retrait)', 4, 1, 'perfO', 1],
    ['perfchg', 'perf', 'Changement de flacon, branchement en Y ou contrôle du débit (hors pose)', 4.1, 1, 'perfO'],
    ['mucov', 'perf', 'Perfusion d’antibiotiques, mucoviscidose (cotation globale)', 15, 1, 'perfC'],
    // Immunodéprimé ou cancéreux (chap. II art. 4)
    ['iperfc', 'immuno', 'Perfusion courte sous surveillance continue (immunodéprimé ou cancéreux)', 10, 1, 'perfC'],
    ['iperfsup', 'immuno', 'Supplément par heure au-delà de la 1re heure (immunodéprimé ou cancéreux)', 6, 1, 'perfS'],
    ['iperfl', 'immuno', 'Perfusion de plus d’une heure (immunodéprimé ou cancéreux)', 15, 1, 'perfL'],
    ['iperfret', 'immuno', 'Arrêt et retrait de perfusion (immunodéprimé ou cancéreux)', 5, 1, 'perfR'],
    ['iperforg', 'immuno', 'Organisation de la surveillance (par jour, immunodéprimé ou cancéreux)', 4, 1, 'perfO', 1],
    ['iperfchg', 'immuno', 'Changement de flacon ou contrôle du débit (immunodéprimé ou cancéreux)', 4.1, 1, 'perfO'],
    ['iimsc', 'immuno', 'Injection IM ou SC (immunodéprimé ou cancéreux)', 1.5, 1, 'inj'],
    ['iiv', 'immuno', 'Injection IV (immunodéprimé ou cancéreux)', 2.5, 0],
    ['iivchimio', 'immuno', 'Injection IV de chimiothérapie', 7, 0],
    ['iaerosol', 'immuno', 'Aérosol à visée prophylactique', 5, 0],
    // Cathéters (chap. II art. 1 et 2)
    ['cathext', 'cath', 'Entretien de cathéter extériorisé, site implantable ou PICC', 4, 0],
    ['cathperit', 'cath', 'Entretien de cathéter péritonéal', 4, 0],
    ['ivsite', 'cath', 'Injection IV par site implanté', 4, 0],
    ['ivcentral', 'cath', 'Injection IV par cathéter central', 3, 0],
    ['prelcath', 'cath', 'Prélèvement sanguin sur cathéter', 1, 0],
    ['analgesique', 'cath', 'Injection d’analgésique (hors cathéter intrathécal ou péridural)', 5, 0],
    // Surveillance (chap. I art. 10, chap. II art. 5 ter)
    ['adm', 'surv', 'Administration et aide à la prise des médicaments (une fois par passage)', 1.2, 0],
    ['survtt', 'surv', 'Surveillance lors de la mise en œuvre d’un traitement (15 passages max.)', 1, 0],
    ['accmed1', 'surv', 'Accompagnement à la prise médicamenteuse : séance initiale', 5.1, 0],
    ['accmed2', 'surv', 'Accompagnement à la prise médicamenteuse : 2e ou 3e séance', 4.6, 0],
    ['prado', 'surv', 'Séance de surveillance insuffisance cardiaque ou BPCO après hospitalisation (PRADO)', 5.8, 1, 'surv58', 1],
    // Post-opératoire (chap. II art. 7)
    ['raac', 'postop', 'Séance de surveillance post-opératoire (RAAC, 3 séances max.)', 3.9, 0, 'post'],
    ['perinerv', 'postop', 'Surveillance et/ou retrait de cathéter périnerveux', 4.2, 0, 'post'],
    ['postsonde', 'postop', 'Retrait de sonde urinaire (dans le protocole post-opératoire)', 2, 0, 'postAdd'],
    ['redon', 'postop', 'Surveillance et/ou retrait de drain de Redon', 2.8, 0, 'postAdd'],
    // Génito-urinaire (chap. I art. 6)
    ['sondf', 'uro', 'Sondage ou changement de sonde urinaire chez la femme', 3, 0],
    ['sondh', 'uro', 'Sondage ou changement de sonde urinaire chez l’homme', 4, 0],
    ['retsonde', 'uro', 'Retrait de sonde urinaire', 2, 0],
    ['autosond', 'uro', 'Éducation à l’autosondage', 3.5, 0],
    ['reedvesic', 'uro', 'Rééducation vésicale', 4.5, 0],
    ['instil', 'uro', 'Instillation ou lavage vésical', 1.25, 0],
    ['etui', 'uro', 'Pose d’un étui pénien', 1, 0],
    ['injvag', 'uro', 'Injection vaginale', 1.25, 0],
    ['curie', 'uro', 'Soins après curiethérapie gynécologique', 1.5, 0],
    // Digestif, sondes (chap. I art. 4 et 7, chap. II art. 6)
    ['lavement', 'dig', 'Lavement évacuateur ou médicamenteux', 3, 0],
    ['fecalome', 'dig', 'Extraction de fécalome', 3, 0],
    ['bouche', 'dig', 'Soins de bouche après radiothérapie', 1.25, 0],
    ['sng', 'dig', 'Pose de sonde gastrique', 3, 0],
    ['gavage', 'dig', 'Alimentation entérale par gavage ou nutri-pompe (séance)', 3, 0],
    ['jejun', 'dig', 'Alimentation entérale par voie jéjunale', 4, 0],
    ['irrig', 'dig', 'Irrigation colique', 4, 0],
    ['dialyse', 'dig', 'Dialyse péritonéale (séance, 4 max. par jour)', 4, 0],
    ['cycleur', 'dig', 'Branchement ou débranchement d’un cycleur de dialyse', 4, 0],
    ['cyclsurv', 'dig', 'Surveillance d’un cycleur (par période de 12 h)', 4, 0],
    // Respiratoire, peau (art. 5 et 8)
    ['aerosol', 'resp', 'Séance d’aérosol', 1.5, 0],
    ['sinus', 'resp', 'Lavage d’un sinus', 2, 0],
    ['pulve', 'resp', 'Pulvérisation de produit médicamenteux (peau)', 1.25, 0],
    ['idr', 'resp', 'Test tuberculinique (IDR)', 0.5, 0],
    ['timbre', 'resp', 'Lecture de timbre tuberculinique', 1, 0],
    // Autres
    ['ldd', 'autres', 'Levée de doute, sans acte réalisé (depuis le 6/11/2026)', 1.35, 0, 'ldd'],
    ['cia', 'autres', 'Consultation infirmière CIA : diabète de type 2, début d’insuline (20 €)', 0, 0, 'cia'],
    ['tls', 'autres', 'Accompagnement d’une téléconsultation pendant un soin prévu (TLS, 10 €)', 0, 0, 'tls'],
    ['tld', 'autres', 'Accompagnement d’une téléconsultation à domicile, hors soin prévu (TLD, 15 €)', 0, 0, 'tld']
  ];
  var ACTS = {};
  A.forEach(function (r) {
    ACTS[r[0]] = { id: r[0], c: r[1], l: r[2], k: r[3], x: !!r[4], g: r[5] || 'std', nm: !!r[6] };
  });

  /* ---------- Utilitaires ---------- */
  function r2(x) { return Math.round((x + 1e-9) * 100) / 100; }
  function fk(k) { return String(k).replace('.', ','); }
  function eur(x) { return x.toFixed(2).replace('.', ',') + ' €'; }

  /* ---------- Calcul d'un passage ---------- */
  // p : { date, acts:[{id,n}], horaire:'jour'|'nuit'|'nuitp', dim, enfant, pallia, mir, domicile, bsi:''|'BSA'|'BSB'|'BSC', forfait, di:0|2.5|1.2, hk, km, mont }
  function passage(p) {
    var date = p.date || '2026-11-15';
    var V = lettre(date);
    var bsi = !!p.bsi;
    var L = bsi ? 'AMX' : 'AMI';
    var dom = p.domicile !== false;
    var res = { lines: [], notes: [], warns: [], actes: 0, majo: 0, depl: 0, ikKm: 0, code: [], V: V };
    function line(code, label, amount, kind, info) {
      amount = r2(amount);
      res.lines.push({ code: code, label: label, amount: amount, kind: kind, info: info || '' });
      if (kind === 'm') res.majo += amount; else if (kind === 'd') res.depl += amount; else res.actes += amount;
      if (code) res.code.push(code);
    }

    // Développer les quantités
    var items = [];
    (p.acts || []).forEach(function (a) {
      var d = ACTS[a.id]; if (!d) return;
      for (var i = 0; i < (a.n || 1); i++) {
        var it = { id: d.id, l: d.l, k: d.k, x: d.x, g: d.g, nm: d.nm };
        if (d.g === 'ppnc' && date < UNCAM) it.k = 2;
        items.push(it);
      }
    });

    // Actes nés de l'avenant 11
    items = items.filter(function (it) {
      if ((it.g === 'ldd' || it.g === 'cia') && date < AV11) { res.warns.push(it.l.replace(/ \(.*\)/, '') + ' : n’existe qu’à partir du 6 novembre 2026, non compté.'); return false; }
      return true;
    });

    var specials = items.filter(function (it) { return it.g === 'cia' || it.g === 'tld'; });
    if (specials.length) {
      var s = specials[0];
      if (items.length > 1) res.warns.push((s.g === 'cia' ? 'La consultation CIA' : 'La TLD') + ' ne se cumule avec aucun autre acte : seuls ' + (s.g === 'cia' ? 'la consultation' : 'la TLD') + ' et le déplacement sont comptés.');
      if (s.g === 'cia') { line('CIA', 'Consultation infirmière (insuline, diabète de type 2)', T.CIA, 'a'); if (bsi) res.warns.push('La CIA n’est pas facturable dans le cadre d’un BSI.'); }
      else line('TLD', 'Accompagnement de téléconsultation à domicile', T.TLD, 'a');
      if (dom) line('IFD', 'Indemnité forfaitaire de déplacement', T.IFD, 'd');
      ik(); return fin();
    }

    // Forfait BSI et bilan DI
    if (bsi && p.forfait !== false) line(p.bsi, 'Forfait journalier dépendance (' + p.bsi + ')', T[p.bsi], 'a', 'taux plein');
    if (p.di) line('DI ' + fk(p.di), p.di === 2.5 ? 'Bilan de soins infirmiers initial' : 'BSI de renouvellement ou intermédiaire', p.di * T.DI, 'a');

    // Un jour de BSI : seuls les actes prévus en AMX se facturent, le reste est inclus dans le forfait
    var included = [];
    if (bsi) {
      items = items.filter(function (it) {
        if (it.g === 'tls' || it.g === 'ldd') return true;
        if (!it.x) { included.push(it.l); return false; }
        return true;
      });
      if (included.length) res.notes.push('Inclus dans le forfait (pas d’AMX prévu) : ' + uniq(included).join(' ; ') + '.');
    }

    var tls = items.filter(function (it) { return it.g === 'tls'; });
    var vaccs = items.filter(function (it) { return it.g === 'vacc' && dom; });
    var rest = items.filter(function (it) { return it.g !== 'tls' && !(it.g === 'vacc' && dom); });
    var ldd = rest.some(function (it) { return it.g === 'ldd'; });
    if (ldd && rest.length > 1) res.warns.push('La levée de doute se cote quand aucun acte n’est réalisé : vérifiez la saisie.');

    // Avertissements de non-cumul
    var has = function (id) { return rest.some(function (it) { return it.id === id; }); };
    if (has('raac') && has('perinerv')) res.warns.push('Séance post-opératoire et surveillance de cathéter périnerveux ne se cumulent pas entre elles.');
    if ((has('perfret') && has('perfc')) || (has('iperfret') && has('iperfc'))) res.warns.push('Le forfait d’arrêt et retrait ne se cumule pas avec une perfusion sous surveillance continue.');
    if ((has('autosond') || has('reedvesic')) && (has('sondf') || has('sondh'))) res.warns.push('Éducation à l’autosondage et rééducation vésicale ne se cumulent pas avec le sondage.');

    // Construction des blocs (groupes cumulables entre eux à taux plein)
    var blocks = [];
    function block(arr, kind) {
      if (!arr.length) return;
      var b = { items: arr, kind: kind, sum: arr.reduce(function (s, it) { return s + it.k; }, 0) };
      b.pds = arr.some(function (it) { return it.g === 'pds'; });
      b.derog = arr.some(function (it) { return /^(pds|pl|plbilan|dpl|analg|danalg|surv58)$/.test(it.g) || /^perf/.test(it.g); });
      blocks.push(b);
    }
    var pool = rest.slice();
    function take(fn) { var out = pool.filter(fn); pool = pool.filter(function (it) { return !fn(it); }); return out; }

    block(take(function (it) { return /^perf[CSL]$/.test(it.g); }), 'perf');
    if (!bsi) {
      block(take(function (it) { return /^(diab|diab75|dpl|danalg)$/.test(it.g); }), 'diab');
    } else {
      block(take(function (it) { return it.g === 'diab'; }), 'diab');
    }
    // Analgésie topique : rattachée au pansement le plus lourd de la séance
    var analgs = take(function (it) { return it.g === 'analg' || it.g === 'danalg'; });
    if (analgs.length) {
      var cands = pool.filter(function (it) { return /^(pl|dpl|ppnc)$/.test(it.g); }).sort(function (a, b) { return b.k - a.k; });
      if (cands.length) { var host = cands[0]; pool.splice(pool.indexOf(host), 1); block([host].concat(analgs), 'pl'); }
      else analgs.forEach(function (it) { block([it], 'std'); });
    }
    block(take(function (it) { return it.g === 'post' || it.g === 'postAdd'; }), 'post');
    pool.forEach(function (it) { block([it], 'std'); });

    blocks.sort(function (a, b) { return b.sum - a.sum; });
    blocks.forEach(function (b, i) {
      var rate;
      if (i > 1) rate = 0;
      else if (!bsi) rate = (i === 0) ? 1 : ((blocks[0].pds || b.pds) ? 1 : 0.5);
      else rate = (i === 0) ? (b.derog ? 1 : 0.5) : (b.pds ? 1 : 0.5);
      b.rate = rate;
      b.items.sort(function (a, c) { return c.k - a.k; }).forEach(function (it) {
        var code = L + ' ' + fk(it.k) + (rate === 0.5 ? '/2' : '');
        var info = rate === 1 ? 'taux plein' : rate === 0.5 ? '50 %' : 'non facturé (3e acte et suivants)';
        if (rate === 0) code = '';
        line(code, it.l, it.k * V * rate, 'a', info);
      });
    });
    vaccs.forEach(function (it) { line(L + ' ' + fk(it.k), it.l, it.k * V, 'a', 'taux plein (vaccination à domicile)'); });
    tls.forEach(function () { line('TLS', 'Accompagnement de téléconsultation pendant le soin', T.TLS, 'a', 'taux plein'); });

    var nActs = rest.length + vaccs.length;
    var anyAct = nActs > 0 || (bsi && p.forfait !== false) || included.length > 0;

    // Majorations
    var pl = rest.some(function (it) { return it.g === 'pl' || it.g === 'dpl'; });
    var bilanPL = rest.some(function (it) { return it.g === 'plbilan'; });
    var mci = dom && (pl || (p.pallia && anyAct)) && !bilanPL;
    if (bilanPL && (pl || p.pallia)) res.notes.push('Le bilan de plaie (AMI 11) ne se cumule pas avec la MCI.');
    if (mci) line('MCI', 'Majoration de coordination infirmière', T.MCI, 'm');
    var only = nActs === 1 ? rest.concat(vaccs)[0] : null;
    if (!bsi && only && only.k <= 1.5 && !mci && !(only.g === 'ldd' && p.mir)) line('MAU', 'Majoration d’acte unique', T.MAU, 'm');
    if (p.enfant && (nActs > 0 || tls.length)) line('MIE', 'Majoration enfant de moins de 7 ans', T.MIE, 'm');
    var majoOK = rest.concat(vaccs).some(function (it) { return !it.nm; }) || (bsi && p.forfait !== false);
    var hor = p.horaire || 'jour';
    var cand = [];
    if (hor === 'nuit') cand.push(['MN', 'Majoration de nuit (20 h-23 h ou 5 h-8 h)', T.NUIT]);
    if (hor === 'nuitp') cand.push(['MNP', 'Majoration de nuit (23 h-5 h)', T.NUITP]);
    if (p.dim) cand.push(['F', 'Majoration dimanche ou jour férié', T.DIM]);
    if (cand.length && anyAct) {
      if (!majoOK) res.notes.push('Pas de majoration de nuit ou de dimanche pour la séance PRADO (AMI 5,8) ni pour l’organisation de la surveillance d’une perfusion.');
      else {
        cand.sort(function (a, b) { return b[2] - a[2]; });
        line(cand[0][0], cand[0][1], cand[0][2], 'm');
        if (cand.length > 1) res.notes.push('Nuit et dimanche ne se cumulent pas : la majoration la plus élevée est retenue.');
      }
    }
    if (p.mir) {
      if (date < AV11) res.warns.push('La MIR n’existe qu’à partir du 6 novembre 2026.');
      else if (bsi) res.warns.push('La MIR s’ajoute à un acte coté en AMI ou à une levée de doute.');
      else if (nActs > 0) line('MIR', 'Majoration demande issue de la régulation (SAS)', T.MIR, 'm');
    }

    // Déplacement
    if (dom && anyAct) {
      if (bsi) line('IFI', 'Indemnité forfaitaire infirmier (patient sous BSI)', T.IFI, 'd');
      else line('IFD', 'Indemnité forfaitaire de déplacement', T.IFD, 'd');
      ik();
    }
    return fin();

    function ik() {
      if (!dom || !p.hk || !(p.km > 0)) return;
      var km = Math.max(0, r2(2 * p.km - (p.mont ? 2 : 4)));
      if (km <= 0) { res.notes.push('Distance trop courte : pas d’IK après l’abattement.'); return; }
      res.ikKm = km; res.ikTarif = p.mont ? T.IKM : T.IKP;
      line('IK ' + fk(km), 'Indemnités kilométriques (' + (p.mont ? 'montagne' : 'plaine') + ', ' + fk(km) + ' km facturables)', km * res.ikTarif, 'd');
    }
    function fin() {
      res.actes = r2(res.actes); res.majo = r2(res.majo); res.depl = r2(res.depl);
      res.total = r2(res.actes + res.majo + res.depl);
      res.cotation = res.code.join(' + ');
      return res;
    }
  }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

  /* ---------- Plafonnement journalier des IK ---------- */
  // Kilomètres facturables cumulés sur la journée : 50 % de 300 à 399 km, plus rien à partir de 400 km.
  function plafondIK(kmList) {
    var tot = 0, reduc = 0;
    kmList.forEach(function (e) {
      for (var i = 0; i < Math.round(e.km); i++) {
        tot++;
        if (tot >= 400) reduc += e.tarif; else if (tot >= 300) reduc += e.tarif / 2;
      }
    });
    return r2(reduc);
  }

  var API = { ACTS: ACTS, CATS: CATS, T: T, lettre: lettre, passage: passage, plafondIK: plafondIK, eur: eur, fk: fk, r2: r2, AV11: AV11 };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.NGAP = API;
})(this);

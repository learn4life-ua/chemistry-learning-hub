(() => {
  const parseNumber = value => {
    const n = Number(String(value ?? '').trim().replace(',', '.'));
    return Number.isFinite(n) ? n : NaN;
  };
  const fmt = (value, digits = 2) => Number(value).toLocaleString('uk-UA', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  const showError = (el, message = '') => { if (!el) return; el.textContent = message; el.hidden = !message; };

  const CROP_REMOVAL = [
    { id:'wheat', name:'Пшениця озима', n:30, p:12, k:22, hint:'Навчальний норматив виносу з АгроХім-Хабу: N 30, P₂O₅ 12, K₂O 22 кг/т.' },
    { id:'corn', name:'Кукурудза на зерно', n:26, p:11, k:27, hint:'Навчальний норматив виносу: N 26, P₂O₅ 11, K₂O 27 кг/т.' },
    { id:'sunflower', name:'Соняшник', n:55, p:27, k:110, hint:'Навчальний норматив виносу: N 55, P₂O₅ 27, K₂O 110 кг/т.' },
    { id:'soybean', name:'Соя', n:65, p:16, k:24, hint:'Навчальний норматив виносу: N 65, P₂O₅ 16, K₂O 24 кг/т.' },
    { id:'rapeseed', name:'Ріпак озимий', n:55, p:28, k:52, hint:'Навчальний норматив виносу: N 55, P₂O₅ 28, K₂O 52 кг/т.' },
    { id:'sugarbeet', name:'Цукровий буряк', n:5, p:1.8, k:6.8, hint:'Навчальний норматив виносу: N 5, P₂O₅ 1,8, K₂O 6,8 кг/т.' },
    { id:'tomato', name:'Томати (відкритий ґрунт)', n:3, p:1, k:5, hint:'Навчальний норматив виносу: N 3, P₂O₅ 1, K₂O 5 кг/т.' }
  ];

  const FERTILIZERS = [
    { name:'Карбамід (сечовина)', formula:'CO(NH₂)₂', n:46.2, p:0, k:0, mg:0, s:0, ca:0 },
    { name:'Аміачна селітра', formula:'NH₄NO₃', n:34.4, p:0, k:0, mg:0, s:0, ca:0 },
    { name:'КАС-32', formula:'Суміш карбаміду та селітри', n:32, p:0, k:0, mg:0, s:0, ca:0 },
    { name:'Сульфат амонію', formula:'(NH₄)₂SO₄', n:21, p:0, k:0, mg:0, s:24, ca:0 },
    { name:'Кальцієва селітра', formula:'Ca(NO₃)₂ · 4H₂O', n:15.5, p:0, k:0, mg:0, s:0, ca:19 },
    { name:'Амофос', formula:'NH₄H₂PO₄', n:12, p:52, k:0, mg:0, s:0, ca:0 },
    { name:'Діамофос', formula:'(NH₄)₂HPO₄', n:18, p:46, k:0, mg:0, s:0, ca:0 },
    { name:'Суперфосфат подвійний', formula:'Ca(H₂PO₄)₂ · H₂O', n:0, p:46, k:0, mg:0, s:0, ca:12 },
    { name:'Монокалійфосфат', formula:'KH₂PO₄', n:0, p:52, k:34, mg:0, s:0, ca:0 },
    { name:'Калій хлористий', formula:'KCl', n:0, p:0, k:60, mg:0, s:0, ca:0 },
    { name:'Сульфат калію', formula:'K₂SO₄', n:0, p:0, k:50, mg:0, s:18, ca:0 },
    { name:'Калімагнезія', formula:'K₂SO₄ · MgSO₄', n:0, p:0, k:28, mg:9, s:15, ca:0 },
    { name:'Нітроамофоска (16:16:16)', formula:'NPK комплексне', n:16, p:16, k:16, mg:0, s:0, ca:0 }
  ];
  const nutrientLabels = { n:'N', p:'P₂O₅', k:'K₂O', mg:'Mg', s:'S', ca:'Ca' };

  function initSoilAcidity() {
    const form = document.querySelector('#soilPhForm');
    if (!form) return;
    const input = form.querySelector('#soilPhInput');
    const error = form.querySelector('.agro-error');
    const result = document.querySelector('#soilPhResult');
    const empty = document.querySelector('#soilPhEmpty');
    const label = document.querySelector('#soilPhClass');
    const range = document.querySelector('#soilPhRange');
    const note = document.querySelector('#soilPhNote');
    const classify = pH => {
      if (pH < 3.5) return ['Ультракислий', 'pH < 3,5'];
      if (pH <= 4.4) return ['Надзвичайно кислий', 'pH 3,5–4,4'];
      if (pH <= 5.0) return ['Дуже сильнокислий', 'pH 4,5–5,0'];
      if (pH <= 5.5) return ['Сильнокислий', 'pH 5,1–5,5'];
      if (pH <= 6.0) return ['Середньокислий', 'pH 5,6–6,0'];
      if (pH <= 6.5) return ['Слабокислий', 'pH 6,1–6,5'];
      if (pH <= 7.3) return ['Нейтральний', 'pH 6,6–7,3'];
      if (pH <= 7.8) return ['Слабколужний', 'pH 7,4–7,8'];
      if (pH <= 8.4) return ['Середньолужний', 'pH 7,9–8,4'];
      if (pH <= 9.0) return ['Сильнолужний', 'pH 8,5–9,0'];
      return ['Дуже сильнолужний', 'pH > 9,0'];
    };
    form.addEventListener('submit', e => {
      e.preventDefault();
      const pH = parseNumber(input.value);
      if (!Number.isFinite(pH) || pH < 0 || pH > 14) { showError(error, 'Введіть pH у межах від 0 до 14.'); return; }
      showError(error);
      const [name, band] = classify(pH);
      label.textContent = name;
      range.textContent = `${band} · введено ${fmt(pH, 2)}`;
      note.textContent = pH < 5.5
        ? 'За FAO ґрунти з pH нижче 5,5 належать до кислих. Сам pH не визначає норму вапна: для розрахунку потрібні додаткові агрохімічні показники.'
        : 'Це класифікація реакції ґрунтового середовища. Рішення щодо меліорації або живлення не слід робити лише за одним значенням pH.';
      empty.hidden = true; result.hidden = false;
    });
    document.querySelectorAll('[data-ph-preset]').forEach(btn => btn.addEventListener('click', () => { input.value = btn.dataset.phPreset; form.requestSubmit(); }));
  }

  function initLiming() {
    const form = document.querySelector('#limingForm');
    if (!form) return;
    const error = form.querySelector('.agro-error');
    const output = document.querySelector('#limingOutput');
    const empty = document.querySelector('#limingEmpty');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const hg = parseNumber(form.hg.value);
      const depth = parseNumber(form.depth.value);
      const density = parseNumber(form.density.value);
      const neutralizing = parseNumber(form.neutralizing.value);
      if (![hg, depth, density, neutralizing].every(Number.isFinite) || hg < 0 || depth <= 0 || density <= 0 || neutralizing <= 0) {
        showError(error, 'Перевірте вихідні дані: усі значення мають бути додатними, а Нг не може бути від’ємною.'); return;
      }
      showError(error);
      const soilMass = 10000 * depth * density;
      const pureRate = hg * 0.5 * soilMass / 1e6;
      const materialRate = pureRate / (neutralizing / 100);
      const factor = 0.5 * soilMass / 1e6;
      document.querySelector('#limingPure').textContent = `${fmt(pureRate, 2)} т/га`;
      document.querySelector('#limingMaterial').textContent = `${fmt(materialRate, 2)} т/га`;
      document.querySelector('#limingFactor').textContent = `${fmt(factor, 3)} × Нг`;
      document.querySelector('#limingStep').textContent = `Маса орного шару: ${fmt(soilMass / 1e6, 2)} млн кг/га. Для заданої глибини й щільності еквівалентна норма CaCO₃ = ${fmt(factor, 3)} × Нг. З урахуванням нейтралізувальної здатності ${fmt(neutralizing,1)}% фізична норма матеріалу становить ${fmt(materialRate,2)} т/га.`;
      empty.hidden = true; output.hidden = false;
    });
    document.querySelectorAll('[data-hg-preset]').forEach(btn => btn.addEventListener('click', () => { form.hg.value = btn.dataset.hgPreset; form.requestSubmit(); }));
  }

  function initBalance() {
    const form = document.querySelector('#balanceForm');
    if (!form) return;
    const cropSelect = form.querySelector('#cropSelect');
    const hint = document.querySelector('#cropHint');
    CROP_REMOVAL.forEach(c => cropSelect.add(new Option(c.name, c.id)));
    const updateHint = () => { hint.textContent = CROP_REMOVAL.find(c => c.id === cropSelect.value)?.hint || ''; };
    cropSelect.addEventListener('change', updateHint); updateHint();
    const error = form.querySelector('.agro-error');
    const empty = document.querySelector('#balanceEmpty');
    const output = document.querySelector('#balanceOutput');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const crop = CROP_REMOVAL.find(c => c.id === cropSelect.value);
      const y = parseNumber(form.yield.value);
      const soil = { n:parseNumber(form.soilN.value), p:parseNumber(form.soilP.value), k:parseNumber(form.soilK.value) };
      const ks = { n:parseNumber(form.kSoilN.value)/100, p:parseNumber(form.kSoilP.value)/100, k:parseNumber(form.kSoilK.value)/100 };
      const kf = { n:parseNumber(form.kFertN.value)/100, p:parseNumber(form.kFertP.value)/100, k:parseNumber(form.kFertK.value)/100 };
      const vals = [y,...Object.values(soil),...Object.values(ks),...Object.values(kf)];
      if (!crop || !vals.every(Number.isFinite) || y <= 0 || Object.values(kf).some(v => v <= 0) || [...Object.values(ks),...Object.values(kf)].some(v => v < 0 || v > 1)) {
        showError(error, 'Перевірте врожайність, запаси та коефіцієнти. Коефіцієнти мають бути в межах 0–100%, а використання з добрив - більше 0%.'); return;
      }
      showError(error);
      const total = { n:crop.n*y, p:crop.p*y, k:crop.k*y };
      const dose = {
        n:Math.max(0,(total.n-soil.n*ks.n)/kf.n),
        p:Math.max(0,(total.p-soil.p*ks.p)/kf.p),
        k:Math.max(0,(total.k-soil.k*ks.k)/kf.k)
      };
      ['n','p','k'].forEach(key => {
        document.querySelector(`#removal-${key}`).textContent = `${fmt(total[key],1)} кг/га`;
        document.querySelector(`#dose-${key}`).textContent = `${fmt(dose[key],1)} кг/га`;
      });
      document.querySelector('#balanceStep').textContent = `Д = [Винос − (запас у ґрунті × Кґрунту)] / Кдобрива. Для ${crop.name.toLowerCase()} за врожайності ${fmt(y,1)} т/га розрахунок виконано з введеними Вами коефіцієнтами.`;
      empty.hidden = true; output.hidden = false;
    });
  }

  function initFertilizer() {
    const select = document.querySelector('#fertilizerSelect');
    if (!select) return;
    const formula = document.querySelector('#fertilizerFormula');
    const tableBody = document.querySelector('#fertilizerTableBody');
    const targetSelect = document.querySelector('#targetNutrient');
    FERTILIZERS.forEach((f,i) => select.add(new Option(f.name, String(i))));
    const renderTable = () => {
      tableBody.innerHTML = FERTILIZERS.map(f => `<tr><td><strong>${f.name}</strong><br><span>${f.formula}</span></td><td>${f.n || '—'}</td><td>${f.p || '—'}</td><td>${f.k || '—'}</td><td>${f.s || '—'}</td><td>${f.mg || '—'}</td><td>${f.ca || '—'}</td></tr>`).join('');
    };
    renderTable();
    const updateFertilizer = () => {
      const f = FERTILIZERS[Number(select.value)] || FERTILIZERS[0];
      formula.textContent = f.formula;
      targetSelect.innerHTML = '';
      Object.keys(nutrientLabels).forEach(key => { if (f[key] > 0) targetSelect.add(new Option(`${nutrientLabels[key]} (${fmt(f[key],1)}%)`, key)); });
      updateForward(); updateReverse();
    };
    const forwardMass = document.querySelector('#fertilizerMass');
    const forwardResult = document.querySelector('#fertilizerContentResult');
    function updateForward() {
      const f = FERTILIZERS[Number(select.value)] || FERTILIZERS[0];
      const mass = parseNumber(forwardMass.value);
      if (!Number.isFinite(mass) || mass < 0) { forwardResult.innerHTML = '<p class="agro-error">Введіть коректну масу добрива.</p>'; return; }
      const items = Object.keys(nutrientLabels).filter(k => f[k] > 0).map(k => `<div class="agro-metric"><span>${nutrientLabels[k]}</span><strong>${fmt(mass*f[k]/100,2)} кг</strong></div>`).join('');
      forwardResult.innerHTML = `<div class="agro-result-grid">${items}</div>`;
    }
    const targetAmount = document.querySelector('#targetAmount');
    const reverseResult = document.querySelector('#fertilizerMassResult');
    function updateReverse() {
      const f = FERTILIZERS[Number(select.value)] || FERTILIZERS[0];
      const key = targetSelect.value;
      const need = parseNumber(targetAmount.value);
      if (!key || !Number.isFinite(need) || need < 0) { reverseResult.textContent = 'Введіть потрібну кількість діючої речовини.'; return; }
      const pct = f[key];
      const mass = pct > 0 ? need/(pct/100) : NaN;
      reverseResult.innerHTML = `<div class="agro-result-main"><span>Потрібна фізична маса ${f.name}</span><strong>${fmt(mass,2)} кг</strong></div><div class="agro-steps"><p>${nutrientLabels[key]} у добриві: ${fmt(pct,1)}%.</p><p>m(добрива) = ${fmt(need,2)} / ${fmt(pct/100,3)} = ${fmt(mass,2)} кг.</p></div>`;
    }
    select.addEventListener('change', updateFertilizer);
    forwardMass.addEventListener('input', updateForward);
    targetSelect.addEventListener('change', updateReverse);
    targetAmount.addEventListener('input', updateReverse);
    updateFertilizer();
  }

  function initFertigation() {
    const form = document.querySelector('#fertigationForm');
    if (!form) return;
    const error = form.querySelector('.agro-error');
    const empty = document.querySelector('#fertigationEmpty');
    const output = document.querySelector('#fertigationOutput');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const stock = parseNumber(form.stock.value);
      const ratio = parseNumber(form.ratio.value);
      if (!Number.isFinite(stock) || !Number.isFinite(ratio) || stock < 0 || ratio <= 0) { showError(error, 'Введіть невід’ємну концентрацію маточного розчину та коефіцієнт розведення більше нуля.'); return; }
      showError(error);
      const stockGL = stock * 10;
      const irrigationGL = stockGL / ratio;
      const mgL = irrigationGL * 1000;
      const ecEstimate = irrigationGL * 1.2;
      document.querySelector('#fertStock').textContent = `${fmt(stockGL,2)} г/л`;
      document.querySelector('#fertFinal').textContent = `${fmt(irrigationGL,3)} г/л`;
      document.querySelector('#fertMg').textContent = `${fmt(mgL,0)} мг/л`;
      document.querySelector('#fertEc').textContent = `~ ${fmt(ecEstimate,2)} мСм/см`;
      document.querySelector('#fertigationStep').textContent = `Маточний розчин ${fmt(stock,2)} кг/100 л = ${fmt(stockGL,2)} г/л. За розведення 1:${fmt(ratio,0)} концентрація у поливній воді становить ${fmt(irrigationGL,3)} г/л.`;
      empty.hidden = true; output.hidden = false;
    });
  }

  initSoilAcidity();
  initLiming();
  initBalance();
  initFertilizer();
  initFertigation();
})();

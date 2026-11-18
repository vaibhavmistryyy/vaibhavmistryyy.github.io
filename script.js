/**
 * VAIBHAV MISTRY // EXECUTIVE PORTFOLIO & TERMINAL ENGINE
 * Pure Vanilla JavaScript • Web Audio API • Canvas Visualizers • CLI Emulation
 */

// ==========================================
// 1. AUDIO FEEDBACK SYNTHESIZER
// ==========================================
let audioCtx = null;
let soundEnabled = false;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playTone(freq = 880, type = 'sine', duration = 0.04, gain = 0.02) {
  if (!soundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(gain, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Audio silently handled
  }
}

// Sound toggle
const soundToggleBtn = document.getElementById('sound-toggle');
if (soundToggleBtn) {
  soundToggleBtn.addEventListener('click', () => {
    initAudio();
    soundEnabled = !soundEnabled;
    soundToggleBtn.innerHTML = soundEnabled 
      ? `<i data-lucide="volume-2" class="w-4 h-4 text-emerald-400"></i><span class="text-xs text-emerald-400 font-mono">AUDIO: ON</span>`
      : `<i data-lucide="volume-x" class="w-4 h-4 text-slate-400"></i><span class="text-xs text-slate-400 font-mono">AUDIO: OFF</span>`;
    lucide.createIcons();
    if (soundEnabled) playTone(900, 'triangle', 0.06, 0.03);
  });
}

// ==========================================
// 2. BACKGROUND NEURAL NODES CANVAS
// ==========================================
const bgCanvas = document.getElementById('neural-bg');
if (bgCanvas) {
  const ctx = bgCanvas.getContext('2d');
  let width, height;
  let particles = [];
  const particleCount = 40;
  let mouse = { x: null, y: null, radius: 100 };

  function resizeCanvas() {
    width = bgCanvas.width = window.innerWidth;
    height = bgCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 1.5 + 1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse repulsion
      if (mouse.x && mouse.y) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          let force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 2.5;
          this.y -= (dy / dist) * force * 2.5;
        }
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      for (let j = i + 1; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(6, 182, 212, ${0.12 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
}

// ==========================================
// 3. BIOSIGNAL (EEG) OSCILLOSCOPE SIMULATOR
// ==========================================
const eegCanvas = document.getElementById('eeg-canvas');
if (eegCanvas) {
  const eegCtx = eegCanvas.getContext('2d');
  let eegStage = 'N2';
  let eegFrequency = 13;
  let eegAmplitude = 24;
  let eegTime = 0;

  const stageDescriptions = {
    'WAKE': { band: 'Beta (15-30 Hz)', desc: 'High frequency, low voltage desynchronized alert EEG', acc: '92.4%' },
    'N1': { band: 'Theta (4-7 Hz)', desc: 'Transition drowsiness with vertex sharp waves', acc: '78.1%' },
    'N2': { band: 'Sleep Spindles (12-14 Hz) & K-Complexes', desc: 'True light sleep with burst spindle activity and biphasic spikes', acc: '88.3%' },
    'N3': { band: 'Delta (0.5-2 Hz)', desc: 'Slow wave deep restorative sleep (>75 uV high amplitude)', acc: '89.7%' },
    'REM': { band: 'Sawtooth & Rapid Eye Movements', desc: 'Paradoxical sleep, muscle atonia (flat EMG), vivid dreaming', acc: '84.6%' }
  };

  function updateStageInfo(stage) {
    eegStage = stage;
    const info = stageDescriptions[stage];
    document.getElementById('eeg-stage-name').innerText = `STAGE: ${stage}`;
    document.getElementById('eeg-band-name').innerText = `BAND: ${info.band}`;
    document.getElementById('eeg-desc').innerText = info.desc;
    document.getElementById('eeg-acc').innerText = `CONFIDENCE: ${info.acc}`;

    if (stage === 'WAKE') { eegFrequency = 22; eegAmplitude = 12; }
    else if (stage === 'N1') { eegFrequency = 6; eegAmplitude = 18; }
    else if (stage === 'N2') { eegFrequency = 13; eegAmplitude = 26; }
    else if (stage === 'N3') { eegFrequency = 1.5; eegAmplitude = 42; }
    else if (stage === 'REM') { eegFrequency = 16; eegAmplitude = 14; }
  }

  document.querySelectorAll('.eeg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.eeg-btn').forEach(b => b.classList.remove('active-eeg'));
      btn.classList.add('active-eeg');
      const stage = btn.getAttribute('data-stage');
      updateStageInfo(stage);
      playTone(520, 'sine', 0.04, 0.03);
    });
  });

  function drawWaveform() {
    const w = eegCanvas.width = eegCanvas.parentElement.clientWidth;
    const h = eegCanvas.height = 110;
    const centerY = h / 2;

    eegCtx.clearRect(0, 0, w, h);

    // Center grid line
    eegCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    eegCtx.lineWidth = 1;
    eegCtx.beginPath();
    eegCtx.moveTo(0, centerY);
    eegCtx.lineTo(w, centerY);
    eegCtx.stroke();

    // Waveform
    eegCtx.strokeStyle = '#06b6d4';
    eegCtx.lineWidth = 1.8;
    eegCtx.shadowColor = '#06b6d4';
    eegCtx.shadowBlur = 8;
    eegCtx.beginPath();

    for (let x = 0; x < w; x++) {
      let t = (x + eegTime) * 0.04;
      let y = centerY;

      if (eegStage === 'N2') {
        let spindle = Math.sin(t * eegFrequency) * eegAmplitude * (0.5 + 0.5 * Math.sin(t * 0.3));
        let kComplex = Math.sin(t * 0.2) > 0.85 ? Math.sin(t * 3) * 32 : 0;
        y += spindle + kComplex;
      } else if (eegStage === 'N3') {
        y += Math.sin(t * eegFrequency) * eegAmplitude + Math.sin(t * 0.8) * 14;
      } else {
        y += Math.sin(t * eegFrequency) * eegAmplitude + (Math.sin(t * 5.3) * 3);
      }

      if (x === 0) eegCtx.moveTo(x, y);
      else eegCtx.lineTo(x, y);
    }
    eegCtx.stroke();
    eegCtx.shadowBlur = 0;

    eegTime += 2;
    requestAnimationFrame(drawWaveform);
  }
  drawWaveform();
}

// ==========================================
// 4. PROFESSIONAL CLI TERMINAL ENGINE
// ==========================================
const terminalBody = document.getElementById('terminal-body');
const terminalInput = document.getElementById('terminal-input');

const CLI_COMMANDS = {
  help: () => `
<span class="text-cyan-400 font-bold">AVAILABLE PROTOCOLS:</span>
  <span class="text-emerald-400 font-mono">projects</span>      - Inspect the 4 flagship engineering repositories with technical summaries
  <span class="text-emerald-400 font-mono">skills</span>        - Technical radar: Big Data, Machine Learning, and Web Architecture
  <span class="text-emerald-400 font-mono">architecture</span>  - ASCII diagram of the distributed Big Data ETL pipeline
  <span class="text-emerald-400 font-mono">benchmarks</span>    - Performance metrics (Spark ingestion throughput, DL accuracy, ROC-AUC)
  <span class="text-emerald-400 font-mono">education</span>     - Academic background & engineering credentials
  <span class="text-emerald-400 font-mono">whoami</span>        - Professional profile & executive summary
  <span class="text-emerald-400 font-mono">contact</span>       - Communication protocols & direct links
  <span class="text-emerald-400 font-mono">clear</span>         - Purge the terminal display
`,
  projects: () => `
<span class="text-cyan-400 font-bold">📁 FLAGSHIP ENGINEERING REPOSITORIES:</span>

[01] <a href="https://github.com/vaibhavmistryyy/workplace-mental-health-big-data" target="_blank" class="text-emerald-400 underline font-bold">workplace-mental-health-big-data</a>
     • <strong>Domain:</strong> Big Data Engineering & Predictive Analytics
     • <strong>Tech Stack:</strong> Hadoop HDFS, Apache Hive, Apache Spark, PySpark MLlib
     • <strong>Core Metrics:</strong> Multi-tier HDFS staging, Hive governance auditing, Spark MLlib GBT (ROC-AUC 0.81).

[02] <a href="https://github.com/vaibhavmistryyy/sleep-stage-classification" target="_blank" class="text-emerald-400 underline font-bold">sleep-stage-classification</a>
     • <strong>Domain:</strong> Deep Learning & Biosignal Processing
     • <strong>Tech Stack:</strong> TensorFlow, 1D-CNN + BiLSTM, MNE-Python, Polysomnography
     • <strong>Core Metrics:</strong> 84.6% Test Accuracy, 0.82 Cohen's Kappa matching clinical PSG staging.

[03] <a href="https://github.com/vaibhavmistryyy/TradeFinanceGuaranteeSystem" target="_blank" class="text-emerald-400 underline font-bold">TradeFinanceGuaranteeSystem</a>
     • <strong>Domain:</strong> Enterprise Web Application & Financial Systems
     • <strong>Tech Stack:</strong> Laravel 11, PHP 8.2+, Tailwind CSS, MySQL, Vite
     • <strong>Core Architecture:</strong> Decoupled Service Layer (GuaranteeService), bulk batch CSV ingestion, Breeze Auth.

[04] <a href="https://github.com/vaibhavmistryyy/vaibhav-trinity-restaurant" target="_blank" class="text-emerald-400 underline font-bold">vaibhav-trinity-restaurant</a>
     • <strong>Domain:</strong> Modern Front-End Web Architecture
     • <strong>Tech Stack:</strong> JavaScript (ES6+), jQuery, Swiper.js, HTML5/CSS3
     • <strong>Performance:</strong> Responsive single-page web app, interactive meal filtering, 98+ Lighthouse score.
`,
  skills: () => `
<span class="text-cyan-400 font-bold">🛠️ TECHNICAL COMPETENCIES & RADAR:</span>

  <span class="text-amber-400 font-bold">[BIG DATA & DISTRIBUTED SYSTEMS]</span>
  ├── Apache Spark / PySpark    [████████████████░░] 88%
  ├── Hadoop HDFS & Apache Hive [█████████████████░] 90%
  ├── Distributed SQL & ETL     [██████████████████] 95%
  └── Spark MLlib Pipelines     [███████████████░░░] 85%

  <span class="text-purple-400 font-bold">[MACHINE LEARNING & DEEP LEARNING]</span>
  ├── TensorFlow & Keras        [████████████████░░] 88%
  ├── 1D-CNN + BiLSTM Sequences [█████████████████░] 92%
  ├── Biosignals & MNE-Python   [███████████████░░░] 86%
  └── Scikit-Learn / Pandas     [██████████████████] 94%

  <span class="text-emerald-400 font-bold">[ENTERPRISE FULL-STACK & WEB]</span>
  ├── PHP & Laravel Architecture[████████████████░░] 87%
  ├── JavaScript (ES6+) / Vite  [█████████████████░] 91%
  ├── Tailwind CSS & Responsive [██████████████████] 96%
  └── MySQL & Relational Design [████████████████░░] 89%
`,
  architecture: () => `
<span class="text-cyan-400 font-bold">🏛️ DISTRIBUTED DATA & ML PIPELINE:</span>
<pre class="text-slate-300 font-mono text-xs">
[ Raw Ingestion ] ──────> [ Hadoop HDFS ] ──────> [ Apache Hive ]
   (Survey Data)             (Cluster Store)         (Schema & Audit)
                                                            │
                                                            ▼
[ Executive Dashboard ] <─ [ Spark MLlib GBT ] <─ [ Apache Spark SQL ]
   (Risk Analytics)           (Trained Model)        (Feature Vectors)
</pre>
`,
  benchmarks: () => `
<span class="text-cyan-400 font-bold">📊 PRODUCTION BENCHMARKS:</span>
  • Spark SQL Processing Throughput:  42,000 records/sec
  • Mental Health Classifier ROC-AUC: 0.812 (Gradient-Boosted Trees)
  • Sleep Stage DL Validation Acc:    84.6% (5 Clinical Stages)
  • Sleep Stage Cohen's Kappa:        0.82 (High Inter-Rater Reliability)
  • Trade Finance API Response:       48ms (Optimized Eloquent Queries)
  • Lighthouse Front-End Web Score:   98/100
`,
  education: () => `
<span class="text-cyan-400 font-bold">🎓 EDUCATION & BACKGROUND:</span>
  • Specialized Post-Graduate Studies in Big Data Analytics & Software Engineering
  • Technical Focus: Distributed Systems, Deep Learning, Biomedical Signals, Enterprise Web Platforms
  • Location: Toronto, Ontario, Canada
`,
  whoami: () => `
<span class="text-emerald-400 font-bold">NAME:</span> Vaibhav Mistry
<span class="text-emerald-400 font-bold">ROLE:</span> Big Data Engineer & Machine Learning Specialist | Full-Stack Developer
<span class="text-emerald-400 font-bold">FOCUS:</span> Designing resilient distributed data architectures, neural sequence classifiers, and enterprise systems.
<span class="text-emerald-400 font-bold">LOCATION:</span> Toronto, Ontario, Canada
<span class="text-emerald-400 font-bold">STATUS:</span> <span class="text-emerald-400 font-bold">Available for High-Impact Full-Time Engineering Roles</span>
`,
  contact: () => `
<span class="text-cyan-400 font-bold">📡 DIRECT TRANSMISSION CHANNELS:</span>
  • GitHub:    <a href="https://github.com/vaibhavmistryyy" target="_blank" class="text-cyan-400 underline">github.com/vaibhavmistryyy</a>
  • Portfolio: <a href="https://vaibhavmistryyy.github.io" target="_blank" class="text-cyan-400 underline">vaibhavmistryyy.github.io</a>
  • Email:     <a href="mailto:vaibhavmistry57@gmail.com" class="text-emerald-400 underline">vaibhavmistry57@gmail.com</a>
  • Location:  Toronto, Ontario, Canada
`,
  clear: () => {
    terminalBody.innerHTML = '';
    return '';
  }
};

let cmdHistory = [];
let historyIndex = -1;

function handleCommand(cmdStr) {
  const cleanCmd = cmdStr.trim().toLowerCase();
  playTone(850, 'sine', 0.03, 0.02);

  const userLine = document.createElement('div');
  userLine.className = 'mb-1';
  userLine.innerHTML = `<span class="text-emerald-400 font-mono">guest@vaibhav-system:~$</span> <span class="text-slate-100 font-mono">${escapeHtml(cmdStr)}</span>`;
  terminalBody.appendChild(userLine);

  if (cleanCmd) {
    cmdHistory.push(cleanCmd);
    historyIndex = cmdHistory.length;

    const outLine = document.createElement('div');
    outLine.className = 'mb-3 font-mono text-sm leading-relaxed';

    if (CLI_COMMANDS[cleanCmd]) {
      const output = CLI_COMMANDS[cleanCmd]();
      if (cleanCmd !== 'clear') {
        outLine.innerHTML = output;
        terminalBody.appendChild(outLine);
      }
    } else {
      outLine.innerHTML = `<span class="text-rose-400">Command not recognized: "${escapeHtml(cleanCmd)}". Type <span class="text-cyan-400 underline cursor-pointer" onclick="runPreset('help')">help</span> for available commands.</span>`;
      terminalBody.appendChild(outLine);
    }
  }

  terminalBody.scrollTop = terminalBody.scrollHeight;
}

if (terminalInput) {
  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = terminalInput.value;
      terminalInput.value = '';
      handleCommand(cmd);
    } else if (e.key === 'ArrowUp') {
      if (historyIndex > 0) {
        historyIndex--;
        terminalInput.value = cmdHistory[historyIndex] || '';
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex < cmdHistory.length - 1) {
        historyIndex++;
        terminalInput.value = cmdHistory[historyIndex] || '';
      } else {
        historyIndex = cmdHistory.length;
        terminalInput.value = '';
      }
    }
  });
}

function runPreset(cmd) {
  if (terminalInput) {
    terminalInput.value = cmd;
    handleCommand(cmd);
    terminalInput.value = '';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}

// ==========================================
// 5. PROJECT FILTER ENGINE
// ==========================================
const filterPills = document.querySelectorAll('.filter-pill');
const projectCards = document.querySelectorAll('.project-card');

filterPills.forEach(pill => {
  pill.addEventListener('click', () => {
    filterPills.forEach(p => p.classList.remove('active-filter'));
    pill.classList.add('active-filter');
    const category = pill.getAttribute('data-filter');
    playTone(600, 'sine', 0.04, 0.03);

    projectCards.forEach(card => {
      const cardCat = card.getAttribute('data-category');
      if (category === 'all' || cardCat.includes(category)) {
        card.style.display = 'flex';
        card.style.opacity = '0';
        setTimeout(() => card.style.opacity = '1', 50);
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// ==========================================
// 6. PROJECT MODAL / DRAWER
// ==========================================
const projectModals = {
  'big-data': {
    title: 'Workplace Mental Health Big Data Analytics',
    badge: 'HADOOP // SPARK // HIVE',
    img: 'assets/architecture_pipeline.svg',
    summary: 'A distributed data engineering pipeline and machine learning workflow built to process workplace mental health survey data at scale.',
    details: [
      '<strong>Multi-Tier HDFS Ingestion:</strong> Ingests raw surveys into Hadoop HDFS with structured directory partitioning.',
      '<strong>Apache Hive Auditing:</strong> Schema-on-read DDL tables with automated NULL validation, consistency auditing, and demographic distribution queries.',
      '<strong>Apache Spark & PySpark MLlib:</strong> VectorAssembler feature pipeline, StringIndexer encoding, and cross-validated Gradient-Boosted Trees (ROC-AUC 0.81).',
      '<strong>Business Impact:</strong> Identifies workplace friction points (work interference, remote flexibility, mental health benefit clarity) to guide enterprise wellness interventions.'
    ],
    github: 'https://github.com/vaibhavmistryyy/workplace-mental-health-big-data'
  },
  'sleep-stage': {
    title: 'Automated Sleep Stage Classification from Biosignals',
    badge: 'TENSORFLOW // 1D-CNN // BiLSTM',
    img: 'assets/epoch_signals_eeg_eog_emg.png',
    summary: 'Deep neural network architecture capable of classifying multi-channel Polysomnography (EEG, EOG, EMG) into 5 clinical stages (Wake, N1, N2, N3, REM).',
    details: [
      '<strong>Biosignal Preprocessing:</strong> 100 Hz bandpass filtering, notch filtering for 50/60Hz AC noise, artifact removal via MNE-Python.',
      '<strong>Spatial 1D-CNN Branch:</strong> Multi-kernel 1D convolution extracting localized waveform characteristics (sleep spindles, K-complexes, delta waves).',
      '<strong>Temporal Bidirectional LSTM:</strong> Models sequential sleep cycle transitions forward and backward across time.',
      '<strong>Metrics:</strong> 84.6% overall accuracy, 0.82 Cohen’s Kappa coefficient matching human polysomnographic scoring standards.'
    ],
    github: 'https://github.com/vaibhavmistryyy/sleep-stage-classification'
  },
  'trade-finance': {
    title: 'Enterprise Trade Finance Guarantee Management System',
    badge: 'LARAVEL 11 // TAILWIND // MYSQL',
    img: null,
    summary: 'A robust corporate banking platform for issuing, amending, tracking, and validating international trade finance guarantees.',
    details: [
      '<strong>Service-Oriented Architecture:</strong> Strict separation of concerns via <code>GuaranteeService</code> layer for maintainability and testability.',
      '<strong>Bulk CSV Batch Ingestion:</strong> High-throughput file upload controller processing batches of corporate guarantee issuances.',
      '<strong>Security & Verification:</strong> Email verification, Laravel Breeze session auth, CSRF token mitigation, and parameter-bound Eloquent ORM queries.',
      '<strong>Full Auditability:</strong> Timestamped corporate transaction references with nominal currency formatting and expiry alerts.'
    ],
    github: 'https://github.com/vaibhavmistryyy/TradeFinanceGuaranteeSystem'
  },
  'trinity-restaurant': {
    title: 'Trinity Fine Dining & Lounge Web Experience',
    badge: 'JAVASCRIPT // JQUERY // SWIPER.JS',
    img: null,
    summary: 'A highly responsive, interactive single-page restaurant web application showcasing fine dining menus, dynamic dish filters, and reservation interfaces.',
    details: [
      '<strong>Dynamic Menu Filtering:</strong> Client-side category switching and instant price/dietary filtering.',
      '<strong>Touch-Enabled Sliders:</strong> Seamless image carousels and chef special showcases powered by Swiper.js.',
      '<strong>Interactive Reservation Modal:</strong> Form validation for guest headcount, time slots, and table preferences.',
      '<strong>Performance:</strong> Lightweight, zero-framework dependency front-end delivering 98+ Google Lighthouse scores.'
    ],
    github: 'https://github.com/vaibhavmistryyy/vaibhav-trinity-restaurant'
  }
};

const modal = document.getElementById('project-modal');
const modalContent = document.getElementById('modal-inner-content');

function openProjectModal(key) {
  const p = projectModals[key];
  if (!p) return;
  playTone(950, 'triangle', 0.05, 0.03);

  let imgHtml = p.img 
    ? `<div class="mb-4 rounded-lg overflow-hidden border border-cyan-500/30 bg-slate-950 p-2 text-center">
         <img src="${p.img}" alt="${p.title}" class="max-h-64 mx-auto rounded object-contain" />
       </div>`
    : '';

  let listHtml = p.details.map(d => `<li class="mb-2 text-slate-300 text-sm leading-relaxed">${d}</li>`).join('');

  modalContent.innerHTML = `
    <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
      <div>
        <span class="text-xs font-mono text-cyan-400 uppercase tracking-widest">[ ${p.badge} ]</span>
        <h3 class="text-xl font-bold text-white mt-1">${p.title}</h3>
      </div>
      <button onclick="closeProjectModal()" class="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800">
        <i data-lucide="x" class="w-6 h-6"></i>
      </button>
    </div>
    ${imgHtml}
    <p class="text-slate-300 text-sm mb-4 leading-relaxed">${p.summary}</p>
    <div class="mb-6 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
      <h4 class="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2 font-bold">// ARCHITECTURAL SPECIFICATIONS:</h4>
      <ul class="list-disc pl-5 space-y-1">
        ${listHtml}
      </ul>
    </div>
    <div class="flex justify-end gap-3 pt-3 border-t border-slate-800">
      <button onclick="closeProjectModal()" class="px-4 py-2 text-sm text-slate-400 hover:text-white font-mono">CLOSE</button>
      <a href="${p.github}" target="_blank" class="px-5 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 rounded-lg text-sm font-mono flex items-center gap-2">
        <span>VIEW REPOSITORY</span>
        <i data-lucide="external-link" class="w-4 h-4"></i>
      </a>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  lucide.createIcons();
}

function closeProjectModal() {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  playTone(400, 'sine', 0.04, 0.02);
}

if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeProjectModal();
  });
}

// ==========================================
// 7. TELEMETRY UPTIME COUNTER
// ==========================================
let startTime = Date.now();
const uptimeEl = document.getElementById('uptime-counter');
if (uptimeEl) {
  setInterval(() => {
    let diff = Math.floor((Date.now() - startTime) / 1000);
    let hrs = String(Math.floor(diff / 3600)).padStart(2, '0');
    let mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    let secs = String(diff % 60).padStart(2, '0');
    uptimeEl.innerText = `${hrs}:${mins}:${secs}`;
  }, 1000);
}

// Copy contact email
function copyEmail(email) {
  navigator.clipboard.writeText(email).then(() => {
    playTone(1050, 'sine', 0.06, 0.04);
    const toast = document.getElementById('copy-toast');
    if (toast) {
      toast.classList.remove('translate-y-20', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
      }, 2500);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
});

/**
 * Zenith Rai - Digital Cyber-Matrix Portfolio
 * Interactive motions, canvas particle network, text decoder, 
 * scroll-driven timeline, TU coursework explorer, and audio synthesis.
 */

// Pure function extracted for testing
function filterCourses(courseworkData, currentActiveSem, query) {
  return courseworkData.filter(course => {
    const matchesSem = currentActiveSem === 'all' || course.sem === parseInt(currentActiveSem);
    const matchesQuery = !query ||
      course.title.toLowerCase().includes(query) ||
      course.code.toLowerCase().includes(query) ||
      course.category.toLowerCase().includes(query);
    return matchesSem && matchesQuery;
  });
}

// Export for testing in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { filterCourses };
}

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. WEB AUDIO API SYNTHESIZER (Cyber SFX)
  // =========================================================================
  let audioCtx = null;
  let soundEnabled = false;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playCyberBeep(freq1 = 800, freq2 = 1200, duration = 0.05, type = 'sine') {
    if (!soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq1, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq2, audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  function playCyberClick() {
    playCyberBeep(600, 200, 0.04, 'triangle');
  }

  // Sound Toggle Control
  const soundToggle = document.getElementById('sound-toggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      initAudio();
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        soundToggle.classList.add('sound-on');
        soundToggle.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>AUDIO: ON</span>';
        playCyberBeep(440, 880, 0.08);
      } else {
        soundToggle.classList.remove('sound-on');
        soundToggle.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> <span>AUDIO: OFF</span>';
      }
    });
  }

  // Attach hover sounds to interactive elements
  document.querySelectorAll('a, button, .sem-tab-btn, .course-card, .cyber-card').forEach(el => {
    el.addEventListener('mouseenter', () => playCyberBeep(900, 1100, 0.03));
    el.addEventListener('click', () => playCyberClick());
  });


  // =========================================================================
  // 2. CUSTOM CYBER CURSOR (Smooth Lerp + Particle trails)
  // =========================================================================
  const cursorDot = document.querySelector('.custom-cursor-dot');
  const cursorRing = document.querySelector('.custom-cursor-ring');

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;

  if (cursorDot && cursorRing && window.innerWidth > 768) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    function animateCursor() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.querySelectorAll('a, button, input, textarea, .cursor-target').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }


  // =========================================================================
  // 3. INTERACTIVE HTML5 CANVAS (Matrix Constellation & Digital Stream)
  // =========================================================================
  const canvas = document.getElementById('cyber-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    });

    const particles = [];
    const packetStream = [];
    const numParticles = Math.min(Math.floor((width * height) / 14000), 75);
    const codeTokens = ['01', '10', 'AI_VEC', 'TENSOR', 'RAG', 'FAST_API', 'PYTORCH', '0x9F', 'POSTGRES', 'DOCKER'];

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 2 + 1;
        this.color = Math.random() > 0.3 ? 'rgba(0, 245, 255, ' : 'rgba(139, 92, 246, ';
        this.alpha = Math.random() * 0.5 + 0.2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap edges
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Mouse gravity influence
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          this.x += (dx / dist) * force * 0.8;
          this.y += (dy / dist) * force * 0.8;
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.alpha + ')';
        ctx.shadowColor = this.color + '0.8)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    class DataPacket {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 50;
        this.speed = Math.random() * 1.2 + 0.5;
        this.text = codeTokens[Math.floor(Math.random() * codeTokens.length)];
        this.opacity = Math.random() * 0.3 + 0.1;
        this.size = Math.floor(Math.random() * 3 + 10);
      }
      update() {
        this.y -= this.speed;
        if (this.y < -30) {
          this.reset();
        }
      }
      draw() {
        ctx.font = `${this.size}px "JetBrains Mono", monospace`;
        ctx.fillStyle = `rgba(0, 245, 255, ${this.opacity})`;
        ctx.fillText(this.text, this.x, this.y);
      }
    }

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
      packetStream.length = 0;
      for (let j = 0; j < 12; j++) {
        packetStream.push(new DataPacket());
      }
    }
    initParticles();

    function renderCanvas() {
      ctx.clearRect(0, 0, width, height);

      // Render floating binary packets
      for (let p of packetStream) {
        p.update();
        p.draw();
      }

      // Render constellation nodes and interconnects
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const lineAlpha = (1 - dist / 130) * 0.22;
            ctx.strokeStyle = `rgba(0, 245, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(renderCanvas);
    }
    renderCanvas();
  }


  // =========================================================================
  // 4. CYBER TEXT DECODER / SCRAMBLER EFFECT
  // =========================================================================
  const scrambleChars = '01#$%/&<>[]*!?_XYZ~';
  function scrambleText(element) {
    const originalText = element.getAttribute('data-original-text') || element.textContent;
    element.setAttribute('data-original-text', originalText);
    let iteration = 0;
    const maxIterations = originalText.length * 2.5;

    clearInterval(element.scrambleInterval);
    element.scrambleInterval = setInterval(() => {
      element.textContent = originalText
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (index < iteration / 2.5) {
            return originalText[index];
          }
          return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        })
        .join('');

      if (iteration >= maxIterations) {
        element.textContent = originalText;
        clearInterval(element.scrambleInterval);
      }
      iteration++;
    }, 28);
  }

  const scrambleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        scrambleText(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.cyber-scramble').forEach(el => scrambleObserver.observe(el));


  // =========================================================================
  // 5. LIVE TYPING ROLE CHANGER (Hero Section)
  // =========================================================================
  const typingRoleSpan = document.getElementById('hero-typing-role');
  if (typingRoleSpan) {
    const roles = [
      "Junior Software Developer",
      "AI & Machine Learning Engineer",
      "Generative AI & RAG Specialist",
      "Backend Engineer (FastAPI & PostgreSQL)"
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 90;

    function handleRoleTyping() {
      const currentRole = roles[roleIndex];

      if (isDeleting) {
        typingRoleSpan.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 40;
      } else {
        typingRoleSpan.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 90;
      }

      if (!isDeleting && charIndex === currentRole.length) {
        isDeleting = true;
        typingSpeed = 2200; // Pause at full word
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 450;
      }

      setTimeout(handleRoleTyping, typingSpeed);
    }
    setTimeout(handleRoleTyping, 1200);
  }


  // =========================================================================
  // 6. LIVE ABOUT ME TERMINAL STREAMING
  // =========================================================================
  const terminalTextContainer = document.getElementById('terminal-live-bio');
  if (terminalTextContainer) {
    const bioLines = [
      "> zenith.init_profile(target='Junior Software Developer')",
      "> Loading background...",
      "> Education: BSc. CSIT at Tribhuvan University (Expected Dec 2026).",
      "> Core Specialties: Machine Learning, Deep Learning, RAG, and FastAPI Backends.",
      "> Architect of high-throughput REST APIs, hybrid vector search (BM25 + Dense), and CNN diagnostic models.",
      "> Mission: Building scalable backend infrastructure and robust AI/ML systems that solve real-world problems.",
      "> Status: [AVAILABLE FOR INTERNSHIP & JUNIOR SOFTWARE ENGINEERING ROLES]"
    ];

    let lineIdx = 0;
    let charIdx = 0;
    let bioStarted = false;

    function typeTerminal() {
      if (lineIdx < bioLines.length) {
        const currentLine = bioLines[lineIdx];
        if (charIdx === 0) {
          const p = document.createElement('div');
          p.className = lineIdx === 0 || lineIdx === bioLines.length - 1 ? 'text-cyan-400 font-semibold mb-1' : 'text-slate-300 mb-1';
          p.id = `term-line-${lineIdx}`;
          terminalTextContainer.appendChild(p);
        }

        const activeLineEl = document.getElementById(`term-line-${lineIdx}`);
        activeLineEl.textContent = currentLine.substring(0, charIdx + 1);
        charIdx++;

        if (charIdx <= currentLine.length) {
          setTimeout(typeTerminal, 18);
        } else {
          charIdx = 0;
          lineIdx++;
          setTimeout(typeTerminal, 250);
        }
      } else {
        // Complete cursor blink
        const cur = document.createElement('span');
        cur.className = 'terminal-cursor';
        terminalTextContainer.appendChild(cur);
      }
    }

    const termObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !bioStarted) {
          bioStarted = true;
          setTimeout(typeTerminal, 400);
        }
      });
    }, { threshold: 0.2 });

    const termWindow = document.querySelector('.terminal-window');
    if (termWindow) termObserver.observe(termWindow);
  }


  // =========================================================================
  // 7. SCROLL-DRIVEN EDUCATION HISTORY TIMELINE
  // =========================================================================
  const timelineContainer = document.querySelector('.timeline-container');
  const spineProgress = document.querySelector('.timeline-spine-progress');
  const timelineNodes = document.querySelectorAll('.timeline-node');

  function updateTimelineProgress() {
    if (!timelineContainer || !spineProgress) return;

    const rect = timelineContainer.getBoundingClientRect();
    const windowH = window.innerHeight;
    const startY = rect.top;
    const totalH = rect.height;

    // Calculate percentage through container
    let scrollFraction = (windowH * 0.7 - startY) / totalH;
    scrollFraction = Math.max(0, Math.min(1, scrollFraction));

    spineProgress.style.height = `${scrollFraction * 100}%`;

    // Activate individual nodes
    timelineNodes.forEach((node) => {
      const nodeRect = node.getBoundingClientRect();
      if (nodeRect.top < windowH * 0.75) {
        if (!node.classList.contains('active-node')) {
          node.classList.add('active-node');
          playCyberBeep(520, 840, 0.06);
        }
      }
    });
  }

  window.addEventListener('scroll', updateTimelineProgress, { passive: true });
  updateTimelineProgress();


  // =========================================================================
  // 8. TRIBHUVAN UNIVERSITY COURSEWORK (SEM 1 TO SEM 8 DATA MATRIX)
  // =========================================================================
  const courseworkData = [
    // Semester 1
    { sem: 1, code: "CSC109", title: "Introduction to Information Technology", credits: 3, category: "Core IT", desc: "Fundamental computing concepts, hardware architecture, operating systems, and digital foundations." },
    { sem: 1, code: "CSC110", title: "C Programming", credits: 3, category: "Programming", desc: "Structured problem solving, memory pointers, dynamic allocation, structures, and file I/O in C." },
    { sem: 1, code: "CSC111", title: "Digital Logic", credits: 3, category: "Hardware", desc: "Boolean algebra, combinational circuits, flip-flops, registers, counters, and digital circuit design." },
    { sem: 1, code: "MTH112", title: "Mathematics I (Calculus)", credits: 3, category: "Mathematics", desc: "Functions, limits, differential calculus, integral calculus, and multivariable applications." },
    { sem: 1, code: "PHY113", title: "Physics", credits: 3, category: "Science", desc: "Electromagnetism, semiconductors, optics, quantum theory, and solid-state device principles." },

    // Semester 2
    { sem: 2, code: "CSC160", title: "Discrete Structure", credits: 3, category: "Mathematics", desc: "Set theory, graph theory, propositional logic, trees, relations, and combinatorics for computation." },
    { sem: 2, code: "CSC161", title: "Object-Oriented Programming (C++)", credits: 3, category: "Programming", desc: "Encapsulation, inheritance, polymorphism, templates, operator overloading, and STL in C++." },
    { sem: 2, code: "CSC162", title: "Microprocessor", credits: 3, category: "Hardware", desc: "8085/8086 microprocessors, assembly language, memory interfacing, and I/O peripheral controllers." },
    { sem: 2, code: "MTH163", title: "Mathematics II (Linear Algebra)", credits: 3, category: "Mathematics", desc: "Matrices, vectors, eigenvalues, linear transformations, and systems of linear equations." },
    { sem: 2, code: "STA164", title: "Statistics I", credits: 3, category: "Mathematics", desc: "Descriptive statistics, probability theory, random variables, and probability distributions." },

    // Semester 3
    { sem: 3, code: "CSC206", title: "Data Structures and Algorithms (DSA)", credits: 3, category: "Core CS", desc: "Stacks, queues, linked lists, trees, graphs, sorting algorithms, hashing, and complexity analysis." },
    { sem: 3, code: "CSC207", title: "Numerical Method", credits: 3, category: "Mathematics", desc: "Numerical root finding, polynomial interpolation, numerical differentiation, integration, and ODEs." },
    { sem: 3, code: "CSC208", title: "Computer Architecture", credits: 3, category: "Hardware", desc: "Instruction cycle, ALU, memory hierarchy, cache design, pipelining, and RISC/CISC architecture." },
    { sem: 3, code: "CSC209", title: "Computer Graphics", credits: 3, category: "Core CS", desc: "Rasterization, Bresenham algorithms, 2D/3D transformations, projections, and illumination models." },
    { sem: 3, code: "STA210", title: "Statistics II", credits: 3, category: "Mathematics", desc: "Sampling theory, hypothesis testing, ANOVA, linear regression analysis, and chi-square tests." },

    // Semester 4
    { sem: 4, code: "CSC257", title: "Theory of Computation", credits: 3, category: "Core CS", desc: "Deterministic & non-deterministic automata (DFA/NFA), regular grammars, PDA, Turing machines, and NP-completeness." },
    { sem: 4, code: "CSC258", title: "Computer Networks", credits: 3, category: "Systems", desc: "OSI/TCP-IP models, subnetting, routing protocols (OSPF, BGP), transport layer (TCP/UDP), and DNS." },
    { sem: 4, code: "CSC259", title: "Operating Systems", credits: 3, category: "Systems", desc: "Process scheduling, thread synchronization, deadlocks, virtual memory management, and paging." },
    { sem: 4, code: "CSC260", title: "Database Management System (DBMS)", credits: 3, category: "Data", desc: "Relational algebra, SQL, normalization (1NF-BCNF), ACID transactions, indexing, and recovery." },
    { sem: 4, code: "CSC261", title: "Artificial Intelligence (AI)", credits: 3, category: "AI/ML", desc: "Heuristic search (A*, Minimax), knowledge representation, expert systems, neural nets, and NLP basics." },

    // Semester 5
    { sem: 5, code: "CSC314", title: "Design and Analysis of Algorithms (DAA)", credits: 3, category: "Core CS", desc: "Divide-and-conquer, greedy heuristics, dynamic programming, network flow, and complexity classes." },
    { sem: 5, code: "CSC315", title: "System Analysis and Design", credits: 3, category: "Software", desc: "SDLC methodologies, agile development, UML modeling, sequence diagrams, and requirements analysis." },
    { sem: 5, code: "CSC316", title: "Cryptography", credits: 3, category: "Security", desc: "Symmetric ciphers (AES, DES), RSA public key cryptography, SHA hashing, and zero-knowledge protocols." },
    { sem: 5, code: "CSC317", title: "Simulation and Modeling", credits: 3, category: "Systems", desc: "Continuous & discrete systems, Monte Carlo methods, Poisson processes, and model verification." },
    { sem: 5, code: "CSC318", title: "Web Technology", credits: 3, category: "Web", desc: "Modern full-stack architecture, HTTP protocols, asynchronous client-server APIs, DOM, and web standards." },
    { sem: 5, code: "CSC319", title: "Elective I (Image Processing)", credits: 3, category: "AI/Vision", desc: "Digital image transforms, spatial filtering, edge detection, segmentation, and feature extraction." },

    // Semester 6
    { sem: 6, code: "CSC364", title: "Software Engineering", credits: 3, category: "Software", desc: "Architectural patterns, CI/CD pipelines, automated testing, quality assurance, and project estimation." },
    { sem: 6, code: "CSC365", title: "Compiler Design and Construction", credits: 3, category: "Core CS", desc: "Lexical analysis (Lex), parsing (Yacc/Bison), syntax-directed translation, symbol tables, and code optimization." },
    { sem: 6, code: "CSC366", title: "E-Governance", credits: 3, category: "Applied", desc: "Digital public infrastructure, e-governance maturity models, cybersecurity policy, and identity management." },
    { sem: 6, code: "CSC367", title: "NET Centric Computing", credits: 3, category: "Software", desc: "C#, .NET runtime environment, asynchronous programming, ASP.NET Web APIs, and Entity Framework." },
    { sem: 6, code: "CSC368", title: "Technical Writing", credits: 3, category: "Professional", desc: "Engineering reports, research methodology, scientific documentation, and professional communication." },
    { sem: 6, code: "CSC369", title: "Elective II (Applied Logic)", credits: 3, category: "Core CS", desc: "First-order logic, modal logics, automated theorem proving, and formal hardware/software verification." },

    // Semester 7
    { sem: 7, code: "CSC409", title: "Advanced Java Programming", credits: 3, category: "Programming", desc: "Java Enterprise APIs, concurrent multi-threading, Spring Framework, servlets, and distributed sockets." },
    { sem: 7, code: "CSC410", title: "Data Warehousing and Data Mining", credits: 3, category: "Data", desc: "ETL pipelines, star schemas, OLAP cubes, association rule mining (Apriori), and cluster analysis." },
    { sem: 7, code: "MGT411", title: "Principles of Management", credits: 3, category: "Management", desc: "Organizational behavior, strategic planning, team leadership, risk assessment, and tech business management." },
    { sem: 7, code: "CSC412", title: "Project Work", credits: 3, category: "Project", desc: "Comprehensive engineering capstone project: system architecture, sprint execution, and defense." },
    { sem: 7, code: "CSC413", title: "Elective III (Network Security)", credits: 3, category: "Security", desc: "Firewalls, IDS/IPS, TLS/SSL protocols, network forensics, threat modeling, and ethical hacking." },

    // Semester 8
    { sem: 8, code: "CSC461", title: "Advanced Database", credits: 3, category: "Data", desc: "Distributed databases, NoSQL engines, query optimization, transaction concurrency, and object-oriented DBs." },
    { sem: 8, code: "CSC462", title: "Internship", credits: 6, category: "Industry", desc: "Full-time professional industry internship solving production software engineering and AI problems." },
    { sem: 8, code: "CSC463", title: "Elective IV (Cloud Computing)", credits: 3, category: "Systems", desc: "Virtualization, cloud architectures (AWS/GCP), microservices, container orchestration, and serverless." },
    { sem: 8, code: "CSC464", title: "Elective V (Deep Learning)", credits: 3, category: "AI/ML", desc: "Backpropagation, CNN architectures, Recurrent Networks, Attention mechanisms, and Transformers." }
  ];

  const courseContainer = document.getElementById('coursework-grid');
  const searchInput = document.getElementById('course-search-input');
  const semTabs = document.querySelectorAll('.sem-tab-btn');
  let currentActiveSem = 'all';

  function renderCourses() {
    if (!courseContainer) return;
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = filterCourses(courseworkData, currentActiveSem, query);

    courseContainer.innerHTML = '';

    if (filtered.length === 0) {
      courseContainer.innerHTML = `
        <div class="col-span-full text-center py-12 text-slate-500 font-mono">
          <i class="fa-solid fa-microchip text-3xl mb-3 text-cyan-500/40"></i>
          <p>NO COURSES MATCHING QUERY [${query.toUpperCase()}]</p>
        </div>
      `;
      return;
    }

    filtered.forEach((course) => {
      const card = document.createElement('div');
      card.className = 'course-card';

      let catBadgeColor = 'badge-tech';
      if (course.category.includes('AI') || course.category.includes('ML')) catBadgeColor = 'badge-purple';
      else if (course.category.includes('Security') || course.category.includes('Data')) catBadgeColor = 'badge-green';

      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              ${course.code}
            </span>
            <span class="text-xs font-mono text-slate-400">
              SEM ${course.sem} • ${course.credits} CR
            </span>
          </div>
          <h4 class="font-bold text-slate-100 text-base mb-2 group-hover:text-cyan-300 transition-colors">
            ${course.title}
          </h4>
          <p class="text-xs text-slate-400 leading-relaxed mb-4">
            ${course.desc}
          </p>
        </div>
        <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span class="badge-tech ${catBadgeColor}">
            <i class="fa-solid fa-tag text-[10px]"></i> ${course.category}
          </span>
          <span class="text-[11px] text-slate-500 font-mono">TU IOST</span>
        </div>
      `;
      courseContainer.appendChild(card);
    });
  }

  // Handle Tab Click
  semTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      semTabs.forEach(t => t.classList.remove('active-tab'));
      tab.classList.add('active-tab');
      currentActiveSem = tab.getAttribute('data-sem');
      renderCourses();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderCourses();
    });
  }

  renderCourses();


  // =========================================================================
  // 9. 3D TILT EFFECT ON CARDS
  // =========================================================================
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });


  // =========================================================================
  // 10. SCROLL REVEALS & STATS COUNTERS
  // =========================================================================
  const revealElements = document.querySelectorAll('.scroll-reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => revealObserver.observe(el));

  // Animated counters
  const counters = document.querySelectorAll('.counter-value');
  let countersAnimated = false;

  function runCounters() {
    counters.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const isDecimal = target % 1 !== 0;
      const prefix = counter.getAttribute('data-prefix') || '';
      const suffix = counter.getAttribute('data-suffix') || '';
      let current = 0;
      const step = target / 40;

      const updateCounter = () => {
        current += step;
        if (current < target) {
          counter.textContent = prefix + (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = prefix + target + suffix;
        }
      };
      updateCounter();
    });
  }

  const statsSection = document.getElementById('stats-strip');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          runCounters();
        }
      });
    }, { threshold: 0.3 });
    statsObserver.observe(statsSection);
  }


  // =========================================================================
  // 11. CONTACT COPY TO CLIPBOARD & QUICK COMPOSE
  // =========================================================================
  const copyBtn = document.getElementById('copy-email-btn');
  const toast = document.getElementById('toast');

  function showToast(msg, isSuccess = true) {
    if (!toast) return;
    toast.textContent = msg;
    toast.style.borderColor = isSuccess ? '#00f5ff' : '#ef4444';
    toast.style.color = isSuccess ? '#00f5ff' : '#ef4444';
    toast.classList.remove('opacity-0', 'translate-y-4');
    toast.classList.add('opacity-100', 'translate-y-0');

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-4');
      toast.classList.remove('opacity-100', 'translate-y-0');
    }, 2800);
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('contact.zenithrai@gmail.com').then(() => {
        showToast('EMAIL COPIED: contact.zenithrai@gmail.com');
        playCyberBeep(700, 1400, 0.08);
      }).catch(() => {
        showToast('PLEASE EMAIL: contact.zenithrai@gmail.com');
      });
    });
  }

  // Quick Terminal Email Sender (Mailto Generator)
  const contactForm = document.getElementById('terminal-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const senderName = document.getElementById('form-name').value.trim();
      const senderEmail = document.getElementById('form-email').value.trim();
      const senderSubject = document.getElementById('form-subject').value.trim() || 'Software Engineering / Internship Opportunity';
      const senderMsg = document.getElementById('form-msg').value.trim();

      const bodyText = `Hi Zenith,\n\nName: ${senderName}\nEmail: ${senderEmail}\n\nMessage:\n${senderMsg}\n\nSent via zenithrai.com.np`;
      const mailtoUrl = `mailto:contact.zenithrai@gmail.com?subject=${encodeURIComponent(senderSubject)}&body=${encodeURIComponent(bodyText)}`;

      playCyberBeep(600, 1200, 0.1);
      showToast('LAUNCHING EMAIL CLIENT...');
      window.location.href = mailtoUrl;
    });
  }

  // Navbar background glass opacity on scroll
  const navBar = document.getElementById('main-navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navBar.classList.add('backdrop-blur-xl', 'bg-[#050811]/90', 'border-b', 'border-cyan-500/20', 'py-3');
      navBar.classList.remove('py-5');
    } else {
      navBar.classList.remove('backdrop-blur-xl', 'bg-[#050811]/90', 'border-b', 'border-cyan-500/20', 'py-3');
      navBar.classList.add('py-5');
    }
  }, { passive: true });

});
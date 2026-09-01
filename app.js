document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Custom Cursor Tracker (Desktop Only) ---
  const cursorDot = document.getElementById('custom-cursor-dot');
  const cursorCircle = document.getElementById('custom-cursor-circle');
  let mouseX = 0, mouseY = 0;
  let circleX = 0, circleY = 0;

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (isTouchDevice || window.innerWidth < 1024) {
    if (cursorDot) cursorDot.style.display = 'none';
    if (cursorCircle) cursorCircle.style.display = 'none';
    document.body.classList.add('mobile-touch');
  } else {
    // Track mouse coordinates
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Position dot immediately
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    // Smooth trail for circle
    function animateCircle() {
      circleX += (mouseX - circleX) * 0.15;
      circleY += (mouseY - circleY) * 0.15;
      
      cursorCircle.style.left = `${circleX}px`;
      cursorCircle.style.top = `${circleY}px`;
      
      requestAnimationFrame(animateCircle);
    }
    requestAnimationFrame(animateCircle);

    // Manage Hover States
    const addHoverClass = () => document.body.classList.add('cursor-hover');
    const removeHoverClass = () => document.body.classList.remove('cursor-hover');

    function updateCursorListeners() {
      const clickables = document.querySelectorAll('.clickable, a, button, input, textarea, select, .project-card, .terminal-action-btn');
      clickables.forEach(elem => {
        elem.removeEventListener('mouseenter', addHoverClass);
        elem.removeEventListener('mouseleave', removeHoverClass);
        elem.addEventListener('mouseenter', addHoverClass);
        elem.addEventListener('mouseleave', removeHoverClass);
      });
    }
    updateCursorListeners();
    
    // Re-run listener updates when DOM changes
    const cursorObserver = new MutationObserver(updateCursorListeners);
    cursorObserver.observe(document.body, { childList: true, subtree: true });
  }

  // --- 2. Dark/Light Theme Memory & Persistence ---
  const themeToggle = document.getElementById('theme-toggle');
  
  // Set theme from local storage or media query
  const currentTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }

  // Toggle Theme Function
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // --- 3. Interactive Terminal CLI ---
  const terminalBody = document.getElementById('terminal-body');
  const terminalActionBtns = document.querySelectorAll('.terminal-action-btn');
  let isTyping = false;

  const commandDb = {
    "system.info()": [
      "Name: Rishu Ray",
      "Focus: Full Stack Developer & AI Integration",
      "Status: Open to internships & freelance contracts",
      "Location: Bangalore, India",
      "GitHub: github.com/rayrishu19-wq"
    ],
    "project.info('explain-code')": [
      "> Initializing Explain My Code model... [SUCCESS]",
      "> Fetching repository details...",
      "------------------------------------------",
      "Project: Explain My Code",
      "Role: AI Solutions Architect",
      "Stack: Gemini API, Groq API, Node.js, HTML5/CSS3",
      "Response Time: Sub-second latency (<0.8s) via Groq",
      "Description: AI-powered code explanation tool designed for developer productivity. Renders side-by-side annotations.",
      "Repo: github.com/rayrishu19-wq/explain-my-code",
      "Live Demo: rayrishu19-wq.github.io/explain-my-code"
    ],
    "project.info('video-summarizer')": [
      "> Loading transcription pipeline... [SUCCESS]",
      "> Fetching summary cache...",
      "------------------------------------------",
      "Project: AI Video Content Summarizer",
      "Role: Backend & Architecture Developer",
      "Stack: Node.js, MongoDB, Express, Gemini API",
      "Features: Processes large technical lectures and extracts structured chronological highlights.",
      "Repo: github.com/rayrishu19-wq/video-summary-using-ai-tools",
      "Live Demo: rayrishu19-wq.github.io/video-summary-using-ai-tools"
    ],
    "project.info('hoppscotch')": [
      "> Connecting to global open source repository...",
      "> Checking merged logs for author: rayrishu19-wq...",
      "------------------------------------------",
      "Target: Hoppscotch API Development Tool",
      "Contribution: UI Accessibility & Keyboard navigation (aria-labels)",
      "Stack: Vue.js, TypeScript, Tailwind CSS",
      "Status: MERGED & DEPLOYED (Shipped in release v2026.4.0)",
      "Repo: github.com/hoppscotch/hoppscotch"
    ],
    "project.info('restaurants')": [
      "> Compiling CSS animations...",
      "> Rendering restaurant-showcase template...",
      "------------------------------------------",
      "Project: Indian Restaurants Showcase Web",
      "Role: Frontend Designer",
      "Stack: HTML5, Vanilla CSS3, Javascript",
      "Focus: Premium UI, smooth transitions, mobile-first responsiveness, and structural SEO tags.",
      "Repo: github.com/rayrishu19-wq/-Indian-restaurants-"
    ],
    "project.info('meshery')": [
      "> Accessing CNCF management plane repository...",
      "> Checking merged logs for author: rayrishu19-wq...",
      "------------------------------------------",
      "Target: Meshery & freeCodeCamp Core Ecosystems",
      "Contribution: Meshplay UI modules & curriculum updates",
      "Stack: React, Golang, Next.js, JavaScript/JSON",
      "Status: ACTIVE CONTRIBUTIONS (Multiple PRs merged)",
      "Repo: github.com/meshery/meshery"
    ],
    "experience.summary()": [
      "> query_milestones()",
      "------------------------------------------",
      "• [2026] Open Source Contributor @ Hoppscotch API Client",
      "• [2025] Open Source Contributor @ Meshery & freeCodeCamp",
      "• [2024] AI Solutions Architect @ Explain My Code App",
      "• [2024] Full Stack Web Developer @ Modern Dashboards Freelance",
      "• [Pursuing] B.Tech @ Bangalore Institute of Technology"
    ]
  };

  // Run a command in the terminal (simulated typewriter & line print)
  function executeCommand(cmdStr) {
    if (isTyping) return;
    isTyping = true;

    // Create prompt line
    const promptLine = document.createElement('div');
    promptLine.className = 'terminal-line';
    promptLine.innerHTML = `<span class="terminal-prompt">guest@rishuray.dev:~$ </span><span class="terminal-command-text"></span><span class="terminal-cursor"></span>`;
    terminalBody.appendChild(promptLine);
    
    // Auto-scroll terminal
    terminalBody.scrollTop = terminalBody.scrollHeight;

    const cmdTextContainer = promptLine.querySelector('.terminal-command-text');
    const cursor = promptLine.querySelector('.terminal-cursor');
    
    let charIdx = 0;
    
    // 1. Simulate Typewriter typing the command
    const typeInterval = setInterval(() => {
      if (charIdx < cmdStr.length) {
        cmdTextContainer.textContent += cmdStr[charIdx];
        charIdx++;
      } else {
        clearInterval(typeInterval);
        cursor.remove(); // Remove blinking cursor from command line
        
        // 2. Clear command special action
        if (cmdStr === 'clear()') {
          setTimeout(() => {
            terminalBody.innerHTML = `
              <div class="terminal-welcome">
                Terminal cleared. Interactive session active.<br>
                Type commands or click the actions below to execute.<br>
                --------------------------------------------------------
              </div>`;
            isTyping = false;
          }, 200);
          return;
        }

        // 3. Print Output Lines with short delays
        const outputLines = commandDb[cmdStr] || [`bash: command not found: ${cmdStr}`];
        let lineIdx = 0;

        function printNextLine() {
          if (lineIdx < outputLines.length) {
            const outLine = document.createElement('div');
            outLine.className = 'terminal-output';
            outLine.innerHTML = outputLines[lineIdx];
            terminalBody.appendChild(outLine);
            terminalBody.scrollTop = terminalBody.scrollHeight;
            lineIdx++;
            setTimeout(printNextLine, 100);
          } else {
            isTyping = false;
          }
        }
        
        setTimeout(printNextLine, 150);
      }
    }, 40);
  }

  // Hook terminal actions buttons
  terminalActionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cmd = e.target.getAttribute('data-cmd');
      if (cmd) executeCommand(cmd);
    });
  });

  // Hook project card click to trigger terminal action & scroll to terminal
  const projectCards = document.querySelectorAll('[data-project-cmd]');
  projectCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Prevent triggering if clicking repo links directly
      if (e.target.closest('a')) return;
      
      const cmd = card.getAttribute('data-project-cmd');
      if (cmd) {
        // Scroll terminal into view
        const termWidget = document.getElementById('terminal-widget');
        termWidget.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Execute CLI command after scroll finished
        setTimeout(() => {
          executeCommand(cmd);
        }, 600);
      }
    });
  });

  // --- 4. Resume Button simulated CLI triggers ---
  const downloadResumeBtn = document.getElementById('download-resume-btn');
  downloadResumeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const termWidget = document.getElementById('terminal-widget');
    termWidget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    setTimeout(() => {
      // Simulate curl download in terminal
      if (isTyping) return;
      isTyping = true;

      const promptLine = document.createElement('div');
      promptLine.className = 'terminal-line';
      promptLine.innerHTML = `<span class="terminal-prompt">guest@rishuray.dev:~$ </span><span class="terminal-command-text">curl -O rishu_resume.pdf</span><span class="terminal-cursor"></span>`;
      terminalBody.appendChild(promptLine);
      terminalBody.scrollTop = terminalBody.scrollHeight;
      
      setTimeout(() => {
        promptLine.querySelector('.terminal-cursor').remove();
        
        const loaderLine = document.createElement('div');
        loaderLine.className = 'terminal-output';
        loaderLine.innerHTML = `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current<br>
                                 Dload  Upload   Total   Spent    Left  Speed<br>
  100  202k  100  202k    0     0   512k      0 --:--:-- --:--:-- --:--:--  511k<br>
> Download complete. [rishu_resume.pdf saved to disk]`;
        
        terminalBody.appendChild(loaderLine);
        terminalBody.scrollTop = terminalBody.scrollHeight;
        isTyping = false;
        
        // Open PDF in new tab
        window.open('./professional_dev_certificate.pdf', '_blank');
      }, 800);
    }, 600);
  });

  // --- 5. Interactive Particle Canvas Background ---
  const canvas = document.getElementById('ambient-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Get particle colors according to the active theme
    const getParticleColor = () => {
      const isDark = document.documentElement.classList.contains('dark');
      return isDark ? { r: 73, g: 230, b: 166 } : { r: 22, g: 101, b: 52 }; // green-glow or dark forest green
    };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.5 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.baseAlpha = Math.random() * 0.5 + 0.15;
        this.alpha = this.baseAlpha;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around viewport boundaries
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Mouse attraction (Desktop non-touch only)
        if (!isTouchDevice && mouseX !== undefined && mouseY !== undefined) {
          const dx = mouseX - this.x;
          const dy = mouseY - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            this.x -= dx * force * 0.02;
            this.y -= dy * force * 0.02;
            this.alpha = Math.min(1, this.baseAlpha + force * 0.55);
          } else {
            this.alpha = this.baseAlpha;
          }
        }
      }

      draw() {
        const color = getParticleColor();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${this.alpha})`;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      // Lower density on mobile to preserve CPU & battery
      const density = isTouchDevice ? 35 : Math.floor((width * height) / 13000);
      const limit = isTouchDevice ? 45 : 120;
      const count = Math.min(density, limit);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    function drawLines() {
      const color = getParticleColor();
      const maxDist = 110;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.14;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Mouse connection links (Desktop only)
        if (!isTouchDevice && mouseX !== undefined && mouseY !== undefined) {
          const dx = particles[i].x - mouseX;
          const dy = particles[i].y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      drawLines();
      animationFrameId = requestAnimationFrame(animateParticles);
    }

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    });

    initParticles();
    animateParticles();
  }

  // --- 6. Scroll Trigger Reveal Animations ---
  const revealTargets = document.querySelectorAll(
    '.project-card, .skills-category, .cert-card, .timeline-item, .contact-info-card, .contact-form, .section-header'
  );

  revealTargets.forEach(el => {
    el.classList.add('reveal-element');
    
    // Customize reveal animations based on layouts
    if (el.classList.contains('skills-category') || el.classList.contains('contact-info-card')) {
      el.classList.add('reveal-left');
    } else if (el.classList.contains('contact-form')) {
      el.classList.add('reveal-right');
    } else if (el.classList.contains('project-card') || el.classList.contains('cert-card')) {
      el.classList.add('reveal-scale');
    }
  });

  const skillProgressBars = document.querySelectorAll('.skill-progress');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        
        // If the skills section container revealed, trigger skill bars filling
        if (entry.target.id === 'skills' || entry.target.closest('#skills')) {
          skillProgressBars.forEach(bar => {
            const targetWidth = bar.getAttribute('data-width');
            bar.style.width = targetWidth;
          });
        }
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealTargets.forEach(el => revealObserver.observe(el));
  
  // Also observe skills section explicitly to make sure bars animate
  const skillsSec = document.getElementById('skills');
  if (skillsSec) revealObserver.observe(skillsSec);

  // --- 7. 3D Hover Tilt Effect (Desktop Only) ---
  if (!isTouchDevice && window.innerWidth >= 1024) {
    const tiltCards = document.querySelectorAll('.project-card, .terminal-widget');
    
    tiltCards.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Rotate maximum 8 degrees
        const tiltX = ((centerY - y) / centerY) * 8;
        const tiltY = ((x - centerX) / centerX) * 8;
        
        el.classList.remove('no-tilt');
        el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
      });
      
      el.addEventListener('mouseleave', () => {
        el.classList.add('no-tilt');
        el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });
    });
  }

  // --- 8. Magnetic Button Interaction (Desktop Only) ---
  if (!isTouchDevice && window.innerWidth >= 1024) {
    const magnetButtons = document.querySelectorAll('.theme-toggle-btn, .cmd-button, .btn-secondary, .footer-social-link');
    
    magnetButtons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.classList.remove('no-magnetic');
        // Magnet strength: pull by 30% of cursor distance
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.classList.add('no-magnetic');
        btn.style.transform = `translate(0px, 0px)`;
      });
    });
  }

  // --- 9. Mobile Nav Menu Toggle & Hamburger Animation ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      mobileMenuBtn.classList.toggle('mobile-menu-open');
    });

    const navItems = document.querySelectorAll('.nav-link');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileMenuBtn.classList.remove('mobile-menu-open');
        
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });

    // Active link highlight on scroll
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= (sectionTop - 220)) {
          current = section.getAttribute('id');
        }
      });

      navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').slice(1) === current) {
          item.classList.add('active');
        }
      });
    });
  }

  // --- 10. Typewriter Text Auto-Trigger on Load ---
  const initialCliLine = terminalBody.querySelector('.terminal-line');
  if (initialCliLine) {
    // Clear static HTML text progressively so typewriter can run
    initialCliLine.remove();
  }
  
  // Start simulated interactive load-in typewriter execution
  setTimeout(() => {
    executeCommand('system.info()');
  }, 950);

});

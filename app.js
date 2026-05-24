document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Custom Cursor Tracker ---
  const cursorDot = document.getElementById('custom-cursor-dot');
  const cursorCircle = document.getElementById('custom-cursor-circle');
  let mouseX = 0, mouseY = 0;
  let circleX = 0, circleY = 0;

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
    // Linear interpolation
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
      "Repo: github.com/rayrishu19-wq/explain-my-code"
    ],
    "project.info('video-summarizer')": [
      "> Loading transcription pipeline... [SUCCESS]",
      "> Fetching summary cache...",
      "------------------------------------------",
      "Project: AI Video Content Summarizer",
      "Role: Backend & Architecture Developer",
      "Stack: Node.js, MongoDB, Express, Gemini API",
      "Features: Processes large technical lectures and extracts structured chronological highlights.",
      "Repo: github.com/rayrishu19-wq/video-summary-using-ai-tools"
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
    "experience.summary()": [
      "> query_milestones()",
      "------------------------------------------",
      "• [2026] Open Source Contributor @ Hoppscotch API Client",
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
        window.open('C:/Users/91797/.gemini/antigravity-ide/scratch/professional_dev_certificate.pdf', '_blank');
      }, 800);
    }, 600);
  });

  // --- 5. Skills Progress Bar Animation using Intersection Observer ---
  const skillsSection = document.getElementById('skills');
  const skillProgressBars = document.querySelectorAll('.skill-progress');

  const animateSkills = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        skillProgressBars.forEach(bar => {
          const targetWidth = bar.getAttribute('data-width');
          bar.style.width = targetWidth;
        });
        observer.unobserve(entry.target);
      }
    });
  };

  const skillsObserver = new IntersectionObserver(animateSkills, {
    root: null,
    threshold: 0.15
  });

  if (skillsSection) {
    skillsObserver.observe(skillsSection);
  }

  // --- 6. Mobile Nav Menu Toggle ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close mobile nav when clicking a link
  const navItems = document.querySelectorAll('.nav-link');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navLinks.classList.remove('open');
      
      // Update active nav link
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
      if (pageYOffset >= (sectionTop - 200)) {
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

  // --- 7. Contact Form Handling with CLI output! ---
  const contactForm = document.getElementById('contact-form');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Scroll to terminal and output sending logs
    const termWidget = document.getElementById('terminal-widget');
    termWidget.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      if (isTyping) return;
      isTyping = true;

      const promptLine = document.createElement('div');
      promptLine.className = 'terminal-line';
      promptLine.innerHTML = `<span class="terminal-prompt">guest@rishuray.dev:~$ </span><span class="terminal-command-text">mail.send()</span><span class="terminal-cursor"></span>`;
      terminalBody.appendChild(promptLine);
      terminalBody.scrollTop = terminalBody.scrollHeight;
      
      setTimeout(() => {
        promptLine.querySelector('.terminal-cursor').remove();
        
        const loaderLine = document.createElement('div');
        loaderLine.className = 'terminal-output';
        loaderLine.innerHTML = `> Connecting to SMTP mail.rishuray.dev... [SUCCESS]<br>
> Packing payload (Name: ${name}, Email: ${email})...<br>
> Sending encrypted body content... [SUCCESS]<br>
> Message dispatched successfully! Thank you. I'll get back to you soon.`;
        
        terminalBody.appendChild(loaderLine);
        terminalBody.scrollTop = terminalBody.scrollHeight;
        isTyping = false;
        
        // Reset form
        contactForm.reset();
      }, 1000);
    }, 600);
  });
  
  // Re-run listener updates when DOM changes
  const observer = new MutationObserver(updateCursorListeners);
  observer.observe(document.body, { childList: true, subtree: true });

});

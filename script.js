document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('py-4');
            navbar.classList.remove('py-6');
            navbar.firstElementChild.classList.add('shadow-md', 'shadow-slate-200/50');
        } else {
            navbar.classList.add('py-6');
            navbar.classList.remove('py-4');
            navbar.firstElementChild.classList.remove('shadow-md', 'shadow-slate-200/50');
        }
    });

    // --- 2. Typing Animation ---
    const typedTextSpan = document.getElementById('typing-text');
    const textArray = ["Machine Learning Developer", "Full-Stack Engineer", "AI Enthusiast"];
    const typingDelay = 100;
    const erasingDelay = 50;
    const newTextDelay = 2000;
    let textArrayIndex = 0;
    let charIndex = 0;

    function type() {
        if (charIndex < textArray[textArrayIndex].length) {
            typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
            charIndex++;
            setTimeout(type, typingDelay);
        } else {
            setTimeout(erase, newTextDelay);
        }
    }

    function erase() {
        if (charIndex > 0) {
            typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
            charIndex--;
            setTimeout(erase, erasingDelay);
        } else {
            textArrayIndex++;
            if (textArrayIndex >= textArray.length) textArrayIndex = 0;
            setTimeout(type, typingDelay + 500);
        }
    }
    
    // Start typing effect
    setTimeout(type, 1000);

    // --- 3. Intersection Observer (Scroll Reveals) ---
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => revealOnScroll.observe(el));

    // --- 4. Fetch Projects Dynamically ---
    async function loadProjects() {
        const container = document.getElementById('projects-container');
        try {
            const response = await fetch('proj.txt');
            if (!response.ok) throw new Error('File not found');
            
            const text = await response.text();
            const lines = text.split('\n');
            
            // Remove loader
            container.innerHTML = '';
            
            let delay = 0;

            lines.forEach(line => {
                line = line.trim();
                // Ignore empty lines and the header
                if (!line || line.toLowerCase() === '[projects]') return;
                
                const parts = line.split('|');
                if (parts.length >= 3) {
                    const name = parts[0].trim();
                    const link = parts[1].trim();
                    const desc = parts[2].trim();
                    
                    const card = document.createElement('div');
                    // Updated classes for Light Theme
                    card.className = `glass p-6 rounded-2xl reveal reveal-scale hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:shadow-sky-100 hover:border-sky-300 group active`;
                    card.style.animationDelay = `${delay}ms`;
                    
                    card.innerHTML = `
                        <div class="flex justify-between items-start mb-4">
                            <div class="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <i class="fa-solid fa-folder-open"></i>
                            </div>
                            <a href="${link}" target="_blank" class="text-slate-400 hover:text-primary transition-colors">
                                <i class="fa-brands fa-github text-xl"></i>
                            </a>
                        </div>
                        <h3 class="text-xl font-bold mb-3 text-slate-800 group-hover:text-primary transition-colors">${name}</h3>
                        <p class="text-slate-600 text-sm leading-relaxed mb-6">${desc}</p>
                        <a href="${link}" target="_blank" class="text-sm font-bold text-primary flex items-center hover:text-secondary transition-colors">
                            View Project <i class="fa-solid fa-arrow-right text-xs ml-2 transform group-hover:translate-x-1 transition-transform"></i>
                        </a>
                    `;
                    container.appendChild(card);
                    delay += 100;
                }
            });

            // If no projects parsed correctly
            if (container.innerHTML === '') {
                container.innerHTML = '<p class="text-slate-500 col-span-full text-center">No projects found. Please add them to proj.txt</p>';
            }

        } catch (error) {
            console.error("Error loading projects:", error);
            container.innerHTML = `
                <div class="col-span-full glass p-8 rounded-xl text-center border-red-200">
                    <i class="fa-solid fa-circle-exclamation text-red-500 text-3xl mb-3"></i>
                    <h3 class="text-xl font-bold mb-2 text-slate-800">Could not load projects</h3>
                    <p class="text-slate-600">Ensure 'proj.txt' exists in the root directory and is formatted correctly.</p>
                </div>
            `;
        }
    }

    // Load projects immediately
    loadProjects();

  // --- 5. EmailJS Configuration & Form Handling ---
    
    const EMAILJS_PUBLIC_KEY = 'PFGAuP-1nFfnjQf7y'; 
    const EMAILJS_SERVICE_ID = 'service_nv1vils';
    const EMAILJS_TEMPLATE_ID = 'template_cxzetng'; // Updated correct Template ID

    // Initialize EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);

    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastMessage = document.getElementById('toast-message');

    function showToast(message, isSuccess) {
        toastMessage.textContent = message;
        if (isSuccess) {
            toastIcon.className = "fa-solid fa-circle-check text-green-500 text-xl";
            toast.style.borderLeft = "4px solid #22c55e"; // green-500
        } else {
            toastIcon.className = "fa-solid fa-circle-xmark text-red-500 text-xl";
            toast.style.borderLeft = "4px solid #ef4444"; // red-500
        }
        
        toast.classList.remove('translate-y-20', 'opacity-0');
        
        setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    }

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span class="ml-2">Sending...</span>';
        submitBtn.disabled = true;

        // Collect parameters matching the standard EmailJS template
        const templateParams = {
            from_name: document.getElementById('name').value,
            from_email: document.getElementById('email').value,
            message: document.getElementById('message').value,
            to_email: 'sthaaryan123@gmail.com'
        };

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(function() {
                showToast("Message sent successfully!", true);
                contactForm.reset();
            }, function(error) {
                console.error("EmailJS Error:", error);
                showToast("Failed to send message. Please check console.", false);
            })
            .finally(function() {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            });
    });
});
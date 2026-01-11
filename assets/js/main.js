/**
 * Modern Portfolio JavaScript
 * Designed for Pablo González Portfolio
 */
(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        typingSpeed: 100,
        typingDelay: 2000,
        scrollThreshold: 100,
        animationDuration: 1000,
        debounceDelay: 50
    };

    // Typing animation texts
    const TYPING_TEXTS = [
        'Game Developer',
        'Software Engineer'
    ];

    // Global variables
    let currentTypingIndex = 0;
    let isTyping = false;
    let typingInterval;
    let currentSection = 'home';
    let isScrolling = false;

    // Utility functions
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const throttle = (func, limit) => {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    const getElementOffset = (element) => {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset
        };
    };

    const isElementInViewport = (element, threshold = 0.1) => {
        const rect = element.getBoundingClientRect();
        const viewHeight = window.innerHeight;
        const viewTop = 0;
        const viewBottom = viewHeight;

        const elementTop = rect.top;
        const elementBottom = rect.bottom;
        const elementHeight = rect.height;

        const visibleHeight = Math.min(elementBottom, viewBottom) - Math.max(elementTop, viewTop);
        return visibleHeight >= elementHeight * threshold;
    };

    // Smooth scroll function
    const smoothScrollTo = (target, duration = 800) => {
        const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
        if (!targetElement) return;

        const targetOffset = getElementOffset(targetElement).top - 80; // Account for navbar
        const startPosition = window.pageYOffset;
        const distance = targetOffset - startPosition;
        let startTime = null;

        const easeInOutQuart = (t) => {
            return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
        };

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            window.scrollTo(0, startPosition + distance * easeInOutQuart(progress));

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    };

    // Navigation functionality
    class Navigation {
        constructor() {
            this.navbar = document.getElementById('navbar');
            this.navMenu = document.getElementById('nav-menu');
            this.navToggle = document.getElementById('nav-toggle');
            this.navLinks = document.querySelectorAll('.nav-link');

            this.init();
        }

        init() {
            this.bindEvents();
            this.updateActiveSection();
        }

        bindEvents() {
            // Mobile menu toggle
            if (this.navToggle) {
                this.navToggle.addEventListener('click', () => {
                    this.toggleMobileMenu();
                });
            }

            // Navigation links
            this.navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    const targetSection = link.getAttribute('data-section');

                    if (targetId && targetId.startsWith('#')) {
                        this.navigateToSection(targetId, targetSection);
                        this.closeMobileMenu();
                    }
                });
            });

            // Scroll events
            window.addEventListener('scroll', throttle(() => {
                this.handleScroll();
            }, CONFIG.debounceDelay));

            // Resize events
            window.addEventListener('resize', debounce(() => {
                this.handleResize();
            }, CONFIG.debounceDelay));
        }

        toggleMobileMenu() {
            this.navMenu.classList.toggle('active');
            this.navToggle.classList.toggle('active');
            document.body.classList.toggle('nav-open');
        }

        closeMobileMenu() {
            this.navMenu.classList.remove('active');
            this.navToggle.classList.remove('active');
            document.body.classList.remove('nav-open');
        }

        navigateToSection(targetId, sectionName) {
            if (isScrolling) return;

            isScrolling = true;
            currentSection = sectionName || targetId.substring(1);

            smoothScrollTo(targetId);

            setTimeout(() => {
                isScrolling = false;
                this.updateActiveSection();
            }, 800);
        }

        updateActiveSection() {
            // Remove active class from all links
            this.navLinks.forEach(link => {
                link.classList.remove('active');
            });

            // Add active class to current section link
            const activeLink = document.querySelector(`[data-section="${currentSection}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }

        handleScroll() {
            const scrollY = window.pageYOffset;

            // Update navbar appearance
            if (scrollY > CONFIG.scrollThreshold) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }

            // Update active section based on scroll position
            if (!isScrolling) {
                this.detectCurrentSection();
            }
        }

        detectCurrentSection() {
            const sections = document.querySelectorAll('section[id]');
            let currentActiveSection = 'home';

            sections.forEach(section => {
                if (isElementInViewport(section, 0.3)) {
                    currentActiveSection = section.id;
                }
            });

            if (currentActiveSection !== currentSection) {
                currentSection = currentActiveSection;
                this.updateActiveSection();
            }
        }

        handleResize() {
            if (window.innerWidth > 768) {
                this.closeMobileMenu();
            }
        }
    }

    // Typing animation class
    class TypingAnimation {
        constructor(element) {
            this.element = element;
            this.currentTextIndex = 0;
            this.currentCharIndex = 0;
            this.isDeleting = false;
            this.isWaiting = false;

            this.init();
        }

        init() {
            if (!this.element) return;
            this.startTyping();
        }

        startTyping() {
            if (isTyping) return;
            isTyping = true;
            this.type();
        }

        type() {
            const currentText = TYPING_TEXTS[this.currentTextIndex];

            if (!this.isDeleting && this.currentCharIndex < currentText.length) {
                // Typing
                this.element.textContent = currentText.substring(0, this.currentCharIndex + 1);
                this.currentCharIndex++;
                setTimeout(() => this.type(), CONFIG.typingSpeed);
            } else if (this.isDeleting && this.currentCharIndex > 0) {
                // Deleting
                this.element.textContent = currentText.substring(0, this.currentCharIndex - 1);
                this.currentCharIndex--;
                setTimeout(() => this.type(), CONFIG.typingSpeed / 2);
            } else if (!this.isDeleting && this.currentCharIndex === currentText.length) {
                // Finished typing, wait before deleting
                this.isWaiting = true;
                setTimeout(() => {
                    this.isDeleting = true;
                    this.isWaiting = false;
                    this.type();
                }, CONFIG.typingDelay);
            } else if (this.isDeleting && this.currentCharIndex === 0) {
                // Finished deleting, move to next text
                this.isDeleting = false;
                this.currentTextIndex = (this.currentTextIndex + 1) % TYPING_TEXTS.length;
                setTimeout(() => this.type(), CONFIG.typingSpeed);
            }
        }
    }

    // Counter animation class
    class CounterAnimation {
        constructor() {
            this.counters = document.querySelectorAll('.stat-number[data-count]');
            this.hasAnimated = new Set();
            this.init();
        }

        init() {
            this.observeCounters();
        }

        observeCounters() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated.has(entry.target)) {
                        this.animateCounter(entry.target);
                        this.hasAnimated.add(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            this.counters.forEach(counter => {
                observer.observe(counter);
            });
        }

        animateCounter(element) {
            const target = parseInt(element.getAttribute('data-count'));
            const duration = 2000;
            const startTime = performance.now();
            const startValue = 0;

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                const currentValue = Math.floor(startValue + (target - startValue) * this.easeOutQuart(progress));
                element.textContent = currentValue;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        }

        easeOutQuart(t) {
            return 1 - (--t) * t * t * t;
        }
    }

    // Skills animation class
    class SkillsAnimation {
        constructor() {
            this.skillBars = document.querySelectorAll('.skill-progress[data-width]');
            this.hasAnimated = new Set();
            this.init();
        }

        init() {
            this.observeSkills();
        }

        observeSkills() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated.has(entry.target)) {
                        this.animateSkill(entry.target);
                        this.hasAnimated.add(entry.target);
                    }
                });
            }, { threshold: 0.3 });

            this.skillBars.forEach(skill => {
                observer.observe(skill);
            });
        }

        animateSkill(element) {
            const targetWidth = element.getAttribute('data-width');
            element.style.width = targetWidth + '%';
        }
    }

    // Project filtering class
    class ProjectFilter {
        constructor() {
            this.filterButtons = document.querySelectorAll('.filter-btn');
            this.projectCards = document.querySelectorAll('.project-card');
            this.activeFilter = 'all';

            this.init();
        }

        init() {
            this.bindEvents();
        }

        bindEvents() {
            this.filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const filter = button.getAttribute('data-filter');
                    this.setActiveFilter(filter);
                    this.filterProjects(filter);
                });
            });
        }

        setActiveFilter(filter) {
            this.activeFilter = filter;

            this.filterButtons.forEach(button => {
                button.classList.remove('active');
            });

            const activeButton = document.querySelector(`[data-filter="${filter}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
            }
        }

        filterProjects(filter) {
            this.projectCards.forEach(card => {
                const categories = card.getAttribute('data-category');
                const shouldShow = filter === 'all' || (categories && categories.includes(filter));

                if (shouldShow) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        }
    }

    // Contact form handler
    class ContactForm {
        constructor() {
            this.form = document.getElementById('contact-form');
            this.init();
        }

        init() {
            if (!this.form) return;
            this.bindEvents();
        }

        bindEvents() {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });

            // Floating label effects
            const formGroups = this.form.querySelectorAll('.form-group');
            formGroups.forEach(group => {
                const input = group.querySelector('input, textarea');
                if (input) {
                    input.addEventListener('focus', () => {
                        group.classList.add('focused');
                    });

                    input.addEventListener('blur', () => {
                        if (!input.value) {
                            group.classList.remove('focused');
                        }
                    });
                }
            });
        }

        async handleSubmit() {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData);

            // Here you would typically send the data to a server
            // For now, we'll just show a success message
            this.showMessage('Message sent successfully! I will contact you soon.', 'success');
            this.form.reset();
        }

        showMessage(message, type = 'info') {
            // Create and show a temporary message
            const messageEl = document.createElement('div');
            messageEl.className = `form-message ${type}`;
            messageEl.textContent = message;
            messageEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 24px;
                background: ${type === 'success' ? '#12D640' : '#FF6B6B'};
                color: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
            `;

            document.body.appendChild(messageEl);

            setTimeout(() => {
                messageEl.style.transform = 'translateX(0)';
            }, 100);

            setTimeout(() => {
                messageEl.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    document.body.removeChild(messageEl);
                }, 300);
            }, 3000);
        }
    }

    // AOS (Animate On Scroll) initialization
    const initAOS = () => {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                easing: 'ease-in-out',
                once: true,
                mirror: false,
                offset: 100
            });
        }
    };

    // Scroll indicator for hero section
    const initScrollIndicator = () => {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (!scrollIndicator) return;

        scrollIndicator.addEventListener('click', () => {
            smoothScrollTo('#about');
        });
    };

    // Preloader
    const initPreloader = () => {
        window.addEventListener('load', () => {
            const preloader = document.querySelector('.preloader');
            if (preloader) {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }
        });
    };

    // Performance optimization
    const optimizePerformance = () => {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    };

    // Project Modal class
    class ProjectModal {
        constructor() {
            this.modal = document.getElementById('project-modal');
            this.modalBody = document.getElementById('modal-body');
            this.closeBtn = document.querySelector('.close-modal');
            this.projectLinks = document.querySelectorAll('.project-link[href$=".html"]');

            this.init();
        }

        init() {
            if (!this.modal) return;
            this.bindEvents();
        }

        bindEvents() {
            // Open modal triggers
            this.projectLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const url = link.getAttribute('href');
                    this.loadProject(url);
                });
            });

            // Close modal triggers
            this.closeBtn.addEventListener('click', () => this.close());

            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });

            // ESC key close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                    this.close();
                }
            });
        }

        async loadProject(url) {
            try {
                // Show loading state if needed
                this.modalBody.innerHTML = '<div style="text-align:center;padding:50px;"><div class="spinner-border text-success" role="status"><span class="sr-only">Loading...</span></div></div>';
                this.open();

                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to load project');

                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // Extract content from #portfolio-details or #main
                const content = doc.querySelector('#portfolio-details') || doc.querySelector('#main');

                if (content) {
                    // Update image paths if they are relative
                    const images = content.querySelectorAll('img');
                    images.forEach(img => {
                        const src = img.getAttribute('src');
                        if (src && !src.startsWith('http') && !src.startsWith('/')) {
                            // Assuming projects are in /projects/ folder and assets in /assets/
                            // If src is "../assets/...", remove "../"
                            if (src.startsWith('../assets')) {
                                img.src = src.substring(3);
                            }
                        }
                    });

                    this.modalBody.innerHTML = '';
                    this.modalBody.appendChild(content);

                    // Re-initialize any scripts if necessary (e.g. carousels)
                    // For typical static content this is fine. 
                    // Video iframes should load automatically.
                } else {
                    throw new Error('Content not found');
                }

            } catch (error) {
                console.error('Error loading project:', error);
                this.modalBody.innerHTML = '<div class="alert alert-danger">Error loading project details. Please try again.</div>';
            }
        }

        open() {
            this.modal.style.display = 'flex';
            // Force reflow
            this.modal.offsetHeight;
            this.modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }

        close() {
            this.modal.classList.remove('active');
            setTimeout(() => {
                this.modal.style.display = 'none';
                this.modalBody.innerHTML = ''; // Clear content
                document.body.style.overflow = '';
            }, 300); // Match transition duration
        }
    }

    // Initialize everything when DOM is ready
    const init = () => {
        // Initialize core components
        new Navigation();
        new CounterAnimation();
        new SkillsAnimation();
        new ProjectFilter();
        new ContactForm();
        new ProjectModal(); // Init modal

        // Initialize typing animation
        const typingElement = document.querySelector('.typing-text');
        if (typingElement) {
            new TypingAnimation(typingElement);
        }

        // Initialize other features
        initAOS();
        initScrollIndicator();
        initPreloader();
        optimizePerformance();

        // Add loaded class to body
        document.body.classList.add('loaded');
    };

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose utilities globally for potential use
    window.PortfolioUtils = {
        smoothScrollTo,
        debounce,
        throttle,
        isElementInViewport
    };

})();
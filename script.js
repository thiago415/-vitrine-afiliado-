// ===== DOM ELEMENTS =====
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const searchToggle = document.getElementById('searchToggle');
const searchBar = document.getElementById('searchBar');
const searchInput = document.getElementById('searchInput');
const backToTop = document.getElementById('backToTop');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const produtosGrid = document.getElementById('produtosGrid');

// ===== NAVBAR SCROLL =====
let lastScrollY = 0;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Navbar background
    if (scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Back to top
    if (scrollY > 400) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }

    lastScrollY = scrollY;
});

// ===== MOBILE MENU =====
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');

    // Create/remove overlay
    let overlay = document.querySelector('.nav-overlay');
    if (navLinks.classList.contains('active')) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.classList.add('nav-overlay', 'active');
            document.body.appendChild(overlay);
            overlay.addEventListener('click', closeMobileMenu);
        }
        document.body.style.overflow = 'hidden';
    } else {
        closeMobileMenu();
    }
});

function closeMobileMenu() {
    menuToggle.classList.remove('active');
    navLinks.classList.remove('active');
    const overlay = document.querySelector('.nav-overlay');
    if (overlay) {
        overlay.remove();
    }
    document.body.style.overflow = '';
}

// Close menu on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// ===== SEARCH BAR =====
searchToggle.addEventListener('click', () => {
    searchBar.classList.toggle('active');
    if (searchBar.classList.contains('active')) {
        setTimeout(() => searchInput.focus(), 300);
    }
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.produto-card');

    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const category = card.querySelector('.produto-category').textContent.toLowerCase();

        if (title.includes(query) || category.includes(query)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
});

// ===== BACK TO TOP =====
backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== FILTER PRODUCTS =====
function filterProducts(category) {
    const cards = document.querySelectorAll('.produto-card');
    const buttons = document.querySelectorAll('.filter-btn');

    // Update active button
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(category) ||
            (category === 'todos' && btn.textContent === 'Todos')) {
            btn.classList.add('active');
        }
    });

    // Filter cards with animation
    cards.forEach((card, index) => {
        const cardCategory = card.dataset.category;

        if (category === 'todos' || cardCategory === category) {
            card.classList.remove('hidden');
            card.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s forwards`;
        } else {
            card.classList.add('hidden');
        }
    });

    // Scroll to offers section
    const ofertasSection = document.getElementById('ofertas');
    if (ofertasSection) {
        ofertasSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== WISHLIST =====
function toggleWishlist(btn) {
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');

    if (btn.classList.contains('active')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        showToast('Adicionado aos favoritos! ❤️');
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        showToast('Removido dos favoritos');
    }
}

// ===== TOAST NOTIFICATION =====
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== SUBSCRIBE FORM =====
function handleSubscribe(e) {
    e.preventDefault();
    const input = e.target.querySelector('input');
    showToast('Inscrição realizada com sucesso! 🎉');
    input.value = '';
}

// ===== SCROLL ANIMATIONS =====
const animateOnScroll = () => {
    const elements = document.querySelectorAll('[data-animate]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
};

// ===== HERO PARTICLES =====
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(99, 102, 241, ${Math.random() * 0.3 + 0.1});
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: float ${Math.random() * 6 + 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 4}s;
        `;
        container.appendChild(particle);
    }
}

// ===== SMOOTH ANCHOR SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            navLinks.querySelectorAll('a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// ===== COUNTER ANIMATION =====
function animateCounters() {
    const stats = document.querySelectorAll('.hero-stats .stat strong');

    stats.forEach(stat => {
        const text = stat.textContent;
        const isPercentage = text.includes('%');
        const isPlus = text.includes('+');
        const isK = text.includes('k');

        let target;
        if (isK) {
            target = parseFloat(text) * 1000;
        } else {
            target = parseInt(text);
        }

        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                stat.textContent = text; // Reset to original text
                clearInterval(timer);
            } else {
                if (isK) {
                    stat.textContent = (current / 1000).toFixed(0) + 'k+';
                } else if (isPercentage) {
                    stat.textContent = Math.floor(current) + '%';
                } else {
                    stat.textContent = Math.floor(current) + '+';
                }
            }
        }, 30);
    });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    animateOnScroll();

    // Trigger counter animation when hero is visible
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                heroObserver.unobserve(entry.target);
            }
        });
    });

    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroObserver.observe(heroSection);
    }
});

// ===== KEYBOARD ACCESSIBILITY =====
document.addEventListener('keydown', (e) => {
    // ESC to close mobile menu
    if (e.key === 'Escape') {
        closeMobileMenu();
        searchBar.classList.remove('active');
    }

    // Ctrl+K to open search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchBar.classList.toggle('active');
        if (searchBar.classList.contains('active')) {
            setTimeout(() => searchInput.focus(), 300);
        }
    }
});

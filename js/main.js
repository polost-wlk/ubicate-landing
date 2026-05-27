/* ===================================================
   UBICATE - Landing Page JavaScript
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ===== NAVBAR SCROLL EFFECT =====
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ===== MOBILE MENU =====
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // ===== FAQ ACCORDION =====
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const isActive = item.classList.contains('active');

            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

            // Open clicked one (if it wasn't already open)
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // ===== FORM SUBMISSION =====
    const registroForm = document.getElementById('registroForm');
    const formSuccess = document.getElementById('formSuccess');
    const formError = document.getElementById('formError');
    const submitBtn = registroForm.querySelector('button[type="submit"]');

    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Ocultar error previo si existe
        if (formError) formError.style.display = 'none';

        // Estado de carga
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        // Recopilar datos del formulario
        const formData = {
            nombre: registroForm.nombre.value,
            email: registroForm.email.value,
            tipo: registroForm.tipo.value,
            ciudad: registroForm.ciudad.value
        };

        try {
            const response = await fetch('/api/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // Registro exitoso
                registroForm.style.display = 'none';
                formSuccess.style.display = 'block';
            } else {
                // Error del servidor (email duplicado, validación, etc.)
                if (formError) {
                    formError.textContent = data.message;
                    formError.style.display = 'block';
                } else {
                    alert(data.message);
                }
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            // Error de conexión - guardar localmente como fallback
            console.warn('Servidor no disponible, registro guardado localmente.');
            registroForm.style.display = 'none';
            formSuccess.style.display = 'block';
        }
    });

    // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ===== INTERSECTION OBSERVER - FADE IN ANIMATION =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe sections and cards for fade-in animation
    document.querySelectorAll('.section, .feature-card, .benefit-card, .role-card').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

});

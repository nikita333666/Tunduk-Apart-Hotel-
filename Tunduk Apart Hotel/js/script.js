document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');

    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    });

    // Sticky Header
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Don't scroll for modal triggers
                if (targetId === '#') return;

                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Phone Input Mask
    function setupPhoneInput(input) {
        const prefix = '+996 ';

        function formatPhoneNumber(value) {
            if (!value.startsWith(prefix)) {
                return prefix;
            }

            let numbers = value.substring(prefix.length).replace(/\D/g, '');
            let formatted = prefix;

            if (numbers.length > 0) {
                formatted += '(' + numbers.substring(0, 3);
            }
            if (numbers.length >= 4) {
                formatted += ') ' + numbers.substring(3, 6);
            }
            if (numbers.length >= 7) {
                formatted += '-' + numbers.substring(6, 8);
            }
            if (numbers.length >= 9) {
                formatted += '-' + numbers.substring(8, 10);
            }
            
            return formatted.substring(0, prefix.length + 15); // +996 (XXX) XXX-XX-XX
        }

        input.addEventListener('input', (e) => {
            const formatted = formatPhoneNumber(e.target.value);
            e.target.value = formatted;
        });

        input.addEventListener('keydown', (e) => {
            if (e.target.selectionStart < prefix.length && (e.key === 'Backspace' || e.key === 'Delete')) {
                e.preventDefault();
            }
        });

        // Set initial placeholder and value
        input.placeholder = '+(996) XXX-XX-XX-XX';
        if (!input.value) { // Only set if no value is pre-filled
             input.value = prefix;
        }
    }

    document.querySelectorAll('input[type="tel"]').forEach(setupPhoneInput);


    // Layout Modal Logic
    const openLayoutModalBtns = document.querySelectorAll('.open-layout-modal-btn');
    const layoutModal = document.getElementById('layout-modal');

    if (layoutModal && openLayoutModalBtns.length > 0) {
        const modalImg = document.getElementById('layout-modal-img');
        const modalTitle = document.getElementById('layout-modal-title');
        const modalDesc = document.getElementById('layout-modal-desc');
        const modalPdf = document.getElementById('layout-modal-pdf');
        const viewToggleBtns = layoutModal.querySelectorAll('.view-toggle-btn');

        let currentLayoutId = null;
        let imgSrc2d = '';
        let imgSrc3d = '';

        openLayoutModalBtns.forEach(button => {
            button.addEventListener('click', () => {
                const imgSrc = button.dataset.imgSrc;
                currentLayoutId = button.dataset.layoutId;
                imgSrc2d = button.dataset['imgSrc-2d'];
                imgSrc3d = button.dataset['imgSrc-3d'];
                const title = button.dataset.title;
                const desc = button.dataset.desc;
                const pdfSrc = button.dataset.pdfSrc;



                modalImg.src = imgSrc;
                modalTitle.textContent = title;
                modalDesc.textContent = desc;

                if (pdfSrc && pdfSrc !== '#') {
                    modalPdf.href = pdfSrc;
                    modalPdf.style.display = 'inline-block';
                } else {
                    modalPdf.style.display = 'none';
                }

                // THIS IS THE CRITICAL FIX: Reset active state on all buttons first
                viewToggleBtns.forEach(btn => btn.classList.remove('active'));
                // Then, set the default (2D) button to active
                const defaultActiveButton = layoutModal.querySelector('.view-toggle-btn[data-view="2d"]');
                if (defaultActiveButton) {
                    defaultActiveButton.classList.add('active');
                }
                
                layoutModal.style.display = 'flex';
            });
        });

        viewToggleBtns.forEach(button => {
            button.addEventListener('click', () => {
                const view = button.dataset.view;
                const mainLayoutImg = document.getElementById(`layout-img-${currentLayoutId}`);

                const newSrc = (view === '2d') ? imgSrc2d : imgSrc3d;



                if (newSrc) {
                    modalImg.src = newSrc;
                    if (mainLayoutImg) {
                        mainLayoutImg.src = newSrc;
                    }
                }

                viewToggleBtns.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    // Universal Modal Logic
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const modals = document.querySelectorAll('.modal');

    openModalBtns.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.dataset.modal;
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'flex';
            }
        });
    });

    modals.forEach(modal => {
        const closeButton = modal.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Form Validation
    const handleFormSubmit = (form) => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = form.querySelector('input[name="name"]');
            const phoneInput = form.querySelector('input[name="phone"]');
            let isValid = true;

            // Simple validation
            if (nameInput.value.trim() === '') {
                alert('Пожалуйста, введите ваше имя.');
                isValid = false;
                return;
            }

            if (phoneInput.value.length < 10) { // Basic phone check
                alert('Пожалуйста, введите корректный номер телефона.');
                isValid = false;
                return;
            }

            if (isValid) {
                console.log('Form submitted:', { name: nameInput.value, phone: phoneInput.value });
                alert('Спасибо! Ваша заявка принята. Мы скоро с вами свяжемся.');

                form.reset();
                // Close modal if it's the modal form
                if(form.closest('.modal')) {
                    form.closest('.modal').style.display = 'none';
                }
            }
        });
    };

    const ctaForm = document.getElementById('cta-form');
    const consultationForm = document.getElementById('consultation-form');

    if (ctaForm) {
        handleFormSubmit(ctaForm);
    }
    if (consultationForm) {
        handleFormSubmit(consultationForm);
    }

    // Construction Stages Slider
    const constructionSection = document.getElementById('construction');
    if (constructionSection) {
        const stages = [
            {
                date: "Май 2024",
                image: "изображения/ход1.jpg",
                description: "Начало строительства. Подготовка площадки, завоз строительных материалов и установка ограждений."
            },
            {
                date: "Июль 2024",
                image: "изображения/ход2.jpg",
                description: "Работы по устройству фундамента. Заливка бетонной плиты и подготовка к возведению каркаса."
            },
            {
                date: "Сентябрь 2024",
                image: "изображения/ход3.jpg",
                description: "Возведение монолитного каркаса. Работы ведутся на уровне 3-го этажа."
            },
            {
                date: "Ноябрь 2024",
                image: "изображения/ход4.jpg",
                description: "Продолжение работ по возведению каркаса, начало кладочных работ на нижних этажах."
            },
            {
                date: "Январь 2025",
                image: "изображения/ход5.jpg",
                description: "Остекление. Начало монтажа оконных блоков и фасадных систем."
            }
        ];

        let currentIndex = 0;

        const timelineNav = constructionSection.querySelector('.construction-timeline-nav');
        const currentImage = constructionSection.querySelector('.current-stage-image');
        const currentDate = constructionSection.querySelector('.current-stage-date');
        const currentDescription = constructionSection.querySelector('.current-stage-description');
        const prevArrow = constructionSection.querySelector('.prev-arrow');
        const nextArrow = constructionSection.querySelector('.next-arrow');

        function updateSlider(index) {
            const stage = stages[index];
            currentImage.src = stage.image;
            currentDate.textContent = stage.date;
            currentDescription.textContent = stage.description;

            // Update active nav item
            const navItems = timelineNav.querySelectorAll('.timeline-nav-item');
            navItems.forEach((item, itemIndex) => {
                if (itemIndex === index) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            currentIndex = index;
        }

        function populateNav() {
            stages.forEach((stage, index) => {
                const navItem = document.createElement('button');
                navItem.className = 'timeline-nav-item';
                navItem.textContent = stage.date;
                navItem.dataset.index = index;
                timelineNav.appendChild(navItem);
            });
        }

        timelineNav.addEventListener('click', (e) => {
            if (e.target.classList.contains('timeline-nav-item')) {
                const index = parseInt(e.target.dataset.index, 10);
                updateSlider(index);
            }
        });

        prevArrow.addEventListener('click', () => {
            const newIndex = (currentIndex - 1 + stages.length) % stages.length;
            updateSlider(newIndex);
        });

        nextArrow.addEventListener('click', () => {
            const newIndex = (currentIndex + 1) % stages.length;
            updateSlider(newIndex);
        });

        // Initial setup
        populateNav();
        updateSlider(0);
    }

    // Scroll Animations
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll, .animate-fade-in, .animate-slide-left, .animate-slide-right, .animate-scale');
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    // Staggered animations for lists/grids
    function initStaggeredAnimations() {
        const staggeredGroups = document.querySelectorAll('.stagger-animation');
        
        staggeredGroups.forEach(group => {
            const children = group.children;
            Array.from(children).forEach((child, index) => {
                child.style.transitionDelay = `${index * 0.1}s`;
                child.classList.add('animate-scale');
            });
        });
    }

    // Smooth scroll enhancement
    function enhanceSmoothScroll() {
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
    }

    // Initialize all animations
    initScrollAnimations();
    initStaggeredAnimations();
    enhanceSmoothScroll();
});

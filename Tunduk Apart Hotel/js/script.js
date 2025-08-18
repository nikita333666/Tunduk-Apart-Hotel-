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

    // Video Reels Functionality
    const videoReelsContainer = document.querySelector('.video-reels-container');
    if (videoReelsContainer) {
        const videoReels = Array.from(videoReelsContainer.querySelectorAll('.video-reel'));
        const prevBtn = videoReelsContainer.querySelector('.video-nav-left');
        const nextBtn = videoReelsContainer.querySelector('.video-nav-right');
        const indicators = videoReelsContainer.querySelectorAll('.video-indicator');
        
        let currentVideo = 1; // Start with the middle video as active
        let players = [];
        let readyPlayerCount = 0;
        const iframes = videoReelsContainer.querySelectorAll('iframe');
        const totalIframes = iframes.length;

        // Set initial positions immediately to prevent FOUC
        videoReels.forEach(reel => { reel.style.transition = 'none'; });
        updateCarousel();
        // Re-enable transitions after a short delay, so they are ready for user interaction
        setTimeout(() => {
            videoReels.forEach(reel => { 
                reel.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'; 
            });
        }, 50);

        window.onYouTubeIframeAPIReady = function() {
            videoReels.forEach((reel, index) => {
                const videoId = reel.getAttribute('data-video-id');
                if (videoId) {
                    // Create a wrapper for the iframe to control aspect ratio
                    const videoWrapper = document.createElement('div');
                    videoWrapper.classList.add('video-wrapper');
                    reel.appendChild(videoWrapper);

                    players[index] = new YT.Player(videoWrapper, {
                        host: 'https://www.youtube-nocookie.com',
                        videoId: videoId,
                        playerVars: {
                            'autoplay': 0, // Autoplay is handled by updateCarousel
                            'controls': 0, /* Отключаем панель управления */
                            'autohide': 1,
                            'showinfo': 0,
                            'modestbranding': 1,
                            'loop': 1,
                            'playlist': videoId, // Required for loop
                            'rel': 0,
                            'iv_load_policy': 3,
                            'origin': window.location.origin
                        },
                        events: {
                            'onReady': onPlayerReady
                        }
                    });
                }
            });
        };

        function onPlayerReady(event) {
            event.target.mute();
            readyPlayerCount++;
            if (readyPlayerCount === videoReels.length) {
                // All players are ready, now make the container visible.
                requestAnimationFrame(() => {
                    videoReelsContainer.style.opacity = 1;
                    // Ensure the active video starts playing
                    if (players[currentVideo] && typeof players[currentVideo].playVideo === 'function') {
                        players[currentVideo].playVideo();
                    }
                });
            }
        }

        function updateCarousel() {
            const total = videoReels.length;
            const isMobile = window.innerWidth <= 768;

            videoReels.forEach((reel, i) => {
                const player = players[i];
                const prevIndex = (currentVideo - 1 + total) % total;
                const nextIndex = (currentVideo + 1) % total;

                // Stop all videos first
                if (player && typeof player.pauseVideo === 'function') {
                    player.pauseVideo();
                }
                reel.classList.remove('active');

                if (i === currentVideo) {
                    reel.style.transform = 'translateX(0) scale(1)';
                    reel.style.opacity = 1;
                    reel.style.zIndex = 10;
                    reel.classList.add('active');
                    if (player && typeof player.playVideo === 'function') {
                        player.playVideo();
                    }
                } else if (!isMobile && i === prevIndex) {
                    reel.style.transform = 'translateX(-220px) scale(0.8)';
                    reel.style.opacity = 0.5;
                    reel.style.zIndex = 5;
                } else if (!isMobile && i === nextIndex) {
                    reel.style.transform = 'translateX(220px) scale(0.8)';
                    reel.style.opacity = 0.5;
                    reel.style.zIndex = 5;
                } else {
                    reel.style.transform = 'scale(0.5)'; // Keep them small but hidden
                    reel.style.opacity = 0;
                    reel.style.zIndex = 0;
                }
            });

            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === currentVideo);
            });
        }

        // Add event listener to re-calculate on resize
        window.addEventListener('resize', updateCarousel);

        function showVideo(newIndex) {
            if (newIndex < 0 || newIndex >= videoReels.length) return;
            currentVideo = newIndex;
            updateCarousel();
        }
        
        function nextVideo() {
            const next = (currentVideo + 1) % videoReels.length;
            showVideo(next);
        }

        function prevVideo() {
            const prev = (currentVideo - 1 + videoReels.length) % videoReels.length;
            showVideo(prev);
        }
        
        // Navigation event listeners
        if (nextBtn) nextBtn.addEventListener('click', nextVideo);
        if (prevBtn) prevBtn.addEventListener('click', prevVideo);
        
        // Indicator clicks
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                if (index !== currentVideo) {
                    showVideo(index);
                }
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') nextVideo();
            if (e.key === 'ArrowLeft') prevVideo();
        });
        
        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        
        videoReelsContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        videoReelsContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    nextVideo(); // Swipe left - next video
                } else {
                    prevVideo(); // Swipe right - prev video
                }
            }
        }
        
        // The carousel is initialized in onPlayerReady to ensure players are loaded.
        // Add a script tag for the YouTube API to your HTML file:
        // <script src="https://www.youtube.com/iframe_api"></script>
    }

    // Simple Slider for About Section
    const aboutSlider = document.querySelector('.about-slider');
    if (aboutSlider) {
        const slides = aboutSlider.querySelectorAll('.simple-slide');
        const dots = aboutSlider.querySelectorAll('.simple-dot');
        const prevBtn = aboutSlider.querySelector('.simple-slider-prev');
        const nextBtn = aboutSlider.querySelector('.simple-slider-next');
        
        let currentSlide = 0;
        let autoSlideInterval;
        
        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            if (slides[index]) slides[index].classList.add('active');
            if (dots[index]) dots[index].classList.add('active');
            currentSlide = index;
        }
        
        function nextSlide() {
            const next = currentSlide < slides.length - 1 ? currentSlide + 1 : 0;
            showSlide(next);
        }
        
        function prevSlide() {
            const prev = currentSlide > 0 ? currentSlide - 1 : slides.length - 1;
            showSlide(prev);
        }
        
        if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoSlide(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoSlide(); });
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => { showSlide(index); resetAutoSlide(); });
        });
        
        function startAutoSlide() {
            autoSlideInterval = setInterval(nextSlide, 4000); // Change slide every 4 seconds
        }
        
        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        }
        
        // Start auto slide
        startAutoSlide();
        
        // Pause auto slide on hover
        aboutSlider.addEventListener('mouseenter', () => {
            clearInterval(autoSlideInterval);
        });
        
        aboutSlider.addEventListener('mouseleave', () => {
            startAutoSlide();
        });
    }

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
        let imgSrcFurnished = '';

        openLayoutModalBtns.forEach(button => {
            button.addEventListener('click', () => {
                const imgSrc = button.dataset.imgSrc;
                currentLayoutId = button.dataset.layoutId;
                imgSrc2d = button.getAttribute('data-img-src-2d');
                imgSrc3d = button.getAttribute('data-img-src-3d');
                imgSrcFurnished = button.getAttribute('data-img-src-furnished');
                const title = button.dataset.title;
                const desc = button.dataset.desc;
                const pdfSrc = button.dataset.pdfSrc;



                modalImg.src = imgSrc2d; // Always start with 2D image
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

                let newSrc;
                if (view === '2d') {
                    newSrc = imgSrc2d;
                } else if (view === '3d') {
                    newSrc = imgSrc3d;
                } else if (view === 'furnished') {
                    newSrc = imgSrcFurnished;
                }

                // Debug logging
                console.log('View:', view);
                console.log('imgSrc2d:', imgSrc2d);
                console.log('imgSrc3d:', imgSrc3d);
                console.log('imgSrcFurnished:', imgSrcFurnished);
                console.log('Selected newSrc:', newSrc);

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

        // Add zoom functionality to modal image
        modalImg.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (this.style.transform && this.style.transform.includes('scale')) {
                // Reset zoom
                this.style.transform = 'scale(1)';
                this.style.transformOrigin = 'center center';
                this.style.cursor = 'zoom-in';
            } else {
                // Zoom in at click point
                const xPercent = (x / rect.width) * 100;
                const yPercent = (y / rect.height) * 100;
                this.style.transformOrigin = `${xPercent}% ${yPercent}%`;
                this.style.transform = 'scale(2)';
                this.style.cursor = 'zoom-out';
            }
        });

        // Reset zoom when modal closes
        const layoutCloseBtn = layoutModal.querySelector('.layout-close');
        if (layoutCloseBtn) {
            layoutCloseBtn.addEventListener('click', () => {
                modalImg.classList.remove('zoomed');
                modalImg.style.transform = 'scale(1)';
                modalImg.style.transformOrigin = 'center center';
                modalImg.style.cursor = 'zoom-in';
            });
        }

        // Make layout card images clickable
        document.querySelectorAll('.layout-card-image img').forEach(img => {
            img.addEventListener('click', () => {
                // Find the corresponding button and trigger its click
                const card = img.closest('.layout-card');
                const button = card.querySelector('.open-layout-modal-btn');
                if (button) {
                    button.click();
                }
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

    // Construction Stories Navigation
    const constructionSection = document.getElementById('construction');
    if (constructionSection) {
        const storiesContainer = constructionSection.querySelector('.construction-stories');
        const stories = constructionSection.querySelectorAll('.construction-story');
        const indicators = constructionSection.querySelectorAll('.story-indicator');
        const leftArrow = constructionSection.querySelector('.story-nav-left');
        const rightArrow = constructionSection.querySelector('.story-nav-right');
        
        if (storiesContainer && stories.length > 0) {
            let currentStoryIndex = 0;
            
            function showStory(index) {
                // Hide all stories
                stories.forEach((story, i) => {
                    story.classList.remove('active');
                });
                
                // Show current story
                if (stories[index]) {
                    stories[index].classList.add('active');
                }
                
                // Update indicators
                indicators.forEach((indicator, i) => {
                    if (i === index) {
                        indicator.classList.add('active');
                    } else {
                        indicator.classList.remove('active');
                    }
                });
                
                currentStoryIndex = index;
            }
            
            // Navigation arrows
            if (leftArrow) {
                leftArrow.addEventListener('click', () => {
                    const newIndex = currentStoryIndex > 0 ? currentStoryIndex - 1 : stories.length - 1;
                    showStory(newIndex);
                });
            }
            
            if (rightArrow) {
                rightArrow.addEventListener('click', () => {
                    const newIndex = currentStoryIndex < stories.length - 1 ? currentStoryIndex + 1 : 0;
                    showStory(newIndex);
                });
            }
            
            // Indicator clicks
            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => {
                    showStory(index);
                });
            });
            
            // Auto-advance stories (optional)
            let autoAdvanceTimer;
            
            function startAutoAdvance() {
                autoAdvanceTimer = setInterval(() => {
                    const nextIndex = currentStoryIndex < stories.length - 1 ? currentStoryIndex + 1 : 0;
                    showStory(nextIndex);
                }, 4000); // Change story every 4 seconds
            }
            
            function stopAutoAdvance() {
                if (autoAdvanceTimer) {
                    clearInterval(autoAdvanceTimer);
                }
            }
            
            // Start auto-advance when section comes into view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        startAutoAdvance();
                    } else {
                        stopAutoAdvance();
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(constructionSection);
            
            // Pause auto-advance on hover
            storiesContainer.addEventListener('mouseenter', stopAutoAdvance);
            storiesContainer.addEventListener('mouseleave', startAutoAdvance);
            
            // Initialize first story
            showStory(0);
        }
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

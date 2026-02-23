import { useState, useEffect, useRef } from 'react';
import Atropos from 'atropos/react';
import 'atropos/css';
import './App.css';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useCart } from './CartContext.jsx';
import { useAuth } from './AuthContext.jsx';
import AuthModal from './AuthModal.jsx';
import { db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

function App() {
    const appRef = useRef(null);
    const [scrollY, setScrollY] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [mobileMenuActive, setMobileMenuActive] = useState(false);
    const [isProductCardOpen, setIsProductCardOpen] = useState(false);
    const [isLocandaExiting, setIsLocandaExiting] = useState(false);
    const [isExiting, setIsExiting] = useState(false); // Used for scroll-to-top
    const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth > 1000 : true);
    const { addToCart, cartItems, cartCount, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
    const { user, logout } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false);
    const [isCartPreviewClosing, setIsCartPreviewClosing] = useState(false);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [cartAddedFlash, setCartAddedFlash] = useState(false);
    const [isBorsaHovered, setIsBorsaHovered] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderConfirmed, setOrderConfirmed] = useState(false);
    const borsaVideoRef = useRef(null);
    const reverseAnimationRef = useRef(null);
    const borsaWrapperRef = useRef(null); // Ref for mobile fixed positioning

    // Lock body scroll when cart modal is open
    useEffect(() => {
        if (isCartModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isCartModalOpen]);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth > 1000);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Refs for dynamic height calculation
    const counterRef = useRef(null);
    const pedestalRef = useRef(null);
    const bannerRef = useRef(null); // Ref for the promo banner
    const headerRef = useRef(null); // Ref for the main header (logo)
    const hamburgerRef = useRef(null); // Ref for the hanging hamburger menu
    const accessoHangingRef = useRef(null); // Ref for the hanging Accesso button
    const locandaSceneRef = useRef(null); // Ref for the main locanda scene
    const modalRef = useRef(null); // Ref for the product card modal

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [])

    // Calculate counter and pedestal heights dynamically
    useEffect(() => {
        const updateHeights = () => {
            if (counterRef.current) {
                const counterHeight = counterRef.current.offsetHeight;
                document.documentElement.style.setProperty('--counter-height', `${counterHeight}px`);
            }
            if (pedestalRef.current) {
                const pedestalHeight = pedestalRef.current.offsetHeight;
                document.documentElement.style.setProperty('--pedestal-height', `${pedestalHeight}px`);
            }
        };

        // Update on mount and resize
        updateHeights();
        window.addEventListener('resize', updateHeights);

        // Also update when images load
        const counterImg = counterRef.current;
        const pedestalImg = pedestalRef.current;
        if (counterImg) counterImg.addEventListener('load', updateHeights);
        if (pedestalImg) pedestalImg.addEventListener('load', updateHeights);

        return () => {
            window.removeEventListener('resize', updateHeights);
            if (counterImg) counterImg.removeEventListener('load', updateHeights);
            if (pedestalImg) pedestalImg.removeEventListener('load', updateHeights);
        };
    }, [isProductCardOpen]);

    // Mobile Header Positioning - Dynamic Top
    useEffect(() => {
        const updateHeaderPosition = () => {
            if (bannerRef.current && window.innerWidth <= 1000) {
                const bannerHeight = bannerRef.current.offsetHeight;
                // Calcoliamo il top dinamico basandoci sull'altezza reale del banner meno offset
                const topValBorsa = `${bannerHeight - 6}px`;
                const topValAccesso = `${bannerHeight + 2}px`; // Più in basso rispetto agli altri

                if (accessoHangingRef.current) {
                    accessoHangingRef.current.style.setProperty('top', topValAccesso, 'important');
                }
                if (borsaWrapperRef.current) {
                    borsaWrapperRef.current.style.setProperty('top', topValBorsa, 'important');
                }
            } else {
                if (accessoHangingRef.current) accessoHangingRef.current.style.removeProperty('top');
                if (borsaWrapperRef.current) borsaWrapperRef.current.style.removeProperty('top');
            }
        };

        updateHeaderPosition();
        window.addEventListener('resize', updateHeaderPosition);
        setTimeout(updateHeaderPosition, 100);

        return () => window.removeEventListener('resize', updateHeaderPosition);
    }, [isDesktop]); // Re-run when desktop state changes

    const scrollToTop = () => {
        gsap.to(window, { duration: 0.8, scrollTo: 0, ease: "power3.inOut" });
    };

    const scrollToSection = (e, targetId) => {
        e.preventDefault();
        setMobileMenuActive(false);
        gsap.to(window, { duration: 0.8, scrollTo: { y: targetId, offsetY: 0 }, ease: "power3.inOut" });
    };

    useGSAP(() => {
        // Hero initial animations
        gsap.from('.hero-relic-banner', {
            opacity: 0,
            y: 50,
            duration: 1.5,
            delay: 0.2,
            ease: "power3.out"
        });

        // Locanda animations
        gsap.from('.locanda-title-img', {
            scrollTrigger: { trigger: '.locanda-section', start: 'top 80%', toggleActions: 'play none none reverse' },
            y: -30, opacity: 0, duration: 1, ease: "back.out(1.7)"
        });
        gsap.from('.counter-image', {
            scrollTrigger: { trigger: '.locanda-section', start: 'top 80%', toggleActions: 'play none none reverse' },
            y: 50, opacity: 0, duration: 1.2
        });
        gsap.from('.bottle-container', {
            scrollTrigger: { trigger: '.locanda-section', start: 'top 80%', toggleActions: 'play none none reverse' },
            scale: 0.5, opacity: 0, duration: 1, ease: "elastic.out(1, 0.5)"
        });

        // Chi Siamo animations
        gsap.from('.chisiamo-title-img', {
            scrollTrigger: { trigger: '.chisiamo-title-img', start: 'top bottom', toggleActions: 'play none none reverse' },
            scale: 0.8, opacity: 0, duration: 1, ease: "power2.out"
        });
        gsap.from('.chisiamo-section .medieval-frame', {
            scrollTrigger: { trigger: '.chisiamo-section .medieval-frame', start: 'top bottom', toggleActions: 'play none none reverse' },
            y: 50, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power2.out"
        });


        // Process Section
        gsap.from('.nettare-title-img', {
            scrollTrigger: { trigger: '.nettare-title-img', start: 'top bottom', toggleActions: 'play none none reverse' },
            y: -50, opacity: 0, duration: 1, ease: "power2.out"
        });
        gsap.from('.process-card-frame', {
            scrollTrigger: { trigger: '.process-card-frame', start: 'top bottom', toggleActions: 'play none none reverse' },
            x: -50, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power2.out"
        });

        // About Section
        gsap.from('.parchment-content', {
            scrollTrigger: { trigger: '.parchment-content', start: 'top bottom', toggleActions: 'play none none reverse' },
            opacity: 0, y: 50, duration: 1.5, ease: "power2.out"
        });
    }, { scope: appRef });

    // Handle Locanda Modal Animations with GSAP React State Dependencies
    useGSAP(() => {
        if (isProductCardOpen && !isLocandaExiting) {
            if (locandaSceneRef.current) gsap.to(locandaSceneRef.current, { x: '-100vw', opacity: 0, duration: 0.5, ease: "power2.inOut" });
            if (modalRef.current) gsap.fromTo(modalRef.current, { x: '100vw', opacity: 0 }, { x: '0', opacity: 1, duration: 0.8, ease: "back.out(1)", delay: 0.3 });
        } else if (isLocandaExiting) {
            if (modalRef.current) {
                gsap.to(modalRef.current, {
                    x: '100vw', opacity: 0, duration: 0.5, ease: "power2.in", onComplete: () => {
                        setIsProductCardOpen(false);
                        setIsLocandaExiting(false);
                    }
                });
            } else {
                setIsProductCardOpen(false);
                setIsLocandaExiting(false);
            }
            if (locandaSceneRef.current) gsap.to(locandaSceneRef.current, { x: '0', opacity: 1, duration: 0.8, ease: "back.out(1)", delay: 0.3 });
        }
    }, { dependencies: [isProductCardOpen, isLocandaExiting], scope: appRef });


    // Show scroll to top button after scrolling down 300px
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Lock body scroll when modal is open
    // Lock body scroll when modal OR mobile menu is open
    useEffect(() => {
        if (showDetailsModal || mobileMenuActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showDetailsModal, mobileMenuActive]);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);

            const shouldShow = window.scrollY > 300;

            if (shouldShow && !showScrollButton) {
                // Show button
                setShowScrollButton(true);
                setIsExiting(false);
            } else if (!shouldShow && showScrollButton) {
                // Start exit animation
                setIsExiting(true);
                // Remove button after animation completes
                setTimeout(() => {
                    setShowScrollButton(false);
                    setIsExiting(false);
                }, 800); // Match animation duration
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showScrollButton]);

    return (
        <div className="app-container" ref={appRef}>
            {/* Background Video */}
            <video
                className="background-video"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src="/assets/tavern_bg.mp4" type="video/mp4" />
            </video>

            {/* Scroll to Top Button - Desktop Only */}
            {showScrollButton && (
                <button
                    className={`scroll-to-top-btn ${isExiting ? 'exiting' : ''}`}
                    onClick={scrollToTop}
                >
                    <img src="/assets/TornaSu.png" alt="Torna Su" className="scroll-btn-image" />
                    <img src="/assets/TornaSu_fuoco.png" alt="Torna Su" className="scroll-btn-image-fire" />
                    <span className="fire-particle fire-1"></span>
                    <span className="fire-particle fire-2"></span>
                    <span className="fire-particle fire-3"></span>
                    <span className="fire-particle fire-4"></span>
                    <span className="fire-particle fire-5"></span>
                    <span className="fire-particle fire-6"></span>
                    <span className="smoke-particle smoke-1"></span>
                    <span className="smoke-particle smoke-2"></span>
                </button>
            )}

            {/* Hanging Hamburger Menu - Mobile Only */}
            <div
                ref={hamburgerRef}
                className={`hamburger-hanging-sign ${mobileMenuActive ? 'active' : ''}`}
                onClick={() => setMobileMenuActive(!mobileMenuActive)}
            >
                <img src="/assets/HamburgerMenu.png" alt="Menu" className="hamburger-sign-image" />
                <img src="/assets/HamburgerMenu_fuoco.png" alt="Menu" className="hamburger-sign-image-fire" />
                <span className="fire-particle fire-1"></span>
                <span className="fire-particle fire-2"></span>
                <span className="fire-particle fire-3"></span>
                <span className="fire-particle fire-4"></span>
                <span className="fire-particle fire-5"></span>
                <span className="fire-particle fire-6"></span>
                <span className="smoke-particle smoke-1"></span>
                <span className="smoke-particle smoke-2"></span>
            </div>



            {/* Medieval Mobile Menu - Overlay */}
            <div
                id="medievalMenuOverlay"
                className={`medieval-menu-overlay ${mobileMenuActive ? 'active' : ''}`}
                onClick={(e) => {
                    if (e.target.id === 'medievalMenuOverlay') {
                        setMobileMenuActive(false);
                    }
                }}
            >
                <div className="parchment-scroll">
                    <button
                        className="mobile-menu-close-btn"
                        onClick={() => setMobileMenuActive(false)}
                        aria-label="Close Menu"
                    >
                        ✕
                    </button>
                    <div className="scroll-top-roll"></div>

                    <nav>
                        <ul className="medieval-nav-links">
                            <li><a href="#locanda" onClick={(e) => scrollToSection(e, '#locanda')}>La Locanda</a></li>
                            <li><a href="#chisiamo" onClick={(e) => scrollToSection(e, '#chisiamo')}>Chi Siamo</a></li>
                            <li><a href="#process" onClick={(e) => scrollToSection(e, '#process')}>Il Nettare</a></li>
                            <li><a href="#about" onClick={(e) => scrollToSection(e, '#about')}>La Leggenda</a></li>
                        </ul>
                    </nav>
                </div>
            </div>

            <div className="top-promo-banner" ref={bannerRef}>
                <div className="promo-scroll-track">
                    <p>⚡ ACQUISTA 3 BOTTIGLIE E RICEVI IL 10% DI SCONTO - SPEDIZIONE GRATUITA SOPRA I 50€ ⚡ &nbsp;&nbsp;|&nbsp;&nbsp; </p>
                    <p>⚡ ACQUISTA 3 BOTTIGLIE E RICEVI IL 10% DI SCONTO - SPEDIZIONE GRATUITA SOPRA I 50€ ⚡ &nbsp;&nbsp;|&nbsp;&nbsp; </p>
                </div>
            </div>

            {/* Gradient overlay for readability */}
            <div className="mobile-header-gradient"></div>

            <header className="main-header" ref={headerRef}>
                {/* Logo Stendardo - left, clickable home button */}
                <a href="/" className="logo-stendardo-container" onClick={() => window.location.reload()}>
                    <img src="/assets/LogoStendardo.png" alt="Vergilius Nectar" className="logo-stendardo" />
                </a>

                {/* Navigation with separate blocks - right */}
                <nav className="nav-blocks">
                    <a href="#locanda" className="nav-block" onClick={(e) => scrollToSection(e, '#locanda')}>
                        <img src="/assets/LaLocanda.png" alt="La Locanda" className="nav-sign-image" />
                        <img src="/assets/LaLocanda_fuoco.png" alt="La Locanda" className="nav-sign-image-fire" />
                        <span className="fire-particle fire-1"></span>
                        <span className="fire-particle fire-2"></span>
                        <span className="fire-particle fire-3"></span>
                        <span className="fire-particle fire-4"></span>
                        <span className="fire-particle fire-5"></span>
                        <span className="fire-particle fire-6"></span>
                        <span className="smoke-particle smoke-1"></span>
                        <span className="smoke-particle smoke-2"></span>
                    </a>
                    <a href="#chisiamo" className="nav-block" onClick={(e) => scrollToSection(e, '#chisiamo')}>
                        <img src="/assets/ChiSiamo.png" alt="Chi Siamo" className="nav-sign-image" />
                        <img src="/assets/ChiSiamo_fuoco.png" alt="Chi Siamo" className="nav-sign-image-fire" />
                        <span className="fire-particle fire-1"></span>
                        <span className="fire-particle fire-2"></span>
                        <span className="fire-particle fire-3"></span>
                        <span className="fire-particle fire-4"></span>
                        <span className="fire-particle fire-5"></span>
                        <span className="fire-particle fire-6"></span>
                        <span className="smoke-particle smoke-1"></span>
                        <span className="smoke-particle smoke-2"></span>
                    </a>
                    <a href="#process" className="nav-block" onClick={(e) => scrollToSection(e, '#process')}>
                        <img src="/assets/Nettare.png" alt="Il Nettare" className="nav-sign-image" />
                        <img src="/assets/Nettare_fuoco.png" alt="Il Nettare" className="nav-sign-image-fire" />
                        <span className="fire-particle fire-1"></span>
                        <span className="fire-particle fire-2"></span>
                        <span className="fire-particle fire-3"></span>
                        <span className="fire-particle fire-4"></span>
                        <span className="fire-particle fire-5"></span>
                        <span className="fire-particle fire-6"></span>
                        <span className="smoke-particle smoke-1"></span>
                        <span className="smoke-particle smoke-2"></span>
                    </a>
                    <a href="#about" className="nav-block" onClick={(e) => scrollToSection(e, '#about')}>
                        <img src="/assets/Leggenda.png" alt="La Leggenda" className="nav-sign-image" />
                        <img src="/assets/Leggenda_fuoco.png" alt="La Leggenda" className="nav-sign-image-fire" />
                        <span className="fire-particle fire-1"></span>
                        <span className="fire-particle fire-2"></span>
                        <span className="fire-particle fire-3"></span>
                        <span className="fire-particle fire-4"></span>
                        <span className="fire-particle fire-5"></span>
                        <span className="fire-particle fire-6"></span>
                        <span className="smoke-particle smoke-1"></span>
                        <span className="smoke-particle smoke-2"></span>
                    </a>
                </nav>

                {/* Right Actions Container: Borsa then Accedi */}
                <div className="right-actions-container">
                    {/* Borsa / Cart Button with Preview Bubble */}
                    <div
                        ref={borsaWrapperRef}
                        className="borsa-wrapper"
                        onMouseEnter={() => {
                            // Cancel any in-progress reverse animation
                            if (reverseAnimationRef.current) {
                                cancelAnimationFrame(reverseAnimationRef.current);
                                reverseAnimationRef.current = null;
                            }
                            setIsBorsaHovered(true);
                            setIsCartPreviewClosing(false);
                            setIsCartPreviewOpen(true);
                            if (borsaVideoRef.current) {
                                const v = borsaVideoRef.current;
                                v.playbackRate = 4;
                                v.currentTime = 0;
                                v.play();
                            }
                        }}
                        onMouseLeave={() => {
                            setIsBorsaHovered(false);
                            // Trigger closing animation, then unmount
                            setIsCartPreviewClosing(true);
                            setTimeout(() => {
                                setIsCartPreviewOpen(false);
                                setIsCartPreviewClosing(false);
                            }, 350);
                            // Reverse the video using RAF
                            if (borsaVideoRef.current) {
                                const v = borsaVideoRef.current;
                                v.pause();
                                const startVideoTime = v.currentTime;
                                const startNow = performance.now();
                                const speed = 4;
                                const reverseStep = (now) => {
                                    const elapsed = (now - startNow) / 1000;
                                    const newTime = startVideoTime - elapsed * speed;
                                    if (newTime <= 0) {
                                        v.currentTime = 0;
                                        reverseAnimationRef.current = null;
                                        return;
                                    }
                                    v.currentTime = newTime;
                                    reverseAnimationRef.current = requestAnimationFrame(reverseStep);
                                };
                                reverseAnimationRef.current = requestAnimationFrame(reverseStep);
                            }
                        }}
                    >
                        {/* Cart Preview Speech Bubble */}
                        {isCartPreviewOpen && (
                            <div className={`cart-preview-bubble${isCartPreviewClosing ? ' is-closing' : ''}`}>
                                <div className="cart-preview-arrow"></div>
                                {cartItems.length === 0 ? (
                                    <div className="cart-preview-empty-state">
                                        <p className="cart-preview-empty">Il tuo carrello è vuoto.</p>
                                        <button
                                            className="cart-preview-btn"
                                            onClick={(e) => { e.stopPropagation(); setIsCartModalOpen(true); setIsCartPreviewOpen(false); }}
                                        >
                                            Visualizza Carrello
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <ul className="cart-preview-list">
                                            {cartItems.map(item => (
                                                <li key={item.id} className="cart-preview-item">
                                                    <img src={item.image} alt={item.name} className="cart-preview-thumb" />
                                                    <div className="cart-preview-info">
                                                        <span className="cart-preview-name">{item.name}</span>
                                                        <span className="cart-preview-qty">x{item.quantity} — €{(item.price * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                    <button
                                                        className="cart-preview-remove"
                                                        onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                                                        aria-label="Rimuovi"
                                                    >
                                                        🗑️
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="cart-preview-footer">
                                            <span className="cart-preview-total">Totale: €{cartTotal.toFixed(2)}</span>
                                            <button
                                                className="cart-preview-btn"
                                                onClick={(e) => { e.stopPropagation(); setIsCartModalOpen(true); setIsCartPreviewOpen(false); }}
                                            >
                                                Visualizza Carrello
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <button
                            className={`borsa-hanging-sign ${isBorsaHovered ? 'is-hovered' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setIsCartModalOpen(true); }}
                            aria-label="Apri carrello"
                        >
                            <video
                                ref={borsaVideoRef}
                                src="/assets/Borsa_Animazione.webm"
                                className="borsa-sign-video"
                                muted
                                playsInline
                            />
                        </button>

                        {/* Wax Seal Badge */}
                        {cartCount > 0 && (
                            <span className="cart-badge">{cartCount}</span>
                        )}
                    </div>

                    {user ? (
                        <div className="user-avatar-btn" onClick={logout} title="Clicca per uscire">
                            {user.photoURL
                                ? <img src={user.photoURL} alt={user.displayName} className="user-photo" />
                                : <span className="user-initials">{(user.displayName || user.email || '?')[0].toUpperCase()}</span>
                            }
                            <span className="user-name-short">{user.displayName?.split(' ')[0] || 'Profilo'}</span>
                        </div>
                    ) : (
                        <button
                            ref={accessoHangingRef}
                            className="accesso-hanging-sign"
                            onClick={() => setIsAuthModalOpen(true)}
                            aria-label="Accedi al tuo account"
                        >
                            <img src="/assets/Accesso.png" alt="Accedi" className="accesso-sign-image accesso-mobile" />
                            <img src="/assets/Accesso_fuoco.png" alt="Accedi" className="accesso-sign-image-fire accesso-mobile" />
                            <img src="/assets/Accedi_Desktop.png" alt="Accedi" className="accesso-sign-image accesso-desktop" />
                            <img src="/assets/Accedi_Desktop_fuoco.png" alt="Accedi" className="accesso-sign-image-fire accesso-desktop" />
                            <span className="fire-particle fire-1"></span>
                            <span className="fire-particle fire-2"></span>
                            <span className="fire-particle fire-3"></span>
                            <span className="fire-particle fire-4"></span>
                            <span className="fire-particle fire-5"></span>
                            <span className="fire-particle fire-6"></span>
                            <span className="smoke-particle smoke-1"></span>
                            <span className="smoke-particle smoke-2"></span>
                        </button>
                    )}
                </div>
            </header>

            <main>
                <section id="hero" className="hero-section">
                    <div className="hero-perspective-container">
                        {isDesktop ? (
                            <Atropos
                                className="hero-relic-atropos"
                                activeOffset={40}
                                shadowScale={1.05}
                            >
                                <div className="hero-relic-banner">
                                    <div className="relic-content" data-atropos-offset="5">
                                        <h1 className="relic-title">Vergilius Nectar</h1>
                                        <p className="relic-subtitle">
                                            Oltrepassate la soglia e scoprite l'elisir degli antichi dei. <br />
                                            Qui, dove il tempo si ferma e la leggenda prende vita, <br />
                                            custodiamo il segreto del miele dorato, forgiato nel fuoco e nella passione. <br />
                                            Un nettare puro, crudo e selvaggio, attende solo chi ha il coraggio di assaporare la storia.
                                        </p>
                                    </div>
                                </div>
                            </Atropos>
                        ) : (
                            <div className="hero-relic-banner">
                                <div className="relic-content">
                                    <h1 className="relic-title">Vergilius Nectar</h1>
                                    <p className="relic-subtitle">
                                        Oltrepassate la soglia e scoprite l'elisir degli antichi dei. <br />
                                        Qui, dove il tempo si ferma e la leggenda prende vita, <br />
                                        custodiamo il segreto del miele dorato, forgiato nel fuoco e nella passione. <br />
                                        Un nettare puro, crudo e selvaggio, attende solo chi ha il coraggio di assaporare la storia.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <a href="#locanda" className="scroll-sign-container" onClick={(e) => scrollToSection(e, '#locanda')}>
                        <img src="/assets/ScorriGiu.png" alt="Scorri Giù" className="scroll-sign-image" />
                        <img src="/assets/ScorriGiu_fuoco.png" alt="Scorri Giù" className="scroll-sign-image-fire" />
                        <span className="fire-particle fire-1"></span>
                        <span className="fire-particle fire-2"></span>
                        <span className="fire-particle fire-3"></span>
                        <span className="fire-particle fire-4"></span>
                        <span className="fire-particle fire-5"></span>
                        <span className="fire-particle fire-6"></span>
                        <span className="smoke-particle smoke-1"></span>
                        <span className="smoke-particle smoke-2"></span>
                    </a>
                </section>

                <section id="locanda" className="locanda-section locanda-background">
                    {/* Interactive Scene */}
                    <div
                        className="locanda-scene"
                        ref={locandaSceneRef}
                    >
                        <img src="/assets/LaLocandaTitolo.png" alt="La Locanda" className="locanda-title-img" />
                        <div className="locanda-counter-gradient"></div>
                        <img ref={counterRef} src="/assets/BanconeLocanda.png" alt="Bancone" className="counter-image" />
                        <div className="bottle-container" onClick={() => setIsProductCardOpen(true)}>
                            <div className="speech-bubble">
                                Schiaccia qui per assaporare l'immortalità!
                                <div className="speech-bubble-arrow"></div>
                            </div>
                            <img src="/product.png" alt="Vergilius Nectar Bottle" className="interactive-bottle" />
                        </div>
                    </div>

                    {/* Product Card Inline (Visible when card is open) */}
                    {isProductCardOpen && (
                        <div className="lava-rock-card-inner modal-card" ref={modalRef}>
                            <div className="modal-close-btn-container" onClick={() => setIsLocandaExiting(true)}>
                                <img src="/assets/TastoChiudi.png" alt="Chiudi" className="close-btn-base" />
                                <img src="/assets/TastoChiudi_fuoco.png" alt="Chiudi" className="close-btn-hover" />
                                <div className="particle"></div>
                                <div className="particle"></div>
                                <div className="particle"></div>
                                <div className="particle"></div>
                            </div>
                            {/* Left: Product Image */}
                            <div className="product-image-section">
                                <div className="product-pedestal-gradient"></div>
                                <img ref={pedestalRef} src="/assets/Piedistallo.png" alt="Piedistallo" className="product-pedestal" />
                                <img src="/product.png" alt="Vergilius Nectar Bottle" className="product-bottle-centered" />
                            </div>

                            {/* Right: Product Content */}
                            <div className="product-content-section">
                                <h1 className="product-title-description">
                                    Idromele Artigianale Non Filtrato
                                    <span className="product-variant-detail">Bottiglia da 0,7L</span>
                                </h1>

                                {/* Price */}
                                <div className="price-section">
                                    <div className="price-tag">€25,00 EUR</div>
                                    <p className="tax-info">Imposte incluse.</p>
                                </div>

                                {/* Quantity Selector */}
                                {/* Quantity and Add to Cart Row */}
                                <div className="mobile-action-row-main">
                                    <div className="quantity-section-compact">
                                        <div className="quantity-selector-box">
                                            <button
                                                className="quantity-btn-box"
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                aria-label="Diminuisci quantità"
                                            >
                                                −
                                            </button>
                                            <span className="quantity-display-box">{quantity}</span>
                                            <button
                                                className="quantity-btn-box"
                                                onClick={() => setQuantity(Math.min(99, quantity + 1))}
                                                aria-label="Aumenta quantità"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        className="cta-button add-to-cart"
                                        onClick={() => {
                                            addToCart({
                                                id: 'idromele-07l',
                                                name: 'Idromele Artigianale Non Filtrato',
                                                variant: 'Bottiglia da 0,7L',
                                                price: 25.00,
                                                image: '/product.png',
                                            }, quantity);
                                            setCartAddedFlash(true);
                                            setTimeout(() => setCartAddedFlash(false), 1800);
                                        }}
                                    >
                                        {cartAddedFlash ? '✨ AGGIUNTO!' : 'AGGIUNGI AL CARRELLO'}
                                    </button>
                                </div>

                                {/* Secondary Links Row */}
                                <div className="mobile-action-row-secondary">
                                    <span className="product-details-link" onClick={() => setShowDetailsModal(true)}>Dettagli del prodotto</span>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                <section id="chisiamo" className="chisiamo-section medieval-theme">
                    {/* Title - Independent */}
                    <div className="title-container">
                        <img src="/assets/ChiSiamoTitolo.png" alt="Chi Siamo" className="chisiamo-title-img" />
                    </div>

                    {/* Main Description Card */}
                    <div className="medieval-frame main-card-frame">
                        <div className="medieval-content">
                            {/* Ornamenti */}
                            <div className="ornament ornament-corner top-left-orn"></div>
                            <div className="ornament ornament-corner top-right-orn"></div>
                            <div className="ornament ornament-corner bottom-left-orn"></div>
                            <div className="ornament ornament-corner bottom-right-orn"></div>

                            <div className="medieval-box main-description">
                                <p>
                                    Siamo i custodi di un'antica tradizione, nati nelle terre nebbiose di Mantova.
                                    Il nostro idromele non è solo una bevanda, ma un richiamo a tempi dimenticati,
                                    dove la natura dettava i ritmi e il fuoco forgiava le leghe più resistenti.
                                    Crediamo nella purezza, nel rispetto delle materie prime e nella pazienza
                                    necessaria per creare qualcosa di veramente eterno.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mission & Vision Grid */}
                    <div className="mission-vision-grid">
                        {/* Mission Card */}
                        <div className="medieval-frame small-card-frame">
                            <div className="medieval-content">
                                {/* Ornamenti */}
                                <div className="ornament ornament-corner top-left-orn"></div>
                                <div className="ornament ornament-corner top-right-orn"></div>
                                <div className="ornament ornament-corner bottom-left-orn"></div>
                                <div className="ornament ornament-corner bottom-right-orn"></div>

                                <div className="medieval-box small-box mission-box">
                                    <div className="icon-wrapper">
                                        {/* Target/Darts SVG */}
                                        <svg viewBox="0 0 24 24" className="medieval-icon" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <circle cx="12" cy="12" r="10" />
                                            <circle cx="12" cy="12" r="6" />
                                            <circle cx="12" cy="12" r="2" />
                                            <path d="M12 2v20M2 12h20" strokeLinecap="round" />
                                        </svg>
                                        <div className="shine-effect"></div>
                                    </div>
                                    <h3>La Nostra Missione</h3>
                                    <p>Riportare in vita il sapore autentico dell'idromele, senza compromessi, per chi cerca l'eccellenza.</p>
                                </div>
                            </div>
                        </div>

                        {/* Vision Card */}
                        <div className="medieval-frame small-card-frame">
                            <div className="medieval-content">
                                {/* Ornamenti */}
                                <div className="ornament ornament-corner top-left-orn"></div>
                                <div className="ornament ornament-corner top-right-orn"></div>
                                <div className="ornament ornament-corner bottom-left-orn"></div>
                                <div className="ornament ornament-corner bottom-right-orn"></div>

                                <div className="medieval-box small-box vision-box">
                                    <div className="icon-wrapper">
                                        {/* Eye SVG */}
                                        <svg viewBox="0 0 24 24" className="medieval-icon" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                        <div className="shine-effect"></div>
                                    </div>
                                    <h3>La Nostra Visione</h3>
                                    <p>Un mondo dove la qualità artigianale trionfa sulla produzione di massa, un sorso alla volta.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mead Making Process Section */}
                <section id="process" className="process-section">
                    <div className="process-container">
                        <div className="process-content">
                            <div className="title-container">
                                <img src="/assets/IlNettareTitolo.png" alt="L'Arte Ancestrale del Nettare" className="nettare-title-img" />
                            </div>
                            <div className="process-steps">
                                <div className="medieval-frame process-card-frame">
                                    <div className="medieval-content">
                                        {/* Ornamenti */}
                                        <div className="ornament ornament-corner top-left-orn"></div>
                                        <div className="ornament ornament-corner top-right-orn"></div>
                                        <div className="ornament ornament-corner bottom-left-orn"></div>
                                        <div className="ornament ornament-corner bottom-right-orn"></div>

                                        <div className="medieval-box process-box">
                                            <h3>Il Miele Dorato</h3>
                                            <p>
                                                Dal miele pregiato Vergilius Nectar®, le api custodi raccolgono
                                                il prezioso nettare. Gocce d'oro puro, benedette dal sole,
                                                portano in sé la forza della natura selvaggia.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="medieval-frame process-card-frame">
                                    <div className="medieval-content">
                                        {/* Ornamenti */}
                                        <div className="ornament ornament-corner top-left-orn"></div>
                                        <div className="ornament ornament-corner top-right-orn"></div>
                                        <div className="ornament ornament-corner bottom-left-orn"></div>
                                        <div className="ornament ornament-corner bottom-right-orn"></div>

                                        <div className="medieval-box process-box">
                                            <h3>L'Unione Primordiale</h3>
                                            <p>
                                                Nelle profondità delle botti di rovere, miele e acqua
                                                si fondono in un rituale antico. La magia inizia
                                                quando gli elementi si riconoscono come uno.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="medieval-frame process-card-frame">
                                    <div className="medieval-content">
                                        {/* Ornamenti */}
                                        <div className="ornament ornament-corner top-left-orn"></div>
                                        <div className="ornament ornament-corner top-right-orn"></div>
                                        <div className="ornament ornament-corner bottom-left-orn"></div>
                                        <div className="ornament ornament-corner bottom-right-orn"></div>

                                        <div className="medieval-box process-box">
                                            <h3>La Sacra Fermentazione</h3>
                                            <p>
                                                Lieviti ancestrali danzano nel liquido ambrato,
                                                trasformando dolcezza in potere. Settimane diventano mesi,
                                                mentre l'elisir forgia la sua anima immortale.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="medieval-frame process-card-frame">
                                    <div className="medieval-content">
                                        {/* Ornamenti */}
                                        <div className="ornament ornament-corner top-left-orn"></div>
                                        <div className="ornament ornament-corner top-right-orn"></div>
                                        <div className="ornament ornament-corner bottom-left-orn"></div>
                                        <div className="ornament ornament-corner bottom-right-orn"></div>

                                        <div className="medieval-box process-box">
                                            <h3>Il Sigillo Eterno</h3>
                                            <p>
                                                Crudo come il ferro forgiato, intatto come pietra millenaria.
                                                Nessun filtro profana la sua essenza, nessun calore ne spezza
                                                lo spirito. Così riposa, aspettando degni bevitori.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="about" className="about-section">
                    <div className="parchment-container">
                        <div className="parchment-content">
                            <h2>Cronache di Virgilio</h2>
                            <p>
                                "Nelle terre nebbiose di Mantova, ove il Mincio scorre lento,
                                i saggi custodiscono il segreto del Vergilius Nectar®."
                            </p>
                            <br />
                            <p>
                                Il nostro idromele non è semplice bevanda, ma un ponte verso un passato dimenticato.
                                Fermentato naturalmente, non filtrato, crudo come la terra da cui nasce.
                                Un tributo al Sommo Poeta e alle antiche tradizioni che rifiutano la modernità sterile.
                            </p>
                        </div>
                    </div>
                </section>
            </main >

            <footer className="main-footer">
                <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src="/logo_new.png" alt="Logo" style={{ height: '80px', marginBottom: '1rem' }} />
                    <p>&copy; {new Date().getFullYear()} Vergilius Nectar. Forgiato a Mantova.</p>
                    <p className="footer-links" style={{ marginTop: '1rem' }}>
                        <a href="https://vergiliusnectar.it/policies/privacy-policy">Privacy Policy</a>
                        <a href="https://vergiliusnectar.it/policies/terms-of-service">Terms of Service</a>
                    </p>
                    <div className="footer-payments" style={{ marginTop: '1.5rem', display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                        <img src="/assets/payment-methods/visa.svg" alt="Visa" className="payment-icon" />
                        <img src="/assets/payment-methods/mastercard.svg" alt="Mastercard" className="payment-icon" />
                        <img src="/assets/payment-methods/maestro.svg" alt="Maestro" className="payment-icon" />
                        <img src="/assets/payment-methods/american-express.svg" alt="American Express" className="payment-icon" />
                        <img src="/assets/payment-methods/paypal.svg" alt="PayPal" className="payment-icon" />
                        <img src="/assets/payment-methods/apple-pay.svg" alt="Apple Pay" className="payment-icon" />
                        <img src="/assets/payment-methods/google-pay.svg" alt="Google Pay" className="payment-icon" />
                        <img src="/assets/payment-methods/klarna.svg" alt="Klarna" className="payment-icon" />
                        <img src="/assets/payment-methods/unionpay.svg" alt="UnionPay" className="payment-icon" />
                    </div>
                </div>
            </footer>

            {/* --- MODALS --- */}
            {
                showDetailsModal && (
                    <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                        <div
                            className="modal-content medieval-modal details-modal-bg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="modal-close-btn" onClick={() => setShowDetailsModal(false)}>×</button>

                            {showDetailsModal && (
                                <div className="details-modal-content">
                                    <h2>Dettagli del Prodotto</h2>
                                    <div className="product-specs">
                                        <h3>Vergilius Nectar - Idromele Classico</h3>
                                        <ul>
                                            <li><strong>Tipologia:</strong> Idromele Artigianale</li>
                                            <li><strong>Gradazione Alcolica:</strong> 10.7% Vol.</li>
                                            <li><strong>Formato:</strong> 0.7 Litri</li>
                                            <li><strong>Ingredienti:</strong> Acqua, Miele, Lieviti selezionati.</li>
                                        </ul>

                                        <div className="certifications">
                                            <div className="cert-badge">🌿 100% Vegetariano</div>
                                            <div className="cert-badge">🍯 Miele di Qualità</div>
                                            <div className="cert-badge">🚫 Senza Glutine e Solfiti</div>
                                            <div className="cert-badge">🇮🇹 Prodotto a Mantova</div>
                                        </div>

                                        <p className="product-description-full">
                                            Il nostro idromele è realizzato seguendo metodi ancestrali, senza filtrazione né pastorizzazione, per preservare intatte le proprietà organolettiche del miele.
                                            Eventuali sedimenti sul fondo sono indice di genuinità e artigianalità del prodotto.
                                            Si consiglia di servire fresco (8-10°C) come aperitivo o da meditazione.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Cart Modal */}
            {isCartModalOpen && (
                <div className="cart-modal-overlay" onClick={() => setIsCartModalOpen(false)}>
                    <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cart-modal-header">
                            <h2 className="cart-modal-title">⚔️ Il Tuo Carrello</h2>
                            <button className="cart-modal-close" onClick={() => setIsCartModalOpen(false)}>✕</button>
                        </div>

                        <div className="cart-modal-body">
                            {cartItems.length === 0 ? (
                                <div className="cart-empty-state">
                                    <p>Il tuo carrello è vuoto.</p>
                                    <button className="cart-cta-btn" onClick={() => setIsCartModalOpen(false)}>Continua a esplorare</button>
                                </div>
                            ) : (
                                <>
                                    <ul className="cart-items-list">
                                        {cartItems.map(item => (
                                            <li key={item.id} className="cart-item-row">
                                                <img src={item.image} alt={item.name} className="cart-item-img" />
                                                <div className="cart-item-details">
                                                    <span className="cart-item-name">{item.name}</span>
                                                    <span className="cart-item-variant">{item.variant}</span>
                                                    <span className="cart-item-price">€{item.price.toFixed(2)} cad.</span>
                                                </div>
                                                <div className="cart-item-qty-controls">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                                </div>
                                                <div className="cart-item-subtotal">€{(item.price * item.quantity).toFixed(2)}</div>
                                                <button className="cart-item-remove" onClick={() => removeFromCart(item.id)} aria-label="Rimuovi">🗑️</button>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="cart-modal-footer">
                                        <div className="cart-modal-total">
                                            <span>Totale ordine:</span>
                                            <strong>€{cartTotal.toFixed(2)}</strong>
                                        </div>
                                        <p className="cart-modal-note">Spedizione gratuita sopra €50 • Tasse incluse</p>
                                        {orderConfirmed ? (
                                            <div className="order-confirmed">
                                                ✅ Ordine inviato! Ti contatteremo presto.
                                            </div>
                                        ) : (
                                            <button
                                                className="cart-cta-btn order-btn"
                                                disabled={orderLoading}
                                                onClick={async () => {
                                                    if (!user) {
                                                        setIsCartModalOpen(false);
                                                        setIsAuthModalOpen(true);
                                                        return;
                                                    }
                                                    setOrderLoading(true);
                                                    try {
                                                        await addDoc(
                                                            collection(db, 'orders'),
                                                            {
                                                                userId: user.uid,
                                                                userName: user.displayName || user.email,
                                                                items: cartItems,
                                                                total: cartTotal,
                                                                status: 'in attesa',
                                                                createdAt: serverTimestamp(),
                                                            }
                                                        );
                                                        setOrderConfirmed(true);
                                                        clearCart();
                                                        setTimeout(() => {
                                                            setOrderConfirmed(false);
                                                            setIsCartModalOpen(false);
                                                        }, 4000);
                                                    } catch (err) {
                                                        alert('Errore durante l’invio dell’ordine. Riprova.');
                                                    } finally {
                                                        setOrderLoading(false);
                                                    }
                                                }}
                                            >
                                                {orderLoading ? 'Invio in corso…' : user ? '📜 Conferma Ordine' : '🔐 Accedi per Ordinare'}
                                            </button>
                                        )}
                                        <button className="cart-clear-btn" onClick={() => { clearCart(); }}>
                                            Svuota carrello
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Auth Modal */}
            {isAuthModalOpen && (
                <AuthModal onClose={() => setIsAuthModalOpen(false)} />
            )}
        </div >

    );
}

export default App;

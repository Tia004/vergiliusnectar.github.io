import { useState, useEffect, useRef } from 'react';
import Atropos from 'atropos/react';
import 'atropos/css';
import './App.css';

function App() {
    const [scrollY, setScrollY] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [mobileMenuActive, setMobileMenuActive] = useState(false);
    const [isProductCardOpen, setIsProductCardOpen] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth > 1000 : true);

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

    // Dynamic Mobile Header Positioning
    useEffect(() => {
        const updateHeaderPosition = () => {
            if (bannerRef.current && window.innerWidth <= 1000) {
                const bannerHeight = bannerRef.current.offsetHeight;

                // Position header exactly below banner with -5px overlap
                if (headerRef.current) {
                    headerRef.current.style.top = `${bannerHeight - 0}px`;
                }

                // Position hanging hamburger menu exactly below banner
                if (hamburgerRef.current) {
                    hamburgerRef.current.style.top = `${bannerHeight - 5}px`;
                }
            } else {
                // Reset for desktop
                if (headerRef.current) headerRef.current.style.top = '';
                if (hamburgerRef.current) hamburgerRef.current.style.top = '';
            }
        };

        // Run on mount and resize
        updateHeaderPosition();
        window.addEventListener('resize', updateHeaderPosition);
        // Helper to run again after a brief delay to ensure fonts/layout are stable
        setTimeout(updateHeaderPosition, 100);

        return () => window.removeEventListener('resize', updateHeaderPosition);
    }, [isDesktop]); // Re-run when desktop state changes

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Show scroll to top button after scrolling down 300px
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Lock body scroll when modal is open
    // Lock body scroll when modal OR mobile menu is open
    useEffect(() => {
        if (showPaymentModal || showDetailsModal || mobileMenuActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showPaymentModal, showDetailsModal, mobileMenuActive]);

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
        <div className="app-container">

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
                            <li><a href="#locanda" onClick={() => setMobileMenuActive(false)}>La Locanda</a></li>
                            <li><a href="#chisiamo" onClick={() => setMobileMenuActive(false)}>Chi Siamo</a></li>
                            <li><a href="#process" onClick={() => setMobileMenuActive(false)}>Il Nettare</a></li>
                            <li><a href="#about" onClick={() => setMobileMenuActive(false)}>La Leggenda</a></li>
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

            {/* Mobile Fixed Background */}
            <div className="mobile-background-fixed"></div>

            <header className="main-header" ref={headerRef}>
                {/* Logo Stendardo - left, clickable home button */}
                <a href="/" className="logo-stendardo-container" onClick={() => window.location.reload()}>
                    <img src="/assets/LogoStendardo.png" alt="Vergilius Nectar" className="logo-stendardo" />
                </a>

                {/* Navigation with separate blocks - right */}
                <nav className="nav-blocks">
                    <a href="#locanda" className="nav-block">
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
                    <a href="#chisiamo" className="nav-block">
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
                    <a href="#process" className="nav-block">
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
                    <a href="#about" className="nav-block">
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
                    <a href="#locanda" className="scroll-sign-container">
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
                    {/* Interactive Scene (Visible when card is closed) */}
                    {/* Interactive Scene (Always rendered, animates out/in) */}
                    <div
                        className={`locanda-scene ${isExiting ? 'scene-enter' : (isProductCardOpen ? 'scene-exit' : '')}`}
                        onAnimationEnd={() => {
                            if (isExiting) {
                                setIsProductCardOpen(false);
                                setIsExiting(false);
                            }
                        }}
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
                        <div className={`lava-rock-card-inner modal-card ${isExiting ? 'closing' : ''}`}>
                            <div className="modal-close-btn-container" onClick={() => setIsExiting(true)}>
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
                                    <button className="cta-button add-to-cart">AGGIUNGI AL CARRELLO</button>
                                </div>

                                {/* Secondary Links Row */}
                                <div className="mobile-action-row-secondary">
                                    <span className="payment-options-link" onClick={() => setShowPaymentModal(true)}>Scopri le opzioni di pagamento</span>
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
                <div className="container">
                    <img src="/logo_new.png" alt="Logo" style={{ height: '80px', marginBottom: '1rem' }} />
                    <p>&copy; {new Date().getFullYear()} Vergilius Nectar. Forgiato a Mantova.</p>
                    <p className="footer-links" style={{ marginTop: '1rem' }}>
                        <a href="https://vergiliusnectar.it/policies/privacy-policy">Privacy Policy</a>
                        <a href="https://vergiliusnectar.it/policies/terms-of-service">Terms of Service</a>
                    </p>
                </div>
            </footer>

            {/* --- MODALS --- */}
            {
                (showPaymentModal || showDetailsModal) && (
                    <div className="modal-overlay" onClick={() => { setShowPaymentModal(false); setShowDetailsModal(false); }}>
                        <div
                            className={`modal-content medieval-modal ${showPaymentModal ? 'payment-modal-bg' : 'details-modal-bg'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="modal-close-btn" onClick={() => { setShowPaymentModal(false); setShowDetailsModal(false); }}>×</button>

                            {showPaymentModal && (
                                <div className="payment-modal-content">
                                    <h2>Opzioni di Pagamento</h2>
                                    <p>Accettiamo pagamenti sicuri tramite:</p>
                                    <div className="payment-methods-grid">
                                        <div className="payment-method-item">💳 Visa</div>
                                        <div className="payment-method-item">💳 Mastercard</div>
                                        <div className="payment-method-item">💳 Amex</div>
                                        <div className="payment-method-item">💳 Maestro</div>
                                        <div className="payment-method-item">🅿️ PayPal</div>
                                        <div className="payment-method-item">🍎 Apple Pay</div>
                                        <div className="payment-method-item">🇬 Google Pay</div>
                                        <div className="payment-method-item">🛍️ Shop Pay</div>
                                    </div>
                                    <p className="secure-payment-note">
                                        Tutte le transazioni sono sicure e criptate.
                                    </p>
                                </div>
                            )}

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
        </div >
    );
}

export default App;

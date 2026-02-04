import { useEffect, useRef } from 'react';

const Embers = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 100;
                this.size = Math.random() * 3 + 1;
                this.speedY = Math.random() * 1 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;
                this.fade = Math.random() * 0.005 + 0.002;
                this.color = `rgba(255, ${Math.floor(Math.random() * 100 + 50)}, 0,`;
            }

            update() {
                this.y -= this.speedY;
                this.x += this.speedX;
                this.opacity -= this.fade;

                if (this.opacity <= 0 || this.y < -50) {
                    this.reset();
                }
            }

            draw() {
                ctx.fillStyle = this.color + this.opacity + ')';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const initParticles = () => {
            const particleCount = Math.min(window.innerWidth / 10, 100); // Adjust density
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        initParticles();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0, // Behind content but in front of background
            }}
        />
    );
};

export default Embers;

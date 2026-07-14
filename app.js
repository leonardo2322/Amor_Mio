/* ============================================
   FUEGOS ARTIFICIALES ROMÁNTICOS
   ============================================ */

const canvas = document.getElementById('fireworks');
const ctx    = canvas.getContext('2d');

// Paleta de colores rosa para los fuegos
const COLORES = [
  '#e91e63', '#f06292', '#f48fb1',
  '#fce4ec', '#ad1457', '#ff80ab',
  '#ff4081', '#f8bbd0', '#ffffff',
  '#ffb3c1', '#ff6b9d', '#c9184a'
];

let ancho, alto;
let cohetes   = [];
let particulas = [];
let activo    = true;
let frameCount = 0;

function resize() {
  ancho = canvas.width  = window.innerWidth;
  alto  = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

/* ── Cohete ── */
class Cohete {
  constructor() {
    this.x   = Math.random() * ancho * 0.8 + ancho * 0.1;
    this.y   = alto;
    this.tx  = Math.random() * ancho * 0.7 + ancho * 0.15;
    this.ty  = Math.random() * alto  * 0.45 + alto * 0.05;
    this.vel = 18 + Math.random() * 8;
    const ang = Math.atan2(this.ty - this.y, this.tx - this.x);
    this.vx  = Math.cos(ang) * this.vel;
    this.vy  = Math.sin(ang) * this.vel;
    this.color = COLORES[Math.floor(Math.random() * COLORES.length)];
    this.estela = [];
    this.exploto = false;
  }

  update() {
    this.estela.push({ x: this.x, y: this.y });
    if (this.estela.length > 12) this.estela.shift();

    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.4; // gravedad suave

    const distancia = Math.hypot(this.tx - this.x, this.ty - this.y);
    if (distancia < 20 || this.y <= this.ty) {
      this.exploto = true;
      explotar(this.x, this.y, this.color);
    }
  }

  draw() {
    // Estela
    for (let i = 0; i < this.estela.length; i++) {
      const alpha = i / this.estela.length;
      ctx.beginPath();
      ctx.arc(this.estela[i].x, this.estela[i].y, 2 * alpha, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = alpha * 0.6;
      ctx.fill();
    }
    // Punta
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 1;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

/* ── Partícula ── */
class Particula {
  constructor(x, y, color, tipo) {
    this.x     = x;
    this.y     = y;
    this.color = color;
    this.tipo  = tipo; // 'normal' | 'estrella' | 'corazon'

    const angulo    = Math.random() * Math.PI * 2;
    const velocidad = Math.random() * 7 + 2;
    this.vx   = Math.cos(angulo) * velocidad;
    this.vy   = Math.sin(angulo) * velocidad;
    this.vida = 1;
    this.decay = 0.012 + Math.random() * 0.016;
    this.radio = Math.random() * 3 + 1.5;
    this.gravedad = 0.08 + Math.random() * 0.06;
    this.chispa = Math.random() < 0.3;
  }

  update() {
    this.x    += this.vx;
    this.y    += this.vy;
    this.vy   += this.gravedad;
    this.vx   *= 0.98;
    this.vida -= this.decay;
    this.radio *= 0.995;
  }

  draw() {
    if (this.vida <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.vida);

    if (this.tipo === 'corazon') {
      dibujarCorazon(ctx, this.x, this.y, this.radio * 2.5, this.color);
    } else if (this.chispa) {
      // chispa alargada
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
      ctx.strokeStyle = this.color;
      ctx.lineWidth   = this.radio * 0.8;
      ctx.lineCap     = 'round';
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0.1, this.radio), 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur  = 8;
      ctx.shadowColor = this.color;
      ctx.fill();
    }
    ctx.restore();
  }

  muerto() { return this.vida <= 0; }
}

function dibujarCorazon(ctx, x, y, tamaño, color) {
  ctx.beginPath();
  ctx.moveTo(x, y + tamaño * 0.3);
  ctx.bezierCurveTo(x, y, x - tamaño * 0.7, y, x - tamaño * 0.7, y + tamaño * 0.35);
  ctx.bezierCurveTo(x - tamaño * 0.7, y + tamaño * 0.7, x, y + tamaño * 1.1, x, y + tamaño * 1.1);
  ctx.bezierCurveTo(x, y + tamaño * 1.1, x + tamaño * 0.7, y + tamaño * 0.7, x + tamaño * 0.7, y + tamaño * 0.35);
  ctx.bezierCurveTo(x + tamaño * 0.7, y, x, y, x, y + tamaño * 0.3);
  ctx.fillStyle   = color;
  ctx.shadowBlur  = 12;
  ctx.shadowColor = color;
  ctx.fill();
}

function explotar(x, y, colorBase) {
  const cantidad  = 80 + Math.floor(Math.random() * 50);
  const conCorazon = Math.random() < 0.4; // 40% de explosiones tienen corazones

  for (let i = 0; i < cantidad; i++) {
    const color = Math.random() < 0.5
      ? colorBase
      : COLORES[Math.floor(Math.random() * COLORES.length)];

    let tipo = 'normal';
    if (conCorazon && i < 12) tipo = 'corazon';

    particulas.push(new Particula(x, y, color, tipo));
  }

  // Ráfaga de brillo central
  for (let i = 0; i < 20; i++) {
    const p = new Particula(x, y, '#ffffff', 'normal');
    p.radio   = Math.random() * 2 + 0.5;
    p.decay   = 0.04 + Math.random() * 0.03;
    particulas.push(p);
  }
}

function lanzarCohete() {
  cohetes.push(new Cohete());
}

/* ── Loop principal ── */
function loop() {
  if (!activo) return;
  frameCount++;

  // Fondo semitransparente para efecto estela
  ctx.fillStyle = 'rgba(252, 228, 236, 0.18)';
  ctx.fillRect(0, 0, ancho, alto);

  // Lanzar cohetes periódicamente
  if (frameCount % 38 === 0) lanzarCohete();
  // Extra rápido al inicio
  if (frameCount < 120 && frameCount % 18 === 0) lanzarCohete();

  // Cohetes
  cohetes = cohetes.filter(c => {
    c.update();
    c.draw();
    return !c.exploto;
  });

  // Partículas
  particulas = particulas.filter(p => {
    p.update();
    p.draw();
    return !p.muerto();
  });

  requestAnimationFrame(loop);
}

/* ── Parar fuegos después de 12 segundos ── */
setTimeout(() => {
  // Lanzar una salva final
  for (let i = 0; i < 6; i++) {
    setTimeout(() => lanzarCohete(), i * 200);
  }
  // Luego dejar que se apaguen solos
  setTimeout(() => {
    activo = false;
    // Borrar canvas suavemente
    let alpha = 0;
    const fade = setInterval(() => {
      alpha += 0.05;
      ctx.fillStyle = `rgba(252, 228, 236, ${alpha})`;
      ctx.fillRect(0, 0, ancho, alto);
      if (alpha >= 1) {
        clearInterval(fade);
        canvas.style.display = 'none';
      }
    }, 50);
  }, 2500);
}, 9500);

/* ── Click para fuegos extra ── */
document.addEventListener('click', (e) => {
  if (!activo) return;
  explotar(e.clientX, e.clientY,
    COLORES[Math.floor(Math.random() * COLORES.length)]);
});

/* ── Arrancar ── */
// Lanzar cohetes iniciales rápidamente
for (let i = 0; i < 4; i++) {
  setTimeout(() => lanzarCohete(), i * 300);
}

loop();

/* ============================================
   ANIMACIONES DE ENTRADA CON SCROLL
   ============================================ */
const observador = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.foto-marco, .mensaje-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(40px)';
  el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  observador.observe(el);
});

// Cuando el observador los detecta se añade la clase visible
const style = document.createElement('style');
style.textContent = `
  .foto-marco.visible,
  .mensaje-card.visible {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
  .foto-marco:nth-child(2).visible { transition-delay: 0.1s !important; }
  .foto-marco:nth-child(3).visible { transition-delay: 0.2s !important; }
  .foto-marco:nth-child(4).visible { transition-delay: 0.3s !important; }
  .foto-marco:nth-child(5).visible { transition-delay: 0.4s !important; }
`;
document.head.appendChild(style);

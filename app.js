/* ============================================
   FUEGOS ARTIFICIALES ROMÁNTICOS
   ============================================ */

const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");

const COLORES = [
  "#e91e63",
  "#f06292",
  "#f48fb1",
  "#fce4ec",
  "#ad1457",
  "#ff80ab",
  "#ff4081",
  "#f8bbd0",
  "#ffffff",
  "#ffb3c1",
  "#ff6b9d",
  "#c9184a",
];

let ancho, alto;
let cohetes = [];
let particulas = [];
let activo = true;
let frameCount = 0;

// ── Estado del mensaje ──
const MENSAJE_COMPLETO = "Yo Te amo, admiro y Deseo con fuerzas";
let mensajeVisible = false;
let mensajeAlpha = 0;
let mensajeTexto = "";
let charIndex = 0;
let escribiendo = false;
let borrandoMensaje = false;

function resize() {
  ancho = canvas.width = window.innerWidth;
  alto = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* ── Cohete ── */
class Cohete {
  constructor() {
    this.x = Math.random() * ancho * 0.8 + ancho * 0.1;
    this.y = alto;
    this.tx = Math.random() * ancho * 0.7 + ancho * 0.15;
    this.ty = Math.random() * alto * 0.45 + alto * 0.05;
    this.vel = 18 + Math.random() * 8;
    const ang = Math.atan2(this.ty - this.y, this.tx - this.x);
    this.vx = Math.cos(ang) * this.vel;
    this.vy = Math.sin(ang) * this.vel;
    this.color = COLORES[Math.floor(Math.random() * COLORES.length)];
    this.estela = [];
    this.exploto = false;
  }

  update() {
    this.estela.push({ x: this.x, y: this.y });
    if (this.estela.length > 12) this.estela.shift();
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.4;
    const dist = Math.hypot(this.tx - this.x, this.ty - this.y);
    if (dist < 20 || this.y <= this.ty) {
      this.exploto = true;
      explotar(this.x, this.y, this.color);
    }
  }

  draw() {
    for (let i = 0; i < this.estela.length; i++) {
      const alpha = i / this.estela.length;
      ctx.beginPath();
      ctx.arc(this.estela[i].x, this.estela[i].y, 2 * alpha, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = alpha * 0.6;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 1;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

/* ── Partícula ── */
class Particula {
  constructor(x, y, color, tipo) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.tipo = tipo;
    const ang = Math.random() * Math.PI * 2;
    const vel = Math.random() * 7 + 2;
    this.vx = Math.cos(ang) * vel;
    this.vy = Math.sin(ang) * vel;
    this.vida = 1;
    this.decay = 0.012 + Math.random() * 0.016;
    this.radio = Math.random() * 3 + 1.5;
    this.gravedad = 0.08 + Math.random() * 0.06;
    this.chispa = Math.random() < 0.3;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravedad;
    this.vx *= 0.98;
    this.vida -= this.decay;
    this.radio *= 0.995;
  }

  draw() {
    if (this.vida <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.vida);
    if (this.tipo === "corazon") {
      dibujarCorazon(ctx, this.x, this.y, this.radio * 2.5, this.color);
    } else if (this.chispa) {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.radio * 0.8;
      ctx.lineCap = "round";
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0.1, this.radio), 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.fill();
    }
    ctx.restore();
  }

  muerto() {
    return this.vida <= 0;
  }
}

function dibujarCorazon(ctx, x, y, t, color) {
  ctx.beginPath();
  ctx.moveTo(x, y + t * 0.3);
  ctx.bezierCurveTo(x, y, x - t * 0.7, y, x - t * 0.7, y + t * 0.35);
  ctx.bezierCurveTo(x - t * 0.7, y + t * 0.7, x, y + t * 1.1, x, y + t * 1.1);
  ctx.bezierCurveTo(
    x,
    y + t * 1.1,
    x + t * 0.7,
    y + t * 0.7,
    x + t * 0.7,
    y + t * 0.35,
  );
  ctx.bezierCurveTo(x + t * 0.7, y, x, y, x, y + t * 0.3);
  ctx.fillStyle = color;
  ctx.shadowBlur = 12;
  ctx.shadowColor = color;
  ctx.fill();
}

function explotar(x, y, colorBase) {
  const cantidad = 80 + Math.floor(Math.random() * 50);
  const conCorazon = Math.random() < 0.4;
  for (let i = 0; i < cantidad; i++) {
    const color =
      Math.random() < 0.5
        ? colorBase
        : COLORES[Math.floor(Math.random() * COLORES.length)];
    const tipo = conCorazon && i < 12 ? "corazon" : "normal";
    particulas.push(new Particula(x, y, color, tipo));
  }
  for (let i = 0; i < 20; i++) {
    const p = new Particula(x, y, "#ffffff", "normal");
    p.radio = Math.random() * 2 + 0.5;
    p.decay = 0.04 + Math.random() * 0.03;
    particulas.push(p);
  }
}

function lanzarCohete() {
  cohetes.push(new Cohete());
}

/* ── Dibujar mensaje en canvas ── */
function dibujarMensaje() {
  if (!mensajeVisible && mensajeAlpha <= 0) return;

  const cx = ancho / 2;
  const cy = alto / 2;

  // Tamaño base según el dispositivo
  let fontSize;

  if (ancho <= 480) {
    fontSize = 20;
  } else if (ancho <= 768) {
    fontSize = 28;
  } else {
    fontSize = Math.min(ancho * 0.07, 60);
  }

  // Reducir automáticamente si el texto es muy largo
  ctx.font = `italic bold ${fontSize}px Georgia, serif`;

  while (ctx.measureText(mensajeTexto).width > ancho * 0.82 && fontSize > 14) {
    fontSize--;
    ctx.font = `italic bold ${fontSize}px Georgia, serif`;
  }

  const medidas = ctx.measureText(mensajeTexto);
  const tw = medidas.width;

  const padX = 36;
  const padY = 20;

  const rx = cx - tw / 2 - padX;
  const ry = cy - fontSize - padY;
  const rw = tw + padX * 2;
  const rh = fontSize + padY * 2;
  const radio = 18;

  ctx.save();
  ctx.globalAlpha = mensajeAlpha;

  // Fondo
  ctx.shadowBlur = 40;
  ctx.shadowColor = "#e91e63";

  ctx.fillStyle = "rgba(90, 0, 30, 0.55)";
  ctx.beginPath();
  ctx.moveTo(rx + radio, ry);
  ctx.lineTo(rx + rw - radio, ry);
  ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radio);
  ctx.lineTo(rx + rw, ry + rh - radio);
  ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radio, ry + rh);
  ctx.lineTo(rx + radio, ry + rh);
  ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radio);
  ctx.lineTo(rx, ry + radio);
  ctx.quadraticCurveTo(rx, ry, rx + radio, ry);
  ctx.closePath();
  ctx.fill();

  // Borde
  ctx.strokeStyle = "rgba(255, 100, 150, 0.7)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Gradiente del texto
  const grad = ctx.createLinearGradient(cx - tw / 2, 0, cx + tw / 2, 0);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.3, "#fce4ec");
  grad.addColorStop(0.6, "#f48fb1");
  grad.addColorStop(1, "#ffffff");

  ctx.fillStyle = grad;
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(mensajeTexto, cx, cy);

  // Cursor mientras escribe
  if (escribiendo && Math.floor(Date.now() / 500) % 2 === 0) {
    ctx.fillStyle = "#ffffff";
    ctx.fillText("|", cx + tw / 2 + 6, cy);
  }

  // Corazones
  if (!escribiendo || charIndex > 5) {
    ctx.font = `${fontSize * 0.7}px serif`;
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#e91e63";
    ctx.fillStyle = `rgba(233,30,99,${mensajeAlpha * 0.9})`;
    ctx.fillText("💗", cx - tw / 2 - padX - 10, cy);
    ctx.fillText("💗", cx + tw / 2 + padX + 10, cy);
  }

  ctx.restore();
}

/* ── Loop principal ── */
function loop() {
  if (!activo) return;
  frameCount++;

  ctx.fillStyle = "rgba(252, 228, 236, 0.18)";
  ctx.fillRect(0, 0, ancho, alto);

  if (frameCount % 38 === 0) lanzarCohete();
  if (frameCount < 120 && frameCount % 18 === 0) lanzarCohete();

  cohetes = cohetes.filter((c) => {
    c.update();
    c.draw();
    return !c.exploto;
  });

  particulas = particulas.filter((p) => {
    p.update();
    p.draw();
    return !p.muerto();
  });

  // Fade in/out del mensaje
  if (mensajeVisible && mensajeAlpha < 1) {
    mensajeAlpha = Math.min(1, mensajeAlpha + 0.025);
  }
  if (borrandoMensaje && mensajeAlpha > 0) {
    mensajeAlpha = Math.max(0, mensajeAlpha - 0.018);
  }

  dibujarMensaje();

  requestAnimationFrame(loop);
}

/* ── Efecto máquina de escribir ── */
function iniciarEscritura() {
  mensajeVisible = true;
  mensajeAlpha = 0;
  mensajeTexto = "";
  charIndex = 0;
  escribiendo = true;
  borrandoMensaje = false;

  const intervalo = setInterval(() => {
    if (charIndex < MENSAJE_COMPLETO.length) {
      mensajeTexto += MENSAJE_COMPLETO[charIndex];
      charIndex++;
    } else {
      escribiendo = false;
      clearInterval(intervalo);
    }
  }, 55); // velocidad de escritura
}

function borrarMensaje() {
  borrandoMensaje = true;
  setTimeout(() => {
    mensajeVisible = false;
    borrandoMensaje = false;
    mensajeTexto = "";
  }, 2000);
}

/* ── Secuencia de mensajes ── */
// Aparece a los 1.5s y dura hasta que se apagan los fuegos
setTimeout(() => {
  iniciarEscritura();
}, 1500);

// Borrar mensaje cuando se detienen los fuegos
setTimeout(() => {
  borrarMensaje();
}, 9200);

/* ── Parar fuegos después de 12 segundos ── */
setTimeout(() => {
  for (let i = 0; i < 6; i++) {
    setTimeout(() => lanzarCohete(), i * 200);
  }
  setTimeout(() => {
    activo = false;
    let alpha = 0;
    const fade = setInterval(() => {
      alpha += 0.05;
      ctx.fillStyle = `rgba(252, 228, 236, ${alpha})`;
      ctx.fillRect(0, 0, ancho, alto);
      if (alpha >= 1) {
        clearInterval(fade);
        canvas.style.display = "none";
      }
    }, 50);
  }, 2500);
}, 9500);

/* ── Click para fuegos extra ── */
document.addEventListener("click", (e) => {
  if (!activo) return;
  explotar(
    e.clientX,
    e.clientY,
    COLORES[Math.floor(Math.random() * COLORES.length)],
  );
});

/* ── Arrancar ── */
for (let i = 0; i < 4; i++) {
  setTimeout(() => lanzarCohete(), i * 300);
}
loop();

/* ============================================
   ANIMACIONES DE ENTRADA CON SCROLL
   ============================================ */
const observador = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.15 },
);

document.querySelectorAll(".foto-marco, .mensaje-card").forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(40px)";
  el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
  observador.observe(el);
});

const style = document.createElement("style");
style.textContent = `
  .foto-marco.visible, .mensaje-card.visible {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
  .foto-marco:nth-child(2).visible { transition-delay: 0.1s !important; }
  .foto-marco:nth-child(3).visible { transition-delay: 0.2s !important; }
  .foto-marco:nth-child(4).visible { transition-delay: 0.3s !important; }
  .foto-marco:nth-child(5).visible { transition-delay: 0.4s !important; }
`;
document.head.appendChild(style);

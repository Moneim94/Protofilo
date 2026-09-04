import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

/* ==================== INTERFACES ==================== */

interface IntroParticle {
  sx: number; sy: number; x: number; y: number;
  tx: number; ty: number;
  size: number; alpha: number; maxAlpha: number;
  color: number; delay: number; born: number; converged: boolean;
}

interface IntroOrbit {
  angle: number; radius: number; speed: number;
  size: number; alpha: number; color: number; inclination: number;
}

interface IntroRing {
  radius: number; speed: number; rotation: number;
  lineWidth: number; alpha: number;
}

interface IntroGeo {
  vertices: { x: number; y: number; z: number }[];
  edges: [number, number][];
  rx: number; ry: number; rz: number;
  spinX: number; spinY: number; spinZ: number;
  distance: number; scale: number;
}

interface AmbientDot {
  x: number; y: number; vx: number; vy: number;
  r: number; a: number; hue: number; pulse: number;
}

interface CoreParticle {
  angle: number; radius: number; speed: number;
  size: number; ring: number; hue: number;
}

interface MetricParticle {
  x: number; y: number; vx: number; vy: number;
  r: number; a: number; pulse: number;
}

/* ==================== COMPONENT ==================== */

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('introCanvas', { static: false }) introRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('ambientCanvas', { static: false }) ambientRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('heroCanvas', { static: false }) heroRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('engCanvas', { static: false }) engRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('metricsCanvas', { static: false }) metricsCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('metricsSection', { static: false }) metricsSectionRef!: ElementRef<HTMLElement>;
  @ViewChild('cRing', { static: false }) cRingRef!: ElementRef;
  @ViewChild('cDot', { static: false }) cDotRef!: ElementRef;

  introDone = false;
  worldVisible = false;
  navOpen = false;
  scrolled = false;
  currentSection = 'hero';
  scrollProgress = 0;
  currentLabel = 'WORLD';
  activeEng: string | null = null;
  openPortal: number | null = null;
  rippleActive = false;
  rippleX = 0;
  rippleY = 0;
  reducedMotion = false;

  trail = Array.from({ length: 6 }, () => ({ x: -200, y: -200 }));
  private cursorX = -200;
  private cursorY = -200;
  private mouseX = 0;
  private mouseY = 0;

  sections = [
    { id: 'hero', label: 'WORLD' },
    { id: 'vision', label: 'VISION' },
    { id: 'impact', label: 'IMPACT' },
    { id: 'engineering', label: 'SYSTEMS' },
    { id: 'work', label: 'PORTALS' },
    { id: 'journey', label: 'PATH' },
    { id: 'contact', label: 'SIGNAL' }
  ];

  engNodes = [
    { id: 'arch', label: 'ARCHITECTURE', x: 50, y: 18, flow: 'Client → Gateway → Service → Database' },
    { id: 'back', label: 'BACKEND', x: 82, y: 38, flow: 'Request → Middleware → Handler → Response' },
    { id: 'front', label: 'FRONTEND', x: 75, y: 72, flow: 'Component → State → Render → DOM' },
    { id: 'identity', label: 'IDENTITY', x: 25, y: 72, flow: 'Client → OAuth2 → Token → API Gateway' },
    { id: 'data', label: 'DATA', x: 15, y: 38, flow: 'Query → Optimizer → Executor → Cache' },
    { id: 'cloud', label: 'CLOUD', x: 50, y: 50, flow: 'Deploy → Scale → Monitor → Recover' }
  ];

  techStack = [
    { name: 'Angular' }, { name: '.NET Core' }, { name: 'TypeScript' },
    { name: 'gRPC' }, { name: 'OAuth2 / OIDC' }, { name: 'SQL / NoSQL' },
    { name: 'Docker / K8s' }, { name: 'Microservices' }, { name: 'OutSystems' }
  ];

  projects = [
    { index: '01', title: 'Laboratory Intelligence', subtitle: 'Enterprise LIS', domain: 'HEALTHCARE', desc: 'Multi-specialty laboratory system — sample tracking, order requisition, and results delivery unified with hospital information systems through HL7 interoperability.', tech: ['HL7', '.NET Core', 'Angular', 'SQL Server'], arch: 'HL7 // INTEROP → HIS', color: 'var(--verdant)' },
    { index: '02', title: 'Identity Fabric', subtitle: 'SSO & Identity Platform', domain: 'SECURITY', desc: 'Centralized authentication managing token lifecycles, refresh flows, PKCE, and granular RBAC across multi-tenant enterprise applications.', tech: ['OAuth2', 'OIDC', 'PKCE', 'IdentityServer'], arch: 'CLIENT → IDP → TOKEN → API', color: 'var(--ice)' },
    { index: '03', title: 'Innovation Engine', subtitle: 'Ideas Management Platform', domain: 'COLLABORATION', desc: 'Enterprise submission and workflow engine with multi-stage review pipelines, attachment handling, and role-based validation.', tech: ['Angular', 'Workflow', 'DDD', '.NET Core'], arch: 'SUBMIT → REVIEW → APPROVE → PUBLISH', color: 'var(--amber)' },
    { index: '04', title: 'Distributed Core', subtitle: 'Services Engine', domain: 'INFRASTRUCTURE', desc: 'High-throughput distributed service layer using gRPC, domain-driven design, and decoupled microservices engineered for maintainability.', tech: ['Microservices', 'gRPC', 'DDD', 'Rust'], arch: 'GATEWAY → ROUTER → SERVICE → MESH', color: 'var(--ember)' }
  ];

  journey = [
    { period: '2026 —', role: 'Principal Software Engineer', org: 'SNS', place: 'Riyadh', focus: 'Architectural governance', current: true },
    { period: '2023 — 26', role: 'Senior Full Stack Developer', org: 'Almoammar', place: 'Riyadh', focus: 'Identity & enterprise platforms', current: false },
    { period: '2021 — 23', role: 'Senior OutSystems Developer', org: 'Envnt', place: 'Egypt', focus: 'Low-code, from scratch', current: false },
    { period: '2020 — 21', role: 'Full Stack Developer', org: 'National Technology', place: 'Egypt', focus: 'Backend & healthcare systems', current: false },
    { period: '2017 — 18', role: 'Full Stack Developer', org: 'ArmyTech', place: 'Egypt', focus: 'Agile delivery', current: false }
  ];

  education = [
    { title: '.NET Full Stack Track', org: 'ITI', year: '2020' },
    { title: 'B.S. Computer Science', org: 'Minia University', year: '2013 — 2018' }
  ];

  /* ==================== CANVAS ==================== */
  private introCanvas!: HTMLCanvasElement;
  private ictx!: CanvasRenderingContext2D;
  private ambientCanvas!: HTMLCanvasElement;
  private actx!: CanvasRenderingContext2D;
  private heroCanvas!: HTMLCanvasElement;
  private hctx!: CanvasRenderingContext2D;
  private engCanvas!: HTMLCanvasElement;
  private ectx!: CanvasRenderingContext2D;
  private ambientDots: AmbientDot[] = [];
  private coreParticles: CoreParticle[] = [];
  private rafId = 0;
  private scrollHandler: any;
  private observer!: IntersectionObserver;

  /* ==================== INTRO ==================== */
  private introStartTime = 0;
  private letterTargets: { x: number; y: number }[] = [];
  private introParticles: IntroParticle[] = [];
  private introOrbits: IntroOrbit[] = [];
  private introRings: IntroRing[] = [];
  private introGeos: IntroGeo[] = [];
  private isMobile = false;
  private fontsReady = false;
  private imageReady = false;
  private introTransitioning = false;
  private readonly INTRO_MIN = 2.6;
  private readonly INTRO_MAX = 5.0;

  /* ==================== HERO CANVAS ==================== */
  private heroParticles: { x: number; y: number; vx: number; vy: number; r: number; a: number; pulse: number }[] = [];

  /* ==================== METRICS ==================== */
  private metricsCanvas!: HTMLCanvasElement;
  private mctx!: CanvasRenderingContext2D;
  private metricsVisible = false;
  private metricsStartTime = 0;
  private metricsParticles: MetricParticle[] = [];
  private metricsHover = -1;
  private metricsMouseX = 0;
  private metricsMouseY = 0;
  private metricsAnim = [0, 0, 0, 0];
  private metricsRevealed = false;

  /* ==================== LIFECYCLE ==================== */

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isMobile = window.innerWidth < 768;
    if (this.reducedMotion) { this.introDone = true; this.worldVisible = true; }
  }

  ngAfterViewInit() {
    document.documentElement.classList.add('has-cursor');
    if (!this.reducedMotion) this.initIntro();
    this.initAmbient();
    this.initHeroCanvas();
    this.initEng();
    this.initMetrics();
    this.initObserver();
    this.ngZone.runOutsideAngular(() => this.renderLoop());
  }

  ngOnDestroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler);
    if (this.observer) this.observer.disconnect();
  }

  /* ==================== MOUSE ==================== */

  @HostListener('document:mousemove', ['$event'])
  onMouse(e: MouseEvent) {
    this.mouseX = e.clientX; this.mouseY = e.clientY;
    this.cursorX += (e.clientX - this.cursorX) * 0.15;
    this.cursorY += (e.clientY - this.cursorY) * 0.15;
    if (this.cRingRef) this.cRingRef.nativeElement.style.transform = `translate3d(${this.cursorX - 18}px,${this.cursorY - 18}px,0)`;
    if (this.cDotRef) this.cDotRef.nativeElement.style.transform = `translate3d(${e.clientX - 1.5}px,${e.clientY - 1.5}px,0)`;
    for (let i = this.trail.length - 1; i > 0; i--) { this.trail[i].x = this.trail[i - 1].x; this.trail[i].y = this.trail[i - 1].y; }
    this.trail[0] = { x: e.clientX, y: e.clientY };
  }

  @HostListener('document:click', ['$event'])
  onClick(e: MouseEvent) {
    this.rippleX = e.clientX; this.rippleY = e.clientY;
    this.rippleActive = true;
    setTimeout(() => this.rippleActive = false, 700);
  }

  @HostListener('document:mouseleave')
  onMouseLeave() { this.cursorX = -200; this.cursorY = -200; }

  /* ====================================================================
     INTRO — MONEIM IDENTITY REVEAL
     ==================================================================== */

  private initIntro() {
    this.introCanvas = this.introRef.nativeElement;
    this.ictx = this.introCanvas.getContext('2d', { alpha: false })!;
    this.introStartTime = performance.now();
    this.resizeIntro();
    this.sampleLetterTargets();
    this.spawnIntroParticles();
    this.spawnIntroOrbits();
    this.spawnIntroRings();
    this.spawnIntroGeos();
    document.fonts.ready.then(() => { this.fontsReady = true; this.checkIntroReady(); });
    const img = new Image();
    img.onload = () => { this.imageReady = true; this.checkIntroReady(); };
    img.src = 'logo.png';
    window.addEventListener('resize', () => this.resizeIntro());
  }

  private checkIntroReady() {
    if (this.fontsReady && this.imageReady && !this.minimumTimeReached && !this.introTransitioning) {
      /* resources ready, wait for minimum time */
    }
    if (this.fontsReady && this.imageReady && this.minimumTimeReached && !this.introTransitioning) {
      this.finishIntro();
    }
  }
  private minimumTimeReached = false;

  private resizeIntro() {
    this.introCanvas.width = window.innerWidth;
    this.introCanvas.height = window.innerHeight;
    this.isMobile = window.innerWidth < 768;
    if (this.introParticles.length > 0) { this.sampleLetterTargets(); this.reassignTargets(); }
  }

  private sampleLetterTargets() {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d')!;
    const w = this.introCanvas.width; const h = this.introCanvas.height;
    c.width = w; c.height = h;
    const fs = Math.min(w * 0.13, 130);
    ctx.fillStyle = '#fff';
    ctx.font = `700 ${fs}px 'Space Grotesk', sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.letterSpacing = '0.12em';
    ctx.fillText('MONEIM', w / 2, h / 2);
    const data = ctx.getImageData(0, 0, w, h).data;
    this.letterTargets = [];
    const step = Math.max(3, Math.floor(fs / 28));
    for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] > 128) this.letterTargets.push({ x, y });
    }
  }

  private spawnIntroParticles() {
    const w = this.introCanvas.width; const h = this.introCanvas.height;
    const cx = w / 2; const cy = h / 2;
    const count = this.isMobile ? 350 : 700;
    const now = performance.now();
    this.introParticles = Array.from({ length: count }, () => {
      const a = Math.random() * Math.PI * 2;
      const d = 200 + Math.random() * Math.max(w, h) * 0.6;
      const cr = Math.random();
      return {
        sx: cx + Math.cos(a) * d, sy: cy + Math.sin(a) * d,
        x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d,
        tx: 0, ty: 0, size: Math.random() * 2 + 0.3,
        alpha: 0, maxAlpha: 0.3 + Math.random() * 0.7,
        color: cr < 0.5 ? 0 : cr < 0.82 ? 1 : 2,
        delay: Math.random() * 0.8, born: now, converged: false
      };
    });
    this.reassignTargets();
  }

  private reassignTargets() {
    if (!this.letterTargets.length) return;
    for (let i = 0; i < this.introParticles.length; i++) {
      const t = this.letterTargets[i % this.letterTargets.length];
      this.introParticles[i].tx = t.x + (Math.random() - 0.5) * 3;
      this.introParticles[i].ty = t.y + (Math.random() - 0.5) * 3;
    }
  }

  private spawnIntroOrbits() {
    const count = this.isMobile ? 35 : 70;
    this.introOrbits = Array.from({ length: count }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 80 + Math.random() * 150,
      speed: 0.002 + Math.random() * 0.006,
      size: Math.random() * 1.5 + 0.3,
      alpha: 0, color: Math.random() < 0.4 ? 0 : 1,
      inclination: (Math.random() - 0.5) * 0.6
    }));
  }

  private spawnIntroRings() {
    this.introRings = [
      { radius: 90, speed: 0.12, rotation: 0, lineWidth: 0.6, alpha: 0 },
      { radius: 130, speed: -0.08, rotation: Math.PI / 3, lineWidth: 0.4, alpha: 0 },
      { radius: 170, speed: 0.05, rotation: Math.PI / 6, lineWidth: 0.3, alpha: 0 },
      { radius: 210, speed: -0.03, rotation: Math.PI / 2, lineWidth: 0.2, alpha: 0 }
    ];
  }

  private spawnIntroGeos() {
    const shapes = [{ verts: 4, size: 30 }, { verts: 6, size: 25 }, { verts: 3, size: 22 }, { verts: 5, size: 28 }];
    this.introGeos = shapes.map((s, i) => {
      const verts = Array.from({ length: s.verts }, (_, j) => {
        const a = (j / s.verts) * Math.PI * 2;
        return { x: Math.cos(a) * s.size, y: Math.sin(a) * s.size, z: (Math.random() - 0.5) * s.size * 0.4 };
      });
      const edges: [number, number][] = [];
      for (let j = 0; j < verts.length; j++) {
        edges.push([j, (j + 1) % verts.length]);
        if (verts.length > 4 && j < verts.length - 2) edges.push([j, j + 2]);
      }
      return { vertices: verts, edges, rx: Math.random() * Math.PI * 2, ry: Math.random() * Math.PI * 2, rz: Math.random() * Math.PI * 2, spinX: 0.003 + Math.random() * 0.005, spinY: 0.004 + Math.random() * 0.006, spinZ: 0.002 + Math.random() * 0.003, distance: 120 + i * 50, scale: 0.7 + Math.random() * 0.4 };
    });
  }

  skipIntro() { if (!this.introTransitioning) this.finishIntro(); }

  private finishIntro() {
    if (this.introTransitioning || this.introDone) return;
    this.introTransitioning = true;
    this.introDone = true;
    setTimeout(() => { this.worldVisible = true; setTimeout(() => this.onIntroComplete(), 300); }, 400);
  }

  /* ==================== INTRO RENDER ==================== */

  private renderIntro(): boolean {
    if (this.introDone) return false;
    const ctx = this.ictx;
    const w = this.introCanvas.width; const h = this.introCanvas.height;
    const cx = w / 2; const cy = h / 2;
    const now = performance.now();
    const elapsed = (now - this.introStartTime) / 1000;

    if (elapsed >= this.INTRO_MIN) { this.minimumTimeReached = true; if (this.fontsReady && this.imageReady) { this.finishIntro(); return false; } }
    if (elapsed >= this.INTRO_MAX) { this.finishIntro(); return false; }

    const p2s = 0.8, p2e = 2.2, p3s = 1.8;
    const fadeStart = this.INTRO_MAX - 1.2;
    let ga = 1;
    if (elapsed > fadeStart) ga = Math.max(0, 1 - (elapsed - fadeStart) / 1.2);

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#030409';
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = ga;

    /* Background glow */
    const br = 0.5 + 0.5 * Math.sin(elapsed * 0.8);
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.4);
    bg.addColorStop(0, `rgba(196,154,108,${0.04 * br})`);
    bg.addColorStop(1, 'rgba(3,4,9,0)');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

    /* Geometric wireframes */
    if (elapsed > 0.2) {
      const ga2 = Math.min(0.12, (elapsed - 0.2) * 0.06);
      for (const g of this.introGeos) {
        g.rx += g.spinX; g.ry += g.spinY; g.rz += g.spinZ;
        const oa = elapsed * 0.2 + g.distance * 0.01;
        const gx = cx + Math.cos(oa) * g.distance * 0.3;
        const gy = cy + Math.sin(oa * 0.7) * g.distance * 0.2;
        ctx.save(); ctx.translate(gx, gy);
        const cX = Math.cos(g.rx), sX = Math.sin(g.rx), cY = Math.cos(g.ry), sY = Math.sin(g.ry), cZ = Math.cos(g.rz), sZ = Math.sin(g.rz);
        const proj = g.vertices.map(v => {
          let x = v.x * g.scale, y = v.y * g.scale, z = v.z * g.scale;
          let ny = y * cX - z * sX, nz = y * sX + z * cX; y = ny; z = nz;
          let nx = x * cY + z * sY; nz = -x * sY + z * cY; x = nx; z = nz;
          nx = x * cZ - y * sZ; ny = x * sZ + y * cZ; x = nx; y = ny;
          const p = 400 / (400 + z);
          return { x: x * p, y: y * p, z };
        });
        ctx.strokeStyle = `rgba(122,168,204,${ga2})`; ctx.lineWidth = 0.4;
        for (const [a, b] of g.edges) { if (proj[a] && proj[b]) { ctx.beginPath(); ctx.moveTo(proj[a].x, proj[a].y); ctx.lineTo(proj[b].x, proj[b].y); ctx.stroke(); } }
        for (const p of proj) { ctx.beginPath(); ctx.arc(p.x, p.y, 1, 0, Math.PI * 2); ctx.fillStyle = `rgba(196,154,108,${ga2 * 0.8})`; ctx.fill(); }
        ctx.restore();
      }
    }

    /* Orbital rings */
    const ra = Math.min(1, elapsed * 0.5);
    for (const r of this.introRings) {
      r.rotation += r.speed * 0.016;
      r.alpha = ra * (0.06 + 0.03 * Math.sin(elapsed + r.radius * 0.01));
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(r.rotation);
      ctx.beginPath(); ctx.ellipse(0, 0, r.radius, r.radius * 0.35, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(122,168,204,${r.alpha})`; ctx.lineWidth = r.lineWidth; ctx.stroke();
      const da = elapsed * r.speed * 2;
      ctx.beginPath(); ctx.arc(Math.cos(da) * r.radius, Math.sin(da) * r.radius * 0.35, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(196,154,108,${r.alpha * 3})`; ctx.fill();
      ctx.restore();
    }

    /* Main particles */
    for (const p of this.introParticles) {
      const age = (now - p.born) / 1000 - p.delay;
      if (age < 0) continue;
      if (elapsed < p2s) {
        p.x += Math.sin(elapsed * 0.5 + p.sx * 0.01) * 0.2;
        p.y += Math.cos(elapsed * 0.4 + p.sy * 0.01) * 0.15;
        p.alpha = Math.min(p.maxAlpha * 0.4, age * 0.5);
      } else if (elapsed < p2e) {
        const prog = Math.min(1, (elapsed - p2s) / (p2e - p2s));
        const ease = 1 - Math.pow(1 - prog, 3);
        p.x += (p.tx - p.x) * ease * 0.06;
        p.y += (p.ty - p.y) * ease * 0.06;
        p.alpha = Math.min(p.maxAlpha, 0.3 + prog * 0.7);
        p.converged = prog > 0.85;
      } else {
        p.x = p.tx + Math.sin(elapsed * 1.5 + p.tx * 0.02) * 0.3;
        p.y = p.ty + Math.cos(elapsed * 1.2 + p.ty * 0.02) * 0.2;
        p.alpha = p.maxAlpha * (0.8 + 0.2 * Math.sin(elapsed * 2 + p.tx * 0.01));
        p.converged = true;
      }
      if (p.alpha > 0.01) {
        const cols = [[196,154,108],[122,168,204],[220,220,230]];
        const c = cols[p.color];
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${p.alpha})`; ctx.fill();
      }
    }

    /* Energy waves */
    if (elapsed > p3s) {
      for (let i = 0; i < 3; i++) {
        const wt = elapsed - p3s - i * 0.6;
        if (wt > 0 && wt < 2) {
          const wp = wt / 2;
          ctx.beginPath(); ctx.arc(cx, cy, 30 + wp * Math.max(w, h) * 0.5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(196,154,108,${0.08 * (1 - wp)})`; ctx.lineWidth = 0.8; ctx.stroke();
        }
      }
    }

    /* Light streaks */
    if (elapsed > p2s) {
      const sa = Math.min(0.04, (elapsed - p2s) * 0.01);
      for (let i = 0; i < (this.isMobile ? 3 : 6); i++) {
        const a = (i / 6) * Math.PI * 2 + elapsed * 0.3;
        const len = 60 + Math.sin(elapsed * 2 + i) * 30;
        const sx = cx + Math.cos(a) * 50, sy = cy + Math.sin(a) * 50 * 0.35;
        const ex = cx + Math.cos(a) * (50 + len), ey = cy + Math.sin(a) * (50 + len) * 0.35;
        const gr = ctx.createLinearGradient(sx, sy, ex, ey);
        gr.addColorStop(0, `rgba(196,154,108,${sa})`); gr.addColorStop(1, 'rgba(196,154,108,0)');
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.strokeStyle = gr; ctx.lineWidth = 0.5; ctx.stroke();
      }
    }

    /* "MONEIM" text */
    if (elapsed > p2s) {
      const tp = Math.min(1, (elapsed - p2s) / 0.8);
      const te = 1 - Math.pow(1 - tp, 4);
      let gx = 0, gy = 0;
      const gm = [2.4, 3.1, 3.8];
      for (const t of gm) { if (elapsed > t && elapsed < t + 0.08) { gx = (Math.random() - 0.5) * 8; gy = (Math.random() - 0.5) * 3; } }
      const fs = Math.min(w * 0.12, 120);
      ctx.save();
      ctx.shadowColor = `rgba(196,154,108,${0.3 + 0.15 * Math.sin(elapsed * 1.5)})`;
      ctx.shadowBlur = 40;
      ctx.fillStyle = `rgba(232,234,240,${te * 0.95})`;
      ctx.font = `700 ${fs}px 'Space Grotesk', sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '0.12em';
      ctx.fillText('MONEIM', cx + gx, cy + gy);
      ctx.restore();

      if (Math.abs(gx) > 1) {
        ctx.save(); ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(196,154,108,0.15)`;
        ctx.font = `700 ${fs}px 'Space Grotesk', sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '0.12em';
        ctx.fillText('MONEIM', cx + gx * 2, cy + gy);
        ctx.fillStyle = `rgba(122,168,204,0.1)`;
        ctx.fillText('MONEIM', cx - gx * 1.5, cy - gy);
        ctx.globalCompositeOperation = 'source-over'; ctx.restore();
      }

      if (elapsed > p3s) {
        const subA = Math.min(0.5, (elapsed - p3s) * 0.4);
        ctx.fillStyle = `rgba(138,144,160,${subA})`;
        ctx.font = `300 ${Math.min(w * 0.016, 11)}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('PRINCIPAL SOFTWARE ENGINEER', cx, cy + fs * 0.6);
      }
    }

    /* Corner brackets */
    if (elapsed > 0.5) {
      const ba = 0.08 * Math.min(1, (elapsed - 0.5) * 0.4);
      const bs = Math.min(w, h) * 0.07;
      ctx.strokeStyle = `rgba(196,154,108,${ba})`; ctx.lineWidth = 0.8;
      [[cx - bs * 2.2, cy - bs * 1.5], [cx + bs * 2.2, cy - bs * 1.5], [cx + bs * 2.2, cy + bs * 1.5], [cx - bs * 2.2, cy + bs * 1.5]].forEach(([x, y], i) => {
        const dx = i % 2 === 0 ? 1 : -1, dy = i < 2 ? 1 : -1;
        ctx.beginPath(); ctx.moveTo(x + dx * bs * 0.3, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * bs * 0.3); ctx.stroke();
      });
    }

    /* Vignette */
    const vig = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.25, cx, cy, Math.min(w, h) * 0.7);
    vig.addColorStop(0, 'rgba(3,4,9,0)'); vig.addColorStop(1, 'rgba(3,4,9,0.5)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    return true;
  }

  /* ==================== INTRO COMPLETE ==================== */

  private onIntroComplete() {
    this.scrollHandler = () => {
      const top = window.scrollY || 0;
      const doc = document.documentElement.scrollHeight - window.innerHeight;
      this.scrollProgress = doc > 0 ? Math.min(100, (top / doc) * 100) : 0;
      this.scrolled = top > 80;
      const mid = top + window.innerHeight * 0.5;
      for (const s of this.sections) {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= mid && el.offsetTop + el.offsetHeight > mid) {
          this.currentSection = s.id;
          this.currentLabel = s.label;
          break;
        }
      }
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.85 && r.bottom > 0) el.classList.add('revealed');
      });
    };
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    setTimeout(() => this.scrollHandler(), 200);
  }

  /* ====================================================================
     AMBIENT FIELD
     ==================================================================== */

  private initAmbient() {
    this.ambientCanvas = this.ambientRef.nativeElement;
    this.actx = this.ambientCanvas.getContext('2d')!;
    this.resizeAmbient();
    this.createAmbientDots();
    window.addEventListener('resize', () => this.resizeAmbient());
  }

  private resizeAmbient() { this.ambientCanvas.width = window.innerWidth; this.ambientCanvas.height = window.innerHeight; }

  private createAmbientDots() {
    const count = this.reducedMotion ? 0 : Math.min(80, Math.floor(window.innerWidth / 16));
    this.ambientDots = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.2 + 0.3, a: Math.random() * 0.3 + 0.03,
      hue: Math.random() > 0.82 ? 0 : 1, pulse: Math.random() * Math.PI * 2
    }));
  }

  private renderAmbient() {
    const ctx = this.actx; const w = this.ambientCanvas.width; const h = this.ambientCanvas.height;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < this.ambientDots.length; i++) {
      const d = this.ambientDots[i];
      d.x += d.vx; d.y += d.vy; d.pulse += 0.006;
      if (d.x < -5) d.x = w + 5; if (d.x > w + 5) d.x = -5;
      if (d.y < -5) d.y = h + 5; if (d.y > h + 5) d.y = -5;
      const dx = d.x - this.mouseX, dy = d.y - this.mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150 && dist > 0) { d.vx += (dx / dist) * 0.008; d.vy += (dy / dist) * 0.008; }
      d.vx *= 0.997; d.vy *= 0.997;
      const alpha = d.a * (0.6 + 0.4 * Math.sin(d.pulse));
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.hue === 0 ? `rgba(196,154,108,${alpha})` : `rgba(122,168,204,${alpha})`; ctx.fill();
      for (let j = i + 1; j < this.ambientDots.length; j++) {
        const d2 = this.ambientDots[j];
        const ddx = d.x - d2.x, ddy = d.y - d2.y;
        const dd = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dd < 110) { ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d2.x, d2.y); ctx.strokeStyle = `rgba(122,168,204,${0.035 * (1 - dd / 110)})`; ctx.lineWidth = 0.3; ctx.stroke(); }
      }
    }
  }

  /* ====================================================================
     HERO CANVAS — atmospheric particles
     ==================================================================== */

  private initHeroCanvas() {
    if (!this.heroRef) return;
    this.heroCanvas = this.heroRef.nativeElement;
    this.hctx = this.heroCanvas.getContext('2d')!;
    this.resizeHero();
    const count = this.isMobile ? 20 : 40;
    this.heroParticles = Array.from({ length: count }, () => ({
      x: Math.random() * (this.heroCanvas.width || window.innerWidth),
      y: Math.random() * (this.heroCanvas.height || window.innerHeight),
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1 + 0.2, a: Math.random() * 0.1 + 0.02,
      pulse: Math.random() * Math.PI * 2
    }));
    window.addEventListener('resize', () => this.resizeHero());
  }

  private resizeHero() {
    if (!this.heroCanvas) return;
    const rect = this.heroCanvas.parentElement?.getBoundingClientRect();
    if (rect) { this.heroCanvas.width = rect.width; this.heroCanvas.height = rect.height; }
  }

  private renderHero() {
    if (!this.hctx || !this.heroCanvas.width) return;
    const ctx = this.hctx; const w = this.heroCanvas.width; const h = this.heroCanvas.height;
    ctx.clearRect(0, 0, w, h);
    for (const p of this.heroParticles) {
      p.x += p.vx; p.y += p.vy; p.pulse += 0.005;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      const alpha = p.a * (0.5 + 0.5 * Math.sin(p.pulse));
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(196,154,108,${alpha})`; ctx.fill();
    }
  }

  /* ====================================================================
     ENGINEERING
     ==================================================================== */

  private initEng() {
    if (!this.engRef) return;
    this.engCanvas = this.engRef.nativeElement;
    this.ectx = this.engCanvas.getContext('2d')!;
    this.resizeEng();
    window.addEventListener('resize', () => this.resizeEng());
  }

  private resizeEng() {
    if (!this.engCanvas) return;
    const rect = this.engCanvas.parentElement?.getBoundingClientRect();
    if (rect) { this.engCanvas.width = rect.width; this.engCanvas.height = rect.height; }
  }

  private renderEng() {
    if (!this.ectx || !this.engCanvas.width) return;
    const ctx = this.ectx; const w = this.engCanvas.width; const h = this.engCanvas.height;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < this.engNodes.length; i++) {
      for (let j = i + 1; j < this.engNodes.length; j++) {
        const a = this.engNodes[i], b = this.engNodes[j];
        const ax = a.x / 100 * w, ay = a.y / 100 * h;
        const bx = b.x / 100 * w, by = b.y / 100 * h;
        const active = this.activeEng === a.id || this.activeEng === b.id;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
        ctx.strokeStyle = active ? 'rgba(196,154,108,0.25)' : 'rgba(122,168,204,0.05)';
        ctx.lineWidth = active ? 1.2 : 0.3; ctx.stroke();
        if (active) {
          const t = (Date.now() % 3000) / 3000;
          ctx.beginPath(); ctx.arc(ax + (bx - ax) * t, ay + (by - ay) * t, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(196,154,108,0.8)'; ctx.fill();
        }
      }
    }
  }

  /* ====================================================================
     PORTALS
     ==================================================================== */

  private renderPortals() {
    document.querySelectorAll('.proj-canvas').forEach((canvas) => {
      const c = canvas as HTMLCanvasElement;
      const idx = parseInt(c.getAttribute('data-idx') || '0');
      const ctx = c.getContext('2d');
      if (!ctx) return;
      if (!c.width || c.width < 10) { c.width = c.parentElement?.offsetWidth || 300; c.height = c.parentElement?.offsetHeight || 200; }
      const w = c.width, h = c.height; ctx.clearRect(0, 0, w, h);
      const t = Date.now() * 0.001; const cx = w / 2, cy = h / 2;
      for (let i = 0; i < 4; i++) {
        const r = 25 + i * 18, spd = 0.2 + i * 0.15;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.strokeStyle = `rgba(122,168,204,${0.07 - i * 0.012})`; ctx.lineWidth = 0.4; ctx.stroke();
        const a = t * spd + idx * 1.5;
        ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2, 0, Math.PI * 2);
        ctx.fillStyle = ['rgba(90,158,122,0.7)', 'rgba(122,168,204,0.7)', 'rgba(196,154,108,0.7)', 'rgba(204,106,74,0.7)'][idx % 4]; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fillStyle = 'rgba(232,234,240,0.25)'; ctx.fill();
    });
  }

  /* ====================================================================
     METRICS CANVAS
     ==================================================================== */

  private initMetrics() {
    if (!this.metricsCanvasRef) return;
    this.metricsCanvas = this.metricsCanvasRef.nativeElement;
    this.mctx = this.metricsCanvas.getContext('2d')!;
    this.resizeMetrics();
    window.addEventListener('resize', () => this.resizeMetrics());
    if (this.metricsSectionRef) {
      this.metricsSectionRef.nativeElement.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = this.metricsCanvas.getBoundingClientRect();
        this.metricsMouseX = e.clientX - rect.left;
        this.metricsMouseY = e.clientY - rect.top;
      });
    }
    const count = this.isMobile ? 20 : 40;
    this.metricsParticles = Array.from({ length: count }, () => ({
      x: Math.random() * (this.metricsCanvas.width || window.innerWidth),
      y: Math.random() * (this.metricsCanvas.height || 400),
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1 + 0.2, a: Math.random() * 0.12 + 0.02,
      pulse: Math.random() * Math.PI * 2
    }));
  }

  private resizeMetrics() {
    if (!this.metricsCanvas || !this.metricsSectionRef) return;
    const rect = this.metricsSectionRef.nativeElement.getBoundingClientRect();
    this.metricsCanvas.width = rect.width; this.metricsCanvas.height = rect.height;
    for (const p of this.metricsParticles) { p.x = Math.random() * this.metricsCanvas.width; p.y = Math.random() * this.metricsCanvas.height; }
  }

  private getMetricPositions() {
    const w = this.metricsCanvas.width, h = this.metricsCanvas.height;
    if (w < 520) return [{ x: w * 0.15, y: h * 0.12, s: Math.min(w * 0.22, 80) }, { x: w * 0.15, y: h * 0.36, s: Math.min(w * 0.22, 80) }, { x: w * 0.15, y: h * 0.60, s: Math.min(w * 0.22, 80) }, { x: w * 0.15, y: h * 0.84, s: Math.min(w * 0.22, 80) }];
    if (w < 860) return [{ x: w * 0.12, y: h * 0.35, s: Math.min(w * 0.16, 90) }, { x: w * 0.62, y: h * 0.35, s: Math.min(w * 0.12, 65) }, { x: w * 0.12, y: h * 0.75, s: Math.min(w * 0.10, 50) }, { x: w * 0.62, y: h * 0.75, s: Math.min(w * 0.10, 50) }];
    return [{ x: w * 0.10, y: h * 0.38, s: Math.min(w * 0.15, 130) }, { x: w * 0.62, y: h * 0.32, s: Math.min(w * 0.10, 90) }, { x: w * 0.38, y: h * 0.78, s: Math.min(w * 0.06, 55) }, { x: w * 0.78, y: h * 0.72, s: Math.min(w * 0.06, 55) }];
  }

  private renderMetrics() {
    if (!this.mctx || !this.metricsCanvas.width) return;
    const ctx = this.mctx; const w = this.metricsCanvas.width; const h = this.metricsCanvas.height;
    ctx.clearRect(0, 0, w, h);
    if (!this.metricsVisible && !this.metricsRevealed) return;
    const elapsed = this.metricsVisible ? (performance.now() - this.metricsStartTime) / 1000 : 99;
    if (elapsed > 0.01) this.metricsRevealed = true;

    const positions = this.getMetricPositions();
    const data = [{ target: 8, plus: true }, { target: 4, plus: false }, { target: 6, plus: false }, { target: 2, plus: false }];

    /* Ambient particles */
    for (const p of this.metricsParticles) {
      p.x += p.vx; p.y += p.vy; p.pulse += 0.008;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      const dx = p.x - this.metricsMouseX, dy = p.y - this.metricsMouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100 && dist > 0) { p.vx += (dx / dist) * 0.02; p.vy += (dy / dist) * 0.02; }
      p.vx *= 0.995; p.vy *= 0.995;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(122,168,204,${p.a * (0.5 + 0.5 * Math.sin(p.pulse))})`; ctx.fill();
    }

    /* Axis line */
    ctx.beginPath(); ctx.moveTo(w * 0.05, h / 2); ctx.lineTo(w * 0.95, h / 2);
    ctx.strokeStyle = `rgba(196,154,108,${Math.min(0.06, elapsed * 0.03)})`; ctx.lineWidth = 0.5; ctx.stroke();

    /* Connecting lines */
    if (elapsed > 0.5) {
      const ca = Math.min(0.04, (elapsed - 0.5) * 0.02);
      for (let i = 0; i < positions.length; i++) for (let j = i + 1; j < positions.length; j++) {
        ctx.beginPath(); ctx.moveTo(positions[i].x, positions[i].y); ctx.lineTo(positions[j].x, positions[j].y);
        ctx.strokeStyle = `rgba(122,168,204,${ca})`; ctx.lineWidth = 0.3; ctx.stroke();
      }
    }

    /* Numbers */
    this.metricsHover = -1;
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i]; const d = data[i];
      const stagger = i * 0.25; const me = Math.max(0, elapsed - stagger);
      const cp = Math.min(1, me / 1.2);
      const ce = 1 - Math.pow(1 - cp, 4);
      this.metricsAnim[i] = d.target * ce;
      const dv = Math.round(this.metricsAnim[i]);

      const dx = this.metricsMouseX - pos.x, dy = this.metricsMouseY - pos.y;
      const hover = Math.sqrt(dx * dx + dy * dy) < pos.s * 1.2;
      if (hover) this.metricsHover = i;
      const hs = hover ? 1.05 : 1;

      if (me > 0) {
        /* Outline shadow */
        ctx.save(); ctx.translate(pos.x, pos.y); ctx.scale(hs, hs);
        ctx.font = `900 ${pos.s}px 'Space Grotesk', sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.strokeStyle = `rgba(196,154,108,${Math.min(0.06, me * 0.03)})`;
        ctx.lineWidth = 0.8;
        ctx.strokeText(dv + (d.plus ? '+' : ''), 0, 0);
        ctx.restore();

        /* Main number */
        const na = Math.min(1, me * 0.6);
        ctx.save(); ctx.translate(pos.x, pos.y); ctx.scale(hs, hs);
        if (hover) { ctx.shadowColor = 'rgba(196,154,108,0.3)'; ctx.shadowBlur = 30; }
        ctx.fillStyle = i === 0 ? `rgba(196,154,108,${na})` : `rgba(232,234,240,${na * 0.9})`;
        ctx.font = `900 ${pos.s}px 'Space Grotesk', sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(dv + (d.plus ? '+' : ''), 0, 0);
        ctx.restore();
      }
    }

    /* Scan sweep */
    if (elapsed > 0.3 && elapsed < 4) {
      const sp = (elapsed - 0.3) / 3.7;
      const sx = w * 0.05 + sp * w * 0.9;
      const sg = ctx.createLinearGradient(sx - 2, 0, sx + 2, 0);
      sg.addColorStop(0, 'rgba(196,154,108,0)'); sg.addColorStop(0.5, 'rgba(196,154,108,0.04)'); sg.addColorStop(1, 'rgba(196,154,108,0)');
      ctx.fillStyle = sg; ctx.fillRect(sx - 2, 0, 4, h);
    }

    /* Hover connections */
    if (this.metricsHover >= 0) {
      const hp = positions[this.metricsHover];
      for (const p of this.metricsParticles) {
        const dx = p.x - hp.x, dy = p.y - hp.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(hp.x, hp.y); ctx.strokeStyle = `rgba(196,154,108,${0.06 * (1 - dist / 150)})`; ctx.lineWidth = 0.3; ctx.stroke(); }
      }
    }
  }

  /* ====================================================================
     NAV / SCROLL
     ==================================================================== */

  toggleNav() { this.navOpen = !this.navOpen; }
  goTo(id: string) { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: this.reducedMotion ? 'auto' : 'smooth' }); this.navOpen = false; }
  activateEng(id: string) { this.activeEng = id; }
  deactivateEng() { this.activeEng = null; }
  getEngFlow(): string { const n = this.engNodes.find(n => n.id === this.activeEng); return n ? n.flow : ''; }
  togglePortal(i: number) { this.openPortal = this.openPortal === i ? null : i; }

  private initObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('revealed');
          if (en.target === this.metricsSectionRef?.nativeElement && !this.metricsVisible) {
            this.metricsVisible = true;
            this.metricsStartTime = performance.now();
          }
        }
      });
    }, { threshold: 0.15 });
    setTimeout(() => {
      document.querySelectorAll('[data-reveal]').forEach(el => this.observer.observe(el));
      if (this.metricsSectionRef) this.observer.observe(this.metricsSectionRef.nativeElement);
      document.querySelectorAll('.impact-label').forEach(el => this.observer.observe(el));
    }, 500);
  }

  /* ====================================================================
     RENDER LOOP
     ==================================================================== */

  private renderLoop() {
    this.renderIntro();
    if (this.worldVisible) {
      this.renderAmbient();
      this.renderHero();
      this.renderEng();
      this.renderPortals();
      this.renderMetrics();
    }
    this.rafId = requestAnimationFrame(() => this.renderLoop());
  }
}

import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AmbientDot { x: number; y: number; vx: number; vy: number; r: number; a: number; hue: number; pulse: number; }
interface MetricParticle { x: number; y: number; vx: number; vy: number; r: number; a: number; pulse: number; }
interface IntroGeo { verts: { x: number; y: number; z: number }[]; edges: [number, number][]; rx: number; ry: number; rz: number; sx: number; sy: number; sz: number; dist: number; scale: number; }

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

  private ambientCanvas!: HTMLCanvasElement;
  private actx!: CanvasRenderingContext2D;
  private heroCanvas!: HTMLCanvasElement;
  private hctx!: CanvasRenderingContext2D;
  private engCanvas!: HTMLCanvasElement;
  private ectx!: CanvasRenderingContext2D;
  private ambientDots: AmbientDot[] = [];
  private rafId = 0;
  private scrollHandler: any;
  private observer!: IntersectionObserver;

  private introCanvas!: HTMLCanvasElement;
  private ictx!: CanvasRenderingContext2D;
  private introStartTime = 0;
  private introTransitioning = false;
  private introFullyDone = false;
  private isMobile = false;
  private fontsReady = false;
  private imageReady = false;

  private letterTargets: { x: number; y: number }[] = [];

  private pMain: { sx: number; sy: number; x: number; y: number; vx: number; vy: number; tx: number; ty: number; r: number; a: number; ma: number; col: number; delay: number }[] = [];
  private pFg: { x: number; y: number; vx: number; vy: number; r: number; a: number; pulse: number; col: number }[] = [];
  private pOrbit: { angle: number; radius: number; speed: number; r: number; a: number; incl: number }[] = [];
  private rings: { radius: number; speed: number; rot: number; lw: number }[] = [];
  private geos: IntroGeo[] = [];

  private collapseStart = 0;
  private readonly COLLAPSE_DUR = 1.8;
  private readonly INTRO_MIN = 2.5;
  private readonly INTRO_MAX = 6.0;
  private minimumTimeReached = false;

  private heroParticles: { x: number; y: number; vx: number; vy: number; r: number; a: number; pulse: number }[] = [];

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
     ██╗  ██████╗  ██████╗ ██████╗
     ██║ ██╔═══██╗██╔═══██╗██╔══██╗
     ██║ ██║   ██║██║   ██║██████╔╝
     ██║ ██║   ██║██║   ██║██╔═══╝
     ███████╗╚██████╔╝╚██████╔╝██║
     ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝
     ==================================================================== */

  private initIntro() {
    this.introCanvas = this.introRef.nativeElement;
    this.ictx = this.introCanvas.getContext('2d', { alpha: false })!;
    this.introStartTime = performance.now();
    this.resizeIntro();
    this.sampleLetterTargets();
    this.spawnIntroMain();
    this.spawnIntroForeground();
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
    if (this.fontsReady && this.imageReady && this.minimumTimeReached && !this.introTransitioning && !this.introFullyDone) {
      this.finishIntro();
    }
  }

  private resizeIntro() {
    if (!this.introCanvas) return;
    const w = window.innerWidth; const h = window.innerHeight;
    this.introCanvas.width = w; this.introCanvas.height = h;
    this.isMobile = w < 768;
    if (this.pMain.length > 0) { this.sampleLetterTargets(); this.reassignTargets(); }
  }

  private sampleLetterTargets() {
    const w = this.introCanvas.width; const h = this.introCanvas.height;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d')!;
    const fs = Math.min(w * 0.14, 140);
    ctx.fillStyle = '#fff';
    ctx.font = `600 ${fs}px 'Outfit', 'Space Grotesk', sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('MONEIM', w / 2, h / 2);
    const data = ctx.getImageData(0, 0, w, h).data;
    this.letterTargets = [];
    const step = 2;
    for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] > 128) this.letterTargets.push({ x, y });
    }
  }

  private spawnIntroMain() {
    const w = this.introCanvas.width; const h = this.introCanvas.height;
    const cx = w / 2; const cy = h / 2;
    const count = this.isMobile ? 500 : 1200;
    this.pMain = Array.from({ length: count }, (_, i) => {
      const a = Math.random() * Math.PI * 2;
      const d = 250 + Math.random() * Math.max(w, h) * 0.65;
      const cr = Math.random();
      const angleVariance = (Math.random() - 0.5) * 0.3;
      return {
        sx: cx + Math.cos(a) * d, sy: cy + Math.sin(a) * d,
        x: cx + Math.cos(a) * (d + 100), y: cy + Math.sin(a) * (d + 100),
        vx: Math.cos(a + angleVariance) * (0.3 + Math.random() * 0.4),
        vy: Math.sin(a + angleVariance) * (0.3 + Math.random() * 0.4),
        tx: 0, ty: 0,
        r: Math.random() * 1.5 + 0.4,
        a: 0, ma: 0.3 + Math.random() * 0.7,
        col: cr < 0.45 ? 0 : cr < 0.78 ? 1 : 2,
        delay: Math.random() * 0.8
      };
    });
    this.reassignTargets();
  }

  private reassignTargets() {
    if (!this.letterTargets.length) return;
    for (let i = 0; i < this.pMain.length; i++) {
      const t = this.letterTargets[i % this.letterTargets.length];
      this.pMain[i].tx = t.x + (Math.random() - 0.5) * 1.5;
      this.pMain[i].ty = t.y + (Math.random() - 0.5) * 1.5;
    }
  }

  private spawnIntroForeground() {
    const w = this.introCanvas.width; const h = this.introCanvas.height;
    const count = this.isMobile ? 40 : 80;
    this.pFg = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.2 + 0.3, a: 0, pulse: Math.random() * Math.PI * 2,
      col: Math.random() < 0.35 ? 0 : 1
    }));
  }

  private spawnIntroOrbits() {
    const count = this.isMobile ? 40 : 80;
    this.pOrbit = Array.from({ length: count }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 100 + Math.random() * 160,
      speed: 0.003 + Math.random() * 0.007,
      r: Math.random() * 1.3 + 0.2,
      a: 0,
      incl: (Math.random() - 0.5) * 0.55
    }));
  }

  private spawnIntroRings() {
    this.rings = [
      { radius: 100, speed: 0.15, rot: 0, lw: 0.7 },
      { radius: 145, speed: -0.1, rot: Math.PI / 3, lw: 0.5 },
      { radius: 190, speed: 0.065, rot: Math.PI / 6, lw: 0.35 },
      { radius: 240, speed: -0.04, rot: Math.PI / 2, lw: 0.25 }
    ];
  }

  private spawnIntroGeos() {
    const shapes = [{ v: 4, s: 28 }, { v: 6, s: 22 }, { v: 3, s: 20 }, { v: 5, s: 25 }];
    this.geos = shapes.map((sh, i) => {
      const verts = Array.from({ length: sh.v }, (_, j) => {
        const a = (j / sh.v) * Math.PI * 2;
        return { x: Math.cos(a) * sh.s, y: Math.sin(a) * sh.s, z: (Math.random() - 0.5) * sh.s * 0.5 };
      });
      const edges: [number, number][] = [];
      for (let j = 0; j < verts.length; j++) {
        edges.push([j, (j + 1) % verts.length]);
        if (verts.length > 4 && j < verts.length - 2) edges.push([j, j + 2]);
      }
      return {
        verts, edges,
        rx: Math.random() * 6.28, ry: Math.random() * 6.28, rz: Math.random() * 6.28,
        sx: 0.004 + Math.random() * 0.005, sy: 0.005 + Math.random() * 0.006, sz: 0.003 + Math.random() * 0.003,
        dist: 130 + i * 55, scale: 0.65 + Math.random() * 0.4
      };
    });
  }

  skipIntro() { if (!this.introTransitioning && !this.introFullyDone) this.finishIntro(); }

  private finishIntro() {
    if (this.introTransitioning || this.introFullyDone) return;
    this.introTransitioning = true;
    this.collapseStart = performance.now();
  }

  private completeIntroTransition() {
    if (this.introFullyDone) return;
    this.introDone = true;
    this.introFullyDone = true;
    this.worldVisible = true;
    this.onIntroComplete();
  }

  private renderIntro(): boolean {
    if (this.introFullyDone) return false;
    const ctx = this.ictx;
    const w = this.introCanvas.width; const h = this.introCanvas.height;
    const cx = w / 2; const cy = h / 2;
    const now = performance.now();
    const elapsed = (now - this.introStartTime) / 1000;

    if (!this.minimumTimeReached && elapsed >= this.INTRO_MIN) { this.minimumTimeReached = true; this.checkIntroReady(); }
    if (elapsed >= this.INTRO_MAX && !this.introTransitioning) this.finishIntro();

    if (this.introTransitioning) {
      const ct = (now - this.collapseStart) / 1000;
      if (ct >= this.COLLAPSE_DUR + 0.5) {
        this.completeIntroTransition();
        return false;
      }
      return this.renderCollapse(ctx, w, h, cx, cy, ct);
    }

    const P1_END = 1.4;
    const P2_START = 1.0;
    const P2_END = 3.2;
    const P3_START = 2.6;
    const P3_LIFE = 3.8;

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#030409';
    ctx.fillRect(0, 0, w, h);

    const breath = 0.5 + 0.5 * Math.sin(elapsed * 0.7);
    const atmGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.45);
    atmGrad.addColorStop(0, `rgba(196,154,108,${0.04 * breath})`);
    atmGrad.addColorStop(0.5, `rgba(122,168,204,${0.015 * breath})`);
    atmGrad.addColorStop(1, 'rgba(3,4,9,0)');
    ctx.fillStyle = atmGrad;
    ctx.fillRect(0, 0, w, h);

    if (elapsed > 0.3) {
      const ra = Math.min(0.9, (elapsed - 0.3) * 0.5);
      for (const r of this.rings) {
        r.rot += r.speed * 0.016;
        const alpha = ra * (0.05 + 0.03 * Math.sin(elapsed * 0.9 + r.radius * 0.01));
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(r.rot);
        ctx.beginPath(); ctx.ellipse(0, 0, r.radius, r.radius * 0.32, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(122,168,204,${alpha})`; ctx.lineWidth = r.lw; ctx.stroke();
        const da = elapsed * r.speed * 2;
        const ox = Math.cos(da) * r.radius, oy = Math.sin(da) * r.radius * 0.32;
        ctx.beginPath(); ctx.arc(ox, oy, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196,154,108,${alpha * 3.5})`; ctx.fill();
        ctx.restore();
      }
    }

    if (elapsed > 0.5) {
      const ga = Math.min(0.12, (elapsed - 0.5) * 0.06);
      for (const g of this.geos) {
        g.rx += g.sx; g.ry += g.sy; g.rz += g.sz;
        const oa = elapsed * 0.18 + g.dist * 0.012;
        const gx = cx + Math.cos(oa) * g.dist * 0.28;
        const gy = cy + Math.sin(oa * 0.7) * g.dist * 0.2;
        ctx.save(); ctx.translate(gx, gy);
        const cX = Math.cos(g.rx), sX = Math.sin(g.rx), cY = Math.cos(g.ry), sY = Math.sin(g.ry), cZ = Math.cos(g.rz), sZ = Math.sin(g.rz);
        const proj = g.verts.map(v => {
          let x = v.x * g.scale, y = v.y * g.scale, z = v.z * g.scale;
          let ny = y * cX - z * sX, nz = y * sX + z * cX; y = ny; z = nz;
          let nx = x * cY + z * sY; nz = -x * sY + z * cY; x = nx; z = nz;
          nx = x * cZ - y * sZ; ny = x * sZ + y * cZ; x = nx; y = ny;
          const p = 400 / (400 + z);
          return { x: x * p, y: y * p };
        });
        ctx.strokeStyle = `rgba(122,168,204,${ga})`; ctx.lineWidth = 0.4;
        for (const [a, b] of g.edges) {
          if (proj[a] && proj[b]) { ctx.beginPath(); ctx.moveTo(proj[a].x, proj[a].y); ctx.lineTo(proj[b].x, proj[b].y); ctx.stroke(); }
        }
        for (const p of proj) {
          ctx.beginPath(); ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(196,154,108,${ga * 0.7})`; ctx.fill();
        }
        ctx.restore();
      }
    }

    const cols = [[196, 154, 108], [122, 168, 204], [210, 210, 220]];

    for (const p of this.pMain) {
      if (elapsed < P1_END) {
        p.x += p.vx * 0.5;
        p.y += p.vy * 0.5;
        p.a = Math.min(p.ma * 0.4, elapsed * 0.3);
      } else if (elapsed < P2_END) {
        const cp = Math.min(1, (elapsed - P2_START) / (P2_END - P2_START));
        const ease = cp < 0.5 ? 4 * cp * cp * cp : 1 - Math.pow(-2 * cp + 2, 3) / 2;
        const springK = 0.04 + ease * 0.08;
        const dx = p.tx - p.x; const dy = p.ty - p.y;
        p.vx += dx * springK; p.vy += dy * springK;
        p.vx *= 0.92; p.vy *= 0.92;
        p.x += p.vx; p.y += p.vy;
        p.a = Math.min(p.ma, 0.15 + cp * 0.85);
      } else {
        const mouseDx = this.mouseX - p.tx;
        const mouseDy = this.mouseY - p.ty;
        const mouseDist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
        const mousePush = mouseDist < 120 ? (120 - mouseDist) / 120 * 8 : 0;
        const pushAngle = Math.atan2(p.ty - this.mouseY, p.tx - this.mouseX);
        const breathX = Math.sin(elapsed * 1.3 + p.tx * 0.015) * 0.35;
        const breathY = Math.cos(elapsed * 1.05 + p.ty * 0.015) * 0.25;
        p.x = p.tx + breathX + Math.cos(pushAngle) * mousePush;
        p.y = p.ty + breathY + Math.sin(pushAngle) * mousePush;
        p.a = p.ma * (0.75 + 0.25 * Math.sin(elapsed * 1.8 + p.tx * 0.008));
      }
      if (p.a > 0.008) {
        const c = cols[p.col];
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${p.a})`; ctx.fill();
      }
    }

    for (const p of this.pFg) {
      p.x += p.vx; p.y += p.vy; p.pulse += 0.007;
      if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
      if (elapsed > 0.3) p.a = Math.min(p.a + 0.003, 0.12 + 0.08 * Math.sin(p.pulse));
      const cc = cols[p.col];
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${cc[0]},${cc[1]},${cc[2]},${p.a})`; ctx.fill();
    }

    if (elapsed > P2_START + 0.3) {
      for (let i = 0; i < 5; i++) {
        const wt = elapsed - P2_START - 0.3 - i * 0.45;
        if (wt > 0 && wt < 2.5) {
          const wp = wt / 2.5;
          const radius = 25 + wp * Math.max(w, h) * 0.55;
          ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(196,154,108,${0.08 * (1 - wp)})`;
          ctx.lineWidth = 1; ctx.stroke();
        }
      }
    }

    if (elapsed > P2_START) {
      const sa = Math.min(0.06, (elapsed - P2_START) * 0.015);
      const beamCount = this.isMobile ? 4 : 8;
      for (let i = 0; i < beamCount; i++) {
        const a = (i / beamCount) * Math.PI * 2 + elapsed * 0.2;
        const len = 80 + Math.sin(elapsed * 2.2 + i * 1.5) * 40;
        const r1 = 45; const r2 = r1 + len;
        const sx = cx + Math.cos(a) * r1, sy = cy + Math.sin(a) * r1 * 0.32;
        const ex = cx + Math.cos(a) * r2, ey = cy + Math.sin(a) * r2 * 0.32;
        const lg = ctx.createLinearGradient(sx, sy, ex, ey);
        lg.addColorStop(0, `rgba(196,154,108,${sa})`);
        lg.addColorStop(0.5, `rgba(255,230,200,${sa * 0.6})`);
        lg.addColorStop(1, 'rgba(196,154,108,0)');
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey);
        ctx.strokeStyle = lg; ctx.lineWidth = 0.8; ctx.stroke();
      }
    }

    if (elapsed > P3_START) {
      const tp = Math.min(1, (elapsed - P3_START) / 0.7);
      const te = 1 - Math.pow(1 - tp, 5);
      const fs = Math.min(w * 0.135, 135);
      const txtFont = `600 ${fs}px 'Outfit', 'Space Grotesk', sans-serif`;

      let gx = 0, gy = 0;
      const glitchTimes = [P3_START + 0.6, P3_START + 1.2, P3_START + 2.0, P3_LIFE + 0.8, P3_LIFE + 1.8];
      for (const gt of glitchTimes) {
        if (elapsed > gt && elapsed < gt + 0.06) { gx = (Math.random() - 0.5) * 10; gy = (Math.random() - 0.5) * 4; }
      }

      ctx.save();
      ctx.shadowColor = `rgba(196,154,108,${0.5 * te})`;
      ctx.shadowBlur = 70;
      ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 3;
      ctx.fillStyle = `rgba(232,234,240,${te * 0.97})`;
      ctx.font = txtFont; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('MONEIM', cx + gx, cy + gy);
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.shadowColor = `rgba(196,154,108,${0.25 * te})`;
      ctx.shadowBlur = 120;
      ctx.fillStyle = `rgba(196,154,108,${0.08 * te})`;
      ctx.font = txtFont; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('MONEIM', cx, cy);
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();

      if (Math.abs(gx) > 1.5) {
        ctx.save(); ctx.globalCompositeOperation = 'screen';
        ctx.font = txtFont; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(196,154,108,0.2)`;
        ctx.fillText('MONEIM', cx + gx * 2.2, cy + gy * 0.8);
        ctx.fillStyle = `rgba(122,168,204,0.14)`;
        ctx.fillText('MONEIM', cx - gx * 1.7, cy - gy * 0.6);
        ctx.globalCompositeOperation = 'source-over'; ctx.restore();
      }

      if (elapsed > P3_START + 0.15 && elapsed < P3_START + 3) {
        const sp = (elapsed - P3_START - 0.15) / 2.85;
        const scanX = cx - fs * 3 + sp * fs * 6;
        const sg = ctx.createLinearGradient(scanX - 3, 0, scanX + 3, 0);
        sg.addColorStop(0, 'rgba(196,154,108,0)');
        sg.addColorStop(0.5, `rgba(196,154,108,${0.09 * te})`);
        sg.addColorStop(1, 'rgba(196,154,108,0)');
        ctx.fillStyle = sg; ctx.fillRect(scanX - 3, cy - fs * 0.45, 6, fs * 0.9);
      }

      if (elapsed > P3_LIFE) {
        const breathAmt = Math.min(1, (elapsed - P3_LIFE) * 0.5);
        const bScale = 1 + breathAmt * 0.005 * Math.sin(elapsed * 1.2);
        const bSkew = breathAmt * 0.003 * Math.sin(elapsed * 0.9 + 1);
        ctx.save();
        ctx.translate(cx, cy); ctx.scale(bScale, 1 + bSkew); ctx.translate(-cx, -cy);
        ctx.clearRect(cx - fs * 3, cy - fs * 0.45, fs * 6, fs * 0.9);
        ctx.fillStyle = '#030409';
        ctx.fillRect(cx - fs * 3, cy - fs * 0.45, fs * 6, fs * 0.9);
        ctx.shadowColor = `rgba(196,154,108,${0.4 * te})`;
        ctx.shadowBlur = 60;
        ctx.fillStyle = `rgba(232,234,240,${te * 0.97})`;
        ctx.font = txtFont; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('MONEIM', cx, cy);
        ctx.restore();
      }

      if (elapsed > P3_LIFE + 0.15) {
        const subA = Math.min(0.55, (elapsed - P3_LIFE - 0.15) * 0.4);
        ctx.fillStyle = `rgba(138,144,160,${subA})`;
        ctx.font = `300 ${Math.min(w * 0.015, 10)}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('PRINCIPAL SOFTWARE ENGINEER', cx, cy + fs * 0.58);
      }
    }

    if (elapsed > 1.0) {
      const ba = Math.min(0.1, (elapsed - 1.0) * 0.05);
      const bs = Math.min(w, h) * 0.065;
      ctx.strokeStyle = `rgba(196,154,108,${ba})`; ctx.lineWidth = 0.8;
      const corners = [
        [cx - bs * 2.3, cy - bs * 1.6], [cx + bs * 2.3, cy - bs * 1.6],
        [cx + bs * 2.3, cy + bs * 1.6], [cx - bs * 2.3, cy + bs * 1.6]
      ];
      corners.forEach(([x, y], i) => {
        const dx = i % 2 === 0 ? 1 : -1; const dy = i < 2 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(x + dx * bs * 0.28, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * bs * 0.28);
        ctx.stroke();
      });
    }

    const vig = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.22, cx, cy, Math.min(w, h) * 0.72);
    vig.addColorStop(0, 'rgba(3,4,9,0)');
    vig.addColorStop(1, 'rgba(3,4,9,0.55)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);

    if (elapsed > 1.5) {
      const slA = Math.min(0.025, (elapsed - 1.5) * 0.008);
      ctx.fillStyle = `rgba(0,0,0,${slA})`;
      for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    }

    ctx.globalAlpha = 1;
    return true;
  }

  private renderCollapse(ctx: CanvasRenderingContext2D, w: number, h: number, cx: number, cy: number, ct: number): boolean {
    const progress = Math.min(1, ct / this.COLLAPSE_DUR);
    const spiralAccel = progress * progress * progress;
    const spiralAngle = spiralAccel * Math.PI * 6;

    ctx.fillStyle = '#030409';
    ctx.fillRect(0, 0, w, h);

    const collapseR = Math.max(w, h) * 0.75 * (1 - progress);
    const cols = [[196, 154, 108], [122, 168, 204], [210, 210, 220]];

    for (let i = 0; i < this.pMain.length; i++) {
      const p = this.pMain[i];
      const targetR = Math.sqrt((p.tx - cx) ** 2 + (p.ty - cy) ** 2);
      const baseAngle = Math.atan2(p.ty - cy, p.tx - cx);
      const collapseAngle = baseAngle + spiralAngle * (0.5 + (i % 5) * 0.1);
      const cr = targetR * (1 - progress * 0.98);
      const px = cx + Math.cos(collapseAngle) * cr;
      const py = cy + Math.sin(collapseAngle) * cr;
      const alpha = p.ma * (1 - progress * 0.5);
      const size = p.r * (1 + progress * 2);
      const c = cols[p.col];

      if (progress > 0.1) {
        const trailLen = progress * 25;
        const tx2 = px - Math.cos(collapseAngle) * trailLen;
        const ty2 = py - Math.sin(collapseAngle) * trailLen;
        const tg = ctx.createLinearGradient(tx2, ty2, px, py);
        tg.addColorStop(0, 'rgba(196,154,108,0)');
        tg.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},${alpha * 0.5})`);
        ctx.beginPath(); ctx.moveTo(tx2, ty2); ctx.lineTo(px, py);
        ctx.strokeStyle = tg; ctx.lineWidth = size * 0.7; ctx.stroke();
      }

      ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`; ctx.fill();
    }

    const txtAlpha = Math.max(0, 1 - progress * 1.3);
    if (txtAlpha > 0.01) {
      const scale = 1 - progress * 0.25;
      const fs = Math.min(w * 0.135, 135) * scale;
      ctx.save();
      ctx.translate(cx, cy); ctx.scale(scale, scale); ctx.translate(-cx, -cy);
      ctx.shadowColor = `rgba(196,154,108,${0.4 * txtAlpha})`;
      ctx.shadowBlur = 50 * (1 + progress);
      ctx.fillStyle = `rgba(232,234,240,${txtAlpha * 0.97})`;
      ctx.font = `600 ${fs}px 'Outfit', 'Space Grotesk', sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('MONEIM', cx, cy);
      ctx.restore();
    }

    if (progress > 0.55) {
      const fp = (progress - 0.55) / 0.45;
      const flash = fp < 0.4 ? fp * 2.5 : Math.max(0, 1.6 - fp * 1.6);
      const flashR = 5 + flash * 220;
      const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, flashR);
      fg.addColorStop(0, `rgba(255,255,255,${flash * 0.98})`);
      fg.addColorStop(0.2, `rgba(196,154,108,${flash * 0.7})`);
      fg.addColorStop(0.6, `rgba(122,168,204,${flash * 0.2})`);
      fg.addColorStop(1, 'rgba(196,154,108,0)');
      ctx.fillStyle = fg;
      ctx.fillRect(cx - flashR, cy - flashR, flashR * 2, flashR * 2);

      for (let r = 0; r < 3; r++) {
        const ringProgress = Math.max(0, fp - r * 0.12);
        if (ringProgress > 0 && ringProgress < 0.8) {
          const ringR = ringProgress * Math.max(w, h) * 0.7;
          const ringA = (1 - ringProgress / 0.8) * 0.3;
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(196,154,108,${ringA})`;
          ctx.lineWidth = 1.5 - ringProgress; ctx.stroke();
        }
      }
    }

    if (ct > this.COLLAPSE_DUR) {
      const wipe = Math.min(1, (ct - this.COLLAPSE_DUR) / 0.5);
      ctx.fillStyle = `rgba(3,4,9,${wipe})`;
      ctx.fillRect(0, 0, w, h);
    }

    return true;
  }

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
    setTimeout(() => this.scrollHandler(), 100);
  }

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

    ctx.beginPath(); ctx.moveTo(w * 0.05, h / 2); ctx.lineTo(w * 0.95, h / 2);
    ctx.strokeStyle = `rgba(196,154,108,${Math.min(0.06, elapsed * 0.03)})`; ctx.lineWidth = 0.5; ctx.stroke();

    if (elapsed > 0.5) {
      const ca = Math.min(0.04, (elapsed - 0.5) * 0.02);
      for (let i = 0; i < positions.length; i++) for (let j = i + 1; j < positions.length; j++) {
        ctx.beginPath(); ctx.moveTo(positions[i].x, positions[i].y); ctx.lineTo(positions[j].x, positions[j].y);
        ctx.strokeStyle = `rgba(122,168,204,${ca})`; ctx.lineWidth = 0.3; ctx.stroke();
      }
    }

    this.metricsHover = -1;
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i]; const d = data[i];
      const stagger = i * 0.25; const me = Math.max(0, elapsed - stagger);
      const cp = Math.min(1, me / 1.2); const ce = 1 - Math.pow(1 - cp, 4);
      this.metricsAnim[i] = d.target * ce;
      const dv = Math.round(this.metricsAnim[i]);

      const dx = this.metricsMouseX - pos.x, dy = this.metricsMouseY - pos.y;
      const hover = Math.sqrt(dx * dx + dy * dy) < pos.s * 1.2;
      if (hover) this.metricsHover = i;
      const hs = hover ? 1.05 : 1;

      if (me > 0) {
        ctx.save(); ctx.translate(pos.x, pos.y); ctx.scale(hs, hs);
        ctx.font = `900 ${pos.s}px 'Space Grotesk', sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.strokeStyle = `rgba(196,154,108,${Math.min(0.06, me * 0.03)})`;
        ctx.lineWidth = 0.8;
        ctx.strokeText(dv + (d.plus ? '+' : ''), 0, 0);
        ctx.restore();

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

    if (elapsed > 0.3 && elapsed < 4) {
      const sp = (elapsed - 0.3) / 3.7;
      const sx = w * 0.05 + sp * w * 0.9;
      const sg = ctx.createLinearGradient(sx - 2, 0, sx + 2, 0);
      sg.addColorStop(0, 'rgba(196,154,108,0)'); sg.addColorStop(0.5, 'rgba(196,154,108,0.04)'); sg.addColorStop(1, 'rgba(196,154,108,0)');
      ctx.fillStyle = sg; ctx.fillRect(sx - 2, 0, 4, h);
    }

    if (this.metricsHover >= 0) {
      const hp = positions[this.metricsHover];
      for (const p of this.metricsParticles) {
        const dx = p.x - hp.x, dy = p.y - hp.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(hp.x, hp.y); ctx.strokeStyle = `rgba(196,154,108,${0.06 * (1 - dist / 150)})`; ctx.lineWidth = 0.3; ctx.stroke(); }
      }
    }
  }

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

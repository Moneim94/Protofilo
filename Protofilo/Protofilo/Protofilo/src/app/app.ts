import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

type CountKey = 'years' | 'projects' | 'regions' | 'volume';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('cursor', { static: false }) cursorRef!: ElementRef;
  @ViewChild('cursorDot', { static: false }) cursorDotRef!: ElementRef;

  loaded = false;
  currentSection = 'hero';
  menuOpen = false;
  typed = '';
  progress = 0;
  cursorVisible = false;
  cursorHover = false;
  cursorX = -100;
  cursorY = -100;
  mouseLX = 0.5;
  mouseLY = 0.5;
  countersOn = false;
  reducedMotion = false;

  typedInterval: any;
  scrollHandler: any;
  observer!: IntersectionObserver;

  counts = { years: 0, projects: 0, regions: 0, volume: 0 };
  private countTargets = { years: 7, projects: 40, regions: 5, volume: 99 };
  private countSteps: Record<string, number> = {};
  countTimers: any[] = [];

  roles = [
    'Principal Software Engineer',
    'Solution Architect',
    'Systems Architect',
    'Engineering Lead'
  ];
  private roleIdx = 0;

  name = {
    first: 'Ahmed',
    last: 'Abd ElMoniem'
  };
  descriptor = 'Principal Software Engineer · Solution Architect';
  location = 'Riyadh, Saudi Arabia';

  // coordinates / data stream labels
  coords = '24°42\' N · 46°40\' E';
  status = 'SYSTEMS ONLINE';

  manifestoLines = [
    { text: 'I architect the systems', accent: false },
    { text: 'behind the software', accent: false },
    { text: 'that runs the future.', accent: true }
  ];

  stacks = [
    { label: 'Angular', role: 'Frontend' },
    { label: '.NET Core', role: 'Backend' },
    { label: 'TypeScript', role: 'Language' },
    { label: 'gRPC', role: 'Protocol' },
    { label: 'OAuth2 / OIDC', role: 'Identity' },
    { label: 'SQL / NoSQL', role: 'Data' },
    { label: 'OutSystems', role: 'Low-Code' },
    { label: 'Microservices', role: 'Pattern' },
    { label: 'Docker / K8s', role: 'Runtime' }
  ];

  nodes = [
    { tag: 'ARCHITECTURE', title: 'System & Solution Design', desc: 'Clean architecture, DDD, and deliberate boundaries that keep complexity in check as systems scale.', icon: '01' },
    { tag: 'IDENTITY', title: 'Identity & Security', desc: 'OAuth2, OIDC, PKCE, JWT — trust as an engineered layer, not an afterthought.', icon: '02' },
    { tag: 'DISTRIBUTION', title: 'Microservices & APIs', desc: 'gRPC and decoupled services woven into resilient, maintainable runtime fabrics.', icon: '03' },
    { tag: 'CRAFTSMANSHIP', title: 'Frontend Experience', desc: 'Angular interfaces engineered with precision — fluid, accessible, and beautifully composed.', icon: '04' }
  ];

  capabilities = [
    { num: '01', title: 'Enterprise Architecture', desc: 'Designing systems that survive scale.', metric: 'SOLID · DDD' },
    { num: '02', title: 'Backend Engineering', desc: 'High-performance services, .NET Core.', metric: 'C# · gRPC' },
    { num: '03', title: 'Identity & Trust', desc: 'Secure auth woven into everything.', metric: 'OAuth2 · OIDC' },
    { num: '04', title: 'Cloud & Runtime', desc: 'Containerized systems that never sleep.', metric: 'Docker · K8s' }
  ];

  projects = [
    {
      index: '01',
      title: 'Laboratory Intelligence',
      subtitle: 'Enterprise Laboratory Information System',
      year: 'HEALTHCARE',
      desc: 'A multi-specialty laboratory system — sample tracking, order requisition, and results delivery, unified with hospital information systems through HL7 interoperability.',
      tech: ['HL7', '.NET Core', 'Angular', 'SQL Server'],
      system: 'HL7 // INTEROP',
      accent: 'health'
    },
    {
      index: '02',
      title: 'Identity Fabric',
      subtitle: 'Single Sign-On & Identity Platform',
      year: 'SECURITY',
      desc: 'Centralized authentication managing token lifecycles, refresh flows, PKCE, and granular RBAC across multi-tenant enterprise applications.',
      tech: ['OAuth2', 'OIDC', 'PKCE', 'IdentityServer'],
      system: 'TRUST // FABRIC',
      accent: 'identity'
    },
    {
      index: '03',
      title: 'Innovation Engine',
      subtitle: 'Ideas & Innovation Management Platform',
      year: 'COLLABORATION',
      desc: 'An enterprise submission and workflow engine with multi-stage review pipelines, attachment handling, and role-based validation.',
      tech: ['Angular', 'Workflow', 'DDD', '.NET Core'],
      system: 'WORKFLOW // CORE',
      accent: 'innovation'
    },
    {
      index: '04',
      title: 'Distributed Core',
      subtitle: 'Enterprise Distributed Services Engine',
      year: 'INFRASTRUCTURE',
      desc: 'A high-throughput distributed service layer using gRPC, domain-driven design, and decoupled microservices engineered for maintainability.',
      tech: ['Microservices', 'gRPC', 'DDD', 'Rust'],
      system: 'MESH // RUNTIME',
      accent: 'distributed'
    }
  ];

  principles = [
    { word: 'Clear', code: '/01', desc: 'Boundaries drawn with intent.' },
    { word: 'Resilient', code: '/02', desc: 'Failure designed as a condition.' },
    { word: 'Elegant', code: '/03', desc: 'The simplest that could possibly work.' },
    { word: 'Honest', code: '/04', desc: 'Systems that reveal their truth.' }
  ];

  journey = [
    { period: '2026 —', role: 'Principal Software Engineer', org: 'SNS', place: 'Riyadh', focus: 'Architectural governance', theme: 'current' },
    { period: '2023 — 26', role: 'Senior Full Stack Developer', org: 'Almoammar', place: 'Riyadh', focus: 'Identity & enterprise platforms' },
    { period: '2021 — 23', role: 'Senior OutSystems Developer', org: 'Envnt', place: 'Egypt', focus: 'Low-code, from scratch' },
    { period: '2020 — 21', role: 'Full Stack Developer', org: 'National Technology', place: 'Egypt', focus: 'Backend & healthcare systems' },
    { period: '2017 — 18', role: 'Full Stack Developer', org: 'ArmyTech', place: 'Egypt', focus: 'Agile delivery' }
  ];

  education = [
    { title: '.NET Full Stack Track', org: 'ITI', year: '2020' },
    { title: 'B.S. Computer Science', org: 'Minia University', year: '2013 — 2018' }
  ];

  nav = [
    { id: 'hero', label: 'Index' },
    { id: 'vision', label: 'Vision' },
    { id: 'systems', label: 'Systems' },
    { id: 'work', label: 'Work' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'journey', label: 'Journey' },
    { id: 'contact', label: 'Contact' }
  ];

  contact = 'ahmedmoneim094@gmail.com';
  phoneSA = '+966 50 310 0847';

  visionStats: { k: CountKey; l: string; s: string }[] = [
    { k: 'years', l: 'Years of Systems', s: '+' },
    { k: 'projects', l: 'Systems Delivered', s: '+' },
    { k: 'regions', l: 'Regions Served', s: '' },
    { k: 'volume', l: 'Stability Score', s: '%' }
  ];

  particles = Array.from({ length: 46 }, (_, i) => i);
  streamRows = Array.from({ length: 6 }, (_, i) => i);
  gridCells = Array.from({ length: 24 }, (_, i) => i);

  constructor() {}

  ngOnInit() {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => { this.loaded = true; }, 120);
    setTimeout(() => { this.cursorVisible = true; }, 800);
    this.startTyping();
  }

  ngAfterViewInit() {
    this.initSectionObserver();
    this.scrollHandler = () => {
      const top = window.scrollY || 0;
      const doc = document.documentElement.scrollHeight - window.innerHeight;
      this.progress = doc > 0 ? Math.min(100, (top / doc) * 100) : 0;
      const winH = window.innerHeight * 0.9;
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        if (r.top < winH && r.bottom > 0) { el.classList.add('revealed'); }
      });
      this.currentSection = this.activeSection();
    };
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    setTimeout(() => this.scrollHandler(), 400);
    document.documentElement.classList.add('has-cursor');
  }

  ngOnDestroy() {
    if (this.typedInterval) clearInterval(this.typedInterval);
    if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler);
    if (this.observer) this.observer.disconnect();
    this.countTimers.forEach((t) => clearInterval(t));
  }

  @HostListener('document:mousemove', ['$event'])
  onMove(e: MouseEvent) {
    this.cursorX = e.clientX;
    this.cursorY = e.clientY;
    this.mouseLX = e.clientX / window.innerWidth;
    this.mouseLY = e.clientY / window.innerHeight;
    if (this.cursorRef) {
      this.cursorRef.nativeElement.style.transform = `translate3d(${e.clientX - 20}px, ${e.clientY - 20}px, 0)`;
    }
    if (this.cursorDotRef) {
      this.cursorDotRef.nativeElement.style.transform = `translate3d(${e.clientX - 3}px, ${e.clientY - 3}px, 0)`;
    }
  }

  onCursorEnter() { this.cursorHover = true; }
  onCursorLeave() { this.cursorHover = false; }

  magnetic(ev: MouseEvent, amount = 12) {
    const el = ev.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const x = (ev.clientX - r.left - r.width / 2) / r.width;
    const y = (ev.clientY - r.top - r.height / 2) / r.height;
    el.style.transform = `translate(${x * amount}px, ${y * amount}px)`;
  }
  magneticReset(ev: MouseEvent) {
    const el = ev.currentTarget as HTMLElement;
    el.style.transform = 'translate(0,0)';
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: this.reducedMotion ? 'auto' : 'smooth' });
    this.menuOpen = false;
  }

  private activeSection(): string {
    const ids = ['hero', 'vision', 'systems', 'work', 'architecture', 'journey', 'contact'];
    const mid = window.scrollY + window.innerHeight / 2;
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= mid && el.offsetTop + el.offsetHeight > mid) return id;
    }
    return 'hero';
  }

  private initSectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('revealed');
          if (en.target.classList.contains('count-block') && !this.countersOn) {
            this.countersOn = true;
            this.startCounters();
          }
        }
      });
    }, { threshold: 0.15 });
    setTimeout(() => {
      document.querySelectorAll('[data-reveal]').forEach((el) => this.observer.observe(el));
      document.querySelectorAll('.count-block').forEach((el) => this.observer.observe(el));
    }, 300);
  }

  private startCounters() {
    const dur = 1800;
    type K = keyof typeof this.countTargets;
    (Object.keys(this.countTargets) as K[]).forEach((key) => {
      this.countSteps[key] = this.countTargets[key] / (dur / 16);
    });
    const tick = () => {
      let done = true;
      (Object.keys(this.countTargets) as K[]).forEach((key) => {
        const val = this.counts[key];
        const next = val + this.countSteps[key];
        this.counts[key] = next >= this.countTargets[key] ? this.countTargets[key] : Math.floor(next);
        if (this.counts[key] < this.countTargets[key]) done = false;
      });
      if (!done) this.countTimers.push(window.setTimeout(tick, 16));
    };
    tick();
  }

  private startTyping() {
    const role = this.roles[this.roleIdx];
    this.typed = '';
    let i = 0;
    clearInterval(this.typedInterval);
    this.typedInterval = setInterval(() => {
      if (i <= role.length) { this.typed = role.slice(0, i); i++; }
      else {
        clearInterval(this.typedInterval);
        setTimeout(() => { this.roleIdx = (this.roleIdx + 1) % this.roles.length; this.startTyping(); }, 1900);
      }
    }, 55);
  }
}

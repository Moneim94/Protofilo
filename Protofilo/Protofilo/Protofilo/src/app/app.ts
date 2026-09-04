import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Experience {
  range: string;
  role: string;
  org: string;
  place: string;
  current?: boolean;
  summary: string;
  points: string[];
  tags: string[];
  color: string;
}

interface Edu {
  school: string;
  degree: string;
  year: string;
  detail: string;
  color: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit, OnDestroy {
  menuOpen = false;
  scrolled = false;
  booted = false;
  activeSection = 'home';
  activeProject: number | null = null;
  activeArch: string | null = null;
  activeSec: string | null = null;
  copied = false;
  private observer!: IntersectionObserver;

  navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'expertise', label: 'Expertise' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'education', label: 'Education' },
    { id: 'contact', label: 'Contact' }
  ];

  heroBadges = ['protection', 'net', 'angular', 'plus', 'cloud', 'identity', 'data'];

  heroSkills = ['.NET', 'Angular', 'Microservices', 'DDD', 'Solution Architecture', 'Identity & Security', 'OutSystems', 'Enterprise Systems'];

  counters = [
    { value: 7, suffix: '+', label: 'Years', sub: 'Enterprise-grade experience' },
    { value: 18, suffix: '', label: 'Systems', sub: 'Major platforms architected' },
    { value: 6, suffix: '', label: 'Domains', sub: 'Healthcare, security, finance & more' },
    { value: 8, suffix: '+', label: 'Stack', sub: 'Technologies mastered' }
  ];

  expertise = [
    {
      icon: 'layout',
      title: 'Architecture',
      desc: 'System design, clean architecture and distributed thinking.',
      techs: ['System Design', 'Clean Architecture', 'Domain-Driven Design', 'Microservices', 'SOLID', 'REST APIs', 'gRPC', 'WCF'],
      color: 'var(--accent)'
    },
    {
      icon: 'cpu',
      title: 'Backend',
      desc: 'High-performance server engineering with .NET at the core.',
      techs: ['C#', 'ASP.NET Core', '.NET 9/10', 'Multithreading', 'Async Programming', 'Python', 'Rust'],
      color: 'var(--sky)'
    },
    {
      icon: 'monitor',
      title: 'Frontend',
      desc: 'Modern, reactive interfaces and component systems.',
      techs: ['Angular', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Bootstrap', 'jQuery'],
      color: 'var(--rose)'
    },
    {
      icon: 'shield',
      title: 'Security & Identity',
      desc: 'Authentication, authorization and token architecture.',
      techs: ['IdentityServer', 'OpenID Connect', 'OAuth 2.0', 'PKCE', 'JWT', 'Web Security Protocols'],
      color: 'var(--emerald)'
    },
    {
      icon: 'database',
      title: 'Database & ORM',
      desc: 'Data modeling, persistence and query optimization.',
      techs: ['SQL Server', 'Oracle', 'Entity Framework Core', 'Dapper', 'ADO.NET', 'Database Optimization'],
      color: 'var(--amber)'
    },
    {
      icon: 'code',
      title: 'Low-Code & Practices',
      desc: 'Rapid delivery without sacrificing engineering discipline.',
      techs: ['OutSystems', 'Unit Testing', 'Code Reviews', 'CI/CD', 'Technical Documentation', 'Mentoring'],
      color: 'var(--violet)'
    }
  ];

  experience: Experience[] = [
    {
      range: 'May 2026 — Present',
      role: 'Principal Software Engineer',
      org: 'SNS',
      place: 'Riyadh, Saudi Arabia',
      current: true,
      summary: 'Architectural governance, design leadership and enterprise solution engineering.',
      points: [
        'Lead end-to-end technical analysis, solution design, and architectural governance for scalable enterprise software.',
        'Architect maintainable systems utilizing DDD, clean design principles, system flowcharts, and high-level architectural blueprints.',
        'Conduct system performance evaluations, identifying bottlenecks and implementing high-impact procedural and technical improvements.',
        'Enforce software quality standards via code reviews, root-cause troubleshooting, and mentoring junior/mid-level engineers.'
      ],
      tags: ['Architecture', 'DDD', 'Code Review', 'Mentoring', 'Performance'],
      color: 'var(--accent)'
    },
    {
      range: 'March 2023 — May 2026',
      role: 'Senior Full Stack Developer',
      org: 'ALMOAMMAR',
      place: 'Riyadh, Saudi Arabia',
      summary: 'Enterprise web platform engineering with identity-first design.',
      points: [
        'Engineered robust enterprise web applications using .NET Core APIs, modern Angular frontends, and SQL Server.',
        'Designed identity and security layers implementing OAuth 2.0, OpenID Connect, and granular RBAC authorization models.',
        'Diagnosed and resolved critical production issues using structured root-cause analysis and performance tuning.',
        'Collaborated with technical leads and enterprise stakeholders to drive continuous feature delivery and integration workflows.'
      ],
      tags: ['.NET Core', 'Angular', 'OAuth 2.0', 'OpenID Connect', 'RBAC', 'SQL Server'],
      color: 'var(--sky)'
    },
    {
      range: 'July 2021 — January 2023',
      role: 'Senior OutSystems Developer',
      org: 'Envnt',
      place: 'Sheraton, Egypt',
      summary: 'Full lifecycle low-code enterprise platform delivery.',
      points: [
        'Architected and deployed custom low-code solutions from scratch on the OutSystems Enterprise Platform.',
        'Designed streamlined application workflows, UX components, and backend database structures.',
        'Maintained, scaled, and configured core business applications while providing advanced L3 technical support.'
      ],
      tags: ['OutSystems', 'Platform', 'Workflow', 'Database'],
      color: 'var(--violet)'
    },
    {
      range: 'April 2020 — July 2021',
      role: 'Full Stack Developer',
      org: 'National Technology',
      place: 'Nasr City, Egypt',
      summary: 'Scalable services and healthcare integration.',
      points: [
        'Built scalable backend services and UI components using .NET Core, Entity Framework, ADO.NET, and Angular 8.',
        'Integrated enterprise healthcare workflows.',
        'Optimized query performance across complex database structures.'
      ],
      tags: ['.NET Core', 'Entity Framework', 'ADO.NET', 'Angular 8', 'Healthcare'],
      color: 'var(--emerald)'
    },
    {
      range: 'January 2017 — March 2018',
      role: 'Full Stack Developer',
      org: 'ArmyTech',
      place: 'Remote, Egypt',
      summary: 'Agile full-stack delivery.',
      points: [
        'Delivered full-stack components in an Agile environment.',
        'Contributed to continuous iterative deployments.'
      ],
      tags: ['Agile', 'Full Stack', 'Deployment'],
      color: 'var(--amber)'
    }
  ];

  projects = [
    {
      index: '01',
      title: 'Enterprise Laboratory Information System',
      subtitle: 'LDM · Multi-specialty LIS',
      domain: 'HEALTHCARE',
      blurb: 'Streamlining sample tracking, order requisition, and results delivery with seamless HIS integration and HL7 interoperability.',
      desc: 'A multi-specialty Laboratory Information System unifying sample tracking, order requisition, and results delivery across connected laboratories — integrating with hospital information systems through HL7 interoperability for a single source of clinical truth.',
      tech: ['Healthcare', 'HL7', 'Interoperability', '.NET', 'Enterprise Integration'],
      flow: 'HIS ⇄ HL7 ⇄ LIS ⇄ Lab Instruments ⇄ Results',
      color: 'var(--emerald)'
    },
    {
      index: '02',
      title: 'Enterprise Single Sign-On & Identity Platform',
      subtitle: 'Centralized authentication & authorization',
      domain: 'SECURITY',
      blurb: 'Managing token lifecycles, refresh flows, PKCE, claims, and RBAC across multi-tenant enterprise applications.',
      desc: 'Centralized authentication and security infrastructure managing token lifecycles, refresh flows, PKCE, claims, and granular RBAC across a connected estate of multi-tenant enterprise applications — one identity, many services.',
      tech: ['IdentityServer', 'OAuth 2.0', 'OpenID Connect', 'PKCE', 'JWT', 'RBAC', 'Security'],
      flow: 'Client → IDP → Authorization Code → Token → API → RBAC',
      color: 'var(--sky)'
    },
    {
      index: '03',
      title: 'Ideas & Innovation Management Platform',
      subtitle: 'Submission & workflow engine',
      domain: 'COLLABORATION',
      blurb: 'Multi-stage review pipelines, attachment handling, and role-based validation.',
      desc: 'Enterprise submission and workflow engine providing multi-stage review pipelines, attachment handling, and role-based validation — turning ideas into governed, auditable outcomes.',
      tech: ['.NET', 'Angular', 'Workflow', 'RBAC', 'Enterprise Applications'],
      flow: 'Submit → Review → Validate → Approve → Publish',
      color: 'var(--accent)'
    },
    {
      index: '04',
      title: 'Enterprise Distributed Services Engine',
      subtitle: 'High-throughput service layer',
      domain: 'INFRASTRUCTURE',
      blurb: 'A decoupled, domain-driven microservice architecture engineered for maintainability.',
      desc: 'High-throughput distributed service layer utilizing gRPC, Domain-Driven Design, and decoupled microservices to maximize maintainability — built to scale across bounded contexts.',
      tech: ['Microservices', 'gRPC', 'DDD', 'Distributed Systems', '.NET'],
      flow: 'Gateway → Router → Service Mesh → Bounded Contexts',
      color: 'var(--violet)'
    }
  ];

  archNodes = [
    { id: 'client', label: 'Frontend', x: 50, y: 12, detail: 'Angular · TypeScript · Responsive UI', tech: 'Angular, TypeScript' },
    { id: 'api', label: 'API Layer', x: 30, y: 36, detail: 'REST / gRPC endpoints · API Gateway', tech: '.NET Core, gRPC, REST' },
    { id: 'app', label: 'Application Layer', x: 70, y: 36, detail: 'Use cases · orchestration · workflows', tech: 'C#, Command Handling' },
    { id: 'domain', label: 'Domain Layer', x: 50, y: 58, detail: 'Entities · value objects · domain rules', tech: 'DDD, Clean Architecture' },
    { id: 'infra', label: 'Infrastructure', x: 30, y: 80, detail: 'Repositories · integrations · providers', tech: 'EF Core, Dapper, Message Bus' },
    { id: 'database', label: 'Database', x: 70, y: 80, detail: 'Persistence & caching', tech: 'SQL Server, Oracle, Redis' }
  ];

  securitySteps = [
    { id: 'client', label: 'Client', icon: 'monitor' },
    { id: 'authz', label: 'Authorization', icon: 'shield' },
    { id: 'idp', label: 'Identity Provider', icon: 'key' },
    { id: 'code', label: 'Authorization Code', icon: 'link' },
    { id: 'token', label: 'Token', icon: 'lock' },
    { id: 'api', label: 'API', icon: 'server' },
    { id: 'rbac', label: 'RBAC', icon: 'users' }
  ];

  strengths = [
    { icon: 'target', title: 'Solution & System Design', desc: 'Turning business problems into robust, scalable technical blueprints.' },
    { icon: 'net', title: 'Enterprise Microservices', desc: 'Decoupled, event-driven services built around bounded contexts.' },
    { icon: 'api', title: 'API & Integration Architecture', desc: 'REST, gRPC and HL7 integration as first-class design concerns.' },
    { icon: 'shield', title: 'OAuth2 & Identity Management', desc: 'Token lifecycles, PKCE, and centralized authorization.' },
    { icon: 'search', title: 'Root-Cause Analysis', desc: 'Structured diagnosis of production issues and performance bottlenecks.' },
    { icon: 'users', title: 'Technical Leadership & Mentoring', desc: 'Raising engineering quality through reviews and guidance.' },
    { icon: 'rocket', title: 'Agile Delivery', desc: 'Continuous, iterative delivery across cross-functional teams.' }
  ];

  education: Edu[] = [
    {
      school: 'Information Technology Institute (ITI)',
      degree: 'Graduate · .NET Full Stack Development Track',
      year: '2020',
      detail: 'Intensive professional training in enterprise .NET full-stack development.',
      color: 'var(--accent)'
    },
    {
      school: 'Minia University',
      degree: 'B.S. in Computer Science',
      year: '2013 — 2018',
      detail: 'Bachelor of Science, Computer Science.',
      color: 'var(--sky)'
    }
  ];

  ngAfterViewInit() {
    this.initScroll();
    this.initObserver();
    setTimeout(() => { this.booted = true; }, 1150);
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scrollFn);
    if (this.observer) this.observer.disconnect();
  }

  private scrollFn = () => {
    const top = window.scrollY;
    this.scrolled = top > 20;
    const probes: Record<string, number> = {};
    for (const n of this.navItems) {
      const el = document.getElementById(n.id);
      if (el) {
        const r = el.getBoundingClientRect();
        probes[n.id] = r.top + window.scrollY;
      }
    }
    const mid = top + window.innerHeight * 0.35;
    let current = 'home';
    for (const n of this.navItems) {
      if (probes[n.id] !== undefined && probes[n.id] <= mid) current = n.id;
    }
    if (this.activeSection !== current) {
      this.activeSection = current;
    }
    // keep DOM reads cheap; Angular runs change detection via zone automatically for scroll events
  };

  private initScroll() {
    window.addEventListener('scroll', this.scrollFn, { passive: true });
    this.scrollFn();
  }

  private initObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in-view');
          en.target.querySelectorAll('[data-count]').forEach(c => {
            const el = c as HTMLElement;
            const target = Number(el.dataset['count'] || 0);
            el.textContent = '0';
            this.animateCountTo(el, target);
          });
          this.observer.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => {
      el.classList.add('to-hide');
      this.observer.observe(el);
    });
  }

  private animateCountTo(el: HTMLElement, target: number) {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm) { el.textContent = String(target); return; }
    const dur = 1200;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  goTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.menuOpen = false;
  }

  toggleProject(i: number) {
    this.activeProject = this.activeProject === i ? null : i;
  }

  selectArch(id: string) {
    this.activeArch = this.activeArch === id ? null : id;
  }

  selectSec(id: string) {
    this.activeSec = this.activeSec === id ? null : id;
  }

  async copyEmail() {
    try {
      await navigator.clipboard.writeText('ahmedmoneim094@gmail.com');
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    } catch {
      this.copied = false;
    }
  }

  icons: Record<string, string> = {
    layout: 'M3 5h18v14H3z M3 9h18 M9 9v10',
    cpu: 'M6 6h12v12H6z M9 2v4 M15 2v4 M9 18v4 M15 18v4 M2 9h4 M2 15h4 M18 9h4 M18 15h4 M10 10h4v4h-4z',
    monitor: 'M3 4h18v13H3z M8 21h8 M12 17v4',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4',
    database: 'M3 5c0-1.5 4-2.5 9-2.5S21 3.5 21 5v14c0 1.5-4 2.5-9 2.5S3 20.5 3 19z M3 5c0 1.5 4 2.5 9 2.5S21 6.5 21 5 M3 12c0 1.5 4 2.5 9 2.5s9-1 9-2.5',
    code: 'M14 6l-4 12 M9 8l-4 4 4 4 M15 8l4 4-4 4',
    key: 'M15 9a6 6 0 1 1-3-5.2 M13.5 10.5L21 3 M18 8v3 M15 11h3',
    lock: 'M7 10V8a5 5 0 0 1 10 0v2 M5 10h14v11H5z M12 14v3',
    link: 'M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1 M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1',
    server: 'M3 5h18v5H3z M3 14h18v5H3z M6 7.5h.01 M6 16.5h.01',
    users: 'M16 19a4 4 0 0 0-8 0 M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M17 15.5a3 3 0 0 1 2 3.5 M7 15.5a3 3 0 0 0-2 3.5',
    target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
    net: 'M12 2l9 4-9 4-9-4z M3 6v6l9 4 9-4V6',
    api: 'M8 12h8 M10 8l-4 4 4 4 M14 8l4 4-4 4',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3',
    rocket: 'M12 2c5 3 7 8 7 13l-7 2-7-2c0-5 2-10 7-13z M12 2v18 M9 13a3 3 0 0 1 6 0',
    protection: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
    plus: 'M12 5v14 M5 12h14',
    cloud: 'M6 18h13a4 4 0 0 0 0-8 6 6 0 0 0-11-2A4 4 0 0 0 6 18z',
    identity: 'M4 20v-1a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v1 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    data: 'M3 5c0-1.5 4-2.5 9-2.5S21 3.5 21 5v14c0 1.5-4 2.5-9 2.5S3 20.5 3 19z M3 5c0 1.5 4 2.5 9 2.5S21 6.5 21 5'
  };
}

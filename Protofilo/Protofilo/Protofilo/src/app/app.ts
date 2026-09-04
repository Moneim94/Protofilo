import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy, AfterViewInit {
  menuOpen = false;
  scrolled = false;
  currentSection = 'hero';
  activeEng: string | null = null;
  openProject: number | null = null;
  private observer!: IntersectionObserver;

  constructor(private cdr: ChangeDetectorRef) {}

  sections = [
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'contact', label: 'Contact' }
  ];

  skillCategories = [
    { icon: '⬡', title: 'Architecture', desc: 'Clean Architecture, SOLID, Design Patterns, Distributed Systems', techs: ['Clean Architecture', 'SOLID', 'Design Patterns', 'Microservices', 'DDD', 'Event-Driven'] },
    { icon: '◆', title: 'Backend', desc: 'Enterprise backend development with .NET ecosystem', techs: ['C#', '.NET Core', 'ASP.NET Core', 'REST APIs', 'Entity Framework Core', 'gRPC'] },
    { icon: '▲', title: 'Frontend', desc: 'Modern frontend engineering with Angular', techs: ['Angular', 'TypeScript', 'JavaScript', 'RxJS', 'SCSS', 'Responsive Design'] },
    { icon: '◈', title: 'Identity & Security', desc: 'Enterprise identity and access management', techs: ['OAuth 2.0', 'OpenID Connect', 'PKCE', 'IdentityServer', 'JWT', 'SSO', 'RBAC'] },
    { icon: '●', title: 'Data', desc: 'Data persistence and caching strategies', techs: ['SQL Server', 'Entity Framework Core', 'Redis', 'NoSQL', 'Query Optimization'] },
    { icon: '☁', title: 'DevOps & Cloud', desc: 'Cloud-native deployment and orchestration', techs: ['Docker', 'Kubernetes', 'CI/CD', 'Azure', 'Monitoring', 'Low-Code (OutSystems)'] }
  ];

  journey = [
    { period: '2026 —', role: 'Principal Software Engineer', org: 'SNS', place: 'Riyadh', focus: 'Architectural governance', current: true },
    { period: '2023 — 26', role: 'Senior Full Stack Developer', org: 'Almoammar', place: 'Riyadh', focus: 'Identity & enterprise platforms', current: false },
    { period: '2021 — 23', role: 'Senior OutSystems Developer', org: 'Envnt', place: 'Egypt', focus: 'Low-code development', current: false },
    { period: '2020 — 21', role: 'Full Stack Developer', org: 'National Technology', place: 'Egypt', focus: 'Backend & healthcare systems', current: false },
    { period: '2017 — 18', role: 'Full Stack Developer', org: 'ArmyTech', place: 'Egypt', focus: 'Agile delivery', current: false }
  ];

  education = [
    { title: '.NET Full Stack Track', org: 'ITI', year: '2020' },
    { title: 'B.S. Computer Science', org: 'Minia University', year: '2013 — 2018' }
  ];

  projects = [
    { index: '01', title: 'Laboratory Intelligence', subtitle: 'Enterprise LIS', domain: 'HEALTHCARE', desc: 'Multi-specialty laboratory system — sample tracking, order requisition, and results delivery unified with hospital information systems through HL7 interoperability.', tech: ['HL7', '.NET Core', 'Angular', 'SQL Server'], arch: 'HL7 // INTEROP → HIS', color: 'var(--emerald)' },
    { index: '02', title: 'Identity Fabric', subtitle: 'SSO & Identity Platform', domain: 'SECURITY', desc: 'Centralized authentication managing token lifecycles, refresh flows, PKCE, and granular RBAC across multi-tenant enterprise applications.', tech: ['OAuth2', 'OIDC', 'PKCE', 'IdentityServer'], arch: 'CLIENT → IDP → TOKEN → API', color: 'var(--sky)' },
    { index: '03', title: 'Innovation Engine', subtitle: 'Ideas Management Platform', domain: 'COLLABORATION', desc: 'Enterprise submission and workflow engine with multi-stage review pipelines, attachment handling, and role-based validation.', tech: ['Angular', 'Workflow', 'DDD', '.NET Core'], arch: 'SUBMIT → REVIEW → APPROVE → PUBLISH', color: 'var(--accent)' },
    { index: '04', title: 'Distributed Core', subtitle: 'Services Engine', domain: 'INFRASTRUCTURE', desc: 'High-throughput distributed service layer using gRPC, domain-driven design, and decoupled microservices engineered for maintainability.', tech: ['Microservices', 'gRPC', 'DDD', 'Rust'], arch: 'GATEWAY → ROUTER → SERVICE → MESH', color: 'var(--rose)' }
  ];

  engNodes = [
    { id: 'arch', label: 'ARCHITECTURE', x: 50, y: 18, flow: 'Client → Gateway → Service → Database' },
    { id: 'back', label: 'BACKEND', x: 82, y: 38, flow: 'Request → Middleware → Handler → Response' },
    { id: 'front', label: 'FRONTEND', x: 75, y: 72, flow: 'Component → State → Render → DOM' },
    { id: 'identity', label: 'IDENTITY', x: 25, y: 72, flow: 'Client → OAuth2 → Token → API Gateway' },
    { id: 'data', label: 'DATA', x: 15, y: 38, flow: 'Query → Optimizer → Executor → Cache' },
    { id: 'cloud', label: 'CLOUD', x: 50, y: 50, flow: 'Deploy → Scale → Monitor → Recover' }
  ];

  ngOnInit() {}

  ngAfterViewInit() {
    this.initScroll();
    this.initObserver();
  }

  ngOnDestroy() {
    if (this.observer) this.observer.disconnect();
  }

  private initScroll() {
    window.addEventListener('scroll', () => {
      const top = window.scrollY || 0;
      this.scrolled = top > 60;
      const mid = top + window.innerHeight * 0.4;
      for (const s of this.sections) {
        const el = document.getElementById(s.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const elTop = top + rect.top;
          if (elTop <= mid && elTop + rect.height > mid) {
            this.currentSection = s.id;
            break;
          }
        }
      }
      this.cdr.detectChanges();
    }, { passive: true });
  }

  private initObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('revealed');
          this.observer.unobserve(en.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    const els = document.querySelectorAll('.reveal');
    els.forEach(el => {
      el.classList.add('pre-hidden');
      this.observer.observe(el);
    });
  }

  goTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    this.menuOpen = false;
  }

  getEngFlow(): string {
    const n = this.engNodes.find(n => n.id === this.activeEng);
    return n ? n.flow : '';
  }

  toggleProject(i: number) {
    this.openProject = this.openProject === i ? null : i;
  }
}

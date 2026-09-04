import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the site with hero', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.site')).toBeTruthy();
    expect(compiled.querySelector('.hero-name')?.textContent).toContain('AHMED');
  });

  it('should show the circular loader until booted, then remove it', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.loading')).toBeTruthy();
    expect(compiled.querySelector('.c-svg .arc-head-g')).toBeTruthy();
    expect(compiled.querySelector('.c-word')?.textContent?.replace(/\s/g, '')).toBe('MONEIM');
    const app = fixture.componentInstance;
    app.booted = true;
    fixture.detectChanges();
    expect(compiled.querySelector('.loading')).toBeFalsy();
    expect(compiled.querySelector('.site')).toBeTruthy();
  });
});

import { Component, inject, HostListener, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Direction } from '@angular/cdk/bidi';

@Component({
  selector: 'app-dashboard-layout',
  imports: [
    CommonModule,
    RouterOutlet, RouterLink, RouterLinkActive,
    MatIconModule, MatButtonModule,
    MatTooltipModule, MatMenuModule,
    TranslatePipe
  ],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss',
})
export class DashboardLayout implements OnInit, OnDestroy {
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  isSidebarCollapsed = false;
  isMobile = false;
  isDark = false;
  currentDir: Direction = 'rtl';

  @HostListener('window:resize')
  onResize() {
    this.checkMobile();
  }

  ngOnInit() {
    this.checkMobile();

    // Dark mode
    this.isDark = localStorage.getItem('darkMode') === 'true';
    this.applyDark();

    // Language
    const savedLang = localStorage.getItem('lang') ?? 'ar';
    this.currentDir = savedLang === 'ar' ? 'rtl' : 'ltr';
    document.dir = this.currentDir;
    this.translate.use(savedLang);
  }

  ngOnDestroy() { }

  checkMobile() {
    this.isMobile = window.innerWidth < 768;
    this.isSidebarCollapsed = this.isMobile;

    if (this.isMobile) {
       this.isSidebarCollapsed = true;
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleLang() {
    const current = this.translate.currentLang();
    const next = current === 'ar' ? 'en' : 'ar';
    this.translate.use(next);
    this.currentDir = next === 'ar' ? 'rtl' : 'ltr';
    document.dir = this.currentDir;
    localStorage.setItem('lang', next);
  }

  toggleDark() {
    this.isDark = !this.isDark;
    localStorage.setItem('darkMode', String(this.isDark));
    this.applyDark();
  }

  applyDark() {
    document.body.classList.toggle('dark-mode', this.isDark);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }
}
import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NavItem } from '../../models/nav-item.model';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  protected readonly mobileMenuOpen = signal(false);

  protected readonly sidebarProfile = computed(() => this.auth.activeProfile());
  protected readonly platformName = 'GYMASTER';
  protected readonly platformSubtitle = 'Academic Athlete';

  protected readonly userNav: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'DB' },
    { label: 'Horarios', route: '/schedules', icon: 'SC' },
    { label: 'Historial', route: '/history', icon: 'HI' },
    { label: 'Mi Código QR', route: '/my-qr', icon: 'QR' },
    { label: 'Perfil', route: '/profile', icon: 'PR' },
  ];

  protected readonly adminNav: NavItem[] = [
    { label: 'Dashboard Admin', route: '/admin-dashboard', icon: 'AD' },
    { label: 'Gestión de Usuarios', route: '/user-management', icon: 'UM' },
    { label: 'Control de Acceso', route: '/attendance', icon: 'CA' },
  ];

  protected readonly visibleAdminNav = computed(() => (this.auth.isAdmin() ? this.adminNav : []));

  constructor(
    protected readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected logout(): void {
    this.auth.logout();
    this.closeMobileMenu();
    void this.router.navigateByUrl('/login');
  }
}

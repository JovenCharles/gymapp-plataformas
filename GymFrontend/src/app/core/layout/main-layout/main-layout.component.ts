import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { MockAuthService } from '../../services/mock-auth.service';
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
  protected readonly visibleAdminNav = computed(() => (this.auth.isAdmin() ? this.mockData.adminNav : []));

  constructor(
    protected readonly mockData: MockDataService,
    protected readonly auth: MockAuthService,
  ) {}

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}

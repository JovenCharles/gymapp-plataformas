import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule, StatusBadgeComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent {
  constructor(protected readonly auth: AuthService) {}
}

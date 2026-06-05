import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MockDataService } from '../../core/services/mock-data.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [CommonModule, StatCardComponent, StatusBadgeComponent],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrl: './admin-dashboard-page.component.scss',
})
export class AdminDashboardPageComponent {
  constructor(protected readonly mockData: MockDataService) {}
}

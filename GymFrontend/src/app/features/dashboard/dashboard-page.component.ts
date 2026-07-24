import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MockAuthService } from '../../core/services/mock-auth.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

interface UpcomingBlock {
  date: string;
  activity: string;
  time: string;
  enabled: boolean;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, RouterLink, UiButtonComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent {
  protected readonly upcomingBlocks: UpcomingBlock[] = [
    {
      date: 'Hoy',
      activity: 'Sala de Pesas',
      time: '08:00 - 09:30',
      enabled: true,
    },
    {
      date: 'Hoy',
      activity: 'Sala de Pesas',
      time: '09:30 - 11:00',
      enabled: true,
    },
    {
      date: 'Hoy',
      activity: 'Sala de Pesas',
      time: '11:00 - 12:30',
      enabled: true,
    },
  ];

  constructor(
    protected readonly mockData: MockDataService,
    protected readonly auth: MockAuthService,
  ) {}
}
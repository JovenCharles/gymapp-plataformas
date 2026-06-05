import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MockAuthService } from '../../core/services/mock-auth.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, RouterLink, UiButtonComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent {
  constructor(
    protected readonly mockData: MockDataService,
    protected readonly auth: MockAuthService,
  ) {}
}

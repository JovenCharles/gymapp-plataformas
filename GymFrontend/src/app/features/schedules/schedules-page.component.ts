import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MockDataService } from '../../core/services/mock-data.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-schedules-page',
  imports: [CommonModule, StatusBadgeComponent, UiButtonComponent],
  templateUrl: './schedules-page.component.html',
  styleUrl: './schedules-page.component.scss',
})
export class SchedulesPageComponent {
  protected selectedDay = 'Lunes';

  constructor(protected readonly mockData: MockDataService) {}

  protected pickDay(day: string): void {
    this.selectedDay = day;
  }
}

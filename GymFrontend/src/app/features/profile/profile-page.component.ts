import { Component } from '@angular/core';
import { MockDataService } from '../../core/services/mock-data.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-profile-page',
  imports: [StatusBadgeComponent, UiButtonComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent {
  constructor(protected readonly mockData: MockDataService) {}
}

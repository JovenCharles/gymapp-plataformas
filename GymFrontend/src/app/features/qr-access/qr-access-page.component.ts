import { Component } from '@angular/core';
import { MockAuthService } from '../../core/services/mock-auth.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-qr-access-page',
  imports: [StatusBadgeComponent],
  templateUrl: './qr-access-page.component.html',
  styleUrl: './qr-access-page.component.scss',
})
export class QrAccessPageComponent {
  constructor(
    protected readonly auth: MockAuthService,
    protected readonly mockData: MockDataService,
  ) {}
}

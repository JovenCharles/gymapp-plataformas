import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  @Input() label = '';
  @Input() tone: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' = 'primary';
}

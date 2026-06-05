import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem } from '../../models/nav-item.model';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input({ required: true }) platformName = '';
  @Input({ required: true }) platformSubtitle = '';
  @Input({ required: true }) userNav: NavItem[] = [];
  @Input() adminNav: NavItem[] = [];
  @Input() open = false;
  @Input() profileName = '';
  @Input() profileRole = '';
  @Input() profileCode = '';

  @Output() navigated = new EventEmitter<void>();

  onNavigate(): void {
    this.navigated.emit();
  }
}

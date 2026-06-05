import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

export interface TableBadgeValue {
  label: string;
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
}

export interface TableStackValue {
  title: string;
  subtitle?: string;
}

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'badge' | 'stack';
}

@Component({
  selector: 'app-simple-table',
  imports: [CommonModule, StatusBadgeComponent],
  templateUrl: './simple-table.component.html',
  styleUrl: './simple-table.component.scss',
})
export class SimpleTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() rows: Record<string, unknown>[] = [];

  asBadge(value: unknown): TableBadgeValue {
    return value as TableBadgeValue;
  }

  asStack(value: unknown): TableStackValue {
    return value as TableStackValue;
  }
}

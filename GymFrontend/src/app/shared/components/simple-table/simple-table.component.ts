import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { UiButtonComponent } from '../ui-button/ui-button.component';

export interface TableBadgeValue {
  label: string;
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
}

export interface TableStackValue {
  title: string;
  subtitle?: string;
}

export interface TableActionValue {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'badge' | 'stack' | 'action';
}

@Component({
  selector: 'app-simple-table',
  imports: [CommonModule, StatusBadgeComponent, UiButtonComponent],
  templateUrl: './simple-table.component.html',
  styleUrl: './simple-table.component.scss',
})
export class SimpleTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() rows: Record<string, unknown>[] = [];

  @Output() actionClick = new EventEmitter<{ row: Record<string, unknown>; key: string }>();

  asBadge(value: unknown): TableBadgeValue {
    return value as TableBadgeValue;
  }

  asStack(value: unknown): TableStackValue {
    return value as TableStackValue;
  }

  asAction(value: unknown): TableActionValue {
    return value as TableActionValue;
  }

  onActionClick(row: Record<string, unknown>, key: string): void {
    this.actionClick.emit({ row, key });
  }
}

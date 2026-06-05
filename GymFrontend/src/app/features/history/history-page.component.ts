import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MockDataService } from '../../core/services/mock-data.service';
import { SimpleTableComponent, TableColumn } from '../../shared/components/simple-table/simple-table.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-history-page',
  imports: [CommonModule, StatCardComponent, SimpleTableComponent],
  templateUrl: './history-page.component.html',
  styleUrl: './history-page.component.scss',
})
export class HistoryPageComponent {
  protected readonly columns: TableColumn[] = [
    { key: 'dateFacility', label: 'Fecha y recinto', type: 'stack' },
    { key: 'timeIn', label: 'Hora entrada' },
    { key: 'timeOut', label: 'Hora salida' },
    { key: 'status', label: 'Estado', type: 'badge' },
  ];

  protected readonly rows;

  constructor(protected readonly mockData: MockDataService) {
    this.rows = this.mockData.historyLogs.map((log) => ({
      dateFacility: {
        title: log.date,
        subtitle: log.facility,
      },
      timeIn: log.in,
      timeOut: log.out,
      status: {
        label: log.status,
        tone: log.tone,
      },
    }));
  }
}

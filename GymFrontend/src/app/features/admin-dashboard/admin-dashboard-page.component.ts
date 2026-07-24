import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin, finalize } from 'rxjs';
import { AuthApiService } from '../../core/services/auth-api.service';
import { Reservation, ReservationApiService } from '../../core/services/reservation-api.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

interface AdminStat {
  title: string;
  value: string;
  helper: string;
}

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [CommonModule, StatCardComponent, StatusBadgeComponent],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrl: './admin-dashboard-page.component.scss',
})
export class AdminDashboardPageComponent implements OnInit {
  protected stats: AdminStat[] = [];
  protected recentReservations: Reservation[] = [];
  protected isLoading = false;
  protected errorMessage = '';

  constructor(
    private readonly authApi: AuthApiService,
    private readonly reservationApi: ReservationApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    forkJoin({
      users: this.authApi.getUsers(),
      reservations: this.reservationApi.getReservations(),
    })
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: ({ users, reservations }) => {
          const activeReservations = reservations.filter((reservation) => reservation.status === 'Reservado');

          this.stats = [
            {
              title: 'Usuarios registrados',
              value: String(users.length),
              helper: 'Registros en la base de datos',
            },
            {
              title: 'Reservas activas',
              value: String(activeReservations.length),
              helper: 'Bloques vigentes',
            },
            {
              title: 'Reservas totales',
              value: String(reservations.length),
              helper: 'Historial del sistema',
            },
          ];
          this.recentReservations = reservations.slice(0, 5);
          this.errorMessage = '';
        },
        error: () => {
          this.errorMessage = 'No se pudieron cargar los datos administrativos.';
        },
      });
  }

  protected getStatusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
    return status === 'Reservado' ? 'success' : status === 'Cancelado' ? 'warning' : 'neutral';
  }
}

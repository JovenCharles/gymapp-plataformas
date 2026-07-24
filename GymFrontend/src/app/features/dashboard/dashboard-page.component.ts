import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Reservation, ReservationApiService } from '../../core/services/reservation-api.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, RouterLink, StatusBadgeComponent, UiButtonComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent implements OnInit {
  protected reservations: Reservation[] = [];
  protected isLoading = false;
  protected errorMessage = '';

  constructor(
    private readonly auth: AuthService,
    private readonly reservationApi: ReservationApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  protected get activeReservations(): Reservation[] {
    return this.reservations.filter((reservation) => reservation.status === 'Reservado');
  }

  ngOnInit(): void {
    const userId = this.auth.userId();

    if (!userId) {
      this.errorMessage = 'Debes iniciar sesión para ver tus reservas.';
      return;
    }

    this.isLoading = true;

    this.reservationApi.getReservationsByUser(userId)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (reservations) => {
          this.reservations = reservations;
          this.errorMessage = '';
        },
        error: () => {
          this.errorMessage = 'No se pudieron cargar tus reservas.';
        },
      });
  }
}

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Reservation, ReservationApiService } from '../../core/services/reservation-api.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-history-page',
  imports: [CommonModule, StatCardComponent, StatusBadgeComponent, UiButtonComponent],
  templateUrl: './history-page.component.html',
  styleUrl: './history-page.component.scss',
})
export class HistoryPageComponent implements OnInit {
  protected reservations: Reservation[] = [];

  protected successMessage = '';
  protected errorMessage = '';
  protected isLoading = false;
  protected isCanceling = false;

  protected pendingCancelReservation: Reservation | null = null;

  constructor(
    private readonly auth: AuthService,
    private readonly reservationApi: ReservationApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadUserReservations();
  }

  protected get activeReservationsCount(): number {
    return this.reservations.filter((reservation) => reservation.status === 'Reservado').length;
  }

  protected get canceledReservationsCount(): number {
    return this.reservations.filter((reservation) => reservation.status === 'Cancelado').length;
  }

  protected get totalReservationsCount(): number {
    return this.reservations.length;
  }

  protected getStatusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
    if (status === 'Reservado') {
      return 'success';
    }

    if (status === 'Cancelado') {
      return 'warning';
    }

    return 'neutral';
  }

  protected canCancel(reservation: Reservation): boolean {
    return reservation.status === 'Reservado';
  }

  protected requestCancelReservation(reservation: Reservation): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.canCancel(reservation)) {
      this.errorMessage = 'Esta reserva ya fue cancelada.';
      this.cdr.detectChanges();
      return;
    }

    this.pendingCancelReservation = reservation;
    this.cdr.detectChanges();
  }

  protected closeCancelDialog(): void {
    if (this.isCanceling) {
      return;
    }

    this.pendingCancelReservation = null;
    this.cdr.detectChanges();
  }

  protected confirmCancelReservation(): void {
    const reservation = this.pendingCancelReservation;

    if (!reservation) {
      return;
    }

    this.isCanceling = true;
    this.cdr.detectChanges();

    this.reservationApi.cancelReservation(reservation.id)
      .pipe(
        finalize(() => {
          this.isCanceling = false;
          this.pendingCancelReservation = null;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.successMessage = `Reserva cancelada para ${reservation.day}, ${reservation.startTime} - ${reservation.endTime}.`;
          this.errorMessage = '';
          this.loadUserReservations();
        },
        error: (error) => {
          console.error('Error al cancelar reserva:', error);
          this.successMessage = '';
          this.errorMessage = error?.error?.message || 'No se pudo cancelar la reserva.';
          this.cdr.detectChanges();
        },
      });
  }

  private loadUserReservations(): void {
    this.successMessage = '';
    this.errorMessage = '';

    const userId = this.auth.userId();

    if (!userId) {
      this.errorMessage = 'Debes iniciar sesión para ver tu historial de reservas.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.reservationApi.getReservationsByUser(userId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (reservations) => {
          this.reservations = reservations;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar historial:', error);
          this.errorMessage = 'No se pudo cargar el historial de reservas.';
          this.cdr.detectChanges();
        },
      });
  }
}
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin, finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Reservation, ReservationApiService } from '../../core/services/reservation-api.service';
import { ScheduleApiService, ScheduleAvailability } from '../../core/services/schedule-api.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-schedules-page',
  imports: [CommonModule, StatusBadgeComponent, UiButtonComponent],
  templateUrl: './schedules-page.component.html',
  styleUrl: './schedules-page.component.scss',
})
export class SchedulesPageComponent implements OnInit {
  protected selectedDay = '';
  protected scheduleDays: string[] = [];
  protected scheduleSlots: ScheduleAvailability[] = [];
  protected reservations: Reservation[] = [];

  protected successMessage = '';
  protected errorMessage = '';
  protected isLoading = false;

  constructor(
    private readonly auth: AuthService,
    private readonly reservationApi: ReservationApiService,
    private readonly scheduleApi: ScheduleApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  protected get visibleSlots(): ScheduleAvailability[] {
    return this.scheduleSlots.filter((slot) => slot.day === this.selectedDay);
  }

  ngOnInit(): void {
    this.loadData();
  }

  protected pickDay(day: string): void {
    this.selectedDay = day;
    this.successMessage = '';
    this.errorMessage = '';
  }

  protected reserveSlot(slot: ScheduleAvailability): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.isAlreadyReservedByCurrentUser(slot)) {
      this.errorMessage = 'Ya tienes una reserva para este bloque.';
      return;
    }

    if (this.getReservedCount(slot) >= slot.capacity) {
      this.errorMessage = 'No quedan cupos disponibles para este bloque.';
      return;
    }

    this.isLoading = true;

    this.reservationApi.createReservation({
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      zone: slot.zone,
    })
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.successMessage = `Reserva creada para ${slot.day}, ${slot.startTime} - ${slot.endTime}.`;
          this.loadData();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'No se pudo crear la reserva.';
        },
      });
  }

  protected getReservedCount(slot: ScheduleAvailability): number {
    return slot.reservedCount;
  }

  protected getSlotsLabel(slot: ScheduleAvailability): string {
    return `${this.getReservedCount(slot)} / ${slot.capacity} cupos`;
  }

  protected getStatusLabel(slot: ScheduleAvailability): string {
    if (this.getReservedCount(slot) >= slot.capacity) {
      return 'Completo';
    }

    if (this.isAlreadyReservedByCurrentUser(slot)) {
      return 'Reservado';
    }

    return 'Disponible';
  }

  protected getStatusTone(slot: ScheduleAvailability): 'success' | 'warning' | 'danger' | 'neutral' {
    if (this.getReservedCount(slot) >= slot.capacity) {
      return 'danger';
    }

    if (this.isAlreadyReservedByCurrentUser(slot)) {
      return 'warning';
    }

    return 'success';
  }

  protected getButtonLabel(slot: ScheduleAvailability): string {
    if (this.isLoading) {
      return 'Reservando...';
    }

    if (this.isAlreadyReservedByCurrentUser(slot)) {
      return 'Ya reservado';
    }

    if (this.getReservedCount(slot) >= slot.capacity) {
      return 'Sin cupos';
    }

    return 'Reservar cupo';
  }

  protected isSlotDisabled(slot: ScheduleAvailability): boolean {
    return (
      this.isLoading ||
      this.isAlreadyReservedByCurrentUser(slot) ||
      this.getReservedCount(slot) >= slot.capacity
    );
  }

  private isAlreadyReservedByCurrentUser(slot: ScheduleAvailability): boolean {
    const userId = this.auth.userId();

    return userId !== null && this.reservations.some((reservation) =>
      reservation.userId === userId &&
      reservation.day === slot.day &&
      reservation.startTime === slot.startTime &&
      reservation.endTime === slot.endTime &&
      reservation.zone === slot.zone &&
      reservation.status === 'Reservado');
  }

  private loadData(): void {
    const userId = this.auth.userId();

    if (!userId) {
      this.errorMessage = 'Debes iniciar sesión para ver los horarios.';
      return;
    }

    this.isLoading = true;

    forkJoin({
      schedules: this.scheduleApi.getSchedules(),
      reservations: this.reservationApi.getReservationsByUser(userId),
    })
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: ({ schedules, reservations }) => {
          this.scheduleSlots = schedules;
          this.reservations = reservations;
          this.scheduleDays = [...new Set(schedules.map((slot) => slot.day))];
          this.selectedDay = this.scheduleDays.includes(this.selectedDay)
            ? this.selectedDay
            : (this.scheduleDays[0] ?? '');
          this.errorMessage = '';
        },
        error: () => {
          this.errorMessage = 'No se pudieron cargar los horarios.';
        },
      });
  }
}

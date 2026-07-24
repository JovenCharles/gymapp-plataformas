import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { MockAuthService } from '../../core/services/mock-auth.service';
import { Reservation, ReservationApiService } from '../../core/services/reservation-api.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

interface ScheduleSlot {
  time: string;
  startTime: string;
  endTime: string;
  zone: string;
  capacity: number;
  enabled: boolean;
}

@Component({
  selector: 'app-schedules-page',
  imports: [CommonModule, StatusBadgeComponent, UiButtonComponent],
  templateUrl: './schedules-page.component.html',
  styleUrl: './schedules-page.component.scss',
})
export class SchedulesPageComponent implements OnInit {
  protected selectedDay = 'Lunes';

  protected successMessage = '';
  protected errorMessage = '';
  protected isLoading = false;

  protected reservations: Reservation[] = [];

  protected readonly scheduleDays = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];

  protected readonly scheduleSlots: ScheduleSlot[] = [
    {
      time: '08:00 - 09:30',
      startTime: '08:00',
      endTime: '09:30',
      zone: 'Sala de Pesas',
      capacity: 20,
      enabled: true,
    },
    {
      time: '09:30 - 11:00',
      startTime: '09:30',
      endTime: '11:00',
      zone: 'Sala de Pesas',
      capacity: 20,
      enabled: true,
    },
    {
      time: '11:00 - 12:30',
      startTime: '11:00',
      endTime: '12:30',
      zone: 'Sala de Pesas',
      capacity: 20,
      enabled: true,
    },
    {
      time: '13:00 - 14:30',
      startTime: '13:00',
      endTime: '14:30',
      zone: 'Sala de Pesas',
      capacity: 20,
      enabled: true,
    },
  ];

  constructor(
    private readonly auth: MockAuthService,
    private readonly reservationApi: ReservationApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  protected pickDay(day: string): void {
    this.selectedDay = day;
    this.successMessage = '';
    this.errorMessage = '';
  }

  protected reserveSlot(slot: ScheduleSlot): void {
    this.successMessage = '';
    this.errorMessage = '';

    const userId = this.auth.userId();

    if (!userId) {
      this.errorMessage = 'Debes iniciar sesión para reservar un bloque.';
      this.cdr.detectChanges();
      return;
    }

    if (this.isAlreadyReservedByCurrentUser(slot)) {
      this.errorMessage = 'Ya tienes una reserva para este bloque.';
      this.cdr.detectChanges();
      return;
    }

    if (this.getReservedCount(slot) >= slot.capacity) {
      this.errorMessage = 'No quedan cupos disponibles para este bloque.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.reservationApi.createReservation({
      userId,
      day: this.selectedDay,
      startTime: slot.startTime,
      endTime: slot.endTime,
      zone: slot.zone,
      capacity: slot.capacity,
    })
    .pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: () => {
        this.successMessage = `Reserva creada para ${this.selectedDay}, ${slot.time}.`;
        this.errorMessage = '';
        this.loadReservations();
      },
      error: (error) => {
        console.error('Error al crear reserva:', error);
        this.successMessage = '';
        this.errorMessage = error?.error?.message || 'No se pudo crear la reserva.';
        this.cdr.detectChanges();
      },
    });
  }

  protected getReservedCount(slot: ScheduleSlot): number {
    return this.reservations.filter((reservation) =>
      reservation.day === this.selectedDay &&
      reservation.startTime === slot.startTime &&
      reservation.endTime === slot.endTime &&
      reservation.zone === slot.zone &&
      reservation.status === 'Reservado'
    ).length;
  }

  protected getSlotsLabel(slot: ScheduleSlot): string {
    return `${this.getReservedCount(slot)} / ${slot.capacity} cupos`;
  }

  protected getStatusLabel(slot: ScheduleSlot): string {
    if (this.getReservedCount(slot) >= slot.capacity) {
      return 'Completo';
    }

    if (this.isAlreadyReservedByCurrentUser(slot)) {
      return 'Reservado';
    }

    return 'Disponible';
  }

  protected getStatusTone(slot: ScheduleSlot): 'success' | 'warning' | 'danger' | 'neutral' {
    if (this.getReservedCount(slot) >= slot.capacity) {
      return 'danger';
    }

    if (this.isAlreadyReservedByCurrentUser(slot)) {
      return 'warning';
    }

    return 'success';
  }

  protected getButtonLabel(slot: ScheduleSlot): string {
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

  protected isSlotDisabled(slot: ScheduleSlot): boolean {
    return (
      !slot.enabled ||
      this.isLoading ||
      this.isAlreadyReservedByCurrentUser(slot) ||
      this.getReservedCount(slot) >= slot.capacity
    );
  }

  private isAlreadyReservedByCurrentUser(slot: ScheduleSlot): boolean {
    const userId = this.auth.userId();

    if (!userId) {
      return false;
    }

    return this.reservations.some((reservation) =>
      reservation.userId === userId &&
      reservation.day === this.selectedDay &&
      reservation.startTime === slot.startTime &&
      reservation.endTime === slot.endTime &&
      reservation.zone === slot.zone &&
      reservation.status === 'Reservado'
    );
  }

  private loadReservations(): void {
    this.reservationApi.getReservations()
      .subscribe({
        next: (reservations) => {
          this.reservations = reservations;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar reservas:', error);
          this.errorMessage = 'No se pudieron cargar las reservas.';
          this.cdr.detectChanges();
        },
      });
  }
}
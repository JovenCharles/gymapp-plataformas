import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Html5Qrcode } from 'html5-qrcode';
import { AttendanceApiService } from '../../core/services/attendance-api.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

type AttendanceMode = 'entry' | 'exit';

interface ScanResult {
  tone: 'success' | 'error';
  message: string;
}

const QR_READER_ELEMENT_ID = 'qr-reader';

@Component({
  selector: 'app-attendance-scanner-page',
  imports: [CommonModule, UiButtonComponent],
  templateUrl: './attendance-scanner-page.component.html',
  styleUrl: './attendance-scanner-page.component.scss',
})
export class AttendanceScannerPageComponent implements OnDestroy {
  protected mode: AttendanceMode | null = null;
  protected isScanning = false;
  protected isProcessing = false;
  protected cameraError = '';
  protected result: ScanResult | null = null;

  private scanner: Html5Qrcode | null = null;

  constructor(
    private readonly attendanceApi: AttendanceApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnDestroy(): void {
    void this.stopScanning();
  }

  protected get modeLabel(): string {
    return this.mode === 'entry' ? 'Registrar entrada' : 'Registrar salida';
  }

  protected selectMode(mode: AttendanceMode): void {
    void this.stopScanning();
    this.mode = mode;
    this.result = null;
    this.cameraError = '';
    this.cdr.detectChanges();
  }

  protected changeMode(): void {
    void this.stopScanning();
    this.mode = null;
    this.result = null;
    this.cameraError = '';
    this.cdr.detectChanges();
  }

  protected startScanning(): void {
    this.cameraError = '';
    this.result = null;
    this.isScanning = true;
    this.cdr.detectChanges();

    this.scanner = new Html5Qrcode(QR_READER_ELEMENT_ID);

    this.scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText) => this.onScanSuccess(decodedText),
        () => {
          // Ignorar errores de decodificación de cada frame: son esperables mientras no hay QR en cuadro.
        },
      )
      .catch(() => {
        this.isScanning = false;
        this.cameraError = 'No se pudo activar la cámara. Verifica los permisos del navegador.';
        this.cdr.detectChanges();
      });
  }

  private onScanSuccess(token: string): void {
    void this.stopScanning();
    this.processToken(token);
  }

  private processToken(token: string): void {
    if (!this.mode) {
      return;
    }

    this.isProcessing = true;
    this.cdr.detectChanges();

    const request$ = this.mode === 'entry'
      ? this.attendanceApi.registerEntry(token)
      : this.attendanceApi.registerExit(token);

    request$.subscribe({
      next: (response) => {
        this.isProcessing = false;
        this.result = { tone: 'success', message: response.message };
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al registrar asistencia:', error);
        this.isProcessing = false;
        this.result = {
          tone: 'error',
          message: error?.error?.message || 'No se pudo registrar la asistencia.',
        };
        this.cdr.detectChanges();
      },
    });
  }

  private async stopScanning(): Promise<void> {
    this.isScanning = false;

    if (!this.scanner) {
      return;
    }

    const scanner = this.scanner;
    this.scanner = null;

    try {
      await scanner.stop();
      scanner.clear();
    } catch {
      // La cámara ya pudo haberse detenido; no hay nada más que hacer.
    }
  }
}

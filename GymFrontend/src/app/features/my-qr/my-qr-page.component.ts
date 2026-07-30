import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as QRCode from 'qrcode';
import { finalize } from 'rxjs';
import { MyQrCode, QrApiService } from '../../core/services/qr-api.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-my-qr-page',
  imports: [CommonModule, UiButtonComponent],
  templateUrl: './my-qr-page.component.html',
  styleUrl: './my-qr-page.component.scss',
})
export class MyQrPageComponent implements OnInit {
  protected qrCode: MyQrCode | null = null;
  protected qrImageUrl: string | null = null;
  protected isLoading = false;
  protected errorMessage = '';

  constructor(
    private readonly qrApi: QrApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadQrCode();
  }

  protected get todayLabel(): string {
    if (!this.qrCode) {
      return '';
    }

    const [year, month, day] = this.qrCode.date.split('-');
    return `${day}/${month}/${year}`;
  }

  protected loadQrCode(): void {
    this.errorMessage = '';
    this.qrImageUrl = null;
    this.isLoading = true;
    this.cdr.detectChanges();

    this.qrApi.getMyCode()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (qrCode) => {
          this.qrCode = qrCode;
          this.renderQrCode(qrCode.token);
        },
        error: (error) => {
          console.error('Error al generar el código QR:', error);
          this.qrCode = null;
          this.errorMessage = 'No se pudo generar tu código QR. Intenta nuevamente.';
          this.cdr.detectChanges();
        },
      });
  }

  private renderQrCode(token: string): void {
    QRCode.toDataURL(token, { width: 260, margin: 1 }, (error, url) => {
      if (error) {
        console.error('Error al dibujar el código QR:', error);
        this.errorMessage = 'No se pudo dibujar tu código QR.';
      } else {
        this.qrImageUrl = url;
      }

      this.cdr.detectChanges();
    });
  }
}

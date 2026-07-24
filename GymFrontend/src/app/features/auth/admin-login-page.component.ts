import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthApiService } from '../../core/services/auth-api.service';
import { AuthService } from '../../core/services/auth.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-admin-login-page',
  imports: [CommonModule, FormsModule, RouterLink, UiButtonComponent],
  templateUrl: './admin-login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class AdminLoginPageComponent {
  protected username = '';
  protected password = '';
  protected errorMessage = '';
  protected isLoading = false;

  constructor(
    private readonly router: Router,
    private readonly authApi: AuthApiService,
    private readonly auth: AuthService,
  ) {}

  protected enter(): void {
    this.errorMessage = '';

    const username = this.username.trim();

    if (!username || !this.password) {
      this.errorMessage = 'Debes ingresar usuario y contraseña.';
      return;
    }

    this.isLoading = true;

    this.authApi.adminLogin({ username, password: this.password })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.auth.login(response);
          void this.router.navigateByUrl('/admin-dashboard');
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'No se pudo iniciar sesión.';
        },
      });
  }
}

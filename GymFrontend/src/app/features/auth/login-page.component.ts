import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AppRole, MockAuthService } from '../../core/services/mock-auth.service';
import { AuthApiService } from '../../core/services/auth-api.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule, UiButtonComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  protected selectedRole: AppRole = 'student';

  // Este campo se usa como RUT
  protected studentName = '';

  protected email = 'athlete@university.edu';
  protected password = '';

  protected errorMessage = '';
  protected isLoading = false;

  constructor(
    private readonly router: Router,
    private readonly auth: MockAuthService,
    private readonly authApi: AuthApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    const currentProfile = this.auth.activeProfile();

    if (this.auth.isLoggedIn()) {
      this.selectedRole = this.auth.role();
      this.studentName = this.auth.isAdmin() ? '' : currentProfile.name;
      this.email = currentProfile.email;
    }
  }

  protected pickRole(role: AppRole): void {
    this.selectedRole = role;
    this.errorMessage = '';

    if (role === 'admin') {
      this.email = 'admin@gymaster.edu';
      return;
    }

    if (!this.email || this.email === 'admin@gymaster.edu') {
      this.email = 'athlete@university.edu';
    }
  }

  protected enter(): void {
    this.errorMessage = '';

    const rut = this.studentName.trim();
    const email = this.email.trim();

    if (!rut || !email || !this.password) {
      this.errorMessage = 'Debes ingresar RUT, correo y contraseña.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.authApi.login({
      rut,
      email,
      password: this.password,
    })
    .pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (response) => {
        const user = response.user;

        if (user.role === 'Admin') {
          this.auth.loginAsAdmin();
        } else {
          this.auth.loginAsStudent(user.name, user.email);
        }

        void this.router.navigateByUrl(this.auth.activeProfile().landingRoute);
      },
      error: (error) => {
        console.error('Error de login:', error);
        this.errorMessage = error?.error?.message || 'Credenciales incorrectas.';
        this.cdr.detectChanges();
      }
    });
  }
}
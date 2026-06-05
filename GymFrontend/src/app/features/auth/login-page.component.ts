import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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

  // Este campo ahora lo usaremos como RUT
  protected studentName = '';

  protected email = 'athlete@university.edu';
  protected password = '';

  protected errorMessage = '';
  protected isLoading = false;

  constructor(
    private readonly router: Router,
    private readonly auth: MockAuthService,
    private readonly authApi: AuthApiService,
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

    // Para administrador mantenemos el login demo del frontend
    // Esto permite entrar al panel de administración y probar gestión de usuarios.
    if (this.selectedRole === 'admin') {
      this.auth.loginAsAdmin();
      void this.router.navigateByUrl(this.auth.activeProfile().landingRoute);
      return;
    }

    // Para estudiantes usamos el backend real con RUT + contraseña
    const rut = this.studentName.trim();

    if (!rut || !this.password) {
      this.errorMessage = 'Debes ingresar RUT y contraseña.';
      return;
    }

    this.isLoading = true;

    this.authApi.login({
      rut,
      password: this.password,
    }).subscribe({
      next: (response) => {
        const user = response.user;

        this.auth.loginAsStudent(user.name, user.email);

        this.isLoading = false;

        void this.router.navigateByUrl(this.auth.activeProfile().landingRoute);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Credenciales incorrectas.';
      }
    });
  }
}
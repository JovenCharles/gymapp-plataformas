import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { AuthApiService } from '../../core/services/auth-api.service';
import { SimpleTableComponent, TableColumn } from '../../shared/components/simple-table/simple-table.component';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-user-management-page',
  imports: [CommonModule, FormsModule, UiButtonComponent, SimpleTableComponent],
  templateUrl: './user-management-page.component.html',
  styleUrl: './user-management-page.component.scss',
})
export class UserManagementPageComponent {
  protected readonly columns: TableColumn[] = [
    { key: 'user', label: 'Usuario', type: 'stack' },
    { key: 'id', label: 'RUT / ID' },
    { key: 'type', label: 'Tipo' },
    { key: 'status', label: 'Estado', type: 'badge' },
    { key: 'actions', label: 'Acciones', align: 'right' },
  ];

  protected rows: any[] = [];

  protected showCreateForm = false;

  protected newUser = {
    rut: '',
    name: '',
    email: '',
    password: '',
    userType: 'Estudiante',
  };

  protected successMessage = '';
  protected errorMessage = '';
  protected isLoading = false;

  constructor(
    protected readonly mockData: MockDataService,
    private readonly authApi: AuthApiService,
  ) {
    this.rows = this.mockData.managedUsers.map((user) => ({
      user: {
        title: user.name,
        subtitle: user.type,
      },
      id: user.id,
      type: user.type,
      status: {
        label: user.status,
        tone: user.tone,
      },
      actions: 'Ver · Editar',
    }));
  }

  protected toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.successMessage = '';
    this.errorMessage = '';
  }

  protected createUser(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (
      !this.newUser.rut ||
      !this.newUser.name ||
      !this.newUser.email ||
      !this.newUser.password ||
      !this.newUser.userType
    ) {
      this.errorMessage = 'Debes completar todos los campos.';
      return;
    }

    this.isLoading = true;

    this.authApi.register(this.newUser).subscribe({
      next: (response) => {
        const user = response.user;

        this.rows = [
          ...this.rows,
          {
            user: {
              title: user.name,
              subtitle: user.userType,
            },
            id: user.rut,
            type: user.userType,
            status: {
              label: 'Activo',
              tone: 'success',
            },
            actions: 'Ver · Editar',
          },
        ];

        this.successMessage = 'Usuario registrado correctamente.';
        this.errorMessage = '';
        this.isLoading = false;

        this.newUser = {
          rut: '',
          name: '',
          email: '',
          password: '',
          userType: 'Estudiante',
        };
      },
      error: (error) => {
        this.isLoading = false;
        this.successMessage = '';
        this.errorMessage = error?.error?.message || 'No se pudo registrar el usuario.';
      },
    });
  }
}
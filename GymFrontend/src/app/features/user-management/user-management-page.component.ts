import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthApiService } from '../../core/services/auth-api.service';
import { SimpleTableComponent, TableColumn } from '../../shared/components/simple-table/simple-table.component';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-user-management-page',
  imports: [CommonModule, FormsModule, UiButtonComponent, SimpleTableComponent],
  templateUrl: './user-management-page.component.html',
  styleUrl: './user-management-page.component.scss',
})
export class UserManagementPageComponent implements OnInit {
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
  protected isLoadingUsers = false;

  constructor(
    private readonly authApi: AuthApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  protected toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  protected createUser(): void {
    this.successMessage = '';
    this.errorMessage = '';

    const rut = this.newUser.rut.trim();
    const name = this.newUser.name.trim();
    const email = this.newUser.email.trim();
    const password = this.newUser.password;
    const userType = this.newUser.userType;

    if (!rut || !name || !email || !password || !userType) {
      this.errorMessage = 'Debes completar todos los campos.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.authApi.register({
      rut,
      name,
      email,
      password,
      userType,
    })
    .pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: () => {
        this.successMessage = 'Usuario registrado correctamente.';
        this.errorMessage = '';

        this.newUser = {
          rut: '',
          name: '',
          email: '',
          password: '',
          userType: 'Estudiante',
        };

        this.showCreateForm = false;
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error al registrar usuario:', error);
        this.successMessage = '';
        this.errorMessage = error?.error?.message || 'No se pudo registrar el usuario.';
        this.cdr.detectChanges();
      },
    });
  }

  private loadUsers(): void {
    this.isLoadingUsers = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.authApi.getUsers()
      .pipe(
        finalize(() => {
          this.isLoadingUsers = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (users) => {
          console.log('Usuarios cargados desde backend:', users);

          this.rows = users.map((user) => ({
            user: {
              title: user.name,
              subtitle: user.email,
            },
            id: user.rut,
            type: user.userType,
            status: {
              label: 'Activo',
              tone: 'success',
            },
            actions: 'Ver · Editar',
          }));

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar usuarios:', error);
          this.errorMessage = 'No se pudieron cargar los usuarios.';
          this.rows = [];
          this.cdr.detectChanges();
        },
      });
  }
}
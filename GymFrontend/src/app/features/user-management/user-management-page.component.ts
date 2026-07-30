import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthApiService } from '../../core/services/auth-api.service';
import {
  SimpleTableComponent,
  TableColumn,
} from '../../shared/components/simple-table/simple-table.component';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

interface UserManagementRow extends Record<string, unknown> {
  user: {
    title: string;
    subtitle: string;
  };
  id: string;
  type: string;
  status: {
    label: string;
    tone: 'success' | 'warning' | 'danger' | 'neutral';
  };
}

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
    { key: 'toggle', label: 'Acceso', type: 'action' },
  ];

  protected rows: UserManagementRow[] = [];

  protected searchTerm = '';
  protected selectedType = 'Todos los tipos';
  protected selectedStatus = 'Todos los estados';

  protected currentPage = 1;
  protected readonly pageSize = 5;

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
  protected togglingUserId: number | null = null;

  constructor(
    private readonly authApi: AuthApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  protected get filteredRows(): UserManagementRow[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.rows.filter((row) => {
      const matchesSearch =
        !search ||
        row.user.title.toLowerCase().includes(search) ||
        row.user.subtitle.toLowerCase().includes(search) ||
        row.id.toLowerCase().includes(search);

      const matchesType =
        this.selectedType === 'Todos los tipos' ||
        row.type === this.selectedType;

      const matchesStatus =
        this.selectedStatus === 'Todos los estados' ||
        row.status.label === this.selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }

  protected get paginatedRows(): UserManagementRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  protected get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize));
  }

  protected get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  protected get showingLabel(): string {
    if (this.filteredRows.length === 0) {
      return 'No hay usuarios que coincidan con los filtros';
    }

    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.filteredRows.length);

    return `Mostrando ${start}-${end} de ${this.filteredRows.length} usuarios`;
  }

  protected toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  protected onFiltersChanged(): void {
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  protected goToPage(page: number): void {
    this.currentPage = page;
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
        this.currentPage = 1;
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

  protected onActionClick(event: { row: Record<string, unknown>; key: string }): void {
    if (event.key !== 'toggle') {
      return;
    }

    const userId = event.row['userId'] as number;
    const currentlyEnabled = event.row['enabled'] as boolean;

    this.toggleStatus(userId, !currentlyEnabled);
  }

  private toggleStatus(userId: number, enabled: boolean): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.togglingUserId = userId;
    this.cdr.detectChanges();

    this.authApi.setUserStatus(userId, enabled)
      .pipe(
        finalize(() => {
          this.togglingUserId = null;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error al actualizar el estado del usuario:', error);
          this.errorMessage = error?.error?.message || 'No se pudo actualizar el estado del usuario.';
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
          this.rows = users
            .filter((user) => user.role !== 'Admin')
            .map((user) => ({
              userId: user.id,
              enabled: user.enabled,
              user: {
                title: user.name,
                subtitle: user.email,
              },
              id: user.rut,
              type: user.userType,
              status: user.enabled
                ? { label: 'Habilitado', tone: 'success' }
                : { label: 'Deshabilitado', tone: 'danger' },
              toggle: {
                label: this.togglingUserId === user.id
                  ? 'Actualizando...'
                  : (user.enabled ? 'Deshabilitar' : 'Habilitar'),
                variant: user.enabled ? 'ghost' : 'primary',
                disabled: this.togglingUserId === user.id,
              },
            }));

          this.currentPage = 1;
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
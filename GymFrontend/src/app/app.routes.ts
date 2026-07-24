import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/auth/admin-login-page.component').then((m) => m.AdminLoginPageComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        canActivate: [roleGuard(['student', 'admin'])],
        loadComponent: () =>
          import('./features/dashboard/dashboard-page.component').then((m) => m.DashboardPageComponent),
      },
      {
        path: 'schedules',
        canActivate: [roleGuard(['student', 'admin'])],
        loadComponent: () =>
          import('./features/schedules/schedules-page.component').then((m) => m.SchedulesPageComponent),
      },
      {
        path: 'history',
        canActivate: [roleGuard(['student', 'admin'])],
        loadComponent: () => import('./features/history/history-page.component').then((m) => m.HistoryPageComponent),
      },
      {
        path: 'profile',
        canActivate: [roleGuard(['student', 'admin'])],
        loadComponent: () => import('./features/profile/profile-page.component').then((m) => m.ProfilePageComponent),
      },
      {
        path: 'admin-dashboard',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
          import('./features/admin-dashboard/admin-dashboard-page.component').then(
            (m) => m.AdminDashboardPageComponent,
          ),
      },
      {
        path: 'user-management',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
          import('./features/user-management/user-management-page.component').then(
            (m) => m.UserManagementPageComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];

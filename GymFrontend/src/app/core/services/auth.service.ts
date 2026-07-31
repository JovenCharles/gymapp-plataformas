import { computed, Injectable, signal } from '@angular/core';
import { AppRole, AuthResponse, User } from '../models/user.model';

interface AuthSession {
  token: string;
  user: User;
}

export interface SessionProfile {
  userId: number;
  name: string;
  email: string;
  roleLabel: string;
  code: string;
  landingRoute: '/dashboard' | '/admin-dashboard';
}

const AUTH_STORAGE_KEY = 'gymaster.auth.session.v2';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly sessionSignal = signal<AuthSession | null>(this.readStoredSession());

  readonly currentUser = computed(() => this.sessionSignal()?.user ?? null);
  readonly token = computed(() => this.sessionSignal()?.token ?? null);
  readonly role = computed<AppRole>(() => (this.currentUser()?.role === 'Admin' ? 'admin' : 'student'));
  readonly isAdmin = computed(() => this.role() === 'admin');
  readonly isLoggedIn = computed(() => this.sessionSignal() !== null);
  readonly userId = computed(() => this.currentUser()?.id ?? null);

  readonly activeProfile = computed<SessionProfile>(() => {
    const user = this.currentUser();

    if (!user) {
      return {
        userId: 0,
        name: '',
        email: '',
        roleLabel: '',
        code: '',
        landingRoute: '/dashboard',
      };
    }

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      roleLabel: user.role === 'Admin' ? 'Administrador' : user.userType,
      code: user.role === 'Admin' ? `ADM ${user.id}` : `ID ${user.id}`,
      landingRoute: user.role === 'Admin' ? '/admin-dashboard' : '/dashboard',
    };
  });

  login(response: AuthResponse): void {
    const session = {
      token: response.token,
      user: response.user,
    };

    this.sessionSignal.set(session);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    }
  }

  logout(): void {
    this.sessionSignal.set(null);

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  canAccess(allowedRoles: AppRole[]): boolean {
    return this.isLoggedIn() && allowedRoles.includes(this.role());
  }

  private readStoredSession(): AuthSession | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const raw = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<AuthSession>;
      const user = parsed.user as Partial<User> | undefined;

      if (!parsed.token || !user?.id || !user.role || !user.rut) {
        return null;
      }

      return {
        token: parsed.token,
        user: {
          id: user.id,
          rut: user.rut,
          name: user.name ?? '',
          email: user.email ?? '',
          username: user.username ?? '',
          userType: user.userType ?? 'Estudiante',
          role: user.role,
          enabled: user.enabled ?? true,
        },
      };
    } catch {
      return null;
    }
  }
}

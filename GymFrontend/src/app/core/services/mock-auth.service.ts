import { computed, Injectable, signal } from '@angular/core';

export type AppRole = 'student' | 'admin';

interface AuthSessionState {
  loggedIn: boolean;
  role: AppRole;
  userId: number | null;
  name: string;
  email: string;
}

interface SessionProfile {
  userId: number | null;
  name: string;
  email: string;
  roleLabel: string;
  code: string;
  landingRoute: '/dashboard' | '/admin-dashboard';
}

const AUTH_STORAGE_KEY = 'gymaster.auth.session.v1';

@Injectable({
  providedIn: 'root',
})
export class MockAuthService {
  private readonly sessionSignal = signal<AuthSessionState>(this.readStoredSession());

  readonly role = computed(() => this.sessionSignal().role);
  readonly isAdmin = computed(() => this.role() === 'admin');
  readonly isLoggedIn = computed(() => this.sessionSignal().loggedIn);
  readonly userId = computed(() => this.sessionSignal().userId);

  readonly activeProfile = computed<SessionProfile>(() => {
    const session = this.sessionSignal();

    if (session.role === 'admin') {
      return {
        userId: session.userId,
        name: session.name || 'Admin',
        email: session.email || 'admin@gymaster.edu',
        roleLabel: 'Administrador',
        code: session.userId ? `ADM ${session.userId}` : 'ADM 0001',
        landingRoute: '/admin-dashboard',
      };
    }

    return {
      userId: session.userId,
      name: session.name || 'Usuario',
      email: session.email || 'athlete@university.edu',
      roleLabel: 'Estudiante',
      code: session.userId ? `ID ${session.userId}` : 'ID 12345',
      landingRoute: '/dashboard',
    };
  });

  loginAsStudent(userId: number, name: string, email: string): void {
    const cleanName = name.trim() || 'Usuario';
    const cleanEmail = email.trim() || `${this.slugify(cleanName)}@universidad.edu`;

    this.setSession({
      loggedIn: true,
      role: 'student',
      userId,
      name: cleanName,
      email: cleanEmail,
    });
  }

  loginAsAdmin(userId: number, name: string, email: string): void {
    this.setSession({
      loggedIn: true,
      role: 'admin',
      userId,
      name: name.trim() || 'Admin',
      email: email.trim() || 'admin@gymaster.edu',
    });
  }

  logout(): void {
    this.setSession(this.defaultSession());
  }

  canAccess(allowedRoles: AppRole[]): boolean {
    return this.isLoggedIn() && allowedRoles.includes(this.role());
  }

  private readStoredSession(): AuthSessionState {
    if (typeof localStorage === 'undefined') {
      return this.defaultSession();
    }

    const raw = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
      return this.defaultSession();
    }

    try {
      const parsed = JSON.parse(raw) as Partial<AuthSessionState>;

      if (parsed.role !== 'student' && parsed.role !== 'admin') {
        return this.defaultSession();
      }

      return {
        loggedIn: Boolean(parsed.loggedIn),
        role: parsed.role,
        userId: parsed.userId ?? null,
        name: parsed.name ?? '',
        email: parsed.email ?? '',
      };
    } catch {
      return this.defaultSession();
    }
  }

  private setSession(session: AuthSessionState): void {
    this.sessionSignal.set(session);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    }
  }

  private defaultSession(): AuthSessionState {
    return {
      loggedIn: false,
      role: 'student',
      userId: null,
      name: '',
      email: '',
    };
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '.');
  }
}
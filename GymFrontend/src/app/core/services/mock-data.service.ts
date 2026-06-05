import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NavItem } from '../models/nav-item.model';
import { MockAuthService } from './mock-auth.service';

export interface DashboardNotice {
  title: string;
  message: string;
  tone: 'danger' | 'primary';
}

export interface UpcomingBlock {
  date: string;
  activity: string;
  time: string;
  enabled: boolean;
}

export interface ScheduleSlot {
  time: string;
  zone: string;
  slots: string;
  statusLabel: string;
  statusTone: 'primary' | 'warning' | 'neutral';
  actionLabel: string;
  enabled: boolean;
}

export interface HistoryLog {
  date: string;
  facility: string;
  in: string;
  out: string;
  status: string;
  tone: 'success' | 'warning' | 'neutral';
}

export interface AccessLog {
  name: string;
  detail: string;
  timeAgo: string;
  status: string;
  tone: 'success' | 'danger' | 'neutral';
}

export interface ManagedUser {
  name: string;
  id: string;
  type: string;
  status: string;
  tone: 'success' | 'neutral';
}

interface StatItem {
  title: string;
  value: string;
  helper: string;
}

interface ProfileData {
  name: string;
  email: string;
  role: string;
  faculty: string;
  career: string;
  studentId: string;
  campus: string;
}

interface MockSeedNotice {
  title: string;
  message: string;
  tone: 'danger' | 'primary';
}

interface MockSeedUser {
  name: string;
  email: string;
  rut: string;
  faculty: string;
  career: string;
  studentId: string;
  campus: string;
}

interface MockSeed {
  noticeTemplates: MockSeedNotice[];
  activities: string[];
  zones: string[];
  facilities: string[];
  userPool: MockSeedUser[];
  adminAccessNotes: string[];
  userTypes: string[];
}

interface StudentProfile {
  name: string;
  email: string;
  rut: string;
  role: string;
  faculty: string;
  career: string;
  studentId: string;
  campus: string;
}

interface MockDatabase {
  dashboardNotices: DashboardNotice[];
  upcomingBlocks: UpcomingBlock[];
  scheduleSlots: ScheduleSlot[];
  historyStats: StatItem[];
  historyLogs: HistoryLog[];
  studentProfiles: StudentProfile[];
  adminStats: StatItem[];
  recentAccess: AccessLog[];
  managedUsers: ManagedUser[];
}

const MOCK_DB_STORAGE_KEY = 'gymaster.mock.db.v1';
const FALLBACK_SEED: MockSeed = {
  noticeTemplates: [
    {
      title: 'Mantenimiento',
      message: 'Cierre parcial programado durante la tarde.',
      tone: 'danger',
    },
    {
      title: 'Nueva clase',
      message: 'Se habilitaron nuevos cupos para entrenamiento funcional.',
      tone: 'primary',
    },
  ],
  activities: ['Sala de Pesas Libre', 'Cardio y Spinning', 'Entrenamiento Funcional'],
  zones: ['Zona de Pesas Libres', 'Piscina Olímpica', 'Sala de Máquinas'],
  facilities: ['Sala de Pesas Principal', 'Centro Acuático', 'Cancha 2'],
  userPool: [
    {
      name: 'Camila Herrera',
      email: 'camila.herrera@universidad.edu',
      rut: '19.324.111-2',
      faculty: 'Facultad de Ciencias del Deporte',
      career: 'Kinesiología y Ciencias del Ejercicio',
      studentId: '10492847',
      campus: 'Campus Atlético Central',
    },
  ],
  adminAccessNotes: ['Student Athlete ID', 'General Admission', 'RFID Error / Expired'],
  userTypes: ['Estudiante', 'Docente', 'Funcionario'],
};

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  readonly platformName = 'GYMASTER';
  readonly platformSubtitle = 'Academic Athlete';

  readonly userNav: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'DB' },
    { label: 'Horarios', route: '/schedules', icon: 'SC' },
    { label: 'Mi QR', route: '/qr-access', icon: 'QR' },
    { label: 'Historial', route: '/history', icon: 'HI' },
    { label: 'Perfil', route: '/profile', icon: 'PR' },
  ];

  readonly adminNav: NavItem[] = [
    { label: 'Dashboard Admin', route: '/admin-dashboard', icon: 'AD' },
    { label: 'Gestión de Usuarios', route: '/user-management', icon: 'UM' },
  ];

  readonly scheduleDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  private database: MockDatabase = this.emptyDatabase();

  constructor(
    private readonly http: HttpClient,
    private readonly auth: MockAuthService,
  ) {}

  async initialize(): Promise<void> {
    const fromStorage = this.readStorage<MockDatabase>(MOCK_DB_STORAGE_KEY);

    if (fromStorage) {
      this.database = fromStorage;
      return;
    }

    try {
      const seed = await firstValueFrom(this.http.get<MockSeed>('mocks/mock-seed.json'));
      this.database = this.buildDatabase(seed);
      this.persistDatabase();
    } catch {
      this.database = this.buildDatabase(FALLBACK_SEED);
      this.persistDatabase();
    }
  }

  get dashboardNotices(): DashboardNotice[] {
    return this.database.dashboardNotices;
  }

  get upcomingBlocks(): UpcomingBlock[] {
    return this.database.upcomingBlocks;
  }

  get scheduleSlots(): ScheduleSlot[] {
    return this.database.scheduleSlots;
  }

  get historyStats(): StatItem[] {
    return this.database.historyStats;
  }

  get historyLogs(): HistoryLog[] {
    return this.database.historyLogs;
  }

  get adminStats(): StatItem[] {
    return this.database.adminStats;
  }

  get recentAccess(): AccessLog[] {
    return this.database.recentAccess;
  }

  get managedUsers(): ManagedUser[] {
    return this.database.managedUsers;
  }

  get profileData(): ProfileData {
    const session = this.auth.activeProfile();

    if (this.auth.isAdmin()) {
      return {
        name: 'Admin',
        email: session.email,
        role: 'Administrador',
        faculty: 'Dirección de Deportes',
        career: 'Gestión de Instalaciones Deportivas',
        studentId: 'ADM-0001',
        campus: 'Campus Central',
      };
    }

    const fallback = this.database.studentProfiles[0] ?? {
      name: 'Usuario',
      email: 'athlete@universidad.edu',
      rut: '19.000.000-0',
      role: 'Estudiante',
      faculty: 'Facultad de Ciencias del Deporte',
      career: 'Kinesiología y Ciencias del Ejercicio',
      studentId: '10000000',
      campus: 'Campus Atlético Central',
    };

    const byName = this.database.studentProfiles.find(
      (profile) => this.normalize(profile.name) === this.normalize(session.name),
    );

    const selected = byName ?? fallback;

    return {
      ...selected,
      name: session.name || selected.name,
      email: session.email || selected.email,
      studentId: `#${selected.studentId}`,
    };
  }

  private buildDatabase(seed: MockSeed): MockDatabase {
    const studentProfiles = seed.userPool.map((user) => ({
      ...user,
      role: 'Estudiante',
    }));

    const historyLogs = this.generateHistoryLogs(seed.facilities);

    return {
      dashboardNotices: this.pickMany(seed.noticeTemplates, 2).map((notice) => ({
        title: notice.title,
        message: notice.message,
        tone: notice.tone,
      })),
      upcomingBlocks: this.generateUpcomingBlocks(seed.activities),
      scheduleSlots: this.generateScheduleSlots(seed.zones),
      historyStats: this.generateHistoryStats(historyLogs),
      historyLogs,
      studentProfiles,
      adminStats: this.generateAdminStats(),
      recentAccess: this.generateRecentAccess(studentProfiles, seed.adminAccessNotes),
      managedUsers: this.generateManagedUsers(studentProfiles, seed.userTypes),
    };
  }

  private generateUpcomingBlocks(activities: string[]): UpcomingBlock[] {
    return [0, 1, 2].map((offset) => {
      const date = new Date();
      date.setDate(date.getDate() + offset + 1);

      return {
        date: this.formatBlockDate(date),
        activity: this.pickOne(activities, 'Entrenamiento Funcional'),
        time: this.buildTimeWindow(),
        enabled: offset === 0,
      };
    });
  }

  private generateScheduleSlots(zones: string[]): ScheduleSlot[] {
    const slotRanges = ['08:00 - 09:30', '09:30 - 11:00', '11:00 - 12:30', '13:00 - 14:00'];

    return slotRanges.map((range, index) => {
      if (index === slotRanges.length - 1) {
        return {
          time: range,
          zone: 'Mantenimiento',
          slots: 'Instalación no disponible',
          statusLabel: 'Cerrado',
          statusTone: 'neutral',
          actionLabel: 'No disponible',
          enabled: false,
        };
      }

      const capacity = this.randomInt(15, 30);
      const used = this.randomInt(0, capacity);
      const available = capacity - used;
      const enabled = available > 0;

      return {
        time: range,
        zone: this.pickOne(zones, 'Zona de Pesas Libres'),
        slots: `${used} / ${capacity} cupos`,
        statusLabel: enabled ? 'Disponible' : 'Lleno',
        statusTone: enabled ? 'primary' : 'warning',
        actionLabel: enabled ? 'Reservar cupo' : 'Lista de espera',
        enabled,
      };
    });
  }

  private generateHistoryLogs(facilities: string[]): HistoryLog[] {
    const logs: HistoryLog[] = [];

    for (let i = 0; i < 8; i += 1) {
      const when = new Date();
      when.setDate(when.getDate() - this.randomInt(1, 35));

      const hourIn = this.randomInt(6, 20);
      const minuteIn = this.randomInt(0, 1) * 30;
      const duration = this.randomInt(50, 110);
      const statusCompleted = Math.random() > 0.2;

      logs.push({
        date: this.formatHistoryDate(when),
        facility: this.pickOne(facilities, 'Sala de Pesas Principal'),
        in: this.formatClock(hourIn, minuteIn),
        out: statusCompleted ? this.formatMinutesToClock(hourIn * 60 + minuteIn + duration) : '--',
        status: statusCompleted ? 'Completado' : 'Cancelado',
        tone: statusCompleted ? 'success' : 'warning',
      });
    }

    return logs.sort((a, b) => {
      const dateA = this.parseHistoryDate(a.date);
      const dateB = this.parseHistoryDate(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }

  private generateHistoryStats(historyLogs: HistoryLog[]): StatItem[] {
    const visits = this.randomInt(18, 54);
    const averageMinutes = this.randomInt(55, 95);
    const averageHours = Math.floor(averageMinutes / 60);
    const averageRemainder = averageMinutes % 60;

    const completed = historyLogs.filter((log) => log.status === 'Completado').length;
    const completionRate = historyLogs.length ? Math.round((completed / historyLogs.length) * 100) : 0;

    return [
      {
        title: 'Visitas Totales',
        value: String(visits),
        helper: 'Últimos 30 días',
      },
      {
        title: 'Duración Promedio',
        value: `${averageHours}h ${String(averageRemainder).padStart(2, '0')}m`,
        helper: 'Por sesión',
      },
      {
        title: 'Tasa de Cumplimiento',
        value: `${completionRate}%`,
        helper: 'Asistencia registrada',
      },
    ];
  }

  private generateAdminStats(): StatItem[] {
    const activeNow = this.randomInt(95, 230);
    const checkinsToday = this.randomInt(350, 980);
    const capacity = this.randomInt(45, 92);

    return [
      {
        title: 'Usuarios activos ahora',
        value: String(activeNow),
        helper: `+${this.randomInt(4, 19)} vs última hora`,
      },
      {
        title: 'Asistencias hoy',
        value: String(checkinsToday),
        helper: 'Total check-in',
      },
      {
        title: 'Capacidad actual',
        value: `${capacity}%`,
        helper: 'Carga operativa',
      },
    ];
  }

  private generateRecentAccess(studentProfiles: StudentProfile[], notes: string[]): AccessLog[] {
    const baseStatuses: Array<Pick<AccessLog, 'status' | 'tone'>> = [
      { status: 'Acceso permitido', tone: 'success' },
      { status: 'Acceso permitido', tone: 'success' },
      { status: 'Acceso denegado', tone: 'danger' },
      { status: 'Ingreso staff', tone: 'neutral' },
    ];

    return baseStatuses.map((status, index) => {
      const student = this.pickOne(studentProfiles, {
        name: 'Usuario desconocido',
        email: '',
        rut: '',
        role: 'Estudiante',
        faculty: '',
        career: '',
        studentId: '0000',
        campus: '',
      });

      const detailPrefix = this.pickOne(notes, 'Student Athlete ID');

      return {
        name: status.tone === 'danger' ? 'Unknown Tag' : student.name,
        detail: status.tone === 'danger' ? 'RFID Error / Expired' : `${detailPrefix}: ${student.studentId}`,
        timeAgo: index === 0 ? 'Justo ahora' : `Hace ${index * 3} min`,
        status: status.status,
        tone: status.tone,
      };
    });
  }

  private generateManagedUsers(studentProfiles: StudentProfile[], types: string[]): ManagedUser[] {
    return this.pickMany(studentProfiles, 8).map((user) => {
      const active = Math.random() > 0.25;
      return {
        name: user.name,
        id: user.rut,
        type: this.pickOne(types, 'Estudiante'),
        status: active ? 'Activo' : 'Inactivo',
        tone: active ? 'success' : 'neutral',
      };
    });
  }

  private buildTimeWindow(): string {
    const startHour = this.randomInt(7, 18);
    const startMinute = this.randomInt(0, 1) * 30;
    const duration = this.pickOne([60, 90], 90);

    const start = this.formatClock(startHour, startMinute);
    const end = this.formatMinutesToClock(startHour * 60 + startMinute + duration);

    return `${start} - ${end} hrs`;
  }

  private formatBlockDate(date: Date): string {
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]}`;
  }

  private formatHistoryDate(date: Date): string {
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  private parseHistoryDate(value: string): Date {
    const months: Record<string, number> = {
      ene: 0,
      feb: 1,
      mar: 2,
      abr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      ago: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dic: 11,
    };

    const [dayRaw, monthRaw, yearRaw] = value.split(' ');
    const day = Number(dayRaw);
    const month = months[monthRaw] ?? 0;
    const year = Number(yearRaw);

    return new Date(year, month, day);
  }

  private formatMinutesToClock(totalMinutes: number): string {
    const wrapped = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
    const hours = Math.floor(wrapped / 60);
    const minutes = wrapped % 60;
    return this.formatClock(hours, minutes);
  }

  private formatClock(hours: number, minutes: number): string {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private pickOne<T>(items: T[], fallback: T): T {
    if (items.length === 0) {
      return fallback;
    }

    const index = this.randomInt(0, items.length - 1);
    return items[index] ?? fallback;
  }

  private pickMany<T>(items: T[], maxItems: number): T[] {
    const copy = [...items];
    const picked: T[] = [];

    while (copy.length > 0 && picked.length < maxItems) {
      const index = this.randomInt(0, copy.length - 1);
      const [item] = copy.splice(index, 1);

      if (item !== undefined) {
        picked.push(item);
      }
    }

    return picked;
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private persistDatabase(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify(this.database));
  }

  private readStorage<T>(key: string): T | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const raw = localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  private emptyDatabase(): MockDatabase {
    return {
      dashboardNotices: [],
      upcomingBlocks: [],
      scheduleSlots: [],
      historyStats: [],
      historyLogs: [],
      studentProfiles: [],
      adminStats: [],
      recentAccess: [],
      managedUsers: [],
    };
  }
}

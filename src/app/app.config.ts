import { ApplicationConfig, APP_INITIALIZER, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { MockDatabase } from './core/mock-backend/mock-database';
import { AuthStore } from './core/auth/auth.store';
import { BroadcastSyncService } from './core/realtime/broadcast-sync.service';
import { InstallService } from './core/pwa/install.service';
import { PreferencesStore } from './core/preferences/preferences.store';
import { seedDatabase } from './core/mock-backend/seed';
import { provideAppTransloco } from './core/i18n/transloco.config';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { TicketRepository } from './models/ticket.repository';
import { UserRepository } from './models/user.repository';
import { CategoryRepository } from './models/category.repository';
import { NotificationRepository } from './models/notification.repository';
import { ReportRepository } from './models/report.repository';
import { SettingsRepository } from './models/settings.repository';
import { DepartmentRepository } from './models/department.repository';
import { MockTicketRepository } from './core/mock-backend/mock-ticket.repository';
import { MockUserRepository } from './core/mock-backend/mock-user.repository';
import { MockCategoryRepository } from './core/mock-backend/mock-category.repository';
import { MockNotificationRepository } from './core/mock-backend/mock-notification.repository';
import { MockReportRepository } from './core/mock-backend/mock-report.repository';
import { MockSettingsRepository } from './core/mock-backend/mock-settings.repository';
import { MockDepartmentRepository } from './core/mock-backend/mock-department.repository';

function initializeApp(): () => Promise<void> {
  const db = inject(MockDatabase);
  const auth = inject(AuthStore);
  const broadcastSync = inject(BroadcastSyncService);
  const installService = inject(InstallService);
  const prefs = inject(PreferencesStore);
  const transloco = inject(TranslocoService);

  return async () => {
    await db.initialize();
    if (!db.hasData()) {
      seedDatabase(db);
    }
    await auth.restoreSession();
    broadcastSync.initialize();
    installService.initialize();

    transloco.setActiveLang(prefs.language());
    await firstValueFrom(transloco.load(prefs.language()));
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideCharts(withDefaultRegisterables()),
    provideAppTransloco(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      multi: true,
    },
    { provide: TicketRepository, useClass: MockTicketRepository },
    { provide: UserRepository, useClass: MockUserRepository },
    { provide: CategoryRepository, useClass: MockCategoryRepository },
    { provide: NotificationRepository, useClass: MockNotificationRepository },
    { provide: ReportRepository, useClass: MockReportRepository },
    { provide: SettingsRepository, useClass: MockSettingsRepository },
    { provide: DepartmentRepository, useClass: MockDepartmentRepository },
  ],
};

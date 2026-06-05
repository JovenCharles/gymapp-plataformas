import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { MockDataService } from './core/services/mock-data.service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [MockDataService],
      useFactory: (mockData: MockDataService) => () => mockData.initialize(),
    },
  ],
};

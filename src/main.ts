import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(withFetch()),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top', // ou 'enabled'
        anchorScrolling: 'enabled'
      })
    )
  ]
}).catch(err => console.error(err));

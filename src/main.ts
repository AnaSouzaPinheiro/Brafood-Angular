import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  provideRouter,
  withInMemoryScrolling,
  //withHashLocation,
} from '@angular/router';
import { routes } from './app/app.routes';
import { AuthService } from './app/services/auth/auth.service';

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(withFetch()),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      })
      //withHashLocation()
    ),
  ],
})
  .then((appRef) => {
    const auth = appRef.injector.get(AuthService);
    auth.loadFromStorage();
  })
  .catch((err) => console.error(err));

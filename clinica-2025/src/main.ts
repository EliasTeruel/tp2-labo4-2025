import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';
registerLocaleData(localeEs, 'es');
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));


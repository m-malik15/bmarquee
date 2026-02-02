// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { homeComponent } from './app/home/home.component';
import { PricesComponent } from './app/prices/prices.component';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter([
      { path: '', component: homeComponent },
      { path: 'prices', component: PricesComponent },
      // { path: ':slug', component: homeComponent }
    ]),
    provideAnimations(),
  ]
}).catch(err => console.error(err));

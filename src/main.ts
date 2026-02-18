// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { homeComponent } from './app/home/home.component';
import { PricesComponent } from './app/prices/prices.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FreeQuoteComponent } from './app/free-quote/free-quote.component';
import { ContactUsComponent } from './app/contact-us/contact-us.component';
import { ServiceAreasComponent } from './app/service-areas/service-areas.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter([
      { path: '', component: homeComponent },
      { path: 'prices', component: PricesComponent },
      { path: 'free-quote', component: FreeQuoteComponent },
      { path: 'contact-us', component: ContactUsComponent },
        { path: 'service-areas', component: ServiceAreasComponent },
      // { path: ':slug', component: homeComponent }
    ]),
    provideAnimations(),
  ]
}).catch(err => console.error(err));

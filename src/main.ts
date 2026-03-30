// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppComponent }            from './app/app.component';
import { homeComponent }           from './app/home/home.component';
import { PricesComponent }         from './app/prices/prices.component';
import { FreeQuoteComponent }      from './app/free-quote/free-quote.component';
import { ContactUsComponent }      from './app/contact-us/contact-us.component';
import { ServiceAreasComponent }   from './app/service-areas/service-areas.component';
import { GalleryComponent }        from './app/gallery/gallery.component';
import { GalleryDemoComponent }    from './app/gallery-demo/gallery-demo.component';
import { WordPressPageComponent }  from './app/wordpress-page/wordpress-page.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideAnimations(),
    provideRouter([
      // ── Dedicated routes ────────────────────────────────────────────────────
      { path: '',               component: homeComponent },
      { path: 'prices',         component: PricesComponent },
      { path: 'free-quote',     component: FreeQuoteComponent },
      { path: 'contact-us',     component: ContactUsComponent },
      { path: 'service-areas',  component: ServiceAreasComponent },

      // Gallery — live (WP images)
      { path: 'gallery',          component: GalleryComponent },
      { path: 'marquee-gallery',  component: GalleryComponent },

      // Gallery — demo (high-quality stock images for client preview)
      { path: 'gallery-demo',     component: GalleryDemoComponent },

      // ── Generic WordPress CMS pages ─────────────────────────────────────────
      { path: ':slug',          component: WordPressPageComponent },
      { path: '**',             component: WordPressPageComponent },
    ]),
  ]
}).catch(err => console.error(err));

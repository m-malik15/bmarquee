// prices.component.ts - Enhanced with collapsible pricing panels
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml, Meta, Title } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { WordPressService2, WordPressPage } from '../services/wordpress.service.service';

// Note: Make sure you have provideAnimations() in your app config or BrowserAnimationsModule imported

interface PriceRow {
  size: string;
  seatedGuests: string;
  withDanceFloor: string;
  standing: string;
  price: string;
}

interface PricingTable {
  id: string;
  title: string;
  subtitle?: string;
  columns: string[];
  rows: PriceRow[];
  isExpanded: boolean;
  icon?: string;
}

@Component({
  selector: 'app-prices',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './prices.component.html',
  styleUrl: './prices.component.scss',
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({
        height: '0',
        opacity: '0',
        overflow: 'hidden'
      })),
      state('expanded', style({
        height: '*',
        opacity: '1',
        overflow: 'visible'
      })),
      transition('collapsed <=> expanded', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ])
    ]),
    trigger('rotateIcon', [
      state('collapsed', style({
        transform: 'rotate(0deg)'
      })),
      state('expanded', style({
        transform: 'rotate(180deg)'
      })),
      transition('collapsed <=> expanded', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ])
    ])
  ]
})
export class PricesComponent implements OnInit, OnDestroy {
  page: WordPressPage | null = null;
  pageContent: SafeHtml = '';
  isLoading = true;
  error: string | null = null;

  pricingTables: PricingTable[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private wpService: WordPressService2,
    private sanitizer: DomSanitizer,
    private meta: Meta,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.initializePricingTables();
    this.loadPricesPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializePricingTables() {
    this.pricingTables = [
      {
        id: 'clearspan-6m',
        title: '6m Wide Clearspan Marquees',
        isExpanded: true, // First one open by default
        columns: ['Marquee Size', 'Seated Guests', 'With Dance Floor', 'Standing', 'Price'],
        rows: [
          { size: '6m x 6m', seatedGuests: '32 - 40', withDanceFloor: '16 - 20', standing: '50', price: '£306.00' },
          { size: '6m x 9m', seatedGuests: '48 - 60', withDanceFloor: '32 - 40', standing: '70', price: '£459.00' },
          { size: '6m x 12m', seatedGuests: '64 - 80', withDanceFloor: '40 - 50', standing: '90', price: '£612.00' },
          { size: '6m x 15m', seatedGuests: '80 - 100', withDanceFloor: '48 - 60', standing: '110', price: '£765.00' },
          { size: '6m x 18m', seatedGuests: '96 - 110', withDanceFloor: '48 - 60', standing: '130', price: '£918.00' },
          { size: '6m x 21m', seatedGuests: '104 - 130', withDanceFloor: '64 - 80', standing: '150', price: '£1071.00' },
          { size: '6m x 24m', seatedGuests: '120 - 150', withDanceFloor: '72 - 90', standing: '170', price: '£1710.00' },
          { size: '6m x 27m', seatedGuests: '128 - 170', withDanceFloor: '88 - 110', standing: '190', price: '£1377.00' },
          { size: '6m x 30m', seatedGuests: '144 - 180', withDanceFloor: '112 - 140', standing: '210', price: '£1530.00' }
        ]
      },
      {
        id: 'clearspan-9m',
        title: '9m Wide Clearspan Marquees',
        isExpanded: false,
        columns: ['Marquee Size', 'Seated Guests', 'With Dance Floor', 'Standing', 'Price'],
        rows: [
          { size: '9m x 9m', seatedGuests: '72 - 90', withDanceFloor: '48 - 60', standing: '115', price: '£688.50' },
          { size: '9m x 12m', seatedGuests: '96 - 120', withDanceFloor: '48 - 60', standing: '140', price: '£918.00' },
          { size: '9m x 15m', seatedGuests: '120 - 150', withDanceFloor: '72 - 90', standing: '175', price: '£1147.50' },
          { size: '9m x 18m', seatedGuests: '136 - 170', withDanceFloor: '72 - 90', standing: '210', price: '£1377.00' },
          { size: '9m x 21m', seatedGuests: '160 - 200', withDanceFloor: '96 - 120', standing: '245', price: '£1606.50' },
          { size: '9m x 24m', seatedGuests: '184 - 230', withDanceFloor: '112 - 140', standing: '280', price: '£1836.00' },
          { size: '9m x 27m', seatedGuests: '208 - 260', withDanceFloor: '136 - 170', standing: '315', price: '£2065.50' },
          { size: '9m x 30m', seatedGuests: '224 - 280', withDanceFloor: '160 - 200', standing: '350', price: '£2295.00' },
          { size: '9m x 33m', seatedGuests: '264 - 330', withDanceFloor: '192 - 240', standing: '385', price: '£2524.50' },
          { size: '9m x 36m', seatedGuests: '288 - 360', withDanceFloor: '192 - 240', standing: '420', price: '£2754.00' }
        ]
      },
      {
        id: 'clearspan-12m',
        title: '12m Wide Clearspan Marquees',

        isExpanded: false,
        columns: ['Marquee Size', 'Seated Guests', 'With Dance Floor', 'Standing', 'Price'],
        rows: [
          { size: '12m x 12m', seatedGuests: '128 - 160', withDanceFloor: '64 - 80', standing: '160', price: '£1368.00' },
          { size: '12m x 15m', seatedGuests: '152 - 190', withDanceFloor: '96 - 120', standing: '220', price: '£1710.00' },
          { size: '12m x 18m', seatedGuests: '184 - 230', withDanceFloor: '96 - 120', standing: '240', price: '£2052.00' },
          { size: '12m x 21m', seatedGuests: '216 - 270', withDanceFloor: '120 - 150', standing: '270', price: '£2394.00' },
          { size: '12m x 24m', seatedGuests: '248 - 310', withDanceFloor: '152 - 190', standing: '310', price: '£2736.00' },
          { size: '12m x 27m', seatedGuests: '280 - 350', withDanceFloor: '184 - 230', standing: '330', price: '£3078.00' },
          { size: '12m x 30m', seatedGuests: '312 - 390', withDanceFloor: '216 - 270', standing: '360', price: '£3420.00' },
          { size: '12m x 33m', seatedGuests: '352 - 460', withDanceFloor: '256 - 300', standing: '400', price: '£3762.00' },
          { size: '12m x 36m', seatedGuests: '384 - 470', withDanceFloor: '288 - 360', standing: '440', price: '£4104.00' },
          { size: '12m x 39m', seatedGuests: '416 - 500', withDanceFloor: '288 - 360', standing: '480', price: '£4446.00' }
        ]
      },
      {
        id: 'clearspan-15m',
        title: '15m Wide Clearspan Marquees',

        isExpanded: false,
        columns: ['Marquee Size', 'Seated Guests', 'With Dance Floor', 'Standing', 'Price'],
        rows: [
          { size: '15m x 15m', seatedGuests: '192 - 240', withDanceFloor: '112 - 140', standing: '240', price: '£2193.75' },
          { size: '15m x 18m', seatedGuests: '232 - 290', withDanceFloor: '112 - 140', standing: '280', price: '£2632.50' },
          { size: '15m x 21m', seatedGuests: '272 - 340', withDanceFloor: '152 - 190', standing: '320', price: '£3071.25' },
          { size: '15m x 24m', seatedGuests: '312 - 340', withDanceFloor: '192 - 240', standing: '360', price: '£3510.00' },
          { size: '15m x 27m', seatedGuests: '352 - 440', withDanceFloor: '232 - 290', standing: '400', price: '£3948.75' },
          { size: '15m x 30m', seatedGuests: '392 - 490', withDanceFloor: '272 - 340', standing: '425', price: '£4387.50' },
          { size: '15m x 33m', seatedGuests: '432 - 540', withDanceFloor: '312 - 340', standing: '450', price: '£4826.25' },
          { size: '15m x 36m', seatedGuests: '472 - 590', withDanceFloor: '352 - 440', standing: '475', price: '£5265.00' },
          { size: '15m x 39m', seatedGuests: '512 - 640', withDanceFloor: '392 - 490', standing: '550', price: '£5703.75' }
        ]
      },
      {
        id: 'pagoda',
        title: 'Pagoda Marquees',

        isExpanded: false,
        columns: ['Marquee Size', 'Seated Guests', 'With Dance Floor', 'Standing', 'Price'],
        rows: [
          { size: '3m x 3m', seatedGuests: '8 - 10', withDanceFloor: 'N/A', standing: '15', price: '£225.00' },
          { size: '4m x 4m', seatedGuests: '13 - 18', withDanceFloor: 'N/A', standing: '20', price: '£285.00' },
          { size: '5m x 5m', seatedGuests: '24 - 30', withDanceFloor: '15', standing: '35', price: '£285.00' },
          { size: '6m x 6m', seatedGuests: '32 - 40', withDanceFloor: '16 - 20', standing: '50', price: '£350.00' }
        ]
      },
      {
        id: 'gazebo',
        title: 'Gazebo Marquees',
        subtitle: 'Modular marquees that can be joined together in various orientations to fit different shaped gardens',

        isExpanded: false,
        columns: ['Marquee Size', 'Seated Guests', 'With Dance Floor', 'Standing', 'Price'],
        rows: [
          { size: '3m x 3m', seatedGuests: '8 - 10', withDanceFloor: 'N/A', standing: '15', price: '£115.00' },
          { size: '3m x 4.5m', seatedGuests: '10 - 15', withDanceFloor: 'N/A', standing: '20', price: '£115.00' },
          { size: '3m x 6m', seatedGuests: '16 - 20', withDanceFloor: '10', standing: '25', price: '£130.00' }
        ]
      },
      {
        id: 'tunnels',
        title: '2m & 3m Clearspan Marquees (Tunnels)',

        isExpanded: false,
        columns: ['Marquee Size', 'Price'],
        rows: [
          { size: '2m x 3m', seatedGuests: '', withDanceFloor: '', standing: '', price: '£115.50' },
          { size: '2m x 6m', seatedGuests: '', withDanceFloor: '', standing: '', price: '£195.00' },
          { size: '2m x 9m', seatedGuests: '', withDanceFloor: '', standing: '', price: '£292.50' },
          { size: '2m x 12m', seatedGuests: '', withDanceFloor: '', standing: '', price: '£390.00' },
          { size: '2m x 15m', seatedGuests: '', withDanceFloor: '', standing: '', price: '£487.50' },
          { size: '3m x 3m', seatedGuests: '', withDanceFloor: '', standing: '', price: '£150.00' },
          { size: '3m x 6m', seatedGuests: '', withDanceFloor: '', standing: '', price: '£250.00' },
          { size: '3m x 9m', seatedGuests: '', withDanceFloor: '', standing: '', price: '£375.00' },
          { size: '3m x 12m', seatedGuests: '', withDanceFloor: '', standing: '', price: '£500.00' },
          { size: '3m x 15m', seatedGuests: '', withDanceFloor: '', standing: '', price: '£625.00' }
        ]
      },
      {
        id: 'star-shade',
        title: 'Star Shade Marquees',

        isExpanded: false,
        columns: ['Marquee Size', 'Guests', 'Price'],
        rows: [
          { size: 'Star Shade 16.5m diameter', seatedGuests: '80', withDanceFloor: '', standing: '', price: '£330.00' },
          { size: 'Twin Shade 21m x 16.5m', seatedGuests: '140', withDanceFloor: '', standing: '', price: '£550.00' }
        ]
      }
    ];
  }

  togglePanel(tableId: string) {
    const table = this.pricingTables.find(t => t.id === tableId);
    if (table) {
      table.isExpanded = !table.isExpanded;
    }
  }

  expandAll() {
    this.pricingTables.forEach(table => table.isExpanded = true);
  }

  collapseAll() {
    this.pricingTables.forEach(table => table.isExpanded = false);
  }

  private loadPricesPage() {
    this.isLoading = true;
    this.error = null;

    // Get page with WordPress styles stripped
    this.wpService.getWpPage('prices', true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pageData) => {
          this.page = pageData.page;
          // Content is already cleaned by the service
          this.pageContent = this.sanitizer.bypassSecurityTrustHtml(pageData.cleanContent);
          this.setMetaTags(pageData.metaTags);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading prices page:', err);
          this.error = 'Unable to load pricing information. Please try again later.';
          this.isLoading = false;
        }
      });
  }

  private setMetaTags(metaTags: any) {
    this.titleService.setTitle(metaTags.title || 'Marquee Hire Prices - Baillie\'s Marquees');
    this.meta.updateTag({ name: 'description', content: metaTags.description || 'View our competitive marquee hire prices.' });
    this.meta.updateTag({ property: 'og:title', content: metaTags.title });
    this.meta.updateTag({ property: 'og:description', content: metaTags.description });
    this.meta.updateTag({ property: 'og:url', content: metaTags.canonical });

    if (metaTags.ogImage) {
      this.meta.updateTag({ property: 'og:image', content: metaTags.ogImage });
    }

    this.updateCanonicalUrl(metaTags.canonical);
  }

  private updateCanonicalUrl(url: string) {
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}

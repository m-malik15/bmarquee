// gallery.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { Subject, takeUntil, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SliderComponent } from '../slider/slider.component';
import { PageShellComponent } from '../page-shell/page-shell.component';
import { WordPressService2, MediaItem } from '../services/wordpress.service.service';

export interface GalleryCategory {
  id: string;           // anchor fragment
  label: string;
  icon: string;         // SVG path
  highlight: string;
  description: string;
  coverImage: string;   // first image from WP, or fallback
  color: string;        // accent colour for the card background
  images: MediaItem[];
}

// ── Static category definitions (no images — those come from WP) ──────────────
const CATEGORY_DEFS: Omit<GalleryCategory, 'images' | 'coverImage'>[] = [
  {
    id: 'clearspan',
    color: '#1a4a7a',
    label: 'Clearspan',
    icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    highlight: 'Our most popular structure',
    description: 'Clearspan marquees are our most versatile structure — no internal poles means a completely open, unobstructed floor plan. Perfect for weddings, corporate events and large gatherings. Available in widths from 6m to 15m and any length, they can be linked together to create bespoke event spaces.'
  },
  {
    id: 'stretch-tents',
    color: '#2d6e5e',
    label: 'Stretch Tents',
    icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    highlight: 'Unique organic shapes',
    description: 'Stretch tents offer a modern, fluid aesthetic that adapts to any environment. Their tensioned fabric creates stunning organic canopy shapes that work beautifully for festivals, garden parties and contemporary events. UV-resistant, waterproof and available in a range of colours.'
  },
  {
    id: 'pagodas',
    color: '#5c3d8f',
    label: 'Pagodas',
    icon: 'M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M16 10v11M12 10v11',
    highlight: 'Classic elegance',
    description: 'Pagoda marquees bring timeless elegance to any outdoor event. Their distinctive peaked roofline and windowed sides create a stunning visual impression. They can be used as standalone structures or linked to clearspan marquees to create entrance porticos, bar areas or additional reception space.'
  },
  {
    id: 'starshades',
    color: '#c0392b',
    label: 'Starshades',
    icon: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83',
    highlight: 'Striking star-shaped canopy',
    description: 'Starshade marquees make an immediate visual statement at any event. Their distinctive star-shaped canopy roof provides excellent weather protection while creating a unique atmosphere. Available as single or twin configurations, ideal for exhibitions, hospitality events and prestigious outdoor functions.'
  },
  {
    id: 'gazebos',
    color: '#d4760a',
    label: 'Gazebos',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10',
    highlight: 'Modular & flexible',
    description: 'Our modular gazebo marquees are the perfect solution for smaller events, market stalls and garden parties. They can be joined together in various orientations — side by side, back to back or in an L-shape — making them ideal for fitting unusual spaces.'
  },
  {
    id: 'cinema',
    color: '#1a1a2e',
    label: 'Cinema',
    icon: 'M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z',
    highlight: 'Unique cinema experiences',
    description: 'Transform any outdoor space into a spectacular cinema experience. Our cinema marquees are blacked-out structures fitted with professional projection and sound equipment. Perfect for private screenings, corporate entertainment and public events.'
  },
  {
    id: 'interiors',
    color: '#7b2d5e',
    label: 'Interiors',
    icon: 'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm7 4v10M3 12h18',
    highlight: 'Beautiful interior styling',
    description: 'The interior of your marquee is where your event vision truly comes to life. We offer full silk ceiling linings, mood lighting in any colour, chandelier drops, fairy light canopies, and a variety of flooring. Our team can help you design an interior that perfectly matches your theme.'
  },
  {
    id: 'flooring',
    color: '#3d5a2a',
    label: 'Flooring',
    icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
    highlight: 'Level, solid underfoot',
    description: 'A quality floor transforms the comfort and appearance of any marquee event. We offer interlocking wooden parquet on galvanised steel subframes — ideal for uneven ground — as well as plastic interlocking tiles. Dance floors in polished hardwood or LED options are also available.'
  }
];

// ── Map Kadence pane #id attributes to our category ids ──────────────────────
// These match the id="" on each .kt-accordion-pane in the WP gallery page
const PANE_ID_MAP: Record<string, string> = {
  'clearspan':           'clearspan',
  'stretch-tents':       'stretch-tents',
  'pagoda-marquees':     'pagodas',
  'starshade-marquees':  'starshades',
  'gazebo-popup-marquees': 'gazebos',
  'cinema':              'cinema',
  'interiors':           'interiors',
  'flooring':            'flooring'
};

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink, PageShellComponent, SliderComponent],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit, OnDestroy {

  categories: GalleryCategory[] = [];
  activeId = 'clearspan';
  isLoading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private wpService: WordPressService2,
    private route: ActivatedRoute,
    private router: Router,
    private meta: Meta,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle("Marquee Gallery | Baillie's Marquees");
    this.meta.updateTag({
      name: 'description',
      content: 'Browse our marquee gallery — clearspan, stretch tents, pagodas, starshades, gazebos, cinema marquees and interior styling.'
    });

    // Deep-link: read fragment from URL e.g. /gallery#pagodas
    this.route.fragment
      .pipe(takeUntil(this.destroy$))
      .subscribe(fragment => {
        if (fragment) this.activeId = fragment;
      });

    this.loadGallery();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get activeCategory(): GalleryCategory | undefined {
    return this.categories.find(c => c.id === this.activeId);
  }

  selectCategory(id: string): void {
    this.activeId = id;
    this.router.navigate([], { fragment: id, replaceUrl: true });
  }

  // ── Load the marquee-gallery WP page and parse images from Kadence panes ────
  private loadGallery(): void {
    this.isLoading = true;

    this.wpService.getPage('marquee-gallery')
      .pipe(
        catchError(() => this.wpService.getPage('gallery')),  // fallback slug
        catchError(() => of(null)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (pageData) => {
          if (pageData?.cleanContent) {
            this.categories = this.parseGalleryPage(pageData.cleanContent);
          }

          // If parse returned nothing (page not found / different structure),
          // fall back to keyword search per category
          if (!this.categories.length || this.categories.every(c => !c.images.length)) {
            this.loadViaSearch();
          } else {
            this.isLoading = false;
          }
        },
        error: () => this.loadViaSearch()
      });
  }

  // ── Parse Kadence accordion panes from WP HTML ────────────────────────────
  private parseGalleryPage(html: string): GalleryCategory[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Build a map: categoryId → MediaItem[]
    const imageMap: Record<string, MediaItem[]> = {};

    // Each Kadence pane has id="clearspan", id="pagoda-marquees" etc.
    const panes = doc.querySelectorAll<HTMLElement>('.kt-accordion-pane[id]');

    panes.forEach(pane => {
      const paneId = pane.getAttribute('id') || '';
      const categoryId = PANE_ID_MAP[paneId];
      if (!categoryId) return;

      const items: MediaItem[] = [];

      // Extract every <img> inside the pane
      pane.querySelectorAll<HTMLImageElement>('img').forEach(imgEl => {
        const fullUrl  = imgEl.getAttribute('data-full-image') || imgEl.src;
        const lightUrl = imgEl.getAttribute('data-light-image') || fullUrl;
        const src      = imgEl.src || imgEl.getAttribute('src') || '';
        const alt      = imgEl.alt || '';
        const idAttr   = imgEl.getAttribute('data-id') || '0';

        if (!src && !fullUrl) return;

        items.push({
          id: parseInt(idAttr, 10),
          title: alt,
          alt_text: alt,
          caption: alt,
          description: '',
          media_type: 'image',
          mime_type: 'image/webp',
          source_url: fullUrl || src,
          sizes: {
            full:      { source_url: fullUrl || src,  width: 1200, height: 800 },
            large:     { source_url: lightUrl || src, width: 1200, height: 800 },
            medium:    { source_url: src,              width: 500,  height: 375 },
            thumbnail: { source_url: src,              width: 150,  height: 150 }
          }
        });
      });

      imageMap[categoryId] = items;
    });

    // Build GalleryCategory array maintaining our defined order
    return CATEGORY_DEFS.map(def => {
      const images = imageMap[def.id] || [];
      return {
        ...def,
        images,
        coverImage: images[0]?.source_url || ''
      };
    });
  }

  // ── Fallback: search WP media library by keyword per category ─────────────
  private loadViaSearch(): void {
    const keywords: Record<string, string> = {
      'clearspan':    'clearspan',
      'stretch-tents':'stretch-tent',
      'pagodas':      'pagoda',
      'starshades':   'starshade',
      'gazebos':      'gazebo',
      'cinema':       'cinema',
      'interiors':    'marquee-interior',
      'flooring':     'flooring'
    };

    const searches = CATEGORY_DEFS.map(def =>
      this.wpService.searchMedia(keywords[def.id] || def.id, 'image').pipe(
        catchError(() => of([] as MediaItem[]))
      )
    );

    forkJoin(searches)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.categories = CATEGORY_DEFS.map((def, i) => ({
            ...def,
            images: results[i],
            coverImage: results[i][0]?.source_url || ''
          }));
          this.isLoading = false;
        },
        error: () => {
          this.error = 'Could not load gallery images.';
          this.isLoading = false;
        }
      });
  }
}

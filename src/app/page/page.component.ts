// page.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml, Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { MediaItem, WordPressPage, WordPressService2 } from '../wordpress.service2.service';
import { SliderComponent } from '../slider/slider.component';

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [CommonModule, SliderComponent, SliderComponent],
  templateUrl: './page.component.html',
  styleUrl: './page.component.scss'
})
export class PageComponent implements OnInit, OnDestroy {
  page: WordPressPage | null = null;
  pageContent: SafeHtml = '';
  sliderImages: MediaItem[] = [];
  isLoading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private wpService: WordPressService2,
    private sanitizer: DomSanitizer,
    private meta: Meta,
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Listen to route parameter changes
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const slug = params['slug'] || ''; // Get slug from route, empty = home
        this.loadPage(slug);

        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPage(slug: string) {
    this.isLoading = true;
    this.error = null;

    // Determine slider images based on page
    const sliderObservable = this.getSliderForPage(slug);

    // Load both page content AND slider images in parallel
    forkJoin({
      pageData: this.wpService.getPage(slug),
      sliderImages: sliderObservable
    }).subscribe({
      next: ({ pageData, sliderImages }) => {
        // Set page data
        this.page = pageData.page;
        this.pageContent = this.sanitizer.bypassSecurityTrustHtml(pageData.cleanContent);

        // Set slider images
        this.sliderImages = sliderImages;

        // Set meta tags
        this.setMetaTags(pageData.metaTags);

        this.isLoading = false;

        console.log('Page loaded:', this.page.title.rendered);
        console.log('Page slug:', slug);
        console.log('Slider images:', this.sliderImages.length);
      },
      error: (err) => {
        console.error('Error loading page:', err);
        this.error = 'Page not found';
        this.isLoading = false;
      }
    });
  }

  /**
   * Get slider images based on page slug
   */
  private getSliderForPage(slug: string) {
    // Define slider configuration for each page
    const sliderConfig: { [key: string]: number[] | string } = {
      '': [739,996,997, 937],        // Home page
      'home': [739,996,997, 937],    // Home page

      // Add more pages as needed
    };

    const config = sliderConfig[slug];

    if (Array.isArray(config)) {
      // Use specific image IDs
      return this.wpService.getMediaByIds(config);
    } else if (typeof config === 'string') {
      // Search by keyword
      return this.wpService.getSliderImages(config);
    } else {
      // No slider for this page
      return this.wpService.getMediaByIds([]);
    }
  }

  getFeaturedImage() {
    return this.page?._embedded?.['wp:featuredmedia']?.[0] || null;
  }

  private setMetaTags(metaTags: any) {
    this.titleService.setTitle(metaTags.title);
    this.meta.updateTag({ name: 'description', content: metaTags.description });
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

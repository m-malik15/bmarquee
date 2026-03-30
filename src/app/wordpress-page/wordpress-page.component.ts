// wordpress-page.component.ts
import { Component, OnInit, OnDestroy, AfterViewChecked, ElementRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml, Meta, Title } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { WordPressService2, WordPressPage } from '../services/wordpress.service.service';
import { PageShellComponent } from '../page-shell/page-shell.component';


@Component({
  selector: 'app-wordpress-page',
  standalone: true,
  imports: [CommonModule, RouterLink, PageShellComponent],
  templateUrl: './wordpress-page.component.html',
  styleUrl: './wordpress-page.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class WordPressPageComponent implements OnInit, OnDestroy, AfterViewChecked {

  page: WordPressPage | null = null;
  pageTitle    = '';
  pageIntro    = '';
  pageContent: SafeHtml = '';
  featuredImageUrl = '';
  isLoading = true;
  error: string | null = null;

  // Track whether we've already wired up accordion clicks for this content load
  private accordionBound = false;

  private destroy$ = new Subject<void>();

  constructor(
    private wpService: WordPressService2,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router,
    private meta: Meta,
    private titleService: Title,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const slug = params['slug'] || this.router.url.replace(/^\/|\/$/g, '');
        this.loadPage(slug);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * After Angular renders the [innerHTML] content, wire up the Kadence
   * accordion buttons so they work without Kadence's own JS.
   */
  ngAfterViewChecked(): void {
    if (!this.accordionBound && !this.isLoading) {
      this.bindAccordions();
      this.bindGalleryGrids();
      this.accordionBound = true;
    }
  }

  private loadPage(slug: string): void {
    this.isLoading = true;
    this.error = null;
    this.pageIntro = '';
    this.pageContent = '';
    this.featuredImageUrl = '';
    this.accordionBound = false;

    this.wpService.getPage(slug).subscribe({
      next: (pageData) => {
        this.page = pageData.page;
        this.pageTitle = this.stripHtml(pageData.page.title.rendered);

        // Featured image
        const media = pageData.page._embedded?.['wp:featuredmedia']?.[0];
        if (media) {
          this.featuredImageUrl =
            media.media_details?.sizes?.large?.source_url ||
            media.media_details?.sizes?.medium?.source_url ||
            media.source_url;
        }

        // Clean & process content
        const cleaned = this.cleanContent(pageData.cleanContent);
        const { intro, body } = this.extractIntro(cleaned);
        this.pageIntro = intro;
        this.pageContent = this.sanitizer.bypassSecurityTrustHtml(body);

        this.setMetaTags(pageData.metaTags);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading WP page:', err);
        this.error = 'Page not found';
        this.isLoading = false;
      }
    });
  }

  /**
   * Strip elements that either duplicate content or break layout:
   * - <style> blocks inside WP content (Kadence inlines these)
   * - The first <h1> if it matches the page title (would duplicate shell header)
   * - Empty Kadence wrapper divs that contribute only grey backgrounds
   */
  private cleanContent(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 1. Remove all inline <style> blocks — we provide our own CSS
    doc.querySelectorAll('style').forEach(s => s.remove());

    // 2. Remove first <h1> if it matches (or is contained in) the page title
    //    Kadence often duplicates the page title as an h1 inside content
    const firstH1 = doc.body.querySelector('h1');
    if (firstH1) {
      const h1Text = (firstH1.textContent || '').trim().toLowerCase();
      const titleText = this.pageTitle.trim().toLowerCase();
      if (h1Text === titleText || titleText.includes(h1Text) || h1Text.includes(titleText)) {
        firstH1.remove();
      }
    }

    // 3. Remove Kadence spacer blocks (they're just empty height divs)
    doc.querySelectorAll('.wp-block-spacer').forEach(el => el.remove());

    // 4. Remove inline background colours from Kadence accordion panels
    //    (the grey .kt-accordion-panel-inner background is Kadence-specific)
    doc.querySelectorAll('.kt-accordion-panel-inner').forEach(el => {
      (el as HTMLElement).style.background = '';
      (el as HTMLElement).style.backgroundColor = '';
    });

    return doc.body.innerHTML;
  }

  /**
   * Extract the first meaningful paragraph for the shell intro.
   * Skip if it's very short (e.g. a lone image caption).
   */
  private extractIntro(html: string): { intro: string; body: string } {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const firstP = doc.body.querySelector('p');

    if (firstP && (firstP.textContent || '').trim().length > 40) {
      const intro = firstP.innerHTML;
      firstP.remove();
      return { intro, body: doc.body.innerHTML };
    }

    return { intro: '', body: html };
  }

  /**
   * Wire up Kadence accordion buttons to show/hide panels.
   * Kadence's JS isn't loaded — we replicate the open/close behaviour.
   */
  private bindAccordions(): void {
    const host = this.el.nativeElement as HTMLElement;
    const buttons = host.querySelectorAll<HTMLButtonElement>('.kt-blocks-accordion-header');

    if (!buttons.length) return;

    buttons.forEach(btn => {
      // Avoid double-binding
      if (btn.dataset['bmBound']) return;
      btn.dataset['bmBound'] = '1';

      btn.addEventListener('click', () => {
        const pane = btn.closest('.kt-accordion-pane') as HTMLElement;
        if (!pane) return;

        const panel = pane.querySelector<HTMLElement>('.kt-accordion-panel');
        if (!panel) return;

        const isOpen = !panel.classList.contains('kt-accordion-panel-hidden');

        // Allow multiple open (simplest approach for gallery page)
        if (isOpen) {
          panel.classList.add('kt-accordion-panel-hidden');
          btn.classList.remove('kt-accordion-panel-active');
        } else {
          panel.classList.remove('kt-accordion-panel-hidden');
          btn.classList.add('kt-accordion-panel-active');
        }
      });
    });
  }

  /**
   * Convert Kadence gallery <ul> lists into proper CSS grids.
   * The data-columns-xl etc. attributes tell us how many columns to use.
   */
  private bindGalleryGrids(): void {
    const host = this.el.nativeElement as HTMLElement;
    const galleries = host.querySelectorAll<HTMLElement>('.kb-gallery-type-grid');

    galleries.forEach(gallery => {
      const cols = gallery.dataset['columnsXl'] || gallery.dataset['columnsMd'] || '3';
      gallery.style.display = 'grid';
      gallery.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      gallery.style.gap = '8px';
      gallery.style.listStyle = 'none';
      gallery.style.padding = '0';
      gallery.style.margin = '0';
    });
  }

  private stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  private setMetaTags(metaTags: any): void {
    this.titleService.setTitle(metaTags.title || this.pageTitle);
    this.meta.updateTag({ name: 'description', content: metaTags.description || '' });
    this.meta.updateTag({ property: 'og:title', content: metaTags.title });
    this.meta.updateTag({ property: 'og:description', content: metaTags.description });
    this.meta.updateTag({ property: 'og:url', content: metaTags.canonical });
    if (metaTags.ogImage) {
      this.meta.updateTag({ property: 'og:image', content: metaTags.ogImage });
    }
    this.updateCanonical(metaTags.canonical);
  }

  private updateCanonical(url: string): void {
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}

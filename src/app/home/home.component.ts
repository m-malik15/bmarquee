import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml, Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { MediaItem, WordPressPage, WordPressService2 } from '../services/wordpress.service.service';
import { SliderComponent } from '../slider/slider.component';
import { CardsGridComponent } from '../cards-grid/cards-grid.component';

import { TrustpilotSectionComponent, TrustpilotData } from '../trustpilot-section/trustpilot-section.component';
import { CardData } from '../card/card.component';


import { ClientsAccreditationsComponent, ClientsAccreditationsData } from '../clients-accreditations/clients-accreditations.component';
import { CtaSectionComponent, CtaData } from '../cta-section/cta-section.component';
import { HtmlParserService } from '../services/html-parser.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SliderComponent, CardsGridComponent, CtaSectionComponent, TrustpilotSectionComponent, ClientsAccreditationsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class homeComponent implements OnInit, OnDestroy {
  page: WordPressPage | null = null;
  pageContentBefore: SafeHtml = '';
  pageContentAfter: SafeHtml = '';
  sliderImages: MediaItem[] = [];
  isLoading = true;
  error: string | null = null;

  allCards: CardData[] = [];
  cardSections: CardData[][] = [];
  showCards = false;

  ctaSection: CtaData | null = null;
  showCta = false;

  trustpilotSection: TrustpilotData | null = null;
  showTrustpilot = false;

  clientsAccreditationsSection: ClientsAccreditationsData | null = null;
  showClientsAccreditations = false;

  private destroy$ = new Subject<void>();

  constructor(
    private wpService: WordPressService2,
    private sanitizer: DomSanitizer,
    private meta: Meta,
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router,
    private htmlParser: HtmlParserService
  ) {}

  ngOnInit() {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const slug = params['slug'] || '';
        this.loadPage(slug);
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

    const sliderObservable = this.getSliderForPage(slug);

    forkJoin({
      pageData: this.wpService.getPage(slug),
      sliderImages: sliderObservable
    }).subscribe({
      next: ({ pageData, sliderImages }) => {
        this.page = pageData.page;

        let cleanContent = pageData.cleanContent;

        // Extract cards
        this.showCards = this.shouldShowCards(slug);
        if (this.showCards) {
          this.allCards = this.htmlParser.parseCardsFromContent(cleanContent);
          this.cardSections = this.htmlParser.splitCardsIntoSections(this.allCards, 3);
          cleanContent = this.htmlParser.removeCardsFromContent(cleanContent);
        }

        // Extract CTA and split content
        this.showCta = this.shouldShowCta(slug);
        if (this.showCta) {
          this.ctaSection = this.htmlParser.extractCtaSection(cleanContent);
          const sections = this.htmlParser.splitContentAtCta(cleanContent);

          // Extract Trustpilot from after content
          this.showTrustpilot = this.shouldShowTrustpilot(slug);
          if (this.showTrustpilot) {
            this.trustpilotSection = this.htmlParser.extractTrustpilotSection(sections.afterCta);
            sections.afterCta = this.htmlParser.removeTrustpilotFromContent(sections.afterCta);
          }

          // Extract Clients & Accreditations from after content
          this.showClientsAccreditations = this.shouldShowClientsAccreditations(slug);
          if (this.showClientsAccreditations) {
            this.clientsAccreditationsSection = this.htmlParser.extractClientsAccreditations(sections.afterCta);
            sections.afterCta = this.htmlParser.removeClientsAccreditationsFromContent(sections.afterCta);
          }

          this.pageContentBefore = this.sanitizer.bypassSecurityTrustHtml(sections.beforeCta);
          this.pageContentAfter = this.sanitizer.bypassSecurityTrustHtml(sections.afterCta);
        } else {
          this.pageContentBefore = this.sanitizer.bypassSecurityTrustHtml(cleanContent);
          this.pageContentAfter = '';
        }

        this.sliderImages = sliderImages;
        this.setMetaTags(pageData.metaTags);

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading page:', err);
        this.error = 'Page not found';
        this.isLoading = false;
      }
    });
  }

  private shouldShowCards(slug: string): boolean {
    return slug === '' || slug === 'home';
  }

  private shouldShowCta(slug: string): boolean {
    return slug === '' || slug === 'home';
  }

  private shouldShowTrustpilot(slug: string): boolean {
    return slug === '' || slug === 'home';
  }

  private shouldShowClientsAccreditations(slug: string): boolean {
    return slug === '' || slug === 'home';
  }

  private getSliderForPage(slug: string) {
    const sliderConfig: { [key: string]: number[] | string } = {
      '': [1056,739, 996, 997, 1022],
      'home': [1056,739, 996, 997, 1022],
    };

    const config = sliderConfig[slug];

    if (Array.isArray(config)) {
      return this.wpService.getMediaByIds(config);
    } else if (typeof config === 'string') {
      return this.wpService.getSliderImages(config);
    } else {
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

// header-improved.component.ts
import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';

import { Subject, takeUntil, filter } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { WordPressMenuItem, WordPressService2 } from '../app/wordpress.service2.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  menuItems: WordPressMenuItem[] = [];
  isMenuOpen = false;
  isScrolled = false;
  private destroy$ = new Subject<void>();
  wpService = inject(WordPressService2)

  constructor(
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMenu();
    this.setupRouterEvents();
    this.checkScrollPosition();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load primary navigation menu from WordPress
   */
  private loadMenu() {
    this.wpService.getPrimaryMenu()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items: WordPressMenuItem[]) => {
          this.menuItems = items;
          console.log('Menu loaded:', items);
        },
        error: (err: any) => {
          console.error('Error loading menu:', err);
          // Fallback menu if WordPress is unavailable
          this.menuItems = this.getFallbackMenu();
        }
      });
  }

  /**
   * Fallback menu structure if WordPress is unavailable
   */
  private getFallbackMenu(): WordPressMenuItem[] {
    return [
      { ID: 1, title: 'Home', url: '/', slug: 'home' },
      {
        ID: 2,
        title: 'Marquee Styles',
        url: '/marquee-styles',
        slug: 'marquee-styles',
        children: [
          { ID: 21, title: 'Wedding Marquees', url: '/wedding-marquees', slug: 'wedding-marquees' },
          { ID: 22, title: 'Corporate Events', url: '/corporate-events', slug: 'corporate-events' },
          { ID: 23, title: 'Festival Marquees', url: '/festival-marquees', slug: 'festival-marquees' }
        ]
      },
      {
        ID: 3,
        title: 'Accessories',
        url: '/accessories',
        slug: 'accessories',
        children: [
          { ID: 31, title: 'Furniture', url: '/furniture', slug: 'furniture' },
          { ID: 32, title: 'Lighting', url: '/lighting', slug: 'lighting' },
          { ID: 33, title: 'Flooring', url: '/flooring', slug: 'flooring' }
        ]
      },
      { ID: 4, title: 'Gallery', url: '/gallery', slug: 'gallery' },
      { ID: 5, title: 'Testimonials', url: '/testimonials', slug: 'testimonials' },
      { ID: 6, title: 'Service Areas', url: '/service-areas', slug: 'service-areas' },
      { ID: 7, title: 'Prices', url: '/prices', slug: 'prices' },
      { ID: 8, title: 'Contact Us', url: '/contact-us', slug: 'contact-us' }
    ];
  }

  /**
   * Setup router events to close mobile menu on navigation
   */
  private setupRouterEvents() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.closeMenu();
      });
  }

  /**
   * Toggle mobile menu
   */
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;

    // Prevent body scroll when menu is open
    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  /**
   * Close mobile menu
   */
  closeMenu() {
    this.isMenuOpen = false;
    document.body.style.overflow = '';
  }

  /**
   * Check if current route is active
   */
  isActive(slug: string): boolean {
    const currentUrl = this.router.url;

    // Home page check
    if (slug === 'home' || slug === '') {
      return currentUrl === '/' || currentUrl === '';
    }

    // Other pages
    return currentUrl.includes(`/${slug}`);
  }

  /**
   * Listen for scroll events to add shadow to header
   */
  @HostListener('window:scroll')
  onWindowScroll() {
    this.checkScrollPosition();
  }

  /**
   * Check scroll position and update header state
   */
  private checkScrollPosition() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isScrolled = scrollPosition > 20;

    // Add/remove class to header element
    const header = document.querySelector('.site-header');
    if (header) {
      if (this.isScrolled) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }

  /**
   * Handle dropdown toggle on mobile (click to open/close)
   */
  toggleDropdown(item: WordPressMenuItem, event: Event) {
    if (window.innerWidth <= 991) {
      event.preventDefault();
      const navItem = (event.target as HTMLElement).closest('.nav-item');
      navItem?.classList.toggle('active');
    }
  }

  /**
   * Close menu when clicking outside
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const header = document.querySelector('.site-header');

    if (this.isMenuOpen && header && !header.contains(target)) {
      this.closeMenu();
    }
  }

  /**
   * Close menu on ESC key press
   */
  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.isMenuOpen) {
      this.closeMenu();
    }
  }

  /**
   * Prevent default on dropdown links with children on mobile
   */
  handleDropdownClick(item: WordPressMenuItem, event: Event) {
    if (item.children && item.children.length > 0 && window.innerWidth <= 991) {
      event.preventDefault();
      this.toggleDropdown(item, event);
    }
  }
}

// header.component.ts - UPDATED
import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';

import { Subject, takeUntil, filter } from 'rxjs';
import { ContactPanelComponent } from '../contact-panel/contact-panel.component';
import { WordPressMenuItem, WordPressService2 } from '../services/wordpress.service.service';




@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ContactPanelComponent, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  menuItems: WordPressMenuItem[] = [];
  isMenuOpen = false;
  isScrolled = false;
  isContactPanelOpen = false;
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
   * Open contact panel
   */
  openContactPanel() {
    this.isContactPanelOpen = true;
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close contact panel (called from child component)
   */
  onContactPanelClose() {
    this.isContactPanelOpen = false;
    document.body.style.overflow = '';
  }

  /**
   * Handle navigation link clicks
   */
  handleNavClick(event: Event, item: WordPressMenuItem) {
    event.preventDefault();

    // For mobile: toggle dropdown if it has children
    if (item.children && item.children.length > 0 && window.innerWidth <= 991) {
      this.toggleDropdown(item, event);
    } else {
      // Close menu on navigation
      this.closeMenu();

      // Navigate to home or prices route
      if (item.slug === 'home' || item.slug === '') {
        this.router.navigate(['/']);
      } else if (item.slug === 'prices') {
        this.router.navigate(['/prices']);
      }
      // All other routes are disabled (do nothing)
    }
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

        },
        error: (err: any) => {

          this.menuItems = this.getFallbackMenu();
        }
      });
  }

  /**
   * Fallback menu structure if WordPress is unavailable
   */
  private getFallbackMenu(): WordPressMenuItem[] {
    return [
      { ID: 1, title: 'Home', url: '#', slug: 'home' },
      {
        ID: 2,
        title: 'Marquee Styles',
        url: '#',
        slug: 'marquee-styles',
        children: [
          { ID: 21, title: 'Wedding Marquees', url: '#', slug: 'wedding-marquees' },
          { ID: 22, title: 'Corporate Events', url: '#', slug: 'corporate-events' },
          { ID: 23, title: 'Festival Marquees', url: '#', slug: 'festival-marquees' }
        ]
      },
      {
        ID: 3,
        title: 'Accessories',
        url: '#',
        slug: 'accessories',
        children: [
          { ID: 31, title: 'Furniture', url: '#', slug: 'furniture' },
          { ID: 32, title: 'Lighting', url: '#', slug: 'lighting' },
          { ID: 33, title: 'Flooring', url: '#', slug: 'flooring' }
        ]
      },
      { ID: 4, title: 'Gallery', url: '#', slug: 'gallery' },
      { ID: 5, title: 'Testimonials', url: '#', slug: 'testimonials' },
      { ID: 6, title: 'Service Areas', url: '#', slug: 'service-areas' },
      { ID: 7, title: 'Prices', url: '#', slug: 'prices' },
      { ID: 8, title: 'Contact Us', url: '#', slug: 'contact-us' }
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

    if (slug === 'home' || slug === '') {
      return currentUrl === '/' || currentUrl === '';
    }

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
    if (this.isContactPanelOpen) {
      this.onContactPanelClose();
    }
  }
}

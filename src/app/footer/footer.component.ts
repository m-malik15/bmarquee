import { Component, OnInit } from '@angular/core';
import { WordPressMenuItem, WordPressService2 } from '../wordpress.service2.service';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [NgFor, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  footerMenuItems: WordPressMenuItem[] = [];
  currentYear = new Date().getFullYear();

  constructor(private wpService: WordPressService2) {}

  ngOnInit() {
    this.loadFooterMenu();
  }

  private loadFooterMenu() {
    // Try to get footer menu, fallback to hardcoded items if not available
    this.wpService.getFooterMenu().subscribe({
      next: (items) => {
        this.footerMenuItems = items;
        console.log('Footer menu loaded:', items);
      },
      error: (err) => {
        console.warn('Could not load footer menu, using fallback', err);
        this.footerMenuItems = this.getFallbackMenu();
      }
    });
  }

  private getFallbackMenu(): WordPressMenuItem[] {
    return [
      { ID: 1, title: 'Free Quotation', url: '/free-quotation', slug: 'free-quotation' },
      { ID: 2, title: 'FAQs', url: '/faqs', slug: 'faqs' },
      { ID: 3, title: 'Blog', url: '/blog', slug: 'blog' },
      { ID: 4, title: 'Quality & Safety', url: '/quality-safety', slug: 'quality-safety' },
      { ID: 5, title: 'Marquee Hire Terms', url: '/marquees-hire-terms', slug: 'marquees-hire-terms' },
      { ID: 6, title: 'Privacy Policy', url: '/data-privacy-policy', slug: 'data-privacy-policy' }
    ];
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}

// footer.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface FooterMenuItem {
  title: string;
  slug: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  newsletterEmail: string = '';
  showBackToTop: boolean = false;

  footerMenuItems: FooterMenuItem[] = [
    { title: 'Home', slug: 'home' },
    { title: 'About Us', slug: 'about' },
    { title: 'Our Services', slug: 'services' },
    { title: 'Meet The Team', slug: 'team' },
    { title: 'Latest Blog', slug: 'blog' },
    { title: 'Contact Us', slug: 'contact' }
  ];

  ngOnInit(): void {
    // Component initialization
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    // Show back to top button when scrolled down 300px
    this.showBackToTop = window.pageYOffset > 300;
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  onNewsletterSubmit(): void {
    if (this.newsletterEmail && this.isValidEmail(this.newsletterEmail)) {

      // Add your newsletter subscription logic here
      // Example: this.newsletterService.subscribe(this.newsletterEmail).subscribe(...)

      // Show success message (you can replace this with a proper notification service)
      alert('Thank you for subscribing to our newsletter!');
      this.newsletterEmail = '';
    } else {
      alert('Please enter a valid email address.');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

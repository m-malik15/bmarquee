// import { CommonModule } from '@angular/common';
// import { Component, inject, OnInit } from '@angular/core';
// import { DomSanitizer, SafeHtml, SafeValue } from '@angular/platform-browser';
// import { HeaderComponent } from '../header/header.component';

// import { WordPressPage, WordPressService } from '../app/wordpress.service';
// import { HeroSliderComponent } from '../hero-slider/hero-slider.component';


// export interface SlideImage {
//   url: string;
//   alt: string;
//   srcset?: string;
// }

// @Component({
//   selector: 'app-landing-pagev2',
//   standalone: true,
//   imports: [CommonModule, HeaderComponent, HeroSliderComponent],
//   templateUrl: './landing-v2.component.html',
//   styleUrl: './landing-v2.component.css'
// })
// export class LandingV2Component implements OnInit {
//   page: WordPressPage | null = null;
//   loading = false;
//   error: string | null = null;
//   sanitizedContent: SafeHtml = '';
//   sliderImages: SlideImage[] = [];

//   private wordpressService: WordPressService = inject(WordPressService)

//   constructor(

//     private sanitizer: DomSanitizer
//   ) { }

//   ngOnInit(): void {
//     this.loadLandingPage();
//   }

//   loadLandingPage(): void {
//     this.loading = true;
//     this.error = null;

//     this.wordpressService.getPageBySlug('home').subscribe({
//       next: (page: any) => {
//         if (page) {
//           this.page = page;
//           console.log("Page content:", page);
//           this.sliderImages = this.extractSliderImages(page.content.rendered);

//           // Extract slider images from content
//          // this.sliderImages = this.extractSliderImages(page.content.rendered);
//           console.log('🖼️  Extracted slider images:', this.sliderImages);

//           // Sanitize content for safe rendering
//           this.sanitizedContent = this.sanitizer.sanitize(1, page.content.rendered) || '';

//           this.loading = false;
//         } else {
//           // If 'home' doesn't exist, try to get the first page
//           this.wordpressService.getPages({ per_page: 1, orderby: 'menu_order', order: 'asc' })
//             .subscribe({
//               next: (pages: string | any[]) => {
//                 this.page = pages.length > 0 ? pages[0] : null;
//                 if (this.page) {
//                   this.sliderImages = this.extractSliderImages(this.page.content.rendered);
//                   this.sanitizedContent = this.sanitizer.sanitize(1, this.page.content.rendered) || '';
//                 }
//                 this.loading = false;
//               },
//               error: (err: any) => {
//                 console.error('❌ Error fetching pages:', err);
//                 this.error = 'Failed to load the landing page. Please check your internet connection and try again.';
//                 this.loading = false;
//               }
//             });
//         }
//       },
//       error: (err: any) => {
//         console.error('❌ Error fetching landing page:', err);
//         this.error = 'Failed to load the landing page. Please check your internet connection and try again.';
//         this.loading = false;
//       }
//     });
//   }

//   private extractSliderImages(htmlContent: string): SlideImage[] {
//     const images: SlideImage[] = [];

//     try {
//       const tempDiv = document.createElement('div');
//       tempDiv.innerHTML = htmlContent;

//       // Look for images in Kadence slider
//       const sliderImages = tempDiv.querySelectorAll('.kb-advanced-slide img, .kb-blocks-slider img');

//       sliderImages.forEach((img: Element) => {
//         const imgElement = img as HTMLImageElement;
//         const src = imgElement.getAttribute('src');
//         const alt = imgElement.getAttribute('alt') || 'Slide image';
//         const srcset = imgElement.getAttribute('srcset') || '';

//         if (src && src.trim()) {
//           // Get largest image from srcset if available
//           const srcsetParts = srcset.split(',').filter(s => s.trim());
//           const largestSrc = srcsetParts.length > 0
//             ? srcsetParts[srcsetParts.length - 1].trim().split(' ')[0]
//             : src;

//           images.push({
//             url: largestSrc || src,
//             alt: alt,
//             srcset: srcset
//           });
//         }
//       });

//       // Fallback: if no slider images, get first 4 images
//       if (images.length === 0) {
//         console.log('ℹ️  No Kadence slider images found, extracting from general content');
//         const allImages = tempDiv.querySelectorAll('img');

//         Array.from(allImages).slice(0, 4).forEach((img: Element) => {
//           const imgElement = img as HTMLImageElement;
//           const src = imgElement.getAttribute('src');
//           const alt = imgElement.getAttribute('alt') || 'Image';
//           const srcset = imgElement.getAttribute('srcset') || '';

//           if (src && src.trim() && !src.includes('data:image')) {
//             images.push({
//               url: src,
//               alt: alt,
//               srcset: srcset
//             });
//           }
//         });
//       }

//       console.log(`📊 Found ${images.length} images for slider`);

//     } catch (error) {
//       console.error('❌ Error extracting slider images:', error);
//     }

//     return images;
//   }

//   /**
//    * Remove Kadence slider HTML from content to avoid duplicate display
//    */
//   private removeSliderFromContent(htmlContent: string): string {
//     const tempDiv = document.createElement('div');
//     tempDiv.innerHTML = htmlContent;

//     // Remove Kadence slider blocks
//     const sliders = tempDiv.querySelectorAll('.kb-advanced-slider, .kb-blocks-slider');
//     sliders.forEach(slider => slider.remove());

//     return tempDiv.innerHTML;
//   }
// }

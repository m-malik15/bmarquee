// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { WordPressService, WordPressPage } from './../wordpress.service';

// @Component({
//   selector: 'app-landing-page',
//   standalone: true,
//   imports: [CommonModule],
//    styleUrl: './landing-page.component.css',
//   templateUrl:  './landing-page.component.html',

// })
// export class LandingPageComponent implements OnInit {
//   page: WordPressPage | null = null;
//   loading = false;
//   error: string | null = null;

//   constructor(private wordpressService: WordPressService) {}

//   ngOnInit(): void {
//     this.loadLandingPage();
//   }

//   loadLandingPage(): void {
//     this.loading = true;
//     this.error = null;

//     // Try to fetch the landing page by slug 'home'
//     // You can change 'home' to match your WordPress page slug
//     this.wordpressService.getPageBySlug('home').subscribe({
//       next: (page) => {
//         if (page) {
//           this.page = page;
//           console.log("pagecontent",page);
//         } else {
//           // If 'home' doesn't exist, try to get the first page
//           this.wordpressService.getPages({ per_page: 1, orderby: 'menu_order', order: 'asc' })
//             .subscribe({
//               next: (pages) => {
//                 this.page = pages.length > 0 ? pages[0] : null;
//                 this.loading = false;
//               },
//               error: (err) => {
//                 console.error('Error fetching pages:', err);
//                 this.error = 'Failed to load the landing page. Please check your internet connection and try again.';
//                 this.loading = false;
//               }
//             });
//         }
//         this.loading = false;
//       },
//       error: (err) => {
//         console.error('Error fetching landing page:', err);
//         this.error = 'Failed to load the landing page. Please check your internet connection and try again.';
//         this.loading = false;
//       }
//     });
//   }
// }

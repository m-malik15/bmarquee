// // ===================================
// // USAGE EXAMPLES FOR WORDPRESS SERVICE
// // ===================================

// import { Component, OnInit } from '@angular/core';
// import { WordPressService2 } from '../wordpress.service2.service';

// @Component({
//   selector: 'app-example',
//   template: ''
// })
// export class ExampleComponent implements OnInit {

//   constructor(private wpService: WordPressService2) {}

//   ngOnInit() {
//     // Choose which example to run
//      //this.example1_GetPrimaryMenu();
//      // this.example2_GetAllMenus();
//      this.example3_GetPages();
//     // this.example4_GetCompleteWebsite();
//   }

//   /**
//    * EXAMPLE 1: Get Primary Navigation Menu
//    * This is the most common use case - replaces the old getKadencePrimaryMenu()
//    */
//   example1_GetPrimaryMenu() {
//     this.wpService.getPrimaryMenu().subscribe(menuItems => {
//       console.log('Primary Menu Items:', menuItems);

//       // Display menu
//       menuItems.forEach(item => {
//         console.log(`- ${item.title} (${item.url})`);
//         if (item.children && item.children.length > 0) {
//           item.children.forEach(child => {
//             console.log(`  - ${child.title} (${child.url})`);
//           });
//         }
//       });
//     });
//   }

//   /**
//    * EXAMPLE 2: Get All Menus and Their Locations
//    */
//   example2_GetAllMenus() {
//     // Get all menus
//     this.wpService.getMenus().subscribe(menus => {
//       console.log('Available Menus:', menus);

//       // For each menu, get its items
//       menus.forEach(menu => {
//         this.wpService.getMenuItems(menu.id).subscribe(items => {
//           console.log(`\nMenu: ${menu.name} (${menu.slug})`);
//           console.log('Items:', items);
//         });
//       });
//     });

//     // Get menu locations
//     this.wpService.getMenuLocations().subscribe(locations => {
//       console.log('Menu Locations:', locations);
//       // Example output: { primary: {...}, footer: {...} }
//     });
//   }

//   /**
//    * EXAMPLE 3: Get All Pages with Images
//    */
//   example3_GetPages() {
//     this.wpService.getPages({ per_page: 100 }).subscribe(pages => {
//       console.log(`Found ${pages.length} pages`);

//       pages.forEach(page => {
//         console.log(`\nPage: ${page.title.rendered}`);
//         console.log(`Slug: ${page.slug}`);
//         console.log(`Link: ${page.link}`);

//         // Check for featured image
//         if (page._embedded?.['wp:featuredmedia']?.[0]) {
//           const featuredImage = page._embedded['wp:featuredmedia'][0];
//           console.log(`Featured Image: ${featuredImage.source_url}`);
//         }
//       });
//     });
//   }

//   /**
//    * EXAMPLE 4: Get Complete Website Data
//    * This fetches EVERYTHING in one call
//    */
//   example4_GetCompleteWebsite() {
//     this.wpService.getCompleteWebsiteData().subscribe(data => {
//       console.log('=== COMPLETE WEBSITE DATA ===');

//       console.log('\n--- Site Info ---');
//       console.log(data.siteInfo);

//       console.log('\n--- Menus ---');
//       console.log(`Found ${data.menus.length} menus`);

//       console.log('\n--- Menu Locations ---');
//       console.log(data.menuLocations);

//       console.log('\n--- Primary Menu ---');
//       console.log(data.primaryMenuItems);

//       console.log('\n--- Pages ---');
//       console.log(`Found ${data.pages.length} pages`);

//       console.log('\n--- Posts ---');
//       console.log(`Found ${data.posts.length} posts`);

//       console.log('\n--- Media ---');
//       console.log(`Found ${data.media.length} media items`);

//       console.log('\n--- Kadence Headers ---');
//       console.log(`Found ${data.kadenceHeaders?.length || 0} custom headers`);

//       console.log('\n--- Kadence Elements ---');
//       console.log(`Found ${data.kadenceElements?.length || 0} custom elements`);

//       console.log('\n--- Kadence Navigation ---');
//       console.log(`Found ${data.kadenceNavigation?.length || 0} navigation blocks`);
//     });
//   }

//   /**
//    * EXAMPLE 5: Get Specific Page by Slug
//    */
//   example5_GetPageBySlug() {
//     this.wpService.getPageBySlug('home').subscribe(page => {
//       if (page) {
//         console.log('Home Page:', page);
//         console.log('Title:', page.title.rendered);
//         console.log('Content:', page.content.rendered);
//       } else {
//         console.log('Page not found');
//       }
//     });
//   }

//   /**
//    * EXAMPLE 6: Get All Media (Images)
//    */
//   example6_GetAllMedia() {
//     this.wpService.getMedia({ per_page: 100 }).subscribe(media => {
//       console.log(`Found ${media.length} media items`);

//       media.forEach(item => {
//         if (item.media_type === 'image') {
//           console.log(`Image: ${item.title.rendered}`);
//           console.log(`URL: ${item.source_url}`);
//           console.log(`Alt Text: ${item.alt_text}`);
//           console.log('---');
//         }
//       });
//     });
//   }

//   /**
//    * EXAMPLE 7: Get Kadence Custom Elements
//    */
//   example7_GetKadenceElements() {
//     // Get custom headers
//     this.wpService.getKadenceHeaders().subscribe(headers => {
//       console.log('Kadence Headers:', headers);
//     });

//     // Get custom elements
//     this.wpService.getKadenceElements().subscribe(elements => {
//       console.log('Kadence Elements:', elements);
//     });

//     // Get navigation blocks
//     this.wpService.getKadenceNavigation().subscribe(navBlocks => {
//       console.log('Kadence Navigation Blocks:', navBlocks);
//     });

//     // Get forms
//     this.wpService.getKadenceForms().subscribe(forms => {
//       console.log('Kadence Forms:', forms);
//     });
//   }

//   /**
//    * EXAMPLE 8: Build Navigation Component
//    */
//   buildNavigationHTML() {
//     this.wpService.getPrimaryMenu().subscribe(menuItems => {
//       const navHtml = this.buildMenuHTML(menuItems);
//       console.log('Navigation HTML:', navHtml);
//       // You can now inject this into your component template
//     });
//   }

//   private buildMenuHTML(items: any[], level: number = 0): string {
//     let html = `<ul class="menu level-${level}">`;

//     items.forEach(item => {
//       html += `<li class="menu-item">`;
//       html += `<a href="${item.url}" target="${item.target}">${item.title}</a>`;

//       if (item.children && item.children.length > 0) {
//         html += this.buildMenuHTML(item.children, level + 1);
//       }

//       html += `</li>`;
//     });

//     html += `</ul>`;
//     return html;
//   }
// }

// // ===================================
// // MIGRATION GUIDE
// // ===================================

// /*
// OLD CODE (using non-existent endpoint):
// --------------------------------------
// this.wpService.getKadencePrimaryMenu().subscribe(menu => {
//   this.navigationItems = menu;
// });


// NEW CODE (using correct endpoints):
// -----------------------------------
// this.wpService.getPrimaryMenu().subscribe(menu => {
//   this.navigationItems = menu;
// });


// ALTERNATIVE - Get All Menus:
// ----------------------------
// this.wpService.getMenus().subscribe(menus => {
//   console.log('All menus:', menus);

//   // Get items for first menu
//   if (menus.length > 0) {
//     this.wpService.getMenuItems(menus[0].id).subscribe(items => {
//       this.navigationItems = items;
//     });
//   }
// });


// COMPLETE WEBSITE DATA:
// ---------------------
// this.wpService.getCompleteWebsiteData().subscribe(data => {
//   this.siteData = data;
//   this.navigation = data.primaryMenuItems;
//   this.pages = data.pages;
//   this.images = data.media;
// });
// */

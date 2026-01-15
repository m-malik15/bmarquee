// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, map, catchError, of } from 'rxjs';

// export interface WordPressPage {
//   id: number;
//   date: string;
//   modified: string;
//   slug: string;
//   status: string;
//   type: string;
//   link: string;
//   title: {
//     rendered: string;
//   };
//   content: {
//     rendered: string;
//     protected: boolean;
//   };
//   excerpt: {
//     rendered: string;
//     protected: boolean;
//   };
//   featured_media: number;
//   parent: number;
//   menu_order: number;
//   acf?: any;
//   _embedded?: {
//     'wp:featuredmedia'?: Array<{
//       source_url: string;
//       alt_text: string;
//     }>;
//   };
// }

// export interface WordPressMenuItem {
//   ID: number;
//   title: string;
//   url: string;
//   slug: string;
//   target: string;
//   classes: string[];
//   menu_item_parent: string;
//   object: string;
//   object_id: number;
//   children?: WordPressMenuItem[];
// }

// export interface KadenceMenuItem {
//   title: string;
//   url: string;
//   parent_id: string;
//   children?: KadenceMenuItem[];
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class WordPressService {
//   private readonly WP_API_BASE = 'https://www.staging2.bailliesmarquees.co.uk/wp-json/wp/v2';
//   private readonly WP_SITE_URL = 'https://www.staging2.bailliesmarquees.co.uk';

//   constructor(private http: HttpClient) {}

//   /**
//    * Get Kadence theme customizations including menus
//    */
//   getKadenceCustomizations(): Observable<any> {
//     const url = `${this.WP_SITE_URL}/wp-json/kadence/v1/customizations`;
//     return this.http.get<any>(url);
//   }

//   /**
//    * Get primary navigation menu from Kadence
//    */
//   getKadencePrimaryMenu(): Observable<WordPressMenuItem[]> {
//     return this.getKadenceCustomizations().pipe(
//       map(data => {
//         if (data?.menus?.primary_navigation) {
//           return this.buildKadenceMenuHierarchy(data.menus.primary_navigation);
//         }
//         return [];
//       }),
//       catchError(error => {
//         console.error('Error fetching Kadence menu:', error);
//         return of([]);
//       })
//     );
//   }

//   /**
//    * Build menu hierarchy from Kadence menu items
//    * FIXED: Properly infers WordPress menu item IDs from parent_id references
//    */
//   private buildKadenceMenuHierarchy(items: KadenceMenuItem[]): WordPressMenuItem[] {
//     console.log('Building menu from', items.length, 'items');

//     // Step 1: Infer WordPress IDs for top-level items
//     // The pattern: if item[i] is top-level and item[i+1].parent_id !== "0",
//     // then item[i]'s WordPress ID is item[i+1].parent_id
//     const inferredIds = new Map<number, string>();

//     items.forEach((item, index) => {
//       if (item.parent_id === '0') {
//         // This is a top-level item
//         // Check if next items are children of this one
//         if (index + 1 < items.length && items[index + 1].parent_id !== '0') {
//           // The next item's parent_id is this item's WordPress ID
//           inferredIds.set(index, items[index + 1].parent_id);
//         } else {
//           // No children detected, assign a unique ID
//           inferredIds.set(index, `menu_item_${index}`);
//         }
//       }
//     });

//     console.log('Inferred IDs for top-level items:', Array.from(inferredIds.entries()));

//     // Step 2: Create menu items with proper IDs
//     const menuItems: WordPressMenuItem[] = items.map((item, index) => ({
//       ID: index,
//       title: this.decodeHtmlEntities(item.title),
//       url: item.url,
//       slug: this.extractSlug(item.url),
//       target: '',
//       classes: [],
//       menu_item_parent: item.parent_id,
//       object: 'custom',
//       object_id: 0,
//       children: []
//     }));

//     // Step 3: Build hierarchy by matching parent_id to inferred IDs
//     const rootItems: WordPressMenuItem[] = [];

//     menuItems.forEach((item, index) => {
//       if (item.menu_item_parent === '0') {
//         // Top-level item
//         rootItems.push(item);
//       } else {
//         // Child item - find parent by matching inferred ID to parent_id
//         const parentIndex = Array.from(inferredIds.entries())
//           .find(([idx, id]) => id === item.menu_item_parent)?.[0];

//         if (parentIndex !== undefined && menuItems[parentIndex]) {
//           if (!menuItems[parentIndex].children) {
//             menuItems[parentIndex].children = [];
//           }
//           menuItems[parentIndex].children!.push(item);
//         } else {
//           console.warn(`Could not find parent for item "${item.title}" with parent_id "${item.menu_item_parent}"`);
//         }
//       }
//     });

//     console.log('Built menu structure:', rootItems);
//     rootItems.forEach(item => {
//       console.log(`- ${item.title} (${item.children?.length || 0} children)`);
//       item.children?.forEach(child => {
//         console.log(`  - ${child.title}`);
//       });
//     });

//     return rootItems;
//   }

//   /**
//    * Decode HTML entities (like &#038; to &)
//    */
//   private decodeHtmlEntities(text: string): string {
//     const textarea = document.createElement('textarea');
//     textarea.innerHTML = text;
//     return textarea.value;
//   }

//   /**
//    * Extract slug from URL
//    */
//   private extractSlug(url: string): string {
//     try {
//       const urlObj = new URL(url);
//       const pathname = urlObj.pathname;
//       const segments = pathname.split('/').filter(s => s);
//       return segments[segments.length - 1] || 'home';
//     } catch {
//       return url.replace(/[^a-z0-9]/gi, '-').toLowerCase();
//     }
//   }

//   /**
//    * Get site settings
//    */
//   getSiteSettings(): Observable<any> {
//     const url = `${this.WP_SITE_URL}/wp-json`;
//     return this.http.get<any>(url).pipe(
//       map(response => ({
//         name: response.name,
//         description: response.description,
//         url: response.url,
//         home: response.home
//       })),
//       catchError(() => {
//         return of({
//           name: 'Baillies Marquees',
//           description: '',
//           url: this.WP_SITE_URL,
//           home: this.WP_SITE_URL
//         });
//       })
//     );
//   }

//   /**
//    * Get custom logo URL
//    */
//   getCustomLogo(): Observable<string | null> {
//     return of('https://www.staging2.bailliesmarquees.co.uk/wp-content/uploads/BAILLIES-LOGO-WITH-FONT.svg');
//   }

//   /**
//    * Get all pages
//    */
//   getPages(params?: { per_page?: number; orderby?: string; order?: string }): Observable<WordPressPage[]> {
//     const queryParams = new URLSearchParams();
//     if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
//     if (params?.orderby) queryParams.append('orderby', params.orderby);
//     if (params?.order) queryParams.append('order', params.order);
//     queryParams.append('_embed', 'true');

//     const url = `${this.WP_API_BASE}/pages?${queryParams.toString()}`;
//     return this.http.get<WordPressPage[]>(url);
//   }

//   /**
//    * Get a specific page by slug
//    */
//   getPageBySlug(slug: string): Observable<WordPressPage | null> {
//     const url = `${this.WP_API_BASE}/pages?slug=${slug}&_embed=true`;
//     return this.http.get<WordPressPage[]>(url).pipe(
//       map(pages => pages.length > 0 ? pages[0] : null)
//     );
//   }

//   /**
//    * Get a specific page by ID
//    */
//   getPageById(id: number): Observable<WordPressPage> {
//     const url = `${this.WP_API_BASE}/pages/${id}?_embed=true`;
//     return this.http.get<WordPressPage>(url);
//   }

//   /**
//    * Get the front page
//    */
//   getFrontPage(): Observable<WordPressPage | null> {
//     return this.getPageBySlug('home');
//   }

//   /**
//    * Get posts
//    */
//   getPosts(params?: { per_page?: number; categories?: number }): Observable<any[]> {
//     const queryParams = new URLSearchParams();
//     if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
//     if (params?.categories) queryParams.append('categories', params.categories.toString());
//     queryParams.append('_embed', 'true');

//     const url = `${this.WP_API_BASE}/posts?${queryParams.toString()}`;
//     return this.http.get<any[]>(url);
//   }
// }

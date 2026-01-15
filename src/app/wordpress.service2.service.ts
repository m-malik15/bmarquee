// wordpress.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of, switchMap } from 'rxjs';

// ============================================
// INTERFACES
// ============================================

export interface WordPressPage {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
      media_details?: {
        sizes?: {
          medium?: { source_url: string };
          large?: { source_url: string };
          thumbnail?: { source_url: string };
        };
      };
    }>;
  };
}

export interface WordPressPost {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  categories: number[];
  _embedded?: any;
}

export interface WordPressMenuItem {
  ID: number;
  title: string;
  url: string;
  slug: string;
  children?: WordPressMenuItem[];
}

export interface SliderData {
  images: Array<{
    url: string;
    alt: string;
    caption?: string;
  }>;
  settings: {
    autoplay: boolean;
    speed: number;
    loop: boolean;
  };
}

export interface PageData {
  page: WordPressPage;
  sliderData: SliderData | null;
  cleanContent: string;
  metaTags: {
    title: string;
    description: string;
    ogImage: string;
    canonical: string;
  };
}

export interface MediaItem {
  id: number;
  title: string;
  alt_text: string;
  caption: string;
  description: string;
  media_type: 'image' | 'video' | 'file';
  mime_type: string;
  source_url: string;
  sizes: {
    thumbnail?: { source_url: string; width: number; height: number };
    medium?: { source_url: string; width: number; height: number };
    large?: { source_url: string; width: number; height: number };
    full?: { source_url: string; width: number; height: number };
  };
}

export interface MediaResponse {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  alt_text: string;
  caption: { rendered: string };
  description: { rendered: string };
  media_type: string;
  mime_type: string;
  source_url: string;
  media_details: {
    width: number;
    height: number;
    sizes: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WordPressService2 {
  private readonly API_BASE = 'https://www.staging2.bailliesmarquees.co.uk/wp-json/wp/v2';
  private readonly SITE_URL = 'https://www.staging2.bailliesmarquees.co.uk';
  private readonly USERNAME = 'mmalik15';
  private readonly APP_PASSWORD = 'xY3D 2can Bbgq L7EA Kbun uUgb';

  constructor(private http: HttpClient) {}

  // ============================================
  // PAGES
  // ============================================

  /**
   * Get page by slug or home page if empty
   */
  getPage(slug: string = ''): Observable<PageData> {
    const pageObservable = !slug || slug === 'home'
      ? this.getFrontPage()
      : this.getPageBySlug(slug);

    return pageObservable.pipe(
      map(page => {
        if (!page) throw new Error('Page not found');

        // Extract slider data from content
        const sliderData = this.extractSliderData(page.content.rendered);

        // Remove slider and other blocks from content
        const cleanContent = this.cleanContent(page.content.rendered);

        // Build meta tags
        const metaTags = {
          title: this.stripHtml(page.title.rendered),
          description: this.stripHtml(page.excerpt.rendered).substring(0, 160),
          ogImage: page._embedded?.['wp:featuredmedia']?.[0]?.source_url || '',
          canonical: page.link
        };

        return { page, sliderData, cleanContent, metaTags };
      })
    );
  }

  /**
   * Get page by slug
   */
  private getPageBySlug(slug: string): Observable<WordPressPage | null> {
    const url = `${this.API_BASE}/pages?slug=${slug}&_embed=true`;
    return this.http.get<WordPressPage[]>(url).pipe(
      map(pages => pages.length > 0 ? pages[0] : null),
      catchError(() => of(null))
    );
  }

  /**
   * Get front/home page
   */
  private getFrontPage(): Observable<WordPressPage | null> {
    return this.getPageBySlug('home');
  }

  /**
   * Get all pages
   */
  getPages(perPage: number = 100): Observable<WordPressPage[]> {
    const url = `${this.API_BASE}/pages?per_page=${perPage}&_embed=true`;
    return this.http.get<WordPressPage[]>(url).pipe(
      catchError(() => of([]))
    );
  }

  // ============================================
  // POSTS
  // ============================================

  /**
   * Get all posts
   */
  getPosts(params?: { per_page?: number; categories?: number }): Observable<WordPressPost[]> {
    const queryParams = new URLSearchParams({
      per_page: (params?.per_page || 10).toString(),
      _embed: 'true'
    });

    if (params?.categories) {
      queryParams.append('categories', params.categories.toString());
    }

    const url = `${this.API_BASE}/posts?${queryParams}`;
    return this.http.get<WordPressPost[]>(url).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Get post by slug
   */
  getPost(slug: string): Observable<WordPressPost | null> {
    const url = `${this.API_BASE}/posts?slug=${slug}&_embed=true`;
    return this.http.get<WordPressPost[]>(url).pipe(
      map(posts => posts.length > 0 ? posts[0] : null),
      catchError(() => of(null))
    );
  }

  // ============================================
  // MENU
  // ============================================

  /**
   * Get primary navigation menu
   */
  getPrimaryMenu(): Observable<WordPressMenuItem[]> {
    return this.getMenuLocation('primary').pipe(
      switchMap(location => {
        if (location?.menu) {
          return this.getMenuItems(location.menu);
        }
        return of([]);
      })
    );
  }

  private getMenuLocation(location: string): Observable<any> {
    const url = `${this.API_BASE}/menu-locations/${location}`;
    return this.http.get<any>(url, this.authHeaders()).pipe(
      catchError(() => of(null))
    );
  }

  private getMenuItems(menuId: number): Observable<WordPressMenuItem[]> {
    const url = `${this.API_BASE}/menu-items?menus=${menuId}&per_page=100`;
    return this.http.get<any[]>(url, this.authHeaders()).pipe(
      map(items => this.buildMenuHierarchy(items)),
      catchError(() => of([]))
    );
  }

  // ============================================
  // CONTENT EXTRACTION
  // ============================================

  /**
   * Extract slider data from WordPress content
   */
  private extractSliderData(content: string): SliderData | null {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    // Find any slider element (Kadence, Gutenberg gallery, etc.)
    const slider = doc.querySelector('.kb-blocks-slider, .splide, .wp-block-gallery');
    if (!slider) return null;

    const images: SliderData['images'] = [];

    // Extract images from slides
    const slideImages = slider.querySelectorAll('img');
    slideImages.forEach(img => {
      const url = img.src || img.getAttribute('data-src') || '';
      if (url) {
        images.push({
          url,
          alt: img.alt || '',
          caption: img.closest('figure')?.querySelector('figcaption')?.textContent || ''
        });
      }
    });

    if (images.length === 0) return null;

    return {
      images,
      settings: {
        autoplay: true,
        speed: 5000,
        loop: true
      }
    };
  }

  /**
   * Clean WordPress content - remove blocks we handle separately
   */
  private cleanContent(content: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    // Remove sliders (we handle them separately)
    doc.querySelectorAll('.kb-blocks-slider, .splide, .kb-splide').forEach(el => el.remove());

    // Remove Kadence-specific wrapper classes but keep content
    doc.querySelectorAll('[class*="kb-"], [class*="kadence"]').forEach(el => {
      // Only remove wrapper divs, not content elements
      if (el.tagName === 'DIV' && !el.querySelector('img, p, h1, h2, h3, h4, h5, h6')) {
        const parent = el.parentNode;
        while (el.firstChild) {
          parent?.insertBefore(el.firstChild, el);
        }
        el.remove();
      }
    });

    return doc.body.innerHTML;
  }

  // ============================================
// MEDIA METHODS
// ============================================

/**
 * Get all media items
 */
getMedia(params?: {
  per_page?: number;
  page?: number;
  search?: string;
  media_type?: 'image' | 'video' | 'file';
  mime_type?: string;
}): Observable<MediaItem[]> {
  const queryParams = new URLSearchParams({
    per_page: (params?.per_page || 100).toString(),
    _fields: 'id,title,alt_text,caption,description,media_type,mime_type,source_url,media_details'
  });

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.media_type) queryParams.append('media_type', params.media_type);
  if (params?.mime_type) queryParams.append('mime_type', params.mime_type);

  const url = `${this.API_BASE}/media?${queryParams}`;

  return this.http.get<MediaResponse[]>(url).pipe(
    map(items => items.map(item => this.transformMediaItem(item))),
    catchError(() => of([]))
  );
}

/**
 * Get specific media items by IDs
 */
getMediaByIds(ids: number[]): Observable<MediaItem[]> {
  if (ids.length === 0) return of([]);

  const url = `${this.API_BASE}/media?include=${ids.join(',')}&_fields=id,title,alt_text,caption,description,media_type,mime_type,source_url,media_details`;

  return this.http.get<MediaResponse[]>(url).pipe(
    map(items => items.map(item => this.transformMediaItem(item))),
    catchError(() => of([]))
  );
}

/**
 * Get single media item by ID
 */
getMediaById(id: number): Observable<MediaItem | null> {
  const url = `${this.API_BASE}/media/${id}?_fields=id,title,alt_text,caption,description,media_type,mime_type,source_url,media_details`;

  return this.http.get<MediaResponse>(url).pipe(
    map(item => this.transformMediaItem(item)),
    catchError(() => of(null))
  );
}

/**
 * Search media by name/title
 */
searchMedia(searchTerm: string, mediaType?: 'image' | 'video'): Observable<MediaItem[]> {
  return this.getMedia({
    search: searchTerm,
    media_type: mediaType,
    per_page: 50
  });
}

/**
 * Get images only (filter by mime type)
 */
getImages(params?: { per_page?: number; search?: string }): Observable<MediaItem[]> {
  return this.getMedia({
    ...params,
    media_type: 'image'
  });
}

/**
 * Get images for slider (by naming convention)
 * Example: Get all images with "slider" or "hero" in the name
 */
getSliderImages(keyword: string = 'slider'): Observable<MediaItem[]> {
  return this.searchMedia(keyword, 'image');
}

/**
 * Get images for specific section (by alt text or title)
 */
getImagesByCategory(category: string): Observable<MediaItem[]> {
  return this.searchMedia(category, 'image');
}

/**
 * Transform WordPress media response to clean format
 */
private transformMediaItem(item: MediaResponse): MediaItem {
  return {
    id: item.id,
    title: this.stripHtml(item.title.rendered),
    alt_text: item.alt_text || '',
    caption: this.stripHtml(item.caption.rendered),
    description: this.stripHtml(item.description.rendered),
    media_type: item.media_type as 'image' | 'video' | 'file',
    mime_type: item.mime_type,
    source_url: item.source_url,
    sizes: {
      thumbnail: item.media_details?.sizes?.thumbnail ? {
        source_url: item.media_details.sizes.thumbnail.source_url,
        width: item.media_details.sizes.thumbnail.width,
        height: item.media_details.sizes.thumbnail.height
      } : undefined,
      medium: item.media_details?.sizes?.medium ? {
        source_url: item.media_details.sizes.medium.source_url,
        width: item.media_details.sizes.medium.width,
        height: item.media_details.sizes.medium.height
      } : undefined,
      large: item.media_details?.sizes?.large ? {
        source_url: item.media_details.sizes.large.source_url,
        width: item.media_details.sizes.large.width,
        height: item.media_details.sizes.large.height
      } : undefined,
      full: {
        source_url: item.source_url,
        width: item.media_details?.width || 0,
        height: item.media_details?.height || 0
      }
    }
  };
}

  // ============================================
  // UTILITIES
  // ============================================

  private authHeaders(): { headers: HttpHeaders } {
    const credentials = btoa(`${this.USERNAME}:${this.APP_PASSWORD}`);
    return {
      headers: new HttpHeaders({
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      })
    };
  }

  private buildMenuHierarchy(items: any[]): WordPressMenuItem[] {
    const map = new Map<number, WordPressMenuItem>();
    const roots: WordPressMenuItem[] = [];

    // Create all items
    items.forEach(item => {
      map.set(item.id, {
        ID: item.id,
        title: this.stripHtml(item.title?.rendered || item.title || ''),
        url: item.url,
        slug: this.extractSlug(item.url),
        children: []
      });
    });

    // Build hierarchy
    items.forEach(item => {
      const menuItem = map.get(item.id);
      const parentId = parseInt(item.menu_item_parent || item.parent || 0);

      if (menuItem) {
        if (parentId === 0 || !map.has(parentId)) {
          roots.push(menuItem);
        } else {
          const parent = map.get(parentId);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(menuItem);
          }
        }
      }
    });

    return roots;
  }

  getFooterMenu(): Observable<WordPressMenuItem[]> {
  return this.getMenuLocation('footer').pipe(
    switchMap(location => {
      if (location?.menu) {
        return this.getMenuItems(location.menu);
      }
      return of([]);
    })
  );
}

  private stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  private extractSlug(url: string): string {
    try {
      const urlObj = new URL(url);
      const segments = urlObj.pathname.split('/').filter(s => s);
      return segments[segments.length - 1] || 'home';
    } catch {
      return url.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    }
  }
}

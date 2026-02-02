// src/app/services/content-cleaner.service.ts
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class ContentCleanerService {

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Remove WordPress inline styles and class attributes for clean Angular styling
   */
  cleanWordPressContent(htmlContent: string, options: CleanOptions = {}): string {
    const {
      removeStyles = true,
      removeInlineStyles = true,
      removeClasses = false,
      preserveClasses = [],
      removeIds = false,
      preserveIds = []
    } = options;

    let cleaned = htmlContent;

    // 1. Remove ALL <style> tags and their content
    if (removeStyles) {
      cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    }

    // 2. Remove inline style attributes
    if (removeInlineStyles) {
      cleaned = cleaned.replace(/\s*style="[^"]*"/gi, '');
      cleaned = cleaned.replace(/\s*style='[^']*'/gi, '');
    }

    // 3. Remove class attributes (optional, preserve specific classes)
    if (removeClasses) {
      if (preserveClasses.length > 0) {
        // Only remove classes not in preserve list
        cleaned = this.removeClassesExcept(cleaned, preserveClasses);
      } else {
        // Remove all classes
        cleaned = cleaned.replace(/\s*class="[^"]*"/gi, '');
        cleaned = cleaned.replace(/\s*class='[^']*'/gi, '');
      }
    }

    // 4. Remove ID attributes (optional, preserve specific IDs)
    if (removeIds) {
      if (preserveIds.length > 0) {
        cleaned = this.removeIdsExcept(cleaned, preserveIds);
      } else {
        cleaned = cleaned.replace(/\s*id="[^"]*"/gi, '');
        cleaned = cleaned.replace(/\s*id='[^']*'/gi, '');
      }
    }

    return cleaned;
  }

  /**
   * Clean and sanitize WordPress content for Angular rendering
   */
  cleanAndSanitize(htmlContent: string, options: CleanOptions = {}): SafeHtml {
    const cleaned = this.cleanWordPressContent(htmlContent, options);
    return this.sanitizer.bypassSecurityTrustHtml(cleaned);
  }

  /**
   * Remove specific WordPress classes
   */
  removeWordPressClasses(htmlContent: string): string {
    const wpClasses = [
      'wp-block-',
      'kb-row-',
      'kt-',
      'kadence-',
      'alignnone',
      'aligncenter',
      'alignleft',
      'alignright',
      'is-layout-',
      'wp-container-'
    ];

    let cleaned = htmlContent;
    wpClasses.forEach(wpClass => {
      const regex = new RegExp(`\\s*${wpClass}[\\w-]*`, 'gi');
      cleaned = cleaned.replace(regex, '');
    });

    return cleaned;
  }

  /**
   * Remove empty class attributes
   */
  removeEmptyClassAttributes(htmlContent: string): string {
    return htmlContent.replace(/\s*class=""\s*/gi, ' ');
  }

  /**
   * Preserve specific table structure classes
   */
  preserveTableStructure(htmlContent: string): string {
    // Keep essential table classes for pricing tables
    const essentialClasses = ['bm-prices-tables'];
    // Implementation would preserve these classes while removing others
    return htmlContent;
  }

  /**
   * Helper: Remove classes except specified ones
   */
  private removeClassesExcept(html: string, preserveClasses: string[]): string {
    return html.replace(/class="([^"]*)"/gi, (match, classNames) => {
      const classes = classNames.split(' ').filter((cls: string) =>
        preserveClasses.some(preserve => cls.includes(preserve))
      );
      return classes.length > 0 ? `class="${classes.join(' ')}"` : '';
    });
  }

  /**
   * Helper: Remove IDs except specified ones
   */
  private removeIdsExcept(html: string, preserveIds: string[]): string {
    return html.replace(/id="([^"]*)"/gi, (match, idValue) => {
      return preserveIds.includes(idValue) ? match : '';
    });
  }

  /**
   * Extract plain text from HTML
   */
  extractPlainText(htmlContent: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = htmlContent;
    return tmp.textContent || tmp.innerText || '';
  }

  /**
   * Check if content has WordPress styling
   */
  hasWordPressStyles(htmlContent: string): boolean {
    return /<style[^>]*>[\s\S]*?<\/style>/gi.test(htmlContent);
  }
}

export interface CleanOptions {
  removeStyles?: boolean;
  removeInlineStyles?: boolean;
  removeClasses?: boolean;
  preserveClasses?: string[];
  removeIds?: boolean;
  preserveIds?: string[];
}

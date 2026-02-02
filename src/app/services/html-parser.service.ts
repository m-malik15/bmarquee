import { Injectable } from '@angular/core';
import { CardData } from '../card/card.component';



export interface CtaData {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export interface TrustpilotData {
  title: string;
  clientsTitle: string;
  clientsImage: string;
  clientsImageAlt: string;
}

export interface ContentSections {
  beforeCta: string;
  afterCta: string;
}

export interface ClientLogo {
  src: string;
  alt: string;
}

export interface Accreditation {
  src: string;
  alt: string;
  title?: string;
}

export interface ClientsAccreditationsData {
  clientsTitle: string;
  clients: ClientLogo[];
  accreditationsTitle: string;
  accreditations: Accreditation[];
}

@Injectable({
  providedIn: 'root'
})
export class HtmlParserService {

  constructor() { }

  /**
   * Parse WordPress page content and extract ALL card data
   */
  parseCardsFromContent(htmlContent: string): CardData[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const cards: CardData[] = [];

    const cardElements = doc.querySelectorAll('.kadence-column.bm-card-grow, .wp-block-kadence-column.kb-section-has-link');

    cardElements.forEach((cardElement) => {
      const card = this.extractCardData(cardElement as HTMLElement);
      if (card) {
        cards.push(card);
      }
    });

    return cards;
  }

  /**
   * Extract individual card data from HTML element
   */
  private extractCardData(element: HTMLElement): CardData | null {
    try {
      const titleElement = element.querySelector('h2.wp-block-heading');
      const title = titleElement?.textContent?.trim() || '';

      const imageElement = element.querySelector('img.kb-img, figure img');
      const image = imageElement?.getAttribute('src') ||
                    imageElement?.getAttribute('data-src') || '';

      const descriptionElement = element.querySelector('p.kt-adv-heading, p.enable-read-more');
      const description = descriptionElement?.textContent?.trim() || '';

      const linkElement = element.querySelector('a.kb-section-link-overlay, a[href]');
      const link = linkElement?.getAttribute('href') || '#';

      if (title && image) {
        return {
          title,
          image,
          description,
          link
        };
      }

      return null;
    } catch (error) {
      console.error('Error extracting card data:', error);
      return null;
    }
  }

  /**
   * Remove cards section from HTML content to avoid duplication
   */
  removeCardsFromContent(htmlContent: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const cardElements = doc.querySelectorAll('.kadence-column.bm-card-grow, .wp-block-kadence-column.kb-section-has-link');
    cardElements.forEach(element => {
      const parentRow = element.closest('.kb-row-layout-wrap');
      if (parentRow) {
        const allChildren = parentRow.querySelectorAll('.kadence-column, .wp-block-kadence-column');
        const cardChildren = parentRow.querySelectorAll('.kadence-column.bm-card-grow, .wp-block-kadence-column.kb-section-has-link');

        if (allChildren.length === cardChildren.length) {
          parentRow.remove();
        } else {
          element.remove();
        }
      } else {
        element.remove();
      }
    });

    return doc.body.innerHTML;
  }

  /**
   * Split cards into sections of specified size
   */
  splitCardsIntoSections(cards: CardData[], sectionSize: number = 3): CardData[][] {
    const sections: CardData[][] = [];

    for (let i = 0; i < cards.length; i += sectionSize) {
      sections.push(cards.slice(i, i + sectionSize));
    }

    return sections;
  }

  /**
   * Extract CTA section from content
   */
  extractCtaSection(htmlContent: string): CtaData | null {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const ctaSection = doc.querySelector('.kb-row-layout-id6_808bd1-c2');

    if (!ctaSection) return null;

    try {
      const titleElement = ctaSection.querySelector('h2.wp-block-heading');
      const title = titleElement?.textContent?.trim() || '';

      const descriptionElement = ctaSection.querySelector('p');
      const description = descriptionElement?.textContent?.trim() || '';

      const buttonElement = ctaSection.querySelector('a.kb-button, a.kt-button');
      const buttonText = buttonElement?.querySelector('.kt-btn-inner-text')?.textContent?.trim() ||
                         buttonElement?.textContent?.trim() ||
                         'Get Your Free Quotation';
      const buttonLink = buttonElement?.getAttribute('href') || '#';

      if (title && description) {
        return {
          title,
          description,
          buttonText,
          buttonLink
        };
      }

      return null;
    } catch (error) {
      console.error('Error extracting CTA section:', error);
      return null;
    }
  }

  /**
   * Split content into before and after CTA sections
   */
  splitContentAtCta(htmlContent: string): ContentSections {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const ctaSection = doc.querySelector('.kb-row-layout-id6_808bd1-c2');

    if (!ctaSection) {
      return {
        beforeCta: htmlContent,
        afterCta: ''
      };
    }

    const beforeElements: Element[] = [];
    const afterElements: Element[] = [];
    let foundCta = false;

    Array.from(doc.body.children).forEach(child => {
      if (child.classList.contains('kb-row-layout-id6_808bd1-c2')) {
        foundCta = true;
      } else if (!foundCta) {
        beforeElements.push(child);
      } else {
        afterElements.push(child);
      }
    });

    const beforeDoc = document.createElement('div');
    beforeElements.forEach(el => beforeDoc.appendChild(el.cloneNode(true)));

    const afterDoc = document.createElement('div');
    afterElements.forEach(el => afterDoc.appendChild(el.cloneNode(true)));

    return {
      beforeCta: this.cleanContent(beforeDoc.innerHTML),
      afterCta: this.cleanContent(afterDoc.innerHTML)
    };
  }

  /**
   * Extract Trustpilot section
   */
  extractTrustpilotSection(htmlContent: string): TrustpilotData | null {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const trustpilotSection = doc.querySelector('.kb-row-layout-id6_f82231-0b');

    if (!trustpilotSection) return null;

    try {
      const titleElement = trustpilotSection.querySelector('h2.kt-adv-heading6_8a49c2-e7');
      const title = titleElement?.textContent?.trim() || 'Our reviews on Trustpilot';

      const clientsTitleElement = trustpilotSection.querySelector('h2.kt-adv-heading6_71f0fe-c1');
      const clientsTitle = clientsTitleElement?.textContent?.trim() || 'A small selection of our clients';

      const clientsImageElement = trustpilotSection.querySelector('.kb-image6_69f34e-6f img');
      const clientsImage = clientsImageElement?.getAttribute('src') || '';
      const clientsImageAlt = clientsImageElement?.getAttribute('alt') || 'Our clients';

      return {
        title,
        clientsTitle,
        clientsImage,
        clientsImageAlt
      };
    } catch (error) {
      console.error('Error extracting Trustpilot section:', error);
      return null;
    }
  }

  /**
   * Remove Trustpilot section from content
   */
  public removeTrustpilotFromContent(htmlContent: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const trustpilotSections = doc.querySelectorAll('.kb-row-layout-id6_f82231-0b');
    trustpilotSections.forEach(section => section.remove());

    return doc.body.innerHTML;
  }

  /**
   * Clean content by removing spacers and empty elements
   */
  private cleanContent(htmlContent: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Remove spacers
    const spacers = doc.querySelectorAll('.wp-block-spacer');
    spacers.forEach(spacer => spacer.remove());

    // Remove empty paragraphs
    const emptyParagraphs = doc.querySelectorAll('p:empty');
    emptyParagraphs.forEach(p => p.remove());

    return doc.body.innerHTML;
  }

  /**
   * Extract Clients and Accreditations section
   * This method looks for the specific section containing both clients grid and accreditations
   */
  extractClientsAccreditations(htmlContent: string): ClientsAccreditationsData | null {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    try {
      // Find the clients section by looking for the heading
      const clientsHeading = Array.from(doc.querySelectorAll('h2.kt-adv-heading6_71f0fe-c1, h2')).find(h =>
        h.textContent?.toLowerCase().includes('small selection') &&
        h.textContent?.toLowerCase().includes('clients')
      );

      const clientsTitle = clientsHeading?.textContent?.trim() || 'A small selection of our clients';

      // Find clients image (it's a single image with all logos)
      const clients: ClientLogo[] = [];
      if (clientsHeading) {
        // Look for the image in the next sibling elements
        let currentElement: Element | null = clientsHeading.nextElementSibling;
        while (currentElement && clients.length === 0) {
          const img = currentElement.querySelector('.kb-image6_69f34e-6f img, img[alt*="clients"]');
          if (img) {
            const src = img.getAttribute('src') || img.getAttribute('data-src');
            const alt = img.getAttribute('alt') || 'Our clients';
            if (src) {
              clients.push({ src, alt });
              break;
            }
          }
          currentElement = currentElement.nextElementSibling;

          // Stop if we hit another major heading
          if (currentElement?.querySelector('h2, h3')) {
            break;
          }
        }
      }

      // Find accreditations section
      const accreditationsHeading = Array.from(doc.querySelectorAll('h2.kt-adv-heading6_2fcce7-7b, h2')).find(h =>
        h.textContent?.toLowerCase().includes('accreditations')
      );

      const accreditationsTitle = accreditationsHeading?.textContent?.trim() || 'Accreditations';
      const accreditations: Accreditation[] = [];

      if (accreditationsHeading) {
        // Look for the 3-column row layout
        let currentElement: Element | null = accreditationsHeading.nextElementSibling;
        while (currentElement) {
          // Check if this is the 3-column layout
          const rowLayout = currentElement.querySelector('.kb-row-layout-id6_8db016-23, .kt-has-3-columns');
          if (rowLayout) {
            // Find all images within the 3-column layout
            const images = rowLayout.querySelectorAll('img.kb-img');
            images.forEach(img => {
              const src = img.getAttribute('src') || img.getAttribute('data-src');
              const alt = img.getAttribute('alt') || 'Accreditation';
              if (src) {
                accreditations.push({ src, alt });
              }
            });
            break;
          }

          currentElement = currentElement.nextElementSibling;

          // Stop if we hit another major heading
          if (currentElement?.querySelector('h2:not([class*="adv-heading6_2fcce7"])')) {
            break;
          }
        }
      }

      if (clients.length > 0 || accreditations.length > 0) {
        return {
          clientsTitle,
          clients,
          accreditationsTitle,
          accreditations
        };
      }

      return null;
    } catch (error) {
      console.error('Error extracting clients and accreditations:', error);
      return null;
    }
  }

  /**
   * Helper to check if an image is likely an accreditation badge
   */
  private isAccreditationImage(src: string, alt: string): boolean {
    const accreditationKeywords = ['muta', 'accredit', 'badge', 'certificate', 'marquee', 'hire guide'];
    const lowerSrc = src.toLowerCase();
    const lowerAlt = alt.toLowerCase();
    return accreditationKeywords.some(keyword =>
      lowerSrc.includes(keyword) || lowerAlt.includes(keyword)
    );
  }

  /**
   * Helper to find text in headings
   */
  private findTextInHeadings(doc: Document, keywords: string[]): string | null {
    const headings = doc.querySelectorAll('h2, h3');
    for (const heading of Array.from(headings)) {
      const text = heading.textContent || '';
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        return text.trim();
      }
    }
    return null;
  }

  /**
   * Remove clients and accreditations section from content
   */
  removeClientsAccreditationsFromContent(htmlContent: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Find and remove the clients section
    const clientsHeading = Array.from(doc.querySelectorAll('h2.kt-adv-heading6_71f0fe-c1, h2')).find(h =>
      h.textContent?.toLowerCase().includes('small selection') &&
      h.textContent?.toLowerCase().includes('clients')
    );

    // Find and remove accreditations section
    const accreditationsHeading = Array.from(doc.querySelectorAll('h2.kt-adv-heading6_2fcce7-7b, h2')).find(h =>
      h.textContent?.toLowerCase().includes('accreditations')
    );

    const elementsToRemove: Element[] = [];

    // Remove clients section
    if (clientsHeading) {
      elementsToRemove.push(clientsHeading);

      // Remove the next sibling (the image column)
      let nextElement = clientsHeading.nextElementSibling;
      if (nextElement && nextElement.classList.contains('kadence-column6_f4c67d-36')) {
        elementsToRemove.push(nextElement);
      }
    }

    // Remove accreditations section
    if (accreditationsHeading) {
      elementsToRemove.push(accreditationsHeading);

      // Remove the row layout with 3 columns
      let currentElement: Element | null = accreditationsHeading.nextElementSibling;
      while (currentElement) {
        elementsToRemove.push(currentElement);

        // Check if this is the 3-column row layout
        if (currentElement.classList.contains('kb-row-layout-id6_8db016-23') ||
            currentElement.querySelector('.kt-has-3-columns')) {
          // Also remove spacer and description paragraph that follow
          let next = currentElement.nextElementSibling;
          while (next) {
            if (next.classList.contains('wp-block-spacer') ||
                next.classList.contains('kb-row-layout-id6_7dbfb2-ee')) {
              elementsToRemove.push(next);
              next = next.nextElementSibling;
            } else {
              break;
            }
          }
          break;
        }

        currentElement = currentElement.nextElementSibling;

        // Stop at next major heading
        if (currentElement?.querySelector('h2:not([class*="adv-heading"])')) {
          break;
        }
      }
    }

    // Remove all collected elements
    elementsToRemove.forEach(el => el.remove());

    return doc.body.innerHTML;
  }
}

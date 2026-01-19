import { Component, Input, OnInit, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

export interface TrustpilotData {
  title: string;
  clientsTitle: string;
  clientsImage: string;
  clientsImageAlt: string;
}

declare global {
  interface Window {
    Trustpilot?: any;
  }
}

@Component({
  selector: 'app-trustpilot-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trustpilot-section.component.html',
  styleUrl: './trustpilot-section.component.scss'
})
export class TrustpilotSectionComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() trustpilot: TrustpilotData | null = null;
  @ViewChild('trustpilotWidget', { static: false }) widgetElement?: ElementRef;

  private isBrowser: boolean;
  private initAttempts = 0;
  private maxAttempts = 10;
  private retryInterval?: any;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.loadTrustpilotScript();
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      // Wait for Angular to fully render the component
      setTimeout(() => {
        this.initializeTrustpilot();
      }, 1000);
    }
  }

  ngOnDestroy() {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
    }
  }

  private loadTrustpilotScript() {
    // Check if script already exists
    if (document.getElementById('trustpilot-script')) {

      return;
    }

    const script = document.createElement('script');
    script.id = 'trustpilot-script';
    script.type = 'text/javascript';
    script.src = 'https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
    script.async = true;

    script.onload = () => {

    };

    script.onerror = (error) => {

    };

    document.head.appendChild(script);
  }

  private initializeTrustpilot() {
    this.initAttempts++;

    const widget = document.getElementById('trustpilot-widget');



    if (!widget) {
      console.error('Trustpilot widget element not found');

      if (this.initAttempts < this.maxAttempts) {

        setTimeout(() => this.initializeTrustpilot(), 1000);
      } else {

      }
      return;
    }

    if (!window.Trustpilot) {
      console.warn('Trustpilot object not available yet');

      if (this.initAttempts < this.maxAttempts) {

        setTimeout(() => this.initializeTrustpilot(), 1000);
      } else {
        console.error('Trustpilot script failed to load after max attempts');
      }
      return;
    }

    try {

      window.Trustpilot.loadFromElement(widget, true);

    } catch (error) {

    }
  }
}

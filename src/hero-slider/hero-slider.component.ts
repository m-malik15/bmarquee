import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';

export interface SlideImage {
  url: string;
  alt: string;
  srcset?: string;
}

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hero-slider" *ngIf="slides.length > 0">
      <div class="slider-container">
        <!-- Slides -->
        <div class="slides" [style.transform]="'translateX(-' + (currentSlide * 100) + '%)'">
          <div
            class="slide"
            *ngFor="let slide of slides; let i = index"
            [class.active]="i === currentSlide"
          >
            <img
              [src]="slide.url"
              [alt]="slide.alt"
              [srcset]="slide.srcset || ''"
              loading="lazy"
              class="slide-image"
            />
            <div class="slide-overlay"></div>
          </div>
        </div>

        <!-- Navigation Arrows -->
        <button
          class="slider-arrow slider-arrow-left"
          (click)="previousSlide()"
          aria-label="Previous slide"
          *ngIf="slides.length > 1"
        >
          ‹
        </button>
        <button
          class="slider-arrow slider-arrow-right"
          (click)="nextSlide()"
          aria-label="Next slide"
          *ngIf="slides.length > 1"
        >
          ›
        </button>

        <!-- Dots Navigation -->
        <div class="slider-dots" *ngIf="slides.length > 1">
          <button
            *ngFor="let slide of slides; let i = index"
            class="dot"
            [class.active]="i === currentSlide"
            (click)="goToSlide(i)"
           [attr.aria-label]="'Go to slide ' + (i + 1)"
          ></button>
        </div>
      </div>
    </div>

    <!-- Fallback if no slides -->
    <div class="hero-placeholder" *ngIf="slides.length === 0">
      <div class="placeholder-content">
        <h1>Welcome to Baillies Marquees</h1>
        <p>Scotland's Premier Marquee Hire Company</p>
      </div>
    </div>
  `,
  styles: [`
    /* Hero Slider Container */
    .hero-slider {
      position: relative;
      width: 100%;
      height: 600px;
      overflow: hidden;
      background: #f5f5f5;
    }

    .slider-container {
      position: relative;
      width: 100%;
      height: 100%;
    }

    /* Slides Wrapper */
    .slides {
      display: flex;
      height: 100%;
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .slide {
      min-width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .slide-image {
        width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  image-rendering: -webkit-optimize-contrast;  /* ADD THIS */
  image-rendering: crisp-edges;  /* ADD THIS */
    }

    .slide-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.1) 0%,
        rgba(0, 0, 0, 0.3) 100%
      );
    }

    /* Navigation Arrows */
    .slider-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.9);
      border: none;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      font-size: 2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      transition: all 0.3s ease;
      color: #333;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .slider-arrow:hover {
      background: white;
      transform: translateY(-50%) scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .slider-arrow-left {
      left: 40px;
    }

    .slider-arrow-right {
      right: 40px;
    }

    /* Dots Navigation */
    .slider-dots {
      position: absolute;
       bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      z-index: 10;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      border: 2px solid rgba(255, 255, 255, 0.8);
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 0;
    }

    .dot:hover {
      background: rgba(255, 255, 255, 0.8);
      transform: scale(1.2);
    }

    .dot.active {
      background: white;
      transform: scale(1.3);
    }

    /* Placeholder (no slides) */
    .hero-placeholder {
      width: 100%;
      height: 500px;
      background: linear-gradient(135deg, #2c5f2d 0%, #1a3a1b 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .placeholder-content {
      text-align: center;
      color: white;
    }

    .placeholder-content h1 {
      font-size: 3rem;
      margin: 0 0 1rem 0;
      font-weight: 600;
    }

    .placeholder-content p {
      font-size: 1.5rem;
      margin: 0;
      opacity: 0.9;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero-slider {
        height: 350px;
      }

      .hero-placeholder {
        height: 350px;
      }

      .slider-arrow {
        width: 40px;
        height: 40px;
        font-size: 1.5rem;
      }

      .slider-arrow-left {
        left: 10px;
      }

      .slider-arrow-right {
        right: 10px;
      }

      .placeholder-content h1 {
        font-size: 2rem;
      }

      .placeholder-content p {
        font-size: 1.2rem;
      }
    }

    @media (max-width: 480px) {
      .hero-slider {
        height: 250px;
      }

      .hero-placeholder {
        height: 250px;
      }

      .placeholder-content h1 {
        font-size: 1.5rem;
      }

      .placeholder-content p {
        font-size: 1rem;
      }
    }
  `]
})
export class HeroSliderComponent implements OnInit, OnDestroy {
  @Input() slides: SlideImage[] = [];
  @Input() autoPlayInterval: number = 5000; // 5 seconds
  @Input() autoPlay: boolean = true;

  currentSlide = 0;
  private autoPlayTimer: any;

  ngOnInit(): void {
    console.log('🎬 Hero Slider initialized with', this.slides.length, 'slides');

    if (this.autoPlay && this.slides.length > 1) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.resetAutoPlay();
  }

  previousSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.resetAutoPlay();
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.resetAutoPlay();
  }

  private startAutoPlay(): void {
    this.autoPlayTimer = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayInterval);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
  }

  private resetAutoPlay(): void {
    if (this.autoPlay && this.slides.length > 1) {
      this.stopAutoPlay();
      this.startAutoPlay();
    }
  }
}

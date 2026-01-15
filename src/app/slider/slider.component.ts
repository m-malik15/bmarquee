// slider.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaItem } from '../wordpress.service2.service';

@Component({
  selector: 'app-slider',
 standalone: true,
  imports: [CommonModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss'
})
export class SliderComponent implements OnInit, OnDestroy {
  @Input() images: MediaItem[] = [];
  @Input() autoplay = true;
  @Input() speed = 5000;
  @Input() showCaptions = true;
  @Input() showDots = true;
  @Input() showCta = true;
  @Input() useSize: 'thumbnail' | 'medium' | 'large' | 'full' = 'large';

  currentIndex = 0;
  private intervalId: any;

  ngOnInit() {
    if (this.autoplay && this.images.length > 1) {
      this.startAutoplay();
    }
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  getSizedImage(image: MediaItem): string {
    return image.sizes[this.useSize]?.source_url || image.source_url;
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.resetAutoplay();
  }

  prev() {
    this.currentIndex = this.currentIndex === 0
      ? this.images.length - 1
      : this.currentIndex - 1;
    this.resetAutoplay();
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    this.resetAutoplay();
  }

  private startAutoplay() {
    this.intervalId = setInterval(() => this.next(), this.speed);
  }

  private stopAutoplay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private resetAutoplay() {
    if (this.autoplay) {
      this.stopAutoplay();
      this.startAutoplay();
    }
  }
}

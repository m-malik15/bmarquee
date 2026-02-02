import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CtaData {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

@Component({
  selector: 'app-cta-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cta-section.component.html',
  styleUrl: './cta-section.component.scss'
})
export class CtaSectionComponent {
  @Input() cta: CtaData | null = null;
}

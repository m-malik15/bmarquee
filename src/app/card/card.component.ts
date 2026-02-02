import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TruncatePipe } from '../utilities/truncate.pipe';

export interface CardData {
  title: string;
  image: string;
  description: string;
  link: string;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TruncatePipe],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input() card!: CardData;
  @Input() animationDelay: number = 0;
  @Input() descriptionLimit: number = 130;
}

import { Component, Input } from '@angular/core';
import { CardComponent, CardData } from '../card/card.component';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-cards-grid',
  imports: [CardComponent, NgFor],
  templateUrl: './cards-grid.component.html',
  styleUrl: './cards-grid.component.scss'
})
export class CardsGridComponent {
  @Input() cards: CardData[] = [];
  @Input() columns: number = 3;

}

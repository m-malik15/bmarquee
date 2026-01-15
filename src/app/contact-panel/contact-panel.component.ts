// contact-panel.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contact-panel.component.html',
  styleUrls: ['./contact-panel.component.scss']
})
export class ContactPanelComponent {
  @Input() isPanelOpen = false;
  @Output() isPanelOpenChange = new EventEmitter<boolean>();

  closePanel() {
    this.isPanelOpen = false;
    this.isPanelOpenChange.emit(false);
    document.body.style.overflow = '';
  }
}

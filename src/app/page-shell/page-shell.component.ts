// page-shell.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-shell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-shell.component.html',
  styleUrl: './page-shell.component.scss'
})
export class PageShellComponent {
  /** Page heading — renders as <h1> */
  @Input() title = '';

  /**
   * Optional subheading / intro paragraph.
   * Supports inline HTML (e.g. links) — sanitise upstream if needed.
   */
  @Input() intro = '';
}

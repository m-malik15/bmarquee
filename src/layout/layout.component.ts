// src/app/components/layout/layout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../app/footer/footer.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  template: `
    <div class="site-wrapper">
      <app-header></app-header>
      <main class="site-main">
        <router-outlet></router-outlet>
      </main>
        <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .site-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .site-main {
      flex: 1;
    }

    .site-footer {
      background: #2c3e50;
      color: #fff;
      padding: 2rem 0;
      margin-top: 4rem;

      .container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 2rem;
        text-align: center;
      }

      p {
        margin: 0;
        font-size: 0.9rem;
      }
    }
  `]
})
export class LayoutComponent {
  currentYear = new Date().getFullYear();
}

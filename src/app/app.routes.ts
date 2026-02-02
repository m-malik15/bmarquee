// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { homeComponent } from './home/home.component';
import { PricesComponent } from './prices/prices.component';


export const routes: Routes = [
  {
    path: '',
    component: homeComponent
  },
  {
    path: 'prices',
    component: PricesComponent,
    title: 'Marquee Hire Prices - Baillie\'s Marquees'
  },
  // {
  //   path: ':slug',
  //   component: homeComponent
  // },
  {
    path: '**',
    redirectTo: ''
  }
];

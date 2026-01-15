// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { PageComponent } from './page/page.component';


export const routes: Routes = [
  {
    path: '',
    component: PageComponent
  },
  {
    path: ':slug',
    component: PageComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];

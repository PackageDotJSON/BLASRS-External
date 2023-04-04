import { Routes } from '@angular/router';
import { LandingPageComponent } from '../pages/landing-page/landing-page.component';
import { LoginComponent } from '../pages/login/login.component';

export const appRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'home',
        component: LandingPageComponent,
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: '**',
        redirectTo: 'home'
      }
    ],
  },
];

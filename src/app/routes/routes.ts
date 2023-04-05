import { Routes } from '@angular/router';
import { LandingPageComponent } from '../pages/landing-page/landing-page.component';
import { LoginComponent } from '../pages/login/login.component';
import { AuthGuard } from '../services/guards/auth.guard';

export const appRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'home',
        component: LandingPageComponent,
        canActivate: [AuthGuard],
      },
      {
        path: '**',
        redirectTo: 'login',
      },
    ],
  },
];

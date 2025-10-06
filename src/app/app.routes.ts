import { Routes } from '@angular/router';
import { MainLayout } from './features/main-layout/main-layout';
import { Dashboard } from './features/dashboard/dashboard';
import { Settings } from './features/settings/settings';
import { LoginComponent } from './login.component';
import { authGuardFn } from './auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuardFn],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'settings', component: Settings },
    ],
  },
  {
    path: '**',
    redirectTo: '', // Or a dedicated 'NotFound' component
  },
];
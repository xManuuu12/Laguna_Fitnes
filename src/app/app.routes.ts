import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { LoginComponent } from './components/login/login';

export const routes: Routes = [
  {
    path: '', 
    component: DashboardComponent, 
  },
  {
    path: 'login', 
    component: LoginComponent,
  }
];
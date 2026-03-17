import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { LoginComponent } from './pages/login/login';
import { MembersComponent } from './pages/members/members';

export const routes: Routes = [
  {
    path: '', 
    component: LoginComponent, 
  },
  {
    path: 'dashboard', 
    component: DashboardComponent,
  },
  {
    path: 'members',
    component: MembersComponent
  }
];
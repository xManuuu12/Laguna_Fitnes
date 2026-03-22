import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { LoginComponent } from './pages/login/login';
import { MembersComponent } from './pages/members/members';
import { VisitsComponent } from './pages/visits/visits';
import { SidebarComponent } from './components/sidebar/sidebar';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: '',
    component: SidebarComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'members',
        component: MembersComponent
      },
      {
        path: 'visits',
        component: VisitsComponent
      }
    ]
  }
];
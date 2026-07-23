import { Routes } from '@angular/router';
import { Questions } from './feature/dashboard/questions/questions';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./layout/dashboard-layout/dashboard-layout').then((m) => m.DashboardLayout),
    children: [
      {
        path: '',
        redirectTo: 'polls',
        pathMatch: 'full',
      },
      {
        path: 'polls',
        title: 'Polls | SurveyBasket',
        loadComponent: () => import('./feature/dashboard/polls/polls').then((m) => m.Polls),
      },
      {
        path: 'polls/:pollId/questions',
        title: 'Questions | SurveyBasket',
        loadComponent: () =>
          import('./feature/dashboard/questions/questions').then((m) => m.Questions),
      },
      {
        path: 'users',
        title: 'Users | SurveyBasket',
        loadComponent: () => import('./feature/dashboard/users/users').then((m) => m.Users),
      },
      {
        path: 'analytics',
        title: 'analytics | SurveyBasket',
        loadComponent: () =>
          import('./feature/dashboard/analytics/analytics').then((m) => m.Analytics),
      },
          {
        path: 'roles',
        title: 'roles | SurveyBasket',
        loadComponent: () =>
          import('./feature/dashboard/roles/roles').then((m) => m.Roles),
      },
    ],
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        title: 'Login | SurveyBasket',
        loadComponent: () => import('./feature/auth/login/login').then((m) => m.Login),
      },
    ],
  },
  // {
  //   path: '**',
  //   title: 'Not Found | SurveyBasket',
  //   loadComponent: () =>
  //     import('./features/not-found/not-found').then(m => m.NotFound)
  // }
];

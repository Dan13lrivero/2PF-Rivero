import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './dashboard';
import { Home } from './home/home';

const routes: Routes = [
  {
    path: '',
    component: Dashboard, 
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'courses', loadChildren: () => import('./courses/courses-module').then(m => m.CoursesModule) },
      { 
        path: 'students',
        children: [
          { path: '', loadComponent: () => import('./students/students').then(m => m.Students) },
          { path: ':id', loadComponent: () => import('./students/student-detail/student-detail').then(m => m.StudentDetail) }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}

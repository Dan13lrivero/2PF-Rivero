import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Students } from './students';

const routes: Routes = [
  {
    path: 'students',
    children: [
      { path: '', loadComponent: () => import('./students').then(m => m.Students) },
      { path: ':id', loadComponent: () => import('./student-detail/student-detail').then(m => m.StudentDetail) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentsRoutingModule {}
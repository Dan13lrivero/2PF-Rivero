import { Component, OnInit } from '@angular/core';
import { Student } from '../../../core/models/Student';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { RootState } from '../../../core/store';
import { StudentsActions } from '../../../core/store/students/students.actions';
import { selectStudents, selectStudentsLoading } from '../../../core/store/students/students.selectors';
import { Observable } from 'rxjs';
import { UsersModule } from '../users/users-module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, UsersModule, MatProgressSpinnerModule],
  templateUrl: './students.html'
})
export class Students implements OnInit {
  students$: Observable<Student[]>;
  loading$: Observable<boolean>;

  constructor(private store: Store<RootState>) {
    this.students$ = this.store.select(selectStudents);
    this.loading$ = this.store.select(selectStudentsLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(StudentsActions.loadStudents());
  }
}
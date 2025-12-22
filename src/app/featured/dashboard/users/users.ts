import { Component, AfterViewInit } from '@angular/core';
import { Student } from '../../../core/models/Student';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { RootState } from '../../../core/store';
import { StudentsActions } from '../../../core/store/students/students.actions';
import { selectStudents } from '../../../core/store/students/students.selectors';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class Users implements AfterViewInit {

  displayedColumns: string[] = ['id', 'nombre', 'apellido', 'edad', 'acciones'];
  dataSource = new MatTableDataSource<Student>();

  studentToEdit: Student | null = null;

  constructor(private store: Store<RootState>) {}

  ngAfterViewInit() {
    this.store.select(selectStudents).subscribe((students) => {
      this.dataSource.data = students;
    });
    
    this.store.dispatch(StudentsActions.loadStudents());
  }

  onAddUser(student: Student) {
    this.store.dispatch(StudentsActions.addStudent({ student }));
  }

  onEditUser(student: Student) {
    this.store.dispatch(StudentsActions.setStudentEdit({ id: student.id }));
  }

  onEditRecieved(student: Student) {
    this.store.dispatch(StudentsActions.updateStudent({ id: student.id, student }));
    this.studentToEdit = null;
  }
}
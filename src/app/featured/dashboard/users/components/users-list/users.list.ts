import { Component, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { Student } from '../../../../../core/models/Student';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Store } from '@ngrx/store';
import { RootState } from '../../../../../core/store';
import { StudentsActions } from '../../../../../core/store/students/students.actions';
import { selectStudents } from '../../../../../core/store/students/students.selectors';

@Component({
  selector: 'user-list',
  standalone: false,
  templateUrl: './users-list.html',
  styleUrls: ['./user-list.css']
})
export class UsersList implements OnChanges {
  @Input() students: Student[] = [];
  @Input() showCI: boolean = false;

  displayedColumns: string[] = ['nombreCompleto', 'email', 'actions'];
  dataSource = new MatTableDataSource<Student>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store<RootState>) {
    this.store.select(selectStudents).subscribe((students) => {
      this.dataSource.data = students;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['showCI']) {
      this.displayedColumns = ['nombreCompleto', this.showCI ? 'ci' : 'email', 'actions'];
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  onEditUser(id: string) {
    this.store.dispatch(StudentsActions.setStudentEdit({ id }));
  }

  onDeleteUser(id: string) {
    this.store.dispatch(StudentsActions.deleteStudent({ id }));
  }
}
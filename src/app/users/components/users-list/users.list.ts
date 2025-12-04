import { Component, EventEmitter, Input, Output, ViewChild  } from '@angular/core';
import { Student } from '../../../core/models/Student'; 
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { StudentsService } from '../../../core/services/students/students.service'; 
 
@Component({
  selector: 'user-list',
  standalone: false,
  templateUrl: './users-list.html',
  styleUrls: ['./user-list.css']
})
export class UsersList {
  @Input() students: Student[] = []; 

  displayedColumns: string[] = ['nombreCompleto', 'email', 'actions']
  dataSource = new MatTableDataSource<Student>(); 

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private studentsService: StudentsService) { 
    this.studentsService.students$.subscribe((students) => { 
      this.dataSource.data = students;
    })
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.studentsService.getStudents(); 
  }

  onEditUser(id: number) {
    this.studentsService.setUpdateStudent(id); 
  }
  
  onDeleteUser(id: number) {
    this.studentsService.deleteStudent(id); 
  }
}
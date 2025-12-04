import { Component, AfterViewInit } from '@angular/core';
import { Student } from '../core/models/Student';
import { MatTableDataSource } from '@angular/material/table';
import { StudentsService } from '../core/services/students/students.service';

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

  constructor(private studentsService: StudentsService) {}

  ngAfterViewInit() {
    this.studentsService.students$.subscribe((students) => {
      this.dataSource.data = students;
    });
  }

  onAddUser(student: Student) {
    this.studentsService.addStudent(student);
  }

  onEditUser(student: Student) {
    this.studentToEdit = student;
  }

  onEditRecieved(student: Student) {
    this.studentsService.updateStudent(student.id, student);
    this.studentToEdit = null;
  }
}

import { Component, OnInit } from '@angular/core';
import { Student } from '../../../core/models/Student'; 
import { StudentsService } from '../../../core/services/students/students.service'; 
import { CommonModule } from '@angular/common';
import { UsersList } from '../../../users/components/users-list/users.list';
import { UserForm } from '../../../users/components/user-form/user-form';
import { UsersModule } from '../../../users/users-module';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, UsersModule],
  templateUrl: './students.html'
})
export class Students implements OnInit {
  studentsList: Student[] = []; 

  constructor(private studentsService: StudentsService) {} 

  ngOnInit(): void {
    this.studentsService.students$.subscribe(students => this.studentsList = students); 
    this.studentsService.getStudents(); 
  }
}
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../../utils/constants';
import { Student } from '../../models/Student';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  private studentsUrl = `${API_URL}/students`;
  
  private studentsSubject = new BehaviorSubject<Student[]>([]);
  students$ = this.studentsSubject.asObservable();
  
  studentEdit = new BehaviorSubject<Student | null>(null);
  studentEdit$ = this.studentEdit.asObservable();

  constructor(private http: HttpClient) {
    this.getStudents();
  }

  getStudents() {
    this.http.get<Student[]>(this.studentsUrl).subscribe((students) => {
      this.studentsSubject.next(students);
    });
  }

  addStudent(student: Student) {
    this.http.post<Student>(this.studentsUrl, student).subscribe(() => {
      this.getStudents();
    });
  }

  updateStudent(id: string, student: Student) {
    this.http.put<Student>(`${this.studentsUrl}/${id}`, student).subscribe(() => {
      this.getStudents();
    });
  }

  deleteStudent(id: string) {
    this.http.delete(`${this.studentsUrl}/${id}`).subscribe(() => {
      this.getStudents();
    });
  }

  setUpdateStudent(id: string) {
    this.http.get<Student>(`${this.studentsUrl}/${id}`).subscribe((student) => {
      this.studentEdit.next(student);
    });
  }

  getStudentById(id: string) {
    return this.http.get<Student>(`${this.studentsUrl}/${id}`);
  }
}
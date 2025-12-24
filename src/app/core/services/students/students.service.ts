import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../../utils/constants';
import { Student } from '../../models/Student';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  private studentsUrl = `${API_URL}/students`;
  
  private studentsSubject = new BehaviorSubject<Student[]>([]);
  students$ = this.studentsSubject.asObservable();
  
  studentEdit = new BehaviorSubject<Student | null>(null);
  studentEdit$ = this.studentEdit.asObservable();

  private driverMonthsUrl = `${API_URL}/driverMonths`;

  constructor(private http: HttpClient) {
    this.getStudents();
  }

  // Driver month persistence
  getDriverMonth(studentId: string, month: number) {
    // json-server supports queries like ?studentId=1&month=0
    return this.http.get<any[]>(`${this.driverMonthsUrl}?studentId=${studentId}&month=${month}`);
  }

  createDriverMonth(data: any) {
    return this.http.post<any>(this.driverMonthsUrl, data);
  }

  updateDriverMonth(id: number, data: any) {
    return this.http.put<any>(`${this.driverMonthsUrl}/${id}`, data);
  }

  saveDriverMonth(studentId: string, month: number, days: any[]) {
    // returns an observable that resolves to the saved record (post or put)
    return this.getDriverMonth(studentId, month).pipe(
      switchMap((arr) => {
        const payload = { studentId, month, days } as any;
        if (arr && arr.length > 0) {
          const existing = arr[0];
          return this.updateDriverMonth(existing.id, { ...existing, ...payload });
        }
        return this.createDriverMonth(payload);
      })
    );
  }

  // Get all months for a specific driver
  getDriverMonths(studentId: string) {
    return this.http.get<any[]>(`${this.driverMonthsUrl}?studentId=${studentId}`);
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
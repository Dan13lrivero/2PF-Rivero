import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { StudentsActions } from './students.actions';
import { StudentsService } from '../../services/students/students.service';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../utils/constants';
import { Student } from '../../models/Student';

@Injectable()
export class StudentsEffects {
  private studentsUrl = `${API_URL}/students`;

  loadStudents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudentsActions.loadStudents),
      mergeMap(() =>
        this.http.get<Student[]>(this.studentsUrl).pipe(
          map((students) =>
            StudentsActions.loadStudentsSuccess({ students })
          ),
          catchError((error) =>
            of(StudentsActions.loadStudentsFailure({ error }))
          )
        )
      )
    )
  );

  addStudent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudentsActions.addStudent),
      mergeMap(({ student }) =>
        // First fetch existing students to compute the next numeric ID
        this.http.get<Student[]>(this.studentsUrl).pipe(
          mergeMap((students) => {
            const numericIds = students
              .map((s) => Number((s as any).id))
              .filter((n) => !Number.isNaN(n));
            const maxId = numericIds.length ? Math.max(...numericIds) : 0;
            const nextId = maxId + 1;
            const studentWithId: Student = { ...(student as any), id: String(nextId) } as Student;

            return this.http.post<Student>(this.studentsUrl, studentWithId).pipe(
              map((newStudent) =>
                StudentsActions.addStudentSuccess({ student: newStudent })
              ),
              catchError((error) =>
                of(StudentsActions.addStudentFailure({ error }))
              )
            );
          }),
          catchError((error) => of(StudentsActions.addStudentFailure({ error })))
        )
      )
    )
  );

  updateStudent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudentsActions.updateStudent),
      mergeMap(({ id, student }) =>
        this.http.put<Student>(`${this.studentsUrl}/${id}`, student).pipe(
          map((updatedStudent) =>
            StudentsActions.updateStudentSuccess({ student: updatedStudent })
          ),
          catchError((error) =>
            of(StudentsActions.updateStudentFailure({ error }))
          )
        )
      )
    )
  );

  deleteStudent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudentsActions.deleteStudent),
      mergeMap(({ id }) =>
        this.http.delete(`${this.studentsUrl}/${id}`).pipe(
          map(() => StudentsActions.deleteStudentSuccess({ id })),
          catchError((error) =>
            of(StudentsActions.deleteStudentFailure({ error }))
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient
  ) {}
}
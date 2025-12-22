import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Course, courseColumns } from '../../../../core/services/courses/model/Course';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { CoursesService } from '../../../../core/services/courses/courses';
import { RootState } from '../../../../core/store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectCourses, selectError, selectIsLoading } from '../store/courses.selectors';
import { CoursesActions } from '../store/courses.actions';

@Component({
  selector: 'app-courses-table',
  standalone: false,
  templateUrl: './courses-table.html',
  styleUrl: './courses-table.css',
})
export class CoursesTable implements AfterViewInit {
  displayedColumns: string[] = courseColumns;
  dataSource = new MatTableDataSource<Course>([]);

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  courses$: Observable<Course[]>;
  isLoading$: Observable<boolean>;
  error$: Observable<any>;

  constructor(private courseService: CoursesService, private store: Store<RootState>) {
    this.courses$ = this.store.select(selectCourses);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.error$ = this.store.select(selectError);
  }

  ngOnInit() {
    this.store.dispatch(CoursesActions.loadCourses());

    this.courses$.subscribe({
      next: (courses) => {
        // Ensure local overrides are always applied to avoid flicker on pagination
        const merged = this.courseService.applyOverridesToCourses(courses as any);
        this.dataSource.data = merged as Course[];
        this.updatePaginator();
      },
      error: (error) => {
        console.log('Error loading courses:', error);
      }
    })
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.updatePaginator();
    }
  }

  updatePaginator() {
    if (this.dataSource.paginator) {
      this.dataSource.paginator.length = this.dataSource.data.length;
    }
  }

  onDeleteCourse(id: number) {
    this.store.dispatch(CoursesActions.deleteCourse({ id }));
  }

  onToggleService(row: Course, toggle: any) {
    // Do not mutate the incoming row (it may be frozen in the store)
    const serviceDone = !!toggle.checked;
    const date = serviceDone ? new Date() : row.lastServiceDate ? new Date(row.lastServiceDate) : undefined;
    const updated: Course = { ...row, serviceDone, lastServiceDate: date };

    // Persist override locally to avoid flicker on quick navigations (serviceDone + date)
    this.courseService.setServiceOverride(row.id, serviceDone, date);
    // Update local cache immediately
    this.courseService.setLocalCourse(updated);
    // Dispatch an action so the store/effects attempt to persist to server
    this.store.dispatch(CoursesActions.updateCourse({ course: updated }));
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
import { Injectable } from '@angular/core';
import { Course } from './model/Course';
import { mockCourses } from './data/mock';
import { BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../utils/constants';

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  private courses: Course[] = [];
  private courseSubject = new BehaviorSubject<Course[]>([]);
  courses$ = this.courseSubject.asObservable();

  private coursesUrl = `${API_URL}/courses`;

  constructor(private http: HttpClient) {
    this.getCourses();
  }

  getCoursesForEffect() {
    return this.http.get<Course[]>(this.coursesUrl).pipe(
      map((courses: any[]) =>
        this.applyOverridesToCourses(courses.map((c) => ({
          ...c,
          serviceDone: c.serviceDone === true,
          lastServiceDate: c.lastServiceDate ? new Date(c.lastServiceDate) : undefined,
        })))
      )
    );
  }

  getCourses() {
    this.http.get<Course[]>(this.coursesUrl).subscribe((courses: any[]) => {
      const normalized = this.applyOverridesToCourses(courses.map((c) => ({
        ...c,
        serviceDone: c.serviceDone === true,
        lastServiceDate: c.lastServiceDate ? new Date(c.lastServiceDate) : undefined,
      })));

      this.courses = normalized as Course[];
      this.courseSubject.next(this.courses);
    });
  }

  getCourse(id: number) {
    return this.http.get<Course>(`${this.coursesUrl}/${id}`);
  }

  addCourse(course: Course) {
    const newId = String(Number(this.courses[this.courses.length - 1].id) + 1);
    course.id = newId;
    this.http.post<Course>(this.coursesUrl, course).subscribe((course) => {
      this.courses.push(course);
      this.courseSubject.next([...this.courses]);
    });
  }

  updateCourse(course: Course) {
    const updatedCourses = this.courses.map((c) => (c.id === course.id ? course : c));
    this.http.put<Course>(`${this.coursesUrl}/${course.id}`, course).subscribe((course) => {
      this.courses = updatedCourses;
      this.courseSubject.next(updatedCourses);
      // Keep local overrides in sync with the server update (prevents stale override)
      this.setServiceOverride(course.id, !!(course as any).serviceDone, (course as any).lastServiceDate ? new Date((course as any).lastServiceDate) : undefined);
    });
  }

  // Effect-friendly update that returns the HTTP observable
  updateCourseForEffect(course: Course) {
    // Sanitize payload so server stores primitive types (ISO date string, boolean)
    const payload: any = {
      ...course,
      lastServiceDate: course.lastServiceDate ? new Date(course.lastServiceDate).toISOString() : null,
      serviceDone: !!course.serviceDone,
    };
    return this.http.put<Course>(`${this.coursesUrl}/${course.id}`, payload);
  }

  // Update the local cache (BehaviorSubject) with the new course
  setLocalCourse(course: Course) {
    const updated = this.courses.map((c) => (String(c.id) === String(course.id) ? course : c));
    this.courses = updated;
    this.courseSubject.next([...this.courses]);
  }

  // --- Local persistence for service overrides (serviceDone + optional lastServiceDate) ---
  private SERVICE_OVERRIDES_KEY = 'courses.overrides';

  setServiceOverride(id: number | string, serviceDone: boolean, lastServiceDate?: Date | null) {
    const map = this._loadOverrides();
    map[String(id)] = {
      serviceDone: !!serviceDone,
      lastServiceDate: lastServiceDate ? new Date(lastServiceDate).toISOString() : null,
    };
    localStorage.setItem(this.SERVICE_OVERRIDES_KEY, JSON.stringify(map));
  }

  getServiceOverride(id: number | string): { serviceDone?: boolean; lastServiceDate?: string | null } | undefined {
    const map = this._loadOverrides();
    return map[String(id)];
  }

  _loadOverrides(): Record<string, { serviceDone?: boolean; lastServiceDate?: string | null }> {
    try {
      const raw = localStorage.getItem(this.SERVICE_OVERRIDES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      return {};
    }
  }

  // Merge overrides into an array of courses
  applyOverridesToCourses(courses: any[]): Course[] {
    const map = this._loadOverrides();
    return courses.map((c) => {
      const o = map[String(c.id)];
      return {
        ...c,
        serviceDone: o && typeof o.serviceDone !== 'undefined' ? o.serviceDone : c.serviceDone,
        lastServiceDate: o && o.lastServiceDate ? new Date(o.lastServiceDate) : c.lastServiceDate ? new Date(c.lastServiceDate) : undefined,
      } as Course;
    });
  }

  deleteCourse(id: number) {
    this.http.delete(`${this.coursesUrl}/${id}`).subscribe({
      next: () => {
        this.courses = this.courses.filter(c => String(c.id) !== String(id));
        this.courseSubject.next([...this.courses]);
      },
      error: (err) => console.error(err)
    });
  }
}
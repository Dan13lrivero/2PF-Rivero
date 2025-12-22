import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Course } from '../../../../core/services/courses/model/Course';

export const CoursesActions = createActionGroup({
  source: 'Courses',
  events: {
    'Load Courses': emptyProps(),
    'Load Courses Success': props<{ courses: Course[] }>(),
    'Load Courses Failure': props<{ error: any }>(),
    'Add Course': props<{ course: Course }>(),
    'Update Courses': props<{ courses: Course[] }>(),
    // Single course update
    'Update Course': props<{ course: Course }>(),
    'Update Course Success': props<{ course: Course }>(),
    'Update Course Failure': props<{ error: any }>(),
    'Delete Course': props<{ id: number }>(),
    'Delete Course Success': props<{ id: number }>(),
    'Delete Course Failure': props<{ error: any }>(),
    'Clear Courses': emptyProps(),
  },
});
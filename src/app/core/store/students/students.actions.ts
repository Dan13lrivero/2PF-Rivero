import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Student } from '../../models/Student';

export const StudentsActions = createActionGroup({
  source: 'Students',
  events: {
    'Load Students': emptyProps(),
    'Load Students Success': props<{ students: Student[] }>(),
    'Load Students Failure': props<{ error: any }>(),
    
    // Add Student
    'Add Student': props<{ student: Student }>(),
    'Add Student Success': props<{ student: Student }>(),
    'Add Student Failure': props<{ error: any }>(),
    
    // Update Student
    'Update Student': props<{ id: string; student: Student }>(),
    'Update Student Success': props<{ student: Student }>(),
    'Update Student Failure': props<{ error: any }>(),
    
    // Delete Student
    'Delete Student': props<{ id: string }>(),
    'Delete Student Success': props<{ id: string }>(),
    'Delete Student Failure': props<{ error: any }>(),
    
    // Set Student to Edit
    'Set Student Edit': props<{ id: string }>(),
    'Clear Student Edit': emptyProps(),
  },
});
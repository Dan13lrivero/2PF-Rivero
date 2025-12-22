import { createFeature, createReducer, on } from '@ngrx/store';
import { StudentsActions } from './students.actions';
import { Student } from '../../models/Student';

export interface StudentsState {
  students: Student[];
  loading: boolean;
  error: any;
  studentEdit: Student | null;
}

const initialState: StudentsState = {
  students: [],
  loading: false,
  error: null,
  studentEdit: null,
};

export const reducer = createReducer(
  initialState,
  
  // Load Students
  on(StudentsActions.loadStudents, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(StudentsActions.loadStudentsSuccess, (state, { students }) => ({
    ...state,
    students,
    loading: false,
    error: null,
  })),
  on(StudentsActions.loadStudentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Add Student
  on(StudentsActions.addStudent, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(StudentsActions.addStudentSuccess, (state, { student }) => ({
    ...state,
    students: [...state.students, student],
    loading: false,
    error: null,
  })),
  on(StudentsActions.addStudentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Update Student
  on(StudentsActions.updateStudent, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(StudentsActions.updateStudentSuccess, (state, { student }) => ({
    ...state,
    students: state.students.map(s => 
      s.id === student.id ? student : s
    ),
    loading: false,
    error: null,
    studentEdit: null,
  })),
  on(StudentsActions.updateStudentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Delete Student
  on(StudentsActions.deleteStudent, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(StudentsActions.deleteStudentSuccess, (state, { id }) => ({
    ...state,
    students: state.students.filter(s => s.id !== id),
    loading: false,
    error: null,
  })),
  on(StudentsActions.deleteStudentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Edit Student
  on(StudentsActions.setStudentEdit, (state, { id }) => ({
    ...state,
    studentEdit: state.students.find(s => s.id === id) || null,
  })),
  on(StudentsActions.clearStudentEdit, (state) => ({
    ...state,
    studentEdit: null,
  }))
);

export const studentsFeature = createFeature({
  name: 'students',
  reducer,
});

export const {
  name: studentsFeatureKey,
  reducer: studentsReducer,
  selectStudents,
  selectLoading,
  selectError,
  selectStudentEdit,
} = studentsFeature;
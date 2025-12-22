import { createFeature, createReducer, on } from "@ngrx/store";
import { Course } from "../../../../core/services/courses/model/Course";
import { CoursesActions } from "./courses.actions";

export const coursesFeatureKey = 'courses';

export interface CoursesState {
    courses: Course[];
    isLoading: boolean;
    error: any;
}

export const initialState: CoursesState = {
    courses: [],
    isLoading: false,
    error: null,
}

export const reducer = createReducer(
    initialState,
    on(CoursesActions.loadCourses, (state) => {
        return {
            ...state,
            isLoading: true,
        };
    }),
    on(CoursesActions.loadCoursesSuccess, (state, {courses}) => {
        return {
            ...state,
            isLoading: false,
            courses,
        }
    }),
    on(CoursesActions.loadCoursesFailure, (state, {error}) =>{
        return {
            ...state,
            isLoading: false,
            error,
        }
    }),
    on(CoursesActions.deleteCourse, (state) => {
        return {
            ...state,
            isLoading: true,
        };
    }),
    on(CoursesActions.deleteCourseSuccess, (state, {id}) => {
        return {
            ...state,
            isLoading: false,
            courses: state.courses.filter(c => String(c.id) !== String(id)),
        }
    }),
    on(CoursesActions.deleteCourseFailure, (state, {error}) => {
        return {
            ...state,
            isLoading: false,
            error,
        }
    }),
    on(CoursesActions.updateCourse, (state, { course }) => {
        return {
            ...state,
            isLoading: true,
            // Optimistic update: update the course in the store immediately
            courses: state.courses.map(c => (String(c.id) === String(course.id) ? course : c)),
        }
    }),
    on(CoursesActions.updateCourseSuccess, (state, { course }) => {
        return {
            ...state,
            isLoading: false,
            courses: state.courses.map(c => (String(c.id) === String(course.id) ? course : c)),
        }
    }),
    on(CoursesActions.updateCourseFailure, (state, { error }) => {
        return {
            ...state,
            isLoading: false,
            error,
        }
    })
)

export const coursesFeature = createFeature({
    name: coursesFeatureKey,
    reducer, 
})
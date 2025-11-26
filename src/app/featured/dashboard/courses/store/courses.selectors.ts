import { createFeatureSelector, createSelector } from "@ngrx/store";
import { coursesFeatureKey, CoursesState } from "./courses.reducer";

const selectCoursesrState = createFeatureSelector<CoursesState>(coursesFeatureKey)

export const selectCourses = createSelector(
    selectCoursesrState,
    (state: CoursesState) => state.courses
)

export const selectIsLoading = createSelector(
    selectCoursesrState,
    (state: CoursesState) => state.isLoading
)
export const selectError = createSelector(
    selectCoursesrState,
    (state: CoursesState) => state.error
)
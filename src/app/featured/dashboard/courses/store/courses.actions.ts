import { createActionGroup ,emptyProps, props } from "@ngrx/store";
import { Course } from "../../../../core/services/courses/model/Course";


export const CoursesActions = createActionGroup({
    source: "Courses",
    events: {
        'Load Courses': emptyProps(),
        'Load Courses Sucess': props<{ courses: Course[]}>(),
        'Load Courses Failure': props<{ error: any}>(),
    },
})
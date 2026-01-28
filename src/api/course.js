import request from "./request";

export function GetCategories() {
    return request.get("/course/categories");
}

export function GetCourses(params) {
    return request.post("/course/list", params);
}

export function UserAttendCourse(courseId) {
    return request.get(`/course/attend/${courseId}`);
}

export function GetCourseVideo(courseId) {
    return request.get(`/course/video/${courseId}`);
}
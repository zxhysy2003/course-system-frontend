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

export function GetUserCourseRelation(courseId) {
    return request.get(`/course/relation/${courseId}`);
}

export function UpdateCourseVideoProgressSeconds(data) {
    return request.post("/course/relation/updateProgressSeconds", null, { params: data });
}

export function GetCourseById(courseId) {
    return request.get(`/course/${courseId}`);
}

export function GetCourseByKp(kpId) {
    return request.get("/course/by-kp", {
        params: { kpId }
    });
}

export function GetKnowledgePointsByCourse(courseId) {
    return request.get("/course/by-c", {
        params: { courseId }
    });
}

import request from "./request";

export function GetCategories() {
    return request.get("/course/categories");
}

export function GetCourses(params) {
    return request.post("/course/list", params);
}
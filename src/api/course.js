import request from "./request";

export function GetCategories() {
    return request.get("/course/categories");
}
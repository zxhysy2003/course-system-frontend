import request from "./request";

export function login(data) {
    return request.post("/user/login", data);
}

export function getProfile() {
    return request.get("/user/profile");
}

export function Register(data) {
    return request.post("/user/register", data);
}
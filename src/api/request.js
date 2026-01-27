import axios from "axios";
import { useUserStore } from "../store/user";

const request = axios.create({
    baseURL: "http://localhost:8080",
    timeout: 5000,
});

request.interceptors.request.use(
    config => {
        const userStore = useUserStore();
        const token = userStore.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }
);

export default request;
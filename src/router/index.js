import {
    createRouter, 
    createWebHashHistory 
} from "vue-router";
import { useUserStore } from "../store/user";

import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import Layout from "@/views/Layout.vue";
import Profile from "@/views/Profile.vue";
import Course from "@/views/Course.vue";
import Recommend from "@/views/Recommend.vue";
import Dashboard from "@/views/Dashboard.vue";
import KnowledgeGraph from "@/views/KnowledgeGraph.vue";
import NotFound from "@/views/404.vue";
import CourseDetail from "@/views/CourseDetail.vue";


const routes = [
    {
        path: "/login",
        name: "Login",
        component: Login
    },
    {
        path: "/register",
        name: "Register",
        component: Register
    },
    // 将匹配所有内容并将其放在 `route.params.pathMatch` 下
    { 
        path: '/:pathMatch(.*)*', 
        name: 'NotFound', 
        component: NotFound 
    },
    {
        path: "/",
        component: Layout,
        children: [
            { path: "", redirect: "/course" },
            { path: "course", component: Course },
            { path: "courseDetail/:id", name: "CourseDetail", component: CourseDetail },
            { path: "recommend", component: Recommend },
            { path: "dashboard", component: Dashboard },
            { path: "graph", component: KnowledgeGraph },
            { path: "profile", component: Profile }
        ]
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    if (to.path !== "/login" && to.path !== "/register" && !userStore.isLoggedIn) {
        next({ name: "Login" });
    } else {
        next();
    }
});

export default router;
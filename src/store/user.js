import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode';

export const useUserStore = defineStore('user', () => {

    const token = ref(localStorage.getItem("token") || "")

    const userInfo = reactive({
        userId: -1,
        username: '',
        role: ''
    })

    const isLoggedIn = computed(() => userInfo.userId !== -1)

    const initUserInfo = () => {
        if (token.value) {
            const decoded = jwtDecode(token.value);
            userInfo.userId = decoded.userId;
            userInfo.username = decoded.username;
            userInfo.role = decoded.role;
        }
    }

    const setToken = (newToken) => {
        token.value = newToken;
        // Store the token in localStorage
        localStorage.setItem("token", newToken);
        // Decode the JWT token to extract user information
        const decoded = jwtDecode(newToken);
        userInfo.userId = decoded.userId;
        userInfo.username = decoded.username;
        userInfo.role = decoded.role;
        
    }

    const clearToken = () => {
        token.value = "";
        localStorage.removeItem("token");
        userInfo.userId = -1;
        userInfo.username = "";
        userInfo.role = "";
    }

    return {
        // state
        token,
        userInfo,
        // getters
        isLoggedIn,
        // actions
        initUserInfo,
        setToken,
        clearToken,
        
    }
})
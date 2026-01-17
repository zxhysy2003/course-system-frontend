<template>
    <el-container class="layout-container">
        <!-- 左侧菜单 -->
        <el-aside class="layout-aside">
            <div class="logo">
                <span class="logo-icon">📚</span>
                <span class="logo-text">课程系统</span>
            </div>
            <el-menu router class="side-menu" :collapse="false">
                <el-menu-item index="/course">
                    <el-icon><Document /></el-icon>
                    <span>课程学习</span>
                </el-menu-item>
                <el-menu-item index="/recommend">
                    <el-icon><Star /></el-icon>
                    <span>推荐</span>
                </el-menu-item>
                <el-menu-item index="/dashboard">
                    <el-icon><DataAnalysis /></el-icon>
                    <span>学习进度</span>
                </el-menu-item>
                <el-menu-item index="/graph">
                    <!-- <el-icon><NetworkCheck /></el-icon> -->
                    <el-icon><MagicStick /></el-icon>
                    <span>知识图谱</span>
                </el-menu-item>
                <el-menu-item index="/profile">
                    <el-icon><User /></el-icon>
                    <span>个人中心</span>
                </el-menu-item>
            </el-menu>
        </el-aside>

        <!-- 主区域 -->
        <el-container class="main-container">
            <el-header class="layout-header">
                <div class="header-left">
                    <span class="header-title">智能课程推荐系统</span>
                </div>
                <div class="header-right">
                    <el-dropdown @command="handleCommand">
                        <span class="user-info">
                            <el-icon><UserFilled /></el-icon>
                            {{ userStore.userInfo?.username || '用户' }}
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </el-header>
            <el-main class="layout-main">
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
import { ref, reactive, computed } from "vue"
import { useUserStore } from "../store/user"
import { useRouter } from "vue-router"
import { Document, Star, DataAnalysis, MagicStick, User, UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const userStore = useUserStore();
const router = useRouter();

const handleCommand = (command) => {
    if (command === 'logout') {
        userStore.clearToken();
        window.location.reload();
    } else if (command === 'profile') {
        router.push('/profile');
    }
}
</script>

<style scoped>
.layout-container {
    height: 100vh;
    display: flex;
}

.layout-aside {
    width: 220px;
    background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
    border-right: 1px solid #f0f0f0;
    overflow-y: auto;
    padding: 16px 0;
}

.logo {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px 24px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 8px;
}

.logo-icon {
    font-size: 24px;
    margin-right: 8px;
}

.logo-text {
    font-size: 16px;
    font-weight: 600;
    color: #333;
}

.side-menu {
    border: none;
}

:deep(.side-menu .el-menu-item) {
    padding: 0 16px;
    margin: 4px 8px;
    border-radius: 6px;
    transition: all 0.3s ease;
    height: 40px;
    line-height: 40px;
}

:deep(.side-menu .el-menu-item:hover) {
    background-color: #f0f0f0;
}

:deep(.side-menu .el-menu-item.is-active) {
    background-color: #e6f7ff;
    color: #1890ff;
}

:deep(.side-menu .el-icon) {
    margin-right: 8px;
}

.main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.layout-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    height: 64px;
    background-color: #ffffff;
    border-bottom: 1px solid #f0f0f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-left {
    display: flex;
    align-items: center;
}

.header-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

.header-right {
    display: flex;
    align-items: center;
}

.user-info {
    display: flex;
    align-items: center;
    padding: 0 12px;
    border-radius: 6px;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
}

.user-info:hover {
    background-color: #f0f0f0;
    color: #333;
}

:deep(.user-info .el-icon) {
    margin-right: 8px;
}

.layout-main {
    flex: 1;
    background-color: #f5f7fa;
    padding: 24px;
    overflow-y: auto;
}

/* 滚动条美化 */
.layout-aside::-webkit-scrollbar,
.layout-main::-webkit-scrollbar {
    width: 6px;
}

.layout-aside::-webkit-scrollbar-track,
.layout-main::-webkit-scrollbar-track {
    background: transparent;
}

.layout-aside::-webkit-scrollbar-thumb,
.layout-main::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 3px;
}

.layout-aside::-webkit-scrollbar-thumb:hover,
.layout-main::-webkit-scrollbar-thumb:hover {
    background: #bfbfbf;
}
</style>
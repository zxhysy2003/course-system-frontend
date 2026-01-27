<template>
  <div class="course-player-wrapper">
    <el-card shadow="hover" class="player-card">
      <!-- 视频区域 -->
      <div class="video-box">
        <video
          v-if="videoUrl"
          class="video"
          :src="videoUrl"
          controls
        />
      </div>

      <!-- 标题区 -->
      <div class="meta">
        <h2 class="title">{{ title }}</h2>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useUserStore } from "../store/user";
import { setAuthTokenToCookie, clearAuthTokenCookie } from "../utils/authCookie";

const videoUrl = ref("");
const store = useUserStore();
const props = defineProps({
  videoUrl: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  }
})



onMounted(() => {
  if (props.videoUrl) {
    // 从store获取token并设置到请求头
    const token = store.token;
    if (token) {
      setAuthTokenToCookie(token, 5); // 5分钟有效期
    } else {
      clearAuthTokenCookie();
    }
  }
})

watch(() => props.videoUrl, (newUrl) => {
  videoUrl.value = newUrl;
}, { immediate: true });

onBeforeUnmount(() => {
  clearAuthTokenCookie();
})

</script>

<style scoped>
.course-player-wrapper {
  padding: 20px;
}

.player-card {
  border-radius: 16px;
}

.video-box {
  width: 100%;
  background: black;
  border-radius: 12px;
  overflow: hidden;
}

.video {
  width: 100%;
  max-height: 520px;
  object-fit: contain;
}

.meta {
  margin-top: 14px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}
</style>

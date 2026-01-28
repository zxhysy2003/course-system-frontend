<template>
  <div class="course-player-wrapper">
    <el-card shadow="hover" class="player-card">
      <!-- 视频区域 -->
      <div class="video-box">
        <video
          v-if="props.videoUrl"
          ref="videoRef"
          class="video"
          :src="props.videoUrl"
          controls
          @error="handleVideoError"
          @play="handleVideoPlay"
          @pause="handleVideoPause"
          @timeupdate="handleTimeUpdate"
          @ended="handleVideoEnded"
        />
        <div v-else class="loading">加载中...</div>
      </div>

      <!-- 标题区 -->
      <div class="meta">
        <h2 class="title">{{ props.title }}</h2>
        <div class="watch-time">观看时长: {{ formatTime(totalWatchTime) }}</div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onBeforeUnmount, watch, ref } from 'vue'
import { useUserStore } from "../store/user";
import { setAuthTokenToCookie, clearAuthTokenCookie } from "../utils/authCookie";
import { ElMessage } from 'element-plus';
import { RecordLearningBehavior } from '../api/learningBehavior';

const store = useUserStore();
const videoRef = ref(null);

const props = defineProps({
  videoUrl: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  courseId: {
    type: [String, Number],
    required: true
  }
})

// 记录是否已发送过播放行为
const hasRecordedView = ref(false);

// 观看时间相关
const totalWatchTime = ref(0); // 总观看时长（秒）
const lastRecordTime = ref(0); // 上次记录的时间戳
const isPlaying = ref(false); // 当前是否在播放

// 当视频URL变化时设置认证Cookie
watch(() => props.videoUrl, (newUrl) => {
  if (newUrl) {
    const token = store.token;
    if (token) {
      setAuthTokenToCookie(token, 10); // 设置Cookie，过期时间10分钟 
      // console.log('设置视频认证 token:', newUrl);
    } else {
      // console.warn('未找到用户 token');
      clearAuthTokenCookie();
    }
  }
  // 重置标志位（切换视频时）
  hasRecordedView.value = false;
  totalWatchTime.value = 0;
  lastRecordTime.value = 0;
  isPlaying.value = false;
}, { immediate: true });

// 视频加载错误处理
const handleVideoError = (e) => {
  console.error('视频加载失败:', e);
  ElMessage.error('视频加载失败，请检查网络或权限');
};

// 视频播放事件处理（只记录一次）
const handleVideoPlay = async () => {
  isPlaying.value = true;
  lastRecordTime.value = Date.now();
  
  if (hasRecordedView.value) return; // 已记录过，只更新播放状态
  
  hasRecordedView.value = true;
  
  const res = await RecordLearningBehavior({
    courseId: Number(props.courseId),
    behaviorType: 'VIEW',
  });
  if (res.data.code === 200) {
    console.log('已记录学习行为 VIEW for courseId:', props.courseId);
  } else {
    console.error('记录学习行为失败:', res.data.msg);
    hasRecordedView.value = false;
  }
};

// 视频暂停事件处理
const handleVideoPause = () => {
  isPlaying.value = false;
};

// 时间更新事件（用于计算观看时长）
const handleTimeUpdate = () => {
  if (isPlaying.value) {
    const now = Date.now();
    const deltaTime = (now - lastRecordTime.value) / 1000; // 转换为秒
    
    // 只累加合理的时间差（防止拖拽等导致的异常值）
    if (deltaTime > 0 && deltaTime < 10) {
      totalWatchTime.value += deltaTime;
    }
    
    lastRecordTime.value = now;
  }
};

// 视频播放结束事件处理
const handleVideoEnded = async () => {
  isPlaying.value = false;
  
  const res = await RecordLearningBehavior({
    courseId: Number(props.courseId),
    behaviorType: 'FINISH',
  });
  if (res.data.code === 200) {
    console.log('已记录学习行为 FINISH for courseId:', props.courseId);
  } else {
    console.error('记录学习行为失败:', res.data.msg);
  }
};

// 格式化时间显示（秒 -> HH:MM:SS）
const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// 离开页面前发送观看时长记录
onBeforeUnmount(async () => {
  if (hasRecordedView.value && totalWatchTime.value > 0) {
    try {
      // 发送观看时长记录（不一定是完成）
      await RecordLearningBehavior({
        courseId: Number(props.courseId),
        behaviorType: 'STUDY',
        duration: Math.round(totalWatchTime.value)
      });
      console.log('离开前记录观看时长:', Math.round(totalWatchTime.value), '秒');
    } catch (e) {
      console.error('记录观看时长失败:', e);
    }
  }
  clearAuthTokenCookie();
});

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
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video {
  width: 100%;
  max-height: 520px;
  object-fit: contain;
}

.loading {
  color: white;
  font-size: 16px;
}

.meta {
  margin-top: 14px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.watch-time {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}
</style>

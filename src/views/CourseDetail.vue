<template>
  <div v-if="loading" class="loading-container">
    <el-icon class="is-loading"><Loading /></el-icon>
    <span>加载中...</span>
  </div>
  <CourseMediaPlayer
    v-else-if="courseVideoInfo.videoUrl"
    :videoUrl="courseVideoInfo.videoUrl"
    :title="courseVideoInfo.title"
    :courseId="courseId"
  />
  <el-empty v-else description="暂无视频资源" />
</template>

<script setup>
  import CourseMediaPlayer from './CourseMediaPlayer.vue';
  import { useRoute } from 'vue-router';
  import { GetCourseVideo } from '../api/course';
  import { onMounted, reactive, ref } from 'vue';
  import { ElMessage } from 'element-plus';
  import { Loading } from '@element-plus/icons-vue';

  const route = useRoute();
  const loading = ref(true);
  
  const courseId = route.params.id; // 从路由参数中获取课程ID
  const courseVideoInfo = reactive({
    title: "加载中...",
    videoUrl: "",
  });

  onMounted(async () => {
    if (!courseId) {
      ElMessage.error('课程ID不存在');
      loading.value = false;
      return;
    }
    try {
      // console.log('正在获取课程视频,课程ID:', courseId);
      const response = await GetCourseVideo(courseId);
      // console.log('获取课程视频响应:', response.data);
      if(response.data.code === 200) {
        courseVideoInfo.videoUrl = String(response.data.data);
        courseVideoInfo.title = route.params.title || `课程 ${courseId}`;
        // console.log('课程视频URL:', courseVideoInfo.videoUrl);
      } else {
        ElMessage.error(`获取课程视频失败: ${response.data.msg}`);
      }
    } catch (error) {
      // console.error('获取课程视频异常:', error);
      ElMessage.error('获取课程视频异常，请稍后重试: ' + error.message);
    } finally {
      loading.value = false;
    }
  });
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 12px;
  font-size: 16px;
  color: #666;
}
</style>
<template>
  <CourseMediaPlayer
    :videoUrl="course.videoUrl"
    :title="course.title"
  />
</template>

<script setup>
  import CourseMediaPlayer from './CourseMediaPlayer.vue';

  const course = {
    title: "计算机基础",
    videoUrl: "http://localhost:8080/video/1.mp4"
  };
</script>

<style scoped>
  
</style>
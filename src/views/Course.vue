<template>
  <div class="course-overview">
    <h2>课程总览</h2>
    <div class="subtitle">浏览、搜索并加入你感兴趣的课程</div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <el-input v-model.trim="searchQuery" placeholder="搜索课程名称、讲师或标签…" clearable @keyup.enter="searchCourses"
        class="toolbar-item input">
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>

      <el-select v-model="selectedCategory" placeholder="全部分类" clearable class="toolbar-item select">
        <el-option label="全部分类" value="" />
        <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>

      <el-select v-model="sortBy" placeholder="排序" class="toolbar-item select">
        <el-option label="按人数" value="popular" />
        <el-option label="按最新" value="recent" />
        <el-option label="按热度" value="hot" />
        <el-option label="按进度" value="progress" />
      </el-select>

      <el-checkbox v-model="showEnrolledOnly" class="toolbar-item">
        仅显示已加入
      </el-checkbox>

      <el-button type="primary" @click="searchCourses" :loading="loading" class="toolbar-item">
        搜索
      </el-button>
    </div>

    <!-- 课程列表 -->
    <el-row v-if="courses.length" :gutter="12">
      <el-col v-for="course in courses" :key="course.id" :xs="24" :sm="12" :md="8">
        <el-card shadow="hover" class="course-card">
          <el-image :src="course.cover" :alt="course.title" fit="cover" class="cover" />

          <div class="card-body">
            <div class="card-header">
              <span class="title" @click="openCourse(course)">
                {{ course.title }}
              </span>
            </div>

            <div class="meta">
              <span class="difficulty" :style="{ color: difficultyMap[course.difficulty]?.color }">
                {{ difficultyMap[course.difficulty]?.label || "未知" }}
                {{ getDifficultyStars(course.difficulty) }}
              </span>
              <span class="separator">|</span>
              <span class="category">{{ course.category }}</span>
            </div>

            <div class="tags">
              <el-tag v-for="tag in course.tags" :key="tag" size="small" effect="light">
                #{{ tag }}
              </el-tag>
            </div>

            <div class="desc">{{ course.description }}</div>

            <div class="stats">
              <div class="learners">
                <el-icon>
                  <User />
                </el-icon>
                <span>{{ course.learners.toLocaleString() }}</span>
              </div>
            </div>

            <el-progress v-if="course.enrolled" :percentage="course.progress" :stroke-width="10" />

            <div class="actions">
              <el-button type="primary" @click="openCourse(course)">
                {{ course.enrolled ? "继续学习" : "查看详情" }}
              </el-button>
              <el-button v-if="!course.enrolled" @click="enroll(course)" :loading="!!enrolling[course.id]">
                {{ enrolling[course.id] ? "加入中…" : "加入课程" }}
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-else description="未找到符合条件的课程">
      <el-button @click="resetFilters">重置筛选</el-button>
    </el-empty>

    <!-- 分页 -->
    <div class="pagination" v-if="courses.length">
      <el-pagination 
        background 
        layout="prev, pager, next, ->, sizes" 
        :current-page="page" 
        :page-size="pageSize"
        :total="total" 
        @current-change="p => { page = p; searchCourses(); }"
        @size-change="size => { pageSize = size; page = 1; searchCourses(); }" />
    </div>
  </div>
</template>


<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Search, User } from "@element-plus/icons-vue";
import request from "../api/request";
import { ElMessage } from "element-plus";
import { GetCategories } from "../api/course";
const router = useRouter();

// 查询与筛选
const searchQuery = ref("");
const selectedCategory = ref("");
const sortBy = ref("popular");
const showEnrolledOnly = ref(false);

// 分页
const page = ref(1);
const pageSize = ref(9);
const total = ref(0);

// 难度等级映射
const difficultyMap = {
  1: { label: "入门", color: "#67c23a" },
  2: { label: "初级", color: "#409eff" },
  3: { label: "中级", color: "#e6a23c" },
  4: { label: "高级", color: "#f56c6c" },
  5: { label: "专家", color: "#ad3c3c" },
};

// 获取难度星级显示（1-5个星）
const getDifficultyStars = (difficulty) => {
  return "★".repeat(difficulty) + "☆".repeat(5 - difficulty);
};

const courses = ref([]);

// 处理中状态：使用对象映射以便响应式
const enrolling = ref({});

// 搜索加载状态
const loading = ref(false);

// 分类列表
const categories = ref([{
  id: 0,
  name: "默认分类"
}]);
// 组件挂载时获取分类列表和初始课程列表
onMounted(async () => {
  try {
    const res = await GetCategories();
    categories.value = res.data?.data || [];
  } catch (e) {
    ElMessage.error("获取分类列表失败");
  }

  // 初始搜索
  searchCourses();
});

// TODO: 这里可以根据后端接口调整请求参数
// 搜索课程
const searchCourses = async () => {
  loading.value = true;
  try {
    const res = await request.get("/", {
      params: {
        keyword: searchQuery.value,
        category: selectedCategory.value,
        sortBy: sortBy.value,
        enrolledOnly: showEnrolledOnly.value,
        page: page.value,
        pageSize: pageSize.value
      }
    });

    courses.value = res.data?.records || [];
    total.value = res.data?.total || 0;
    ElMessage.success("搜索成功");
  } catch (e) {
    ElMessage.error("搜索失败");
  } finally {
    loading.value = false;
  }
};

// 充值搜索选项
const resetFilters = () => {
  searchQuery.value = "";
  selectedCategory.value = "";
  sortBy.value = "popular";
  showEnrolledOnly.value = false;
  searchCourses();
};

const OnPageSizeChange = (size) => {
  pageSize.value = size;
  page.value = 1;
}

const openCourse = (course) => {
  router?.push({ name: "CourseDetail", params: { id: course.id } }).catch(() => {
  });
};

const enroll = async (course) => {
  if (enrolling.value[course.id]) return;
  enrolling.value[course.id] = true;
  try {
    await new Promise((res) => setTimeout(res, 600)); // 模拟网络延迟
    course.enrolled = true;
    course.progress = 0;
  } finally {
    enrolling.value[course.id] = false;
  }
};

// 筛选项变化自动搜索
watch(
  [selectedCategory, sortBy, showEnrolledOnly],
  searchCourses
);


</script>

<style scoped>
.course-overview {
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;
}

.subtitle {
  color: #666;
  margin-top: 4px;
  font-size: 14px;
  margin-bottom: 12px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin: 12px 0 16px;
}

.toolbar .input {
  flex: 1 1 320px;
}

.toolbar .select {
  width: 160px;
}

.course-card {
  margin-bottom: 12px;
}

.cover {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  background: #f6f6f6;
  border-radius: 6px;
}

.card-body {
  padding: 10px 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 16px;
  cursor: pointer;
}

.meta {
  color: #666;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.difficulty {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.separator {
  color: #ddd;
}

.category {
  color: #666;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.desc {
  color: #444;
  font-size: 14px;
  line-height: 1.6;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.learners {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #555;
  font-size: 13px;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
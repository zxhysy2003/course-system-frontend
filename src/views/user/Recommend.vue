<template>
  <div class="recommend-page" v-loading="loading">
    <div class="header">
      <div class="title">课程推荐</div>
      <div class="subtitle">根据协同过滤与知识掌握度生成的个性化推荐</div>
    </div>

    <el-card class="summary-card" shadow="hover">
      <div class="summary-row">
        <div class="summary-item">
          <div class="label">用户 ID</div>
          <div class="value">{{ recommendation.userId ?? "-" }}</div>
        </div>
        <div class="summary-item">
          <div class="label">推荐数量</div>
          <div class="value">{{ items.length }}</div>
        </div>
        <div class="summary-item">
          <div class="label">更新时间</div>
          <div class="value">{{ lastUpdatedText || "-" }}</div>
        </div>
      </div>
    </el-card>

    <el-row v-if="items.length" :gutter="16" class="cards">
      <el-col v-for="item in items" :key="item.courseId" :xs="24" :lg="12">
        <el-card shadow="hover" class="recommend-card">
          <template #header>
            <div class="card-header">
              <div class="course-id">
                <span class="course-title" @click="openCourse(item)">
                  {{ item.title || `课程 #${item.courseId}` }}
                </span>
              </div>
              <el-tag type="success" effect="light">综合推荐</el-tag>
            </div>
          </template>

          <div class="score-grid">
            <div class="score-item">
              <div class="label">推荐评分</div>
              <div class="value">{{ item.finalScore.toFixed(1) }}</div>
            </div>
            <div class="score-item">
              <div class="label">准备度</div>
              <el-progress :percentage="toPercent(item.readiness)" :stroke-width="10" />
            </div>
          </div>

          <div class="section">
            <div class="section-title">相关知识点</div>
            <div class="tag-list">
              <el-tag v-for="kp in item.knowledgePoints" :key="kp.id" effect="light">
                {{ kp.name }} · {{ difficultyText(kp.difficulty) }}
              </el-tag>
            </div>
          </div>

          <div class="section">
            <div class="section-title">待补齐前置掌握度</div>
            <el-table :data="item.missingPrerequisitesMastery" size="small" border>
              <el-table-column prop="name" label="知识点" min-width="160" />
              <el-table-column prop="difficulty" label="难度" width="90">
                <template #default="{ row }">
                  {{ difficultyText(row.difficulty) }}
                </template>
              </el-table-column>
              <el-table-column prop="have" label="当前掌握" width="110">
                <template #default="{ row }">
                  {{ toPercent(row.have) }}%
                </template>
              </el-table-column>
              <el-table-column prop="need" label="目标掌握" width="110">
                <template #default="{ row }">
                  {{ toPercent(row.need) }}%
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="section">
            <div class="section-header">
              <div class="section-title">推荐学习路径</div>
              <el-button
                type="primary"
                plain
                size="small"
                class="toggle-button"
                @click="togglePath(item.courseId)"
              >
                {{ isPathExpanded(item.courseId) ? "收起路径" : "展开路径" }}
              </el-button>
            </div>
            <div v-show="isPathExpanded(item.courseId)" class="paths">
              <div v-for="(path, index) in item.learningPaths" :key="index" class="path">
                <div class="path-title">路径 {{ index + 1 }}</div>
                <el-steps direction="vertical" :active="path.length - 1">
                  <el-step
                    v-for="node in path"
                    :key="node.id"
                    :description="`难度：${difficultyText(node.difficulty)}`"
                  >
                    <template #title>
                      <span class="path-kp-link" @click="openKnowledgePointCourses(node)">
                        {{ node.name }}
                      </span>
                    </template>
                  </el-step>
                </el-steps>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-else description="暂无推荐数据">
      <el-button type="primary" @click="fetchRecommendation" :loading="loading">
        刷新推荐
      </el-button>
    </el-empty>

    <el-dialog
      v-model="courseSelectorVisible"
      title="请选择课程"
      width="520px"
      destroy-on-close
    >
      <el-empty v-if="!relatedCourses.length" description="该知识点暂无关联课程" />
      <div v-else class="course-option-list">
        <el-button
          v-for="course in relatedCourses"
          :key="course.id"
          text
          class="course-option-btn"
          @click="goToCourseDetail(course.id)"
        >
          <span class="course-option-title">{{ course.title || `课程 #${course.id}` }}</span>
          <span class="course-option-difficulty">难度：{{ difficultyText(course.difficulty) }}</span>
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { GetHybridRecommend } from "@/api/recommend";
import { GetCourseByKp } from "@/api/course";
import { logger } from "@/utils/logger";

const router = useRouter();

const recommendation = ref({
  userId: null,
  items: [],
});

const items = computed(() => recommendation.value.items || []);

const lastUpdatedText = ref("");

const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const loading = ref(false);

const normalizePayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return { userId: null, items: [] };
  }
  return {
    userId: payload.userId ?? null,
    items: Array.isArray(payload.items) ? payload.items : [],
  };
};

const fetchRecommendation = async () => {
  loading.value = true;
  try {
    const res = await GetHybridRecommend();
    const payload = res?.data?.data ?? res?.data ?? {};
    recommendation.value = normalizePayload(payload);
    lastUpdatedText.value = formatDate(new Date());
  } catch (e) {
    logger.error("获取推荐失败", e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchRecommendation();
});

const toPercent = (value) => Math.round(Number(value || 0) * 100);

const difficultyMap = {
  1: "初级",
  2: "中级",
  3: "高级"
};

const difficultyText = (level) => difficultyMap[level] || "未知";

const expandedMap = ref({});

const isPathExpanded = (courseId) => !!expandedMap.value[courseId];

const togglePath = (courseId) => {
  expandedMap.value = {
    ...expandedMap.value,
    [courseId]: !expandedMap.value[courseId],
  };
};

const openCourse = (item) => {
  router.push({
    name: "CourseDetail",
    params: { id: item.courseId },
  });
};

const relatedCourses = ref([]);
const courseSelectorVisible = ref(false);
const loadingCoursesByKp = ref(false);

const normalizeCourseListFromResponse = (res) => {
  const payload = res?.data?.data ?? res?.data;
  if (!Array.isArray(payload)) return [];
  return payload
    .map((item) => ({
      id: Number(item?.id),
      title: item?.title ?? "",
      difficulty: Number(item?.difficulty ?? 0),
    }))
    .filter((item) => Number.isFinite(item.id) && item.id > 0);
};

const openKnowledgePointCourses = async (node) => {
  const kpId = Number(node?.id);
  if (!Number.isFinite(kpId)) {
    logger.warn("该知识点缺少 id，无法查询关联课程");
    return;
  }
  if (loadingCoursesByKp.value) return;

  loadingCoursesByKp.value = true;
  try {
    const res = await GetCourseByKp(kpId);
    relatedCourses.value = normalizeCourseListFromResponse(res);
    courseSelectorVisible.value = true;
  } catch (e) {
    logger.error("获取知识点关联课程失败", e);
  } finally {
    loadingCoursesByKp.value = false;
  }
};

const goToCourseDetail = (courseId) => {
  courseSelectorVisible.value = false;
  router.push({
    name: "CourseDetail",
    params: { id: courseId },
  });
};
</script>

<style scoped>
.recommend-page {
  padding: 16px 20px 40px;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: #1f2a44;
}

.subtitle {
  color: #6b778c;
  font-size: 14px;
}

.summary-card {
  margin-bottom: 16px;
}

.summary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.summary-item .label {
  color: #97a3b6;
  font-size: 12px;
}

.summary-item .value {
  font-size: 18px;
  font-weight: 600;
  color: #24324b;
}

.cards {
  margin-top: 8px;
}

.recommend-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.course-id {
  font-size: 16px;
  font-weight: 600;
}

.course-title {
  cursor: pointer;
  color: #1f6feb;
}

.course-title:hover {
  color: #0f4fbf;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.score-item .label {
  font-size: 12px;
  color: #97a3b6;
  margin-bottom: 6px;
}

.score-item .value {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.section {
  margin-top: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.toggle-button {
  padding: 4px 10px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.paths {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.path-title {
  font-size: 13px;
  color: #5c6f8a;
  margin-bottom: 6px;
}

.path-kp-link {
  color: #1f6feb;
  cursor: pointer;
}

.path-kp-link:hover {
  color: #0f4fbf;
}

.course-option-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.course-option-btn {
  width: 100%;
  justify-content: flex-start;
  padding: 8px 0;
  height: auto;
}

.course-option-btn :deep(.el-button__text) {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.course-option-list :deep(.el-button + .el-button) {
  margin-left: 0;
  margin-top: 0;
}

.course-option-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-option-difficulty {
  font-size: small;
  margin-left: 10px;
  white-space: nowrap;
}

@media (max-width: 960px) {
  .score-grid {
    grid-template-columns: 1fr;
  }
}
</style>

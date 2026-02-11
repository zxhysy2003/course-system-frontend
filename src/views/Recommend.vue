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
                    :title="node.name"
                    :description="`难度：${difficultyText(node.difficulty)}`"
                  />
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
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { GetHybridRecommend } from "@/api/recommend";
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
  1: "入门",
  2: "初级",
  3: "中级",
  4: "高级",
  5: "专家",
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

@media (max-width: 960px) {
  .score-grid {
    grid-template-columns: 1fr;
  }
}
</style>

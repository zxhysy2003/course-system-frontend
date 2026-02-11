import request from "./request";

export function GetKnowledgeGraph(courseId) {
  return request.get("/analysis/knowledge-graph", {
    params: { courseId },
  });
}

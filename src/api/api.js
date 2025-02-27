import axios from "axios";

const API_BASE_URL = "http://backend:8080"; // 실제 API 주소로 변경하세요

// 🔹 초기 문제 가져오기 (POST 요청)
export const fetchProblem = async (userId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/initial`, {
      userId
    });
    console.log("init", response.data);
    return response.data; // { problem, comments, blocks }
  } catch (error) {
    console.error("문제 가져오기 실패:", error);
    throw error;
  }
};

// 🔹 정답 제출하기 (GET 요청)
export const submitAnswer = async (userId, combi) => {
  try {
    console.log(combi);
    const response = await axios.post(`${API_BASE_URL}/api/submit`, {
        userId,
        combi
    });
    return response.data; // { isAnswer, feedback }
  } catch (error) {
    console.error("정답 제출 실패:", error);
    throw error;
  }
};

// 🔹 최종 피드백 가져오기 (GET 요청)
export const fetchFinalFeedback = async (userId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/final`, {
        userId
    });
    return response.data; // { feedback }
  } catch (error) {
    console.error("최종 피드백 가져오기 실패:", error);
    throw error;
  }
};

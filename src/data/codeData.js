// 문제 리스트
export const problemData = {
    1: {
      questionText: "1부터 10까지 합계를 구하는 프로그램을 만드세요.",
      correctSteps: [
        ["sum", "=", "0"],
        ["for", "i", "in", "range", "(", "1", ",", "11", ")", ":"],
        ["+", "sum", "+=", "i"],
        ["print", "(", "sum", ")"],
      ],
      instructions: [
        "# 합계를 저장할 변수 초기화",
        "# for문 정의",
        "# sum에 i 더하기",
        "# 계산된 합계 출력",
      ],
    },
    2: {
      questionText: "리스트의 모든 요소를 더하는 프로그램을 만드세요.",
      correctSteps: [
        ["numbers", "=", "[", "1", ",", "2", ",", "3", ",", "4", "]"],
        ["sum_result", "=", "sum", "(", "numbers", ")"],
        ["print", "(", "sum_result", ")"],
      ],
      instructions: [
        "# 리스트 정의",
        "# 리스트의 합계 계산",
        "# 결과 출력",
      ],
    },
    3: {
      questionText: "1부터 N까지의 합계를 구하는 프로그램을 만드세요.",
      correctSteps: [
        ["N", "=", "int", "(", "input", "(", ")", ")"],
        ["sum_result", "=", "sum", "(", "range", "(", "1", ",", "N", "+", "1", ")", ")"],
        ["print", "(", "sum_result", ")"],
      ],
      instructions: [
        "# N을 입력받음",
        "# 1부터 N까지의 합계 계산",
        "# 결과 출력",
      ],
    }
};
  
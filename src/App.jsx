import { useState } from "react";
import CodeEditor from "./components/CodeEditor"; // CodeEditor 가져오기

console.log("앱 실행딤");
export default function App() {
  const [selectedProblem, setSelectedProblem] = useState(null);

  const handleProblemSelect = (problemNumber) => {
    console.log(`문제 ${problemNumber} 선택됨`);
    setSelectedProblem(problemNumber);
  };

  return (
    <div>
      {selectedProblem === null ? (
        <StartPage onSelectProblem={handleProblemSelect} />
      ) : (
        <CodeEditor problemNumber={selectedProblem} />
      )}
    </div>
  );
}


function StartPage({ onSelectProblem }) {
  console.log("StartPage 렌더링됨, onSelectProblem:", onSelectProblem);
  console.log("onSelectProblem:", onSelectProblem); // ✅ 함수가 정상적으로 전달되었는지 확인

  return (
    <div style={startPageStyle}>
      <h1 style={titleStyle}>Python 코딩 연습</h1>
      <p style={subtitleStyle}>원하는 문제를 선택하세요.</p>
      <div style={buttonContainerStyle}>
        {[1, 2, 3].map((num) => (
          <button key={num} style={buttonStyle} onClick={() => {
            console.log(`문제 ${num} 버튼 클릭됨`); 
            if (onSelectProblem) onSelectProblem(num); // ✅ 함수가 undefined일 경우 대비
          }} disabled={false}>
            문제 {num}
          </button>
        ))}
      </div>
    </div>
  );
}


// ✅ 기본 스타일 (없으면 버튼이 안 보일 수 있음)
const startPageStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",  // ✅ 수직 가운데 정렬
  alignItems: "center",      // ✅ 수평 가운데 정렬 추가
  height: "100vh",
  width: "100vw",            // ✅ 전체 너비 사용하여 가운데 정렬
  backgroundColor: "#f8f3f9",
};

const titleStyle = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#1F2937",
  marginBottom: "10px",
};

const subtitleStyle = {
  fontSize: "18px",
  color: "#4B5563",
  marginBottom: "20px",
};

const buttonContainerStyle = {
  display: "flex",
  gap: "15px",
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  fontWeight: "bold",
  color: "white",
  backgroundColor: "#4A90E2",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "background 0.3s",
};

buttonStyle[":hover"] = {
  backgroundColor: "#357ABD",
};
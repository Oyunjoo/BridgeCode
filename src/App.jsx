// import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useState } from "react";
import CodeEditor from "./components/CodeEditor"; // CodeEditor.jsx가 components 폴더에 있다고 가정

export default function App() {
  const [selectedProblem, setSelectedProblem] = useState(null);

  const handleProblemSelect = (problemNumber) => {
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
  return (
    <div style={startPageStyle}>
      <h1 style={titleStyle}>Python 코딩 연습</h1>
      <p style={subtitleStyle}>원하는 문제를 선택하세요.</p>
      <div style={buttonContainerStyle}>
        {[1, 2, 3].map((num) => (
          <button key={num} style={buttonStyle} onClick={() => onSelectProblem(num)}>
            문제 {num}
          </button>
        ))}
      </div>
    </div>
  );
}

const startPageStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  backgroundColor: "#f3f4f6",
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


import { useState } from "react";
import StartPage from "./components/StartPage";
import CodeEditor from "./components/CodeEditor"; // CodeEditor 가져오기

console.log("앱 실행됨");
export default function App() {
  const [selectedProblem, setSelectedProblem] = useState(null);

  const handleProblemSelect = (problemNumber) => {
    console.log(`문제 ${problemNumber+1} 선택됨`);
    setSelectedProblem(problemNumber);
  };

  const handleReset = () => {
    setSelectedProblem(null);
  }

  return (
    <div>
      {selectedProblem === null ? (
        <StartPage onSelectProblem={handleProblemSelect} />
      ) : (
        <CodeEditor problemNumber={selectedProblem} onReset={handleReset} />
      )}
    </div>
  );
}
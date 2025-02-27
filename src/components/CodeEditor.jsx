import { useEffect, useState } from "react";
// import { problemData } from "../data/codeData";
import { fetchProblem, submitAnswer, fetchFinalFeedback } from "../api/api";

import { DndContext, closestCenter } from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import "./CodeEditor.css";

const boxStyle = {
    padding: "6px 12px",
    border: "2px solid #4A90E2",
    backgroundColor: "#E3F2FD",
    borderRadius: "8px",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    cursor: "grab",
    minWidth: "10px",
    minHeight: "20px",
    margin: "10px",
    fontSize: "16px",
    whiteSpace: "nowrap"
};

const titleStyle = {
    fontSize: "26px",
    fontWeight: "bold",
    textAlign: "center",
    color: "#1F2937",
    marginBottom: "10px",
};

const instructionStyle = {
    fontSize: "18px",
    fontWeight: "500",
    color: "#374151",
};

const containerStyle = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    border: "2px solid #ccc",
    borderRadius: "10px",
    minHeight: "160px", // 컨테이너 크기 유지
    width: "100%",
    boxSizing: "border-box",
    flexShrink: 0, // 크기 줄어들지 않게 설정
};

const wrapperStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px", // drag-container와 drop-container 사이 간격 추가
    width: "100%",
    minHeight: "300px",
};

const flexContainerStyle = {
    display: "flex",
    justifyContent: "space-between", // 좌우 공간 최대로 활용
    alignItems: "center",
    width: "100vw",
    maxWidth: "1400px", // 전체 컨테이너 크기 확대
    gap: "40px",
};

const sectionStyle = {
    width: "70%", // 좌우 영역 확장
    maxWidth: "600px",
    padding: "10px",
};

const questionStyle = {
    fontSize: "20px",
    fontWeight: "bold",
    textAlign: "center",
    padding: "15px",
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: "10px",
    border: "2px solid #1F2937",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
};

function DraggableItem({ id, value }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useDraggable({ id });
    const style = {
      ...boxStyle,
      transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
      transition,
    };
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="draggable-item">
        {value}
      </div>
    );
}
  
function DropZone({ id, children }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
    <div ref={setNodeRef} className={`drop-zone ${isOver ? 'highlight' : ''}`} id={id}>
      {children ? (
        <div style={{ ...boxStyle, border: "2px solid #4A90E2", backgroundColor: "#E3F2FD" }}>{children}</div>
      ) : (
        <div style={{ ...boxStyle, border: "2px dashed #dc3545", backgroundColor: "#f8d7da" }}></div>
      )}
    </div>
    );
}

export default function CodeEditor({ problemNumber }) {
    const [userId] = useState("user123");
    const [problemText, setProblemText] = useState(""); // 문제 설명
    const [comments, setComments] = useState([]); // 주석 목록
    const [blocks, setBlocks] = useState([]); // 정답 블록 목록
    const [droppedItems, setDroppedItems] = useState([]);
    const [isCorrect, setIsCorrect] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [step, setStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over) {
          const newDroppedItems = [...droppedItems];
          newDroppedItems[parseInt(over.id)] = items.find((item) => item.id === active.id);
          setDroppedItems(newDroppedItems);
          setItems(items.filter((item) => item.id !== active.id));
        }
    };

    const handleReset = () => {
        setStep(0);
        setCompletedSteps([]);
        setDroppedItems(Array(blocks.length).fill(null));
        setIsCorrect(null);
        setFeedback("");
    };      
  
    useEffect(() => {
      // 🔹 문제 불러오기 API 호출
      const loadProblem = async () => {
        try {
          const data = await fetchProblem(userId, problemNumber);
          setProblemText(data.problem);
          setComments(data.comments);
          setBlocks(data.blocks); // ✅ 평탄화 X, 이중 리스트 그대로 저장
          setDroppedItems(Array(data.blocks.length).fill(null)); // ✅ 줄 수에 맞게 초기화
          setStep(0);
        } catch (error) {
          console.error("문제를 불러오는 중 오류 발생", error);
        }
      };
  
      loadProblem();
    }, [problemNumber, userId]);
  
    const handleSubmit = async () => {
      const userAnswer = droppedItems.map(item => item ? item.value : "");
      
      try {
        const response = await submitAnswer(userId, problemNumber, userAnswer);
        setIsCorrect(response.isAnswer);
        setFeedback(response.feedback);

        if (response.isAnswer) {
            setCompletedSteps([...completedSteps, userAnswer.join(" ")]); // ✅ 현재 줄을 저장
            setStep(step + 1); // ✅ 다음 줄로 이동
            setDroppedItems(Array(blocks[step + 1]?.length || 0).fill(null)); // ✅ 다음 줄 크기에 맞게 초기화
        }
      } catch (error) {
        console.error("정답 제출 실패:", error);
      }
    };


  return (
    <div className="code-editor-container" style={{ width: "70vw", height: "50vh", display: "flex", backgroundColor: "#f8f3f9"}}>
      <div className="flex-container" style={{ ...flexContainerStyle, display: "flex", justifyContent: "center", alignItems: "center", width: "70%", maxWidth: "1000px" }}>
        <div className="left-section" style={sectionStyle}>
          <h2 style={titleStyle}>코드 한 줄씩 완성하기</h2>
          <div className="instruction-box" style={instructionStyle}>
            <p>{comments[step - 1]}</p>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div style={wrapperStyle}>
                <div className="drag-container" style={{...containerStyle, backgroundColor: "#fafafa"}}>
                  {blocks.map((item, index) => (
                    <DraggableItem key={index} id={`word-${index}`} value={item} />
                  ))}
                </div>
                <div className="drop-container" style={{ ...containerStyle, display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", backgroundColor: "#fff59d" }}>
                  {droppedItems.map((item, index) => (
                    <DropZone key={index} id={index.toString()}>{item?.value}</DropZone>
                  ))}
                </div>
              </div>
            </DndContext>
          </div>

          <button className="submit-button" onClick={handleSubmit} style={{ padding: "8px 16px", fontSize: "14px", width: "auto", minWidth: "100px", alignItems: "center" }}>제출하기</button>
          {isCorrect !== null && <p>{isCorrect ? "정답!" : "오답!"} - {feedback}</p>}

          {/* ✅ 모든 문제를 맞췄을 때 처음 화면으로 돌아가는 버튼 */}
          {completedSteps.length === comments.length && (
            <button
              onClick={handleReset}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "bold",
                backgroundColor: "#4A90E2",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background 0.3s",
                width: "auto", 
                minWidth: "100px"
              }}
            >
              처음 화면으로 돌아가기
            </button>
          )}
        </div>

        <div className="right-section" style={sectionStyle}>
          <div className="horizontal-layout" style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <h3 style={{...questionStyle, alignItems: "center"}}>Q. {problemText}</h3>
            <div className="code-preview" style={{ display: "flex", flexDirection: "column", width: "100%", alignItems:"center" }}>
              {comments.map((comment, index) => (
                <p key={index} className="pending" style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ textAlign: "left", whiteSpace: "pre" }}>{completedSteps.length > index ? (completedSteps[index][0]=='+' ? "         " + completedSteps[index] : completedSteps[index]) : ""}</span>
                  <span style={{ textAlign: "right", color: "gray", fontStyle: "italic" }}>{comment}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
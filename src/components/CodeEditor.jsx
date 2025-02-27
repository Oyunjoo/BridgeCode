import { useEffect, useState } from "react";
import { fetchProblem, submitAnswer, fetchFinalFeedback } from "../api/api";
import { motion } from "framer-motion";

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
    // margin: "0.5px",
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

export default function CodeEditor({ onReset }) {
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
  
          setBlocks(prevBlocks => {
              const updatedBlocks = [...prevBlocks];
  
              // ✅ 첫 글자가 "+"면 제거
              if (updatedBlocks[step][0] === "+") {
                  updatedBlocks[step] = updatedBlocks[step].slice(1);
              }
  
              // ✅ 이제 드래그된 아이템을 찾기
              const draggedItem = updatedBlocks[step]?.find((word, index) => `word-${index}` === active.id);
  
              if (draggedItem) {
                  newDroppedItems[parseInt(over.id)] = { id: active.id, value: draggedItem };
                  setDroppedItems(newDroppedItems);
  
                  // ✅ 드래그된 아이템을 제거하고 업데이트
                  updatedBlocks[step] = updatedBlocks[step].filter((word, index) => `word-${index}` !== active.id);
              }
  
              return updatedBlocks;
          });
      }
    };
  

    const handleReset = () => {
        setStep(0);
        setCompletedSteps([]);
        setDroppedItems([]);
        setIsCorrect(null);
        setFeedback("");
        setBlocks([]);
        onReset();
    };     
  
    useEffect(() => {
      // 🔹 문제 불러오기 API 호출
      const loadProblem = async () => {
        try {
          const data = await fetchProblem(userId);
          setProblemText(data.problem);
          setComments(data.comments);
          setBlocks(data.blocks); // ✅ 평탄화 X, 이중 리스트 그대로 저장
          setStep(0);
          setDroppedItems(Array(data.blocks[0].length || 0).fill(null)); // ✅ 줄 수에 맞게 초기화
        } catch (error) {
          console.error("문제를 불러오는 중 오류 발생", error);
        }
      };
  
      loadProblem();
    }, [userId]);

    useEffect(() => {
      if (!blocks[step]) return; // ✅ 방어 코드 추가
    
      // ✅ `+` 개수를 카운트하여 들여쓰기 수준 결정
      const indentLevel = blocks[step]?.findIndex(word => word !== "+"); // `+`가 아닌 첫 번째 요소의 인덱스
      const displayBlock = indentLevel > 0 ? blocks[step].slice(indentLevel) : blocks[step]; // `+` 제거된 블록
    
      console.log("📌 현재 Step:", step);
      console.log("📌 indentLevel (들여쓰기 개수):", indentLevel);
      console.log("📌 displayBlock:", displayBlock);
    
      // ✅ completedSteps에 indentLevel을 함께 저장
      if (indentLevel > 0) {
        setCompletedSteps(prevSteps => {
          const updatedSteps = [...prevSteps, { text: displayBlock.join(" "), indentLevel }];
          console.log("📌 (After Update) completedSteps:", updatedSteps);
          return updatedSteps;
        });
        setStep(prevStep => prevStep + 1);
      }
    }, [step]);
    
    
       
  
    const handleSubmit = async () => {
      const userAnswer = droppedItems.map(item => item ? item.value : "");
      
      try {
        const response = await submitAnswer(userId, userAnswer);
        setIsCorrect(response.answer);
    
        console.log("📌 제출한 답안 (userAnswer):", userAnswer);
        console.log("📌 서버 응답 (isCorrect):", response.answer);
        console.log("📌 서버 피드백:", response.feedback);
    
        setFeedback(response.feedback);
    
        if (response.answer) {
          const nextStep = step + 1;
          setCompletedSteps([...completedSteps, userAnswer.join(" ")]); // ✅ 현재 줄을 저장
    
          console.log("📌 updatedCompletedSteps (추가 후):", [...completedSteps, userAnswer.join(" ")]);
    
          if (nextStep < blocks.length) {
            setStep(nextStep); // ✅ 다음 줄로 이동
            
            const nextBlock = blocks[nextStep] || []; // 다음 줄 블록 가져오기 (안전 처리)
            const isIndented = nextBlock[0] === "+"; // ✅ 들여쓰기 여부 확인
    
            console.log("📌 nextBlock:", nextBlock);
            console.log("📌 isIndented (들여쓰기 여부):", isIndented);
    
            setDroppedItems(Array(isIndented ? nextBlock.length - 1 : nextBlock.length).fill(null)); // ✅ "+" 있을 경우 크기 줄이기
          } else {
            console.log("모든 문제를 완료했습니다.");
          }
        }
      } catch (error) {
        console.error("정답 제출 실패:", error);
      }
    };
    

  return (
    <div className="code-editor-container" style={{ height: "100vh", width: "100vw", display: "flex", backgroundColor: "#f8f3f9", justifyContent: "center" }}>
      <div className="flex-container" style={{ ...flexContainerStyle, display: "flex", justifyContent: "center", alignItems: "center", width: "70%", maxWidth: "1000px" }}>
        <div className="left-section" style={sectionStyle}>
          <h2 style={titleStyle}>코드 한 줄씩 완성하기</h2>
          <div className="instruction-box" style={instructionStyle}>
            <p>{comments[step - 1]}</p>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div style={wrapperStyle}>
              <div className="drag-container" style={{ ...containerStyle, backgroundColor: "#fafafa" }}>
                {displayBlock.map((item, index) => ( 
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

          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "15px", width: "100%" }}>
            {/* 🔹 Go Back 버튼 */}
            <button 
                onClick={handleReset} 
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    padding: "8px 16px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    backgroundColor: "#FF6B6B",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "background 0.3s",
                    textAlign: "center",
                    minHeight: "50px" // 최대 크기 제한
                }}
                className="back-button"
            >
                뒤로가기
            </button>

            {/* 제출하기 버튼 */}
            <button 
                onClick={handleSubmit} 
                style={{ 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",  // ✅ 버튼 너비 동일하게 설정
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  backgroundColor: "#4A90E2",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background 0.3s",
                  minHeight: "50px",
                  textAlign: "center",
                }}
                className="submit-button"
            >
                제출하기
            </button>
          </div>
          {isCorrect !== null && <p>{isCorrect ? "정답!" : "오답!"} - {feedback}</p>}
        </div>

        <div className="right-section" style={sectionStyle}>
          <div className="horizontal-layout" style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <h3 style={{...questionStyle, alignItems: "center"}}>Q. {problemText}</h3>
            <div className="code-preview" style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
              {comments.map((comment, index) => {
                const completedStep = completedSteps[index];
                if (!completedStep) return null; // ✅ 방어 코드 추가

                return (
                  <p key={index} className="pending" style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ textAlign: "left", whiteSpace: "pre" }}>
                      {" ".repeat(completedStep.indentLevel * 4) + completedStep.text} {/* ✅ 4칸 들여쓰기 적용 */}
                    </span>
                    <span style={{ textAlign: "right", color: "gray", fontStyle: "italic" }}>{comment}</span>
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
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

// export default function CodeEditor({ onReset }) {
//     const [userId] = useState("user123");
//     const [problemText, setProblemText] = useState(""); // 문제 설명
//     const [comments, setComments] = useState([]); // 주석 목록
//     const [blocks, setBlocks] = useState([]); // 정답 블록 목록
//     const [droppedItems, setDroppedItems] = useState([]);
//     const [isCorrect, setIsCorrect] = useState(null);
//     const [feedback, setFeedback] = useState("");
//     const [step, setStep] = useState(0);
//     const [completedSteps, setCompletedSteps] = useState([]);

//     const handleDragEnd = (event) => {
//       const { active, over } = event;
//       if (over) {
//           const newDroppedItems = [...droppedItems];
  
//           setBlocks(prevBlocks => {
//               const updatedBlocks = [...prevBlocks];
  
//               // ✅ 첫 글자가 "+"면 제거
//               if (updatedBlocks[step][0] === "+") {
//                   updatedBlocks[step] = updatedBlocks[step].slice(1);
//               }
  
//               // ✅ 이제 드래그된 아이템을 찾기
//               const draggedItem = updatedBlocks[step]?.find((word, index) => `word-${index}` === active.id);
  
//               if (draggedItem) {
//                   newDroppedItems[parseInt(over.id)] = { id: active.id, value: draggedItem };
//                   setDroppedItems(newDroppedItems);
  
//                   // ✅ 드래그된 아이템을 제거하고 업데이트
//                   updatedBlocks[step] = updatedBlocks[step].filter((word, index) => `word-${index}` !== active.id);
//               }
  
//               return updatedBlocks;
//           });
//       }
//     };
  

//     const handleReset = () => {
//         setStep(0);
//         setCompletedSteps([]);
//         setDroppedItems([]);
//         setIsCorrect(null);
//         setFeedback("");
//         setBlocks([]);
//         onReset();
//     };     
  
//     useEffect(() => {
//       // 🔹 문제 불러오기 API 호출
//       const loadProblem = async () => {
//         try {
//           const data = await fetchProblem(userId);
//           setProblemText(data.problem);
//           setComments(data.comments);
//           setBlocks(data.blocks); // ✅ 평탄화 X, 이중 리스트 그대로 저장
//           setStep(0);
//           setDroppedItems(Array(data.blocks[0].length || 0).fill(null)); // ✅ 줄 수에 맞게 초기화
//         } catch (error) {
//           console.error("문제를 불러오는 중 오류 발생", error);
//         }
//       };
  
//       loadProblem();
//     }, [userId]);

//     // const currentBlock = blocks[step] || []; // 현재 블록이 없을 경우 빈 배열 방지
//     // const isIndented = currentBlock[0] === "+"; // ✅ 맨 앞 요소가 "+"인지 체크
//     // const displayBlock = isIndented ? currentBlock.slice(1) : currentBlock; // ✅ "+"가 있으면 제거, 없으면 그대로

//     // useEffect(() => {
//     //   if (!blocks[step]) return; // ✅ 방어 코드 추가
    
//     //   const isIndented = blocks[step]?.[0] === "+"; // ✅ 들여쓰기 여부 체크
//     //   const displayBlock = isIndented ? blocks[step].slice(1) : blocks[step]; // ✅ + 제외한 코드
    
//     //   console.log("📌 현재 Step:", step);
//     //   console.log("📌 isIndented:", isIndented);
//     //   console.log("📌 displayBlock:", displayBlock);
//     // }, [step]);
    
//     const [displayBlock, setDisplayBlock] = useState([]); // ✅ displayBlock을 상태로 선언

//     useEffect(() => {
//       if (!blocks[step]) return; // ✅ 방어 코드 추가

//       // ✅ `+` 개수를 카운트하여 들여쓰기 수준 결정
//       const indentLevel = blocks[step]?.findIndex(word => word !== "+"); // `+`가 아닌 첫 번째 요소의 인덱스
//       const newDisplayBlock = indentLevel > 0 ? blocks[step].slice(indentLevel) : blocks[step]; // `+` 제거된 블록

//       console.log("📌 현재 Step:", step);
//       console.log("📌 indentLevel (들여쓰기 개수):", indentLevel);
//       console.log("📌 newDisplayBlock:", newDisplayBlock);

//       setDisplayBlock(newDisplayBlock); // ✅ `displayBlock`을 상태로 업데이트

//       // ✅ completedSteps에 indentLevel을 함께 저장
//       if (indentLevel > 0) {
//         setCompletedSteps(prevSteps => {
//           const updatedSteps = [...prevSteps, { text: newDisplayBlock.join(" "), indentLevel }];
//           console.log("📌 (After Update) completedSteps:", updatedSteps);
//           return updatedSteps;
//         });
//         setStep(prevStep => prevStep + 1);
//       }
//     }, [step, blocks]); // ✅ 의존성 배열에 blocks 포함
  
//     const handleSubmit = async () => {
//       const userAnswer = droppedItems.map(item => item ? item.value : "");
      
//       try {
//         const response = await submitAnswer(userId, userAnswer);
//         setIsCorrect(response.answer);
    
//         console.log("📌 제출한 답안 (userAnswer):", userAnswer);
//         console.log("📌 서버 응답 (isCorrect):", response.answer);
//         console.log("📌 서버 피드백:", response.feedback);
    
//         setFeedback(response.feedback);
    
//         if (response.answer) {
//           const nextStep = step + 1;
//           setCompletedSteps([...completedSteps, userAnswer.join(" ")]); // ✅ 현재 줄을 저장
    
//           console.log("📌 updatedCompletedSteps (추가 후):", [...completedSteps, userAnswer.join(" ")]);
    
//           if (nextStep < blocks.length) {
//             setStep(nextStep); // ✅ 다음 줄로 이동
            
//             const nextBlock = blocks[nextStep] || []; // 다음 줄 블록 가져오기 (안전 처리)
//             const isIndented = nextBlock[0] === "+"; // ✅ 들여쓰기 여부 확인
    
//             console.log("📌 nextBlock:", nextBlock);
//             console.log("📌 isIndented (들여쓰기 여부):", isIndented);
    
//             setDroppedItems(Array(isIndented ? nextBlock.length - 1 : nextBlock.length).fill(null)); // ✅ "+" 있을 경우 크기 줄이기
//           } else {
//             console.log("모든 문제를 완료했습니다.");
//           }
//         }
//       } catch (error) {
//         console.error("정답 제출 실패:", error);
//       }
//     };
    

//   return (
//     <div className="code-editor-container" style={{ height: "100vh", width: "100vw", display: "flex", backgroundColor: "#f8f3f9", justifyContent: "center" }}>
//       <div className="flex-container" style={{ ...flexContainerStyle, display: "flex", justifyContent: "center", alignItems: "center", width: "70%", maxWidth: "1000px" }}>
//         <div className="left-section" style={sectionStyle}>
//           <h2 style={titleStyle}>코드 한 줄씩 완성하기</h2>
//           <div className="instruction-box" style={instructionStyle}>
//             <p>{comments[step - 1]}</p>
//             <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//               <div style={wrapperStyle}>
//               <div className="drag-container" style={{ ...containerStyle, backgroundColor: "#fafafa" }}>
//                 {displayBlock.map((item, index) => ( 
//                   <DraggableItem key={index} id={`word-${index}`} value={item} />
//                 ))}
//               </div>
//                 <div className="drop-container" style={{ ...containerStyle, display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", backgroundColor: "#fff59d" }}>
//                   {droppedItems.map((item, index) => (
//                     <DropZone key={index} id={index.toString()}>{item?.value}</DropZone>
//                   ))}
//                 </div>
//               </div>
//             </DndContext>
//           </div>

//           <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "15px", width: "100%" }}>
//             {/* 🔹 Go Back 버튼 */}
//             <button 
//                 onClick={handleReset} 
//                 style={{
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     width: "100%",
//                     padding: "8px 16px",
//                     fontSize: "14px",
//                     fontWeight: "bold",
//                     backgroundColor: "#FF6B6B",
//                     color: "white",
//                     border: "none",
//                     borderRadius: "8px",
//                     cursor: "pointer",
//                     transition: "background 0.3s",
//                     textAlign: "center",
//                     minHeight: "50px" // 최대 크기 제한
//                 }}
//                 className="back-button"
//             >
//                 뒤로가기
//             </button>

//             {/* 제출하기 버튼 */}
//             <button 
//                 onClick={handleSubmit} 
//                 style={{ 
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   width: "100%",  // ✅ 버튼 너비 동일하게 설정
//                   padding: "8px 16px",
//                   fontSize: "14px",
//                   fontWeight: "bold",
//                   backgroundColor: "#4A90E2",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "8px",
//                   cursor: "pointer",
//                   transition: "background 0.3s",
//                   minHeight: "50px",
//                   textAlign: "center",
//                 }}
//                 className="submit-button"
//             >
//                 제출하기
//             </button>
//           </div>
//           {isCorrect !== null && <p>{isCorrect ? "정답!" : "오답!"} - {feedback}</p>}
//         </div>

//         <div className="right-section" style={sectionStyle}>
//           <div className="horizontal-layout" style={{ display: "flex", flexDirection: "column", width: "100%" }}>
//             <h3 style={{...questionStyle, alignItems: "center"}}>Q. {problemText}</h3>
//             <div className="code-preview" style={{ display: "flex", flexDirection: "column", width: "100%", alignItems:"center" }}>
//               {comments.map((comment, index) => (
//                 <p key={index} className="pending" style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
//                   <span style={{ textAlign: "left", whiteSpace: "pre" }}>{" ".repeat(completedStep.indentLevel * 4) + completedStep.text}</span>
//                   <span style={{ textAlign: "right", color: "gray", fontStyle: "italic" }}>{comment}</span>
//                 </p>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

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

  // const handleDragEnd = (event) => {
  //   const { active, over } = event;
  //   if (over) {
  //       const newDroppedItems = [...droppedItems];

  //       setBlocks(prevBlocks => {
  //           const updatedBlocks = [...prevBlocks];

  //           // ✅ "+" 문자로 시작하는 요소들 제거는 displayBlock 계산에서 처리하므로 여기서는 필요 없음
            
  //           // ✅ 이제 드래그된 아이템을 찾기
  //           const draggedItem = displayBlock.find((word, index) => `word-${index}` === active.id);

  //           if (draggedItem) {
  //               newDroppedItems[parseInt(over.id)] = { id: active.id, value: draggedItem };
  //               setDroppedItems(newDroppedItems);

  //               // ✅ 드래그된 아이템을 제거하고 업데이트
  //               setDisplayBlock(prev => prev.filter((word, index) => `word-${index}` !== active.id));
  //           }

  //           return updatedBlocks;
  //       });
  //   }
  // };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return; // ✅ 드롭된 위치가 없으면 리턴

    console.log("📌 Dragged Item ID:", active.id);
    console.log("📌 Dropped Over ID:", over.id);

    const newDroppedItems = [...droppedItems];

    // ✅ 드래그된 아이템 찾기
    const draggedItem = displayBlock.find((word, index) => `word-${index}` === active.id);

    if (draggedItem) {
        const dropIndex = parseInt(over.id); // ✅ 숫자로 변환
        console.log("📌 Drop Index:", dropIndex);

        newDroppedItems[dropIndex] = { id: active.id, value: draggedItem };
        setDroppedItems(newDroppedItems);

        // ✅ 기존 드래그 블록에서 아이템 제거
        setDisplayBlock(prev => prev.filter((word, index) => `word-${index}` !== active.id));
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
  
  const [displayBlock, setDisplayBlock] = useState([]); // ✅ displayBlock을 상태로 선언

  useEffect(() => {
    if (!blocks[step]) return; // ✅ 방어 코드 추가

    // ✅ `+` 개수를 카운트하여 들여쓰기 수준 결정
    const currentBlock = blocks[step] || [];
    const plusCount = currentBlock.filter(item => item === "+").length;
    
    // ✅ 모든 "+" 문자 제거
    const newDisplayBlock = currentBlock.filter(item => item !== "+");

    console.log("📌 현재 Step:", step);
    console.log("📌 들여쓰기 개수:", plusCount);
    console.log("📌 displayBlock:", newDisplayBlock);

    setDisplayBlock(newDisplayBlock); // ✅ `displayBlock`을 상태로 업데이트
    
    // ✅ 드롭 영역 초기화 (모든 "+" 제외한 크기로)
    setDroppedItems(Array(newDisplayBlock.length).fill(null));

    // ✅ 자동으로 완료되는 블록 처리 (빈 블록이거나 "+"만 있는 경우)
    if (newDisplayBlock.length === 0) {
      setCompletedSteps(prevSteps => [
        ...prevSteps, 
        { text: "", indentLevel: plusCount }
      ]);
      
      // 다음 단계로 이동
      setStep(prevStep => prevStep + 1);
    }
  }, [step, blocks]); // ✅ 의존성 배열에 blocks 포함

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
        // ✅ 현재 블록의 "+" 개수 카운트
        const plusCount = blocks[step]?.filter(item => item === "+").length || 0;
        
        // 완료된 코드 저장
        setCompletedSteps(prevSteps => [
          ...prevSteps, 
          { text: userAnswer.join(" "), indentLevel: plusCount }
        ]);
  
        const nextStep = step + 1;
  
        if (nextStep < blocks.length) {
          setStep(nextStep); // ✅ 다음 줄로 이동
        } else {
          console.log("모든 문제를 완료했습니다.");
          
          // 모든 단계 완료 후 최종 피드백 요청을 추가할 수 있음
          try {
            const finalFeedback = await fetchFinalFeedback(userId);
            setFeedback(finalFeedback.message);
          } catch (error) {
            console.error("최종 피드백 요청 실패:", error);
          }
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
          <p>{comments[step]}</p>
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
          <div className="code-preview" style={{ 
            display: "flex", 
            flexDirection: "column",
            width: "100%", 
            alignItems: "flex-start",
            backgroundColor: "#2d2d2d",
            color: "#f8f8f2",
            borderRadius: "8px",
            padding: "15px",
            fontFamily: "monospace",
            marginTop: "10px",
            minHeight: "300px"
          }}>
            {/* 완료된 코드 단계 출력 */}
            {completedSteps.map((step, index) => (
              <div key={index} style={{ 
                width: "100%", 
                display: "flex", 
                justifyContent: "space-between",
                marginBottom: "8px"
              }}>
                {/* 들여쓰기와 코드 텍스트 */}
                <span style={{ 
                  textAlign: "left", 
                  whiteSpace: "pre", 
                  color: "#f8f8f2" 
                }}>
                  {"  ".repeat(step.indentLevel)}{step.text}
                </span>
                
                {/* 주석 */}
                {comments[index] && (
                  <span style={{ 
                    textAlign: "right", 
                    color: "#6272a4", 
                    fontStyle: "italic",
                    marginLeft: "10px"
                  }}>
                    // {comments[index]}
                  </span>
                )}
              </div>
            ))}
            
            {/* 현재 작업 중인 코드 라인 표시 */}
            {step < blocks.length && (
              <div style={{ 
                width: "100%", 
                display: "flex", 
                justifyContent: "space-between",
                marginBottom: "8px",
                backgroundColor: "#3d3d3d",
                padding: "5px",
                borderRadius: "4px"
              }}>
                <span style={{ 
                  textAlign: "left", 
                  whiteSpace: "pre", 
                  color: "#f1fa8c" 
                }}>
                  {"  ".repeat(blocks[step]?.filter(item => item === "+").length || 0)}
                  {droppedItems.filter(item => item).map(item => item.value).join(" ")}
                </span>
                
                {comments[step] && (
                  <span style={{ 
                    textAlign: "right", 
                    color: "#6272a4", 
                    fontStyle: "italic",
                    marginLeft: "10px"
                  }}>
                    // {comments[step]}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
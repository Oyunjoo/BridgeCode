import { useState } from "react";
import { questionText, correctSteps, instructions } from "../data/codeData"; // Import data
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

export default function CodeEditor() {
  const [step, setStep] = useState(1);
  const [items, setItems] = useState(correctSteps[0].map((value, index) => ({ id: `step0-${index}`, value })).filter((item, index) => !(index === 0 && item.value === "+")));
  const [droppedItems, setDroppedItems] = useState(Array(correctSteps[0].length).fill(null));
  const [isCorrect, setIsCorrect] = useState(null);
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

  const handleSubmit = () => {
    const currentOrder = droppedItems.map((item) => item?.value).filter((val, index) => !(index === 0 && val === "+"));
    if (JSON.stringify(currentOrder) === JSON.stringify(correctSteps[step - 1].filter((val, index) => !(index === 0 && val === "+")))) {
      setIsCorrect(true);
      setCompletedSteps([...completedSteps, currentOrder.join(" ")]);
      if (step < correctSteps.length) {
        setStep(step + 1);
        if (correctSteps[step][0] == '+') {
            setDroppedItems(Array(correctSteps[step].length-1).fill(null));
            setItems(correctSteps[step].map((value, index) => ({ id: `step${step}-${index}`, value })).filter((item, index) => !(index === 0 && item.value === "+")));
            setIsCorrect(null);
        }
        else {
            setDroppedItems(Array(correctSteps[step].length).fill(null));
            setItems(correctSteps[step].map((value, index) => ({ id: `step${step}-${index}`, value })).filter((item, index) => !(index === 0 && item.value === "+")));
            setIsCorrect(null); 
        }
      }
    } else {
      setIsCorrect(false);
      if (correctSteps[step-1][0] == '+') {
        setDroppedItems(Array(correctSteps[step - 1].length-1).fill(null)); // Reset drop zone
        setItems(correctSteps[step - 1].map((value, index) => ({ id: `step${step - 1}-${index}`, value })).filter((item, index) => !(index === 0 && item.value === "+"))); // Reset available items
      }
      else {
        setDroppedItems(Array(correctSteps[step - 1].length).fill(null)); // Reset drop zone
        setItems(correctSteps[step - 1].map((value, index) => ({ id: `step${step - 1}-${index}`, value })).filter((item, index) => !(index === 0 && item.value === "+"))); // Reset available items
      }
    }
  };

  return (
    <div className="code-editor-container" style={{ width: "70vw", height: "50vh", display: "flex", backgroundColor: "#f8f3f9"}}>
      <div className="flex-container" style={{ ...flexContainerStyle, display: "flex", justifyContent: "center", alignItems: "center", width: "70%", maxWidth: "1000px" }}>
        <div className="left-section" style={sectionStyle}>
          <h2 style={titleStyle}>코드 한 줄씩 완성하기</h2>
          <div className="instruction-box" style={instructionStyle}>
            <p>{instructions[step - 1]}</p>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div style={wrapperStyle}>
                <div className="drag-container" style={{...containerStyle, backgroundColor: "#fafafa"}}>
                  {items.map((item) => (
                    <DraggableItem key={item.id} id={item.id} value={item.value} />
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
          <button className="submit-button" onClick={handleSubmit} style={{ padding: "8px 16px", fontSize: "14px", width: "auto", minWidth: "100px" }}>제출하기</button>
          {isCorrect !== null && !isCorrect && (
            <p className={`result-message ${isCorrect ? 'correct' : 'incorrect'}`}>
              {isCorrect ? "정답입니다!" : "오답입니다. 다시 시도하세요."}
            </p>
          )}
        </div>
        <div className="right-section" style={sectionStyle}>
          <div className="horizontal-layout" style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <h3 style={{...questionStyle, alignItems: "center"}}>Q. {questionText}</h3>
            <div className="code-preview" style={{ display: "flex", flexDirection: "column", width: "100%", alignItems:"center" }}>
              {instructions.map((instruction, index) => (
                <p key={index} className="pending" style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ textAlign: "left", whiteSpace: "pre" }}>{completedSteps.length > index ? (correctSteps[index][0]=='+' ? "         " + completedSteps[index] : completedSteps[index]) : ""}</span>
                  <span style={{ textAlign: "right", color: "gray", fontStyle: "italic" }}>{instruction}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
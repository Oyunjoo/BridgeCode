import { useEffect, useState } from "react";
import { fetchProblem, submitAnswer, fetchFinalFeedback } from "../api/api";
import { motion } from "framer-motion";

import { DndContext, closestCenter } from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import "./CodeEditor.css"; // Import the CSS file we created

function DraggableItem({ id, value }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useDraggable({ id });
  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    transition,
    zIndex: transform ? "10" : "auto", // Ensure dragged items appear in front
  };
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className="draggable-item"
    >
      {value}
    </div>
  );
}

function DropZone({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef} 
      className={`drop-zone ${isOver ? "highlight" : ""}`} 
      id={id}
      style={{
        minWidth: children ? "auto" : "40px",  // 기본 크기 유지
        minHeight: children ? "auto" : "40px", 
      }}
    >
      {children ? children : null} {/* 중복된 div 제거 */}
    </div>
  );
}



export default function CodeEditor({ onReset }) {
  const [userId] = useState("user123");
  const [problemText, setProblemText] = useState("");
  const [comments, setComments] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [droppedItems, setDroppedItems] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [finalFeedback, setFinalFeedback] = useState("");
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [displayBlock, setDisplayBlock] = useState([]);

  useEffect(() => {
    // Load problem API call
    const loadProblem = async () => {
      try {
        const data = await fetchProblem(userId);

        if (!data || !data.problem || !data.comments || !data.blocks || !Array.isArray(data.blocks)) {
          console.error("Server response is invalid!", data);
          return;
        }

        setProblemText(data.problem);
        setComments(data.comments);
        setBlocks(data.blocks);
        setStep(0);
        setDroppedItems(Array(data.blocks[0].length || 0).fill(null));
      } catch (error) {
        console.error("Error loading problem", error);
      }
    };

    loadProblem();
  }, [userId]);

  useEffect(() => {
    if (!blocks[step]) return;

    // Count "+" to determine indentation level
    const currentBlock = blocks[step] || [];
    const plusCount = currentBlock.filter(item => item === "+").length;
    
    // Remove all "+" characters
    const newDisplayBlock = currentBlock.filter(item => item !== "+");

    setDisplayBlock(newDisplayBlock);
    
    // Initialize drop area
    setDroppedItems(Array(newDisplayBlock.length).fill(null));

    // Automatically complete empty blocks
    if (newDisplayBlock.length === 0) {
      setCompletedSteps(prevSteps => [
        ...prevSteps, 
        { text: "", indentLevel: plusCount }
      ]);
      
      // Move to next step
      setStep(prevStep => prevStep + 1);
    }
  }, [step, blocks]);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    console.log("Dragged Item ID:", active.id);
    console.log("Dropped Over ID:", over.id);

    const newDroppedItems = [...droppedItems];

    // Find dragged item
    const draggedItem = displayBlock.find((word, index) => `word-${index}` === active.id);

    if (draggedItem) {
        const dropIndex = parseInt(over.id);
        console.log("Drop Index:", dropIndex);

        newDroppedItems[dropIndex] = { id: active.id, value: draggedItem };
        setDroppedItems(newDroppedItems);

        // Remove item from drag area
        setDisplayBlock(prev => prev.filter((word, index) => `word-${index}` !== active.id));
    }
  };

  const handleSubmit = async () => {
    const userAnswer = droppedItems.map(item => item ? item.value : "");
    
    try {
      const response = await submitAnswer(userId, userAnswer);
      setIsCorrect(response.answer);
  
      console.log("Submitted Answer:", userAnswer);
      console.log("Server Response (isCorrect):", response.answer);
  
      if (response.answer) {
        // Count "+" for indentation level
        const plusCount = blocks[step]?.filter(item => item === "+").length || 0;
        
        // Save completed code
        setCompletedSteps(prevSteps => [
          ...prevSteps, 
          { text: userAnswer.join(" "), indentLevel: plusCount }
        ]);
  
        const nextStep = step + 1;
  
        if (nextStep < blocks.length) {
          setStep(nextStep);
        } else {
          console.log("All problems completed.");
          
          // Request final feedback
          try {
            const finalFeedback = await fetchFinalFeedback(userId);
            setFinalFeedback(finalFeedback.message);
          } catch (error) {
            console.error("Final feedback request failed:", error);
          }
        }
      } else {
        setDisplayBlock(blocks[step].filter(item => item !== "+"));
        setDroppedItems(Array(blocks[step].filter(item => item !== "+").length).fill(null));
      }
    } catch (error) {
      console.error("Answer submission failed:", error);
    }
  };
  
  const handleReset = () => {
      setStep(0);
      setCompletedSteps([]);
      setDroppedItems([]);
      setIsCorrect(null);
      setFinalFeedback("");
      setBlocks([]);
      onReset();
  };

  return (
    <div className="code-editor-container">
      <div className="flex-container">
        <div className="left-section">
          <div className="title-box">코드 한 줄씩 완성하기</div>
          
          <div className="instruction-box">
            <p>{comments[step]}</p>
          </div>
          
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="drag-container">
              {displayBlock.map((item, index) => ( 
                <DraggableItem key={index} id={`word-${index}`} value={item} />
              ))}
            </div>
            
            <div className="drop-container">
              {droppedItems.map((item, index) => (
                <DropZone key={index} id={index.toString()}>
                  {item && (
                    <div className="draggable-item">
                      {item.value}
                    </div>
                  )}
                </DropZone>
              ))}
            </div>
          </DndContext>

          <div className="button-container">
            <button onClick={handleReset} className="back-button">
              뒤로가기
            </button>

            <button onClick={handleSubmit} className="submit-button">
              제출하기
            </button>
          </div>
          
          {isCorrect !== null && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className={`feedback-message ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}
            >
              {isCorrect ? "🎉 정답입니다! 🎉" : "❌ 오답입니다! ❌"}
            </motion.div>
          )}
        </div>

        <div className="right-section">
          <div className="question-box">
            Q. {problemText}
          </div>
          
          <div className="code-preview">
            {/* Completed code steps */}
            {completedSteps.map((step, index) => (
              <div key={index} className="code-line completed-line">
                <span className="code-text">
                  {"  ".repeat(step.indentLevel)}{step.text}
                </span>
                
                {comments[index] && (
                  <span className="code-comment">
                    // {comments[index]}
                  </span>
                )}
              </div>
            ))}
            
            {/* Current code line */}
            {step < blocks.length && (
              <div className="code-line current-line">
                <span className="code-text">
                  {"  ".repeat(blocks[step]?.filter(item => item === "+").length || 0)}
                  {droppedItems.filter(item => item).map(item => item.value).join(" ")}
                </span>
                
                {comments[step] && (
                  <span className="code-comment">
                    // {comments[step]}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {finalFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="final-feedback"
            >
              🏆 최종 피드백: {finalFeedback}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
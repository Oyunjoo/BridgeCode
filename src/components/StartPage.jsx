import { motion } from "framer-motion";
import "./StartPage.css"; // ✅ 수정된 CSS 적용

export default function StartPage({ onSelectProblem }) {
  return (
    <div className="start-page">
      {/* ✅ 애니메이션 효과 적용 */}
      <motion.h1 
        className="title" 
        initial={{ opacity: 0, y: -50 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8 }}
      >
        Python 코딩 연습
      </motion.h1>

      <motion.p 
        className="subtitle"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        원하는 문제를 선택하세요.
      </motion.p>

      <motion.div 
        className="button-container"
        initial={{ opacity: 0, scale: 0.8 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        {[0].map((num) => (
          <button key={num} className="problem-button" onClick={() => onSelectProblem(num)}>
            문제 생성
          </button>
        ))}
      </motion.div>
    </div>
  );
}

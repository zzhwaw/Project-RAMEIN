import { useEffect, useRef, useState } from 'react';

export default function useQuestionProgress(totalQuestions, onAnswer) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const answeredCurrentQuestion = useRef(false);

  useEffect(() => {
    answeredCurrentQuestion.current = false;
  }, [questionIndex]);

  const answerQuestion = (isCorrect) => {
    if (answeredCurrentQuestion.current || isComplete) return;

    answeredCurrentQuestion.current = true;
    if (isCorrect) setCorrectAnswers((count) => count + 1);
    onAnswer(Boolean(isCorrect), questionIndex);

    if (questionIndex + 1 === totalQuestions) {
      setIsComplete(true);
      return;
    }

    setQuestionIndex((index) => index + 1);
  };

  return { questionIndex, answerQuestion, isComplete, correctAnswers };
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import QuizSetup from "@/components/quiz/QuizSetup";
import QuizResult from "@/components/quiz/QuizResult";
import QuestionCard from "@/components/quiz/QuestionCard";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
}

const reactQuestions: Question[] = [
  {
    id: 1,
    question: "What is React?",
    options: [
      "A JavaScript library for building user interfaces",
      "A programming language",
      "A database management system",
      "An operating system"
    ],
    answer: "A JavaScript library for building user interfaces"
  },
  {
    id: 2,
    question: "What is JSX?",
    options: [
      "A JavaScript extension for XML",
      "A Java XML parser",
      "A JSON formatter",
      "A JavaScript testing framework"
    ],
    answer: "A JavaScript extension for XML"
  },
  {
    id: 3,
    question: "What is a React component?",
    options: [
      "A reusable piece of UI",
      "A database table",
      "A CSS framework",
      "A JavaScript variable"
    ],
    answer: "A reusable piece of UI"
  },
  {
    id: 4,
    question: "What is the virtual DOM?",
    options: [
      "A lightweight copy of the actual DOM",
      "A web browser",
      "A programming language",
      "A React component"
    ],
    answer: "A lightweight copy of the actual DOM"
  },
  {
    id: 5,
    question: "What hook is used for side effects in React?",
    options: [
      "useEffect",
      "useState",
      "useContext",
      "useReducer"
    ],
    answer: "useEffect"
  }
];

const Quiz = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStartQuiz = async (topic: string, selectedDifficulty: string) => {
    setIsLoading(true);
    try {
      if (topic.toLowerCase() === "react") {
        setQuestions(reactQuestions);
        setShowQuiz(true);
        setAnswers({});
      } else {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { topic }
      });

      if (error) throw error;

      const parsedData = JSON.parse(data);
      setQuestions(parsedData.questions);
      setShowQuiz(true);
      setAnswers({});
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        title: "Error",
        description: "Failed to generate quiz questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      setShowWarning(true);
      return;
    }
    setShowResults(true);
  };

  const calculateScore = () => {
    const correctAnswers = questions.filter(
      (q) => answers[q.id] === q.answer
    ).length;
    return Math.round((correctAnswers / questions.length) * 100);
  };

  const handleRetry = () => {
    setShowResults(false);
    setShowQuiz(false);
    setAnswers({});
    setQuestions([]);
  };

  const handleAnalyze = () => {
    toast({
      title: "Coming Soon",
      description: "Performance analysis will be available in the next update.",
    });
  };

  if (!showQuiz) {
    return <QuizSetup onStartQuiz={handleStartQuiz} isLoading={isLoading} />;
  }

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-8">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              selectedAnswer={answers[question.id] || ""}
              onAnswerChange={(answer) =>
                setAnswers((prev) => ({ ...prev, [question.id]: answer }))
              }
            />
          ))}

          <Button
            onClick={handleSubmit}
            className="w-full animate-fade-up"
            style={{ animationDelay: `${(questions.length + 1) * 100}ms` }}
          >
            Submit Quiz
          </Button>
        </div>
      </div>

      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Warning</DialogTitle>
            <DialogDescription>
              Please answer all questions before submitting.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowWarning(false)}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <QuizResult
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        score={calculateScore()}
        onRetry={handleRetry}
        onAnalyze={handleAnalyze}
      />
    </div>
  );
};

export default Quiz;

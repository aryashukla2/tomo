// src/components/BigTaskBreakdown.jsx
import { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";
import { useRouter } from "next/navigation";
import { useBigTaskProgress } from "../hooks/useBigTaskProgress";

const moods = ["Low Energy", "Stressed", "Focused"] as const;
type Mood = (typeof moods)[number];

interface TaskStep {
  id: number;
  description: string;
  completed: boolean;
}

export default function BigTaskBreakdown() {
  const [bigTask, setBigTask] = useState<string>("");
  const [mood, setMood] = useState<Mood>("Low Energy");
  const [steps, setSteps] = useState<TaskStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [confettiOpacity, setConfettiOpacity] = useState<number>(1);
  const [width, height] = useWindowSize();
  const router = useRouter();
  const { saveBigTaskProgress, loadBigTaskProgress, clearBigTaskProgress } =
    useBigTaskProgress();
  const [dateCreated, setDateCreated] = useState<string>("");

  // Load existing progress on mount
  useEffect(() => {
    const savedProgress = loadBigTaskProgress();
    if (savedProgress) {
      setBigTask(savedProgress.bigTask);
      setMood(savedProgress.mood);
      setSteps(savedProgress.steps);
      setCurrentStepIndex(savedProgress.currentStepIndex);
      setDateCreated(savedProgress.dateCreated);
      // If there are existing steps, show them with animation
      if (savedProgress.steps.length > 0) {
        setIsAnimating(true);
      }
    }
  }, [loadBigTaskProgress]);

  // Save progress whenever steps or currentStepIndex changes (but not on initial load)
  useEffect(() => {
    if (steps.length > 0 && dateCreated) {
      saveBigTaskProgress({
        bigTask,
        mood,
        steps,
        currentStepIndex,
        dateCreated,
      });
    }
  }, [
    steps,
    currentStepIndex,
    bigTask,
    mood,
    dateCreated,
    saveBigTaskProgress,
  ]);

  const generateSteps = () => {
    if (!bigTask.trim()) return;

    setIsGenerating(true);
    const lower = bigTask.toLowerCase();
    let generatedSteps: TaskStep[] = [];

    // Generate steps based on mood and task type
    if (mood === "Low Energy") {
      if (
        lower.includes("write") ||
        lower.includes("essay") ||
        lower.includes("report")
      ) {
        generatedSteps = [
          {
            id: 1,
            description: "Gather all your materials and create a workspace",
            completed: false,
          },
          {
            id: 2,
            description: "Write down 3-5 main points you want to cover",
            completed: false,
          },
          {
            id: 3,
            description:
              "Choose one point and write just one paragraph about it",
            completed: false,
          },
          {
            id: 4,
            description: "Take a break, then write one more paragraph",
            completed: false,
          },
          {
            id: 5,
            description: "Connect your paragraphs with simple transitions",
            completed: false,
          },
        ];
      } else if (lower.includes("clean") || lower.includes("organize")) {
        generatedSteps = [
          {
            id: 1,
            description: "Set a timer for 10 minutes and pick one small area",
            completed: false,
          },
          {
            id: 2,
            description: "Sort items into 'keep', 'donate', and 'trash' piles",
            completed: false,
          },
          {
            id: 3,
            description: "Put away the 'keep' items in their proper places",
            completed: false,
          },
          {
            id: 4,
            description: "Take out trash and set aside donations",
            completed: false,
          },
          {
            id: 5,
            description: "Wipe down the surfaces in your cleaned area",
            completed: false,
          },
        ];
      } else {
        generatedSteps = [
          {
            id: 1,
            description: "Spend 5 minutes understanding what needs to be done",
            completed: false,
          },
          {
            id: 2,
            description: "Gather any tools or materials you'll need",
            completed: false,
          },
          {
            id: 3,
            description: "Do the easiest part first to build momentum",
            completed: false,
          },
          {
            id: 4,
            description: "Take a short break and tackle the next easiest part",
            completed: false,
          },
          {
            id: 5,
            description: "Finish up with any final touches or cleanup",
            completed: false,
          },
        ];
      }
    } else if (mood === "Stressed") {
      generatedSteps = [
        {
          id: 1,
          description:
            "Take 3 deep breaths and write down what's stressing you",
          completed: false,
        },
        {
          id: 2,
          description: "Break the task into the smallest possible first action",
          completed: false,
        },
        {
          id: 3,
          description: "Do just that one small action - nothing more",
          completed: false,
        },
        {
          id: 4,
          description: "Acknowledge your progress and plan the next small step",
          completed: false,
        },
        {
          id: 5,
          description: "Complete one more small step at your own pace",
          completed: false,
        },
      ];
    } else if (mood === "Focused") {
      if (
        lower.includes("write") ||
        lower.includes("essay") ||
        lower.includes("report")
      ) {
        generatedSteps = [
          {
            id: 1,
            description: "Create a detailed outline with main sections",
            completed: false,
          },
          {
            id: 2,
            description: "Write the introduction and thesis statement",
            completed: false,
          },
          {
            id: 3,
            description:
              "Complete the first main section with supporting details",
            completed: false,
          },
          {
            id: 4,
            description: "Write the remaining sections, one at a time",
            completed: false,
          },
          {
            id: 5,
            description: "Write conclusion and proofread the entire piece",
            completed: false,
          },
        ];
      } else if (lower.includes("study") || lower.includes("learn")) {
        generatedSteps = [
          {
            id: 1,
            description: "Create a study schedule and gather all materials",
            completed: false,
          },
          {
            id: 2,
            description: "Read through the material once for overview",
            completed: false,
          },
          {
            id: 3,
            description: "Take detailed notes on key concepts",
            completed: false,
          },
          {
            id: 4,
            description: "Create practice questions or flashcards",
            completed: false,
          },
          {
            id: 5,
            description: "Test yourself and review any weak areas",
            completed: false,
          },
        ];
      } else {
        generatedSteps = [
          {
            id: 1,
            description: "Plan out all the steps and gather resources",
            completed: false,
          },
          {
            id: 2,
            description: "Start with the most important/challenging part",
            completed: false,
          },
          {
            id: 3,
            description: "Work through the middle sections systematically",
            completed: false,
          },
          {
            id: 4,
            description: "Complete any remaining smaller tasks",
            completed: false,
          },
          {
            id: 5,
            description: "Review your work and make final improvements",
            completed: false,
          },
        ];
      }
    }

    setSteps(generatedSteps);
    setCurrentStepIndex(0);
    setDateCreated(new Date().toLocaleString());
    setIsGenerating(false);

    // Add a small delay to allow the DOM to render before starting animation
    setTimeout(() => {
      setIsAnimating(true);
    }, 10);
  };

  const completeCurrentStep = () => {
    const updatedSteps = [...steps];
    updatedSteps[currentStepIndex].completed = true;
    setSteps(updatedSteps);

    // Check if all steps are completed
    if (currentStepIndex === steps.length - 1) {
      // All steps completed!
      setShowConfetti(true);
      setConfettiOpacity(1);

      setTimeout(() => {
        setConfettiOpacity(0);
      }, 4000);

      setTimeout(() => {
        setShowConfetti(false);
      }, 5500);
    } else {
      // Move to next step
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const resetProgress = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setBigTask("");
      setSteps([]);
      setCurrentStepIndex(0);
      setDateCreated("");
      clearBigTaskProgress();
    }, 10);
  };

  const completedSteps = steps.filter((step) => step.completed).length;
  const progressPercentage =
    steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
  const allStepsCompleted = completedSteps === steps.length && steps.length > 0;

  return (
    <div className="flex items-center justify-center min-h-screen overflow-hidden">
      <div className="max-w-8xl mx-auto p-10 space-y-12 relative">
        {/* Task Input Section */}
        <div
          className={`transition-all duration-1000 ease-in-out ${
            isAnimating
              ? "opacity-0 -translate-y-60 scale-75 pointer-events-none"
              : "opacity-100 translate-y-0 scale-100"
          }`}
        >
          <div className="text-center space-y-8">
            <h2 className="text-8xl font-serif font-semibold text-white mb-12">
              Big Task Breakdown
            </h2>

            <input
              type="text"
              placeholder="What's your big task?"
              value={bigTask}
              onChange={(e) => setBigTask(e.target.value)}
              className="w-full text-3xl font-serif text-white bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-white placeholder-gray-400 pb-1 mb-8"
            />

            {/* Mood Selector */}
            <div className="flex justify-center gap-2 mb-8">
              {moods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`px-4 py-2 rounded font-serif ${
                    mood === m
                      ? "bg-blue-800/30 text-white border-2 border-white"
                      : "bg-blue-400/30 text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="flex justify-center items-center">
              <button
                onClick={generateSteps}
                disabled={!bigTask.trim() || isGenerating}
                className="items-center w-fit p-4 bg-orange-300/50 text-xl font-serif text-white py-2 rounded hover:bg-orange-300/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Breaking it down..." : "Break It Down"}
              </button>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        {steps.length > 0 && (
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${
              isAnimating
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-full pointer-events-none"
            }`}
          >
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Big Task Display */}
              <div className="text-center">
                <h3 className="text-xl font-serif text-gray-300 mb-2">
                  Working on:
                </h3>
                <h2 className="text-6xl font-serif font-semibold text-white mb-4">
                  {bigTask}
                </h2>

                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <div
                    className="bg-green-500/50 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-gray-300 font-serif">
                  {completedSteps} of {steps.length} steps completed (
                  {Math.round(progressPercentage)}%)
                </p>
              </div>

              {/* Current Step */}
              {!allStepsCompleted && (
                <div className="text-center">
                  <h4 className="text-xl font-serif text-gray-300 mb-3">
                    Step {currentStepIndex + 1} of {steps.length}:
                  </h4>
                  <p className="text-6xl font-serif text-white mb-6">
                    {steps[currentStepIndex]?.description}
                  </p>

                  <button
                    onClick={completeCurrentStep}
                    className="px-6 py-3 bg-green-500/70 text-white font-serif rounded hover:bg-green-500/90 transition-colors"
                  >
                    Mark Complete & Continue
                  </button>
                </div>
              )}

              {/* Completion Message */}
              {allStepsCompleted && (
                <div className="text-center bg-green-900/30 p-8 rounded-lg border border-green-500/30">
                  <h3 className="text-4xl font-serif text-white mb-4">
                    🎉 Task Complete! 🎉
                  </h3>
                  <p className="text-xl font-serif text-gray-300 mb-6">
                    Great job breaking down and completing your big task!
                  </p>
                </div>
              )}

              {/* Completed Steps List (collapsed by default) */}
              {completedSteps > 0 && (
                <details className="bg-gray-800/30 p-4 rounded-lg">
                  <summary className="font-serif text-white cursor-pointer hover:text-gray-300">
                    View Completed Steps ({completedSteps})
                  </summary>
                  <div className="mt-4 space-y-2">
                    {steps
                      .filter((step) => step.completed)
                      .map((step) => (
                        <div
                          key={step.id}
                          className="flex items-center gap-3 text-gray-300"
                        >
                          <span className="text-green-500">✓</span>
                          <span className="font-serif">{step.description}</span>
                        </div>
                      ))}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={resetProgress}
                  className="px-4 py-2 bg-gray-600/50 text-white font-serif rounded hover:bg-gray-600/70 transition-colors"
                >
                  Break Down Another Task
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confetti */}
        {showConfetti && (
          <div
            style={{
              opacity: confettiOpacity,
              transition: "opacity 1.5s ease-in-out",
              pointerEvents: "none",
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 50,
            }}
          >
            <Confetti width={width} height={height} />
          </div>
        )}
      </div>

      {/* Help Button - Show only before steps are generated */}
      {!steps.length && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => router.push("/")}
            className="text-white px-4 py-2 rounded hover:underline font-serif"
          >
            Need Just One Quick Step?
          </button>
        </div>
      )}

      {/* Navigation Button - Only shows with steps */}
      {/*}
      {steps.length > 0 && (
        <div
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 transition-all duration-1000 ease-in-out ${
            isAnimating
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-full pointer-events-none"
          }`}
        >
          <button
            onClick={() => router.push("/")}
            className="text-white px-4 py-2 rounded hover:underline font-serif"
          >
            Back to First Step Generator
          </button>
        </div>
      )}
        */}
    </div>
  );
}

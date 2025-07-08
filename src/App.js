
import React, { useState, useEffect } from 'react';
import './App.css';

// Main App component
const App = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data extracted from the provided PDF content, now including options and correct answer letter
  const rawFlashcardData = [
    // ...existing code from your flashcard data (truncated for brevity)...
  ];

  useEffect(() => {
    // Simulate fetching data
    try {
      const allFlashcards = rawFlashcardData.flatMap(chapter =>
        chapter.questions.map(q => ({
          ...q,
          chapter: chapter.chapter // Add chapter info to each flashcard
        }))
      );
      setFlashcards(allFlashcards);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load flashcards.");
      setIsLoading(false);
    }
  }, []);

  const handleNext = () => {
    setShowAnswer(false);
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setShowAnswer(false);
    setCurrentCardIndex((prevIndex) =>
      prevIndex === 0 ? flashcards.length - 1 : prevIndex - 1
    );
  };

  const toggleAnswer = () => {
    setShowAnswer((prev) => !prev);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Loading flashcards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">No flashcards available.</p>
      </div>
    );
  }

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Engineering Management Flashcards
        </h1>

        <div className="text-sm text-gray-500 mb-2 text-center">
          {currentCard.chapter}
        </div>
        <div className="text-gray-600 mb-4 text-center">
          Card {currentCardIndex + 1} of {flashcards.length}
        </div>

        <div
          className="flashcard-card w-full bg-blue-50 rounded-xl p-6 mb-6 flex flex-col items-center justify-center min-h-[200px] cursor-pointer transform transition-transform duration-300 hover:scale-105 shadow-md"
          onClick={toggleAnswer}
        >
          <div className="text-xl font-semibold text-gray-900 text-center mb-4">
            {currentCard.question}
          </div>
          <ul className="list-none p-0 m-0 w-full text-left">
            {currentCard.options.map((option, index) => (
              <li
                key={index}
                className={`p-2 rounded-md mb-2 transition-colors duration-200 ${
                  showAnswer && option.startsWith(currentCard.correctAnswer + ".")
                    ? "bg-green-200 font-bold text-green-800 shadow-inner"
                    : "bg-white text-gray-700"
                }`}
              >
                {option}
              </li>
            ))}
          </ul>
          {showAnswer && (
            <div className="mt-4 text-lg font-bold text-green-700">
              Answer: {currentCard.correctAnswer}
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handlePrev}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-full shadow-lg hover:bg-purple-700 transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;

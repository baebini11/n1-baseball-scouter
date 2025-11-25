import React from 'react';
import './QuestionCard.css';

const QuestionCard = ({ index, question, options, onAnswer, selectedOption, showFeedback, correctAnswer }) => {
    const isGrammar = !!question.question;
    const displayContent = isGrammar ? question.question : question.kanji;
    // const correctAnswer = isGrammar ? question.answer : question.furigana; // Removed internal calculation

    const handleSpeak = (e) => {
        e.stopPropagation();
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(displayContent);
            utterance.lang = 'ja-JP';
            window.speechSynthesis.speak(utterance);
        }
    };

    const isCorrect = selectedOption === correctAnswer;
    const resultClass = showFeedback ? (isCorrect ? 'result-correct' : 'result-incorrect') : '';

    return (
        <div className={`question-card ${resultClass}`}>
            <div className="question-header">
                <span className="question-number">#{index}</span>
                <div className={`kanji-display ${isGrammar ? 'grammar-text' : ''}`} onClick={handleSpeak} title="Click to listen">
                    {displayContent.split('___').map((part, i, arr) => (
                        <React.Fragment key={i}>
                            {part}
                            {i < arr.length - 1 && <span className="blank-space">____</span>}
                        </React.Fragment>
                    ))}
                </div>
                {showFeedback && (
                    <div className={`feedback-icon ${isCorrect ? 'icon-o' : 'icon-x'}`}>
                        {isCorrect ? 'O' : 'X'}
                    </div>
                )}
            </div>

            <div className="options-grid">
                {options.map((option, idx) => {
                    let className = "option-button";
                    const isSelected = selectedOption === option;
                    const isAnswer = option === correctAnswer;

                    if (showFeedback) {
                        if (isAnswer) className += " correct-highlight";
                        if (isSelected && !isAnswer) className += " incorrect-highlight";
                    } else {
                        if (isSelected) className += " selected";
                    }

                    return (
                        <button
                            key={idx}
                            className={className}
                            onClick={() => !showFeedback && onAnswer(option)}
                            disabled={showFeedback}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>

            {showFeedback && (
                <div className="example-section">
                    {isGrammar ? (
                        <>
                            <div className="word-meaning">Meaning: {question.meaning}</div>
                            <div className="example-text" style={{ marginTop: '10px', fontSize: '0.9em', color: '#aaa' }}>
                                {question.explanation}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="example-text">{question.example}</div>
                            <div className="example-meaning">{question.example_meaning}</div>
                            <div className="word-meaning">Meaning: {question.meaning}</div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuestionCard;

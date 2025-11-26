import React, { useState, useEffect } from 'react';
import QuestionCard from './QuestionCard';
import './QuizArea.css';

const QuizArea = ({ words, grammar, addToGlobalReview, globalWrongAnswers }) => {
    const [quizState, setQuizState] = useState('intro'); // intro, playing, result
    const [mode, setMode] = useState('vocab'); // 'vocab' or 'grammar'
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(0);
    const [wrongQuestions, setWrongQuestions] = useState([]);
    const [showReview, setShowReview] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const getReading = (item) => {
        if (item.furigana) return item.furigana;
        const on = item.onyomi ? item.onyomi.join(', ') : '';
        const kun = item.kunyomi ? item.kunyomi.join(', ') : '';
        if (on && kun) return `${on} / ${kun}`;
        return on || kun || item.kanji;
    };

    const startQuiz = (count) => {
        const sourceData = mode === 'vocab' ? words : grammar;
        if (!sourceData || sourceData.length === 0) {
            alert("No data available for this mode.");
            return;
        }

        const batchSize = count === 'all' ? sourceData.length : count;
        const newQuestions = generateBatch(sourceData, batchSize);

        setQuestions(newQuestions);
        setUserAnswers({});
        setScore(0);
        setWrongQuestions([]);
        setShowReview(false);
        setCurrentQuestionIndex(0);

        setQuizState('playing');
        window.scrollTo(0, 0);
    };

    const generateBatch = (sourceData, count) => {
        if (!sourceData || sourceData.length === 0) return [];
        const shuffled = [...sourceData].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, count);

        return selected.map(item => createQuestionObject(item, sourceData));
    };

    const createQuestionObject = (item, sourceData) => {
        if (mode === 'grammar') {
            const shuffledOptions = [...item.options].sort(() => 0.5 - Math.random());
            return { word: item, options: shuffledOptions, isGrammar: true };
        } else {
            const distractors = [];
            const correctReading = getReading(item);

            while (distractors.length < 3) {
                const randomDistractor = words[Math.floor(Math.random() * words.length)];
                const distractorReading = getReading(randomDistractor);

                if (randomDistractor.id !== item.id && !distractors.includes(distractorReading) && distractorReading !== correctReading) {
                    distractors.push(distractorReading);
                }
            }
            const options = [...distractors, correctReading].sort(() => 0.5 - Math.random());
            return { word: item, options, isGrammar: false };
        }
    };

    const handleAnswer = (questionId, option) => {
        if (quizState !== 'playing') return;
        if (userAnswers[questionId]) return; // Lock answer

        setUserAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const nextQuestion = () => {
        if (currentQuestionIndex === questions.length - 1) {
            const sourceData = mode === 'vocab' ? words : grammar;
            const randomItem = sourceData[Math.floor(Math.random() * sourceData.length)];
            const newQuestion = createQuestionObject(randomItem, sourceData);

            setQuestions(prev => [...prev, newQuestion]);
        }

        setCurrentQuestionIndex(prev => prev + 1);
    };

    const submitAnswers = () => {
        let newScore = 0;
        const newWrongQuestions = [];

        questions.forEach(q => {
            const userAnswer = userAnswers[q.word.id];
            if (!userAnswer) return;

            const correctAnswer = q.isGrammar ? q.word.answer : getReading(q.word);
            if (userAnswer === correctAnswer) {
                newScore += 10;
            } else {
                newWrongQuestions.push(q);
            }
        });

        setScore(newScore);
        setWrongQuestions(newWrongQuestions);
        setQuizState('result');
        window.scrollTo(0, 0);
    };

    const currentQ = questions[currentQuestionIndex];
    const isCurrentAnswered = currentQ && userAnswers[currentQ.word.id];
    const currentAnswer = currentQ ? userAnswers[currentQ.word.id] : null;

    // Fix: Ensure strict equality works by trimming or normalizing if needed, but usually direct match is fine if options come from same source.
    // The issue might be that 'getReading' returns different string instances or formatting?
    // Let's ensure we compare exactly what was clicked.
    const correctAnswerText = currentQ ? (currentQ.isGrammar ? currentQ.word.answer : getReading(currentQ.word)) : null;
    const isCurrentCorrect = currentQ && currentAnswer === correctAnswerText;

    const isInGlobalReview = (id) => globalWrongAnswers.some(item => item.id === id);

    if (quizState === 'intro') {
        return (
            <div className="quiz-intro">
                <h2>SELECT MODE</h2>
                <div className="mode-selection">
                    <button
                        className={`mode-btn ${mode === 'vocab' ? 'active' : ''}`}
                        onClick={() => setMode('vocab')}
                    >
                        VOCABULARY
                    </button>
                    <button
                        className={`mode-btn ${mode === 'grammar' ? 'active' : ''}`}
                        onClick={() => setMode('grammar')}
                    >
                        GRAMMAR
                    </button>
                </div>

                <h2>SELECT QUESTION COUNT</h2>
                <div className="count-buttons">
                    {[1, 10, 20, 30, 'all'].map(count => (
                        <button key={count} onClick={() => startQuiz(count)} className="intro-btn">
                            {count === 'all' ? 'ALL QUESTIONS' : `${count} QUESTIONS`}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-area">
            <div className={quizState === 'playing' ? "quiz-header-sticky" : "quiz-header"}>
                <div className="score-display">
                    {quizState === 'result' ?
                        `Score: ${score}` :
                        `Question: ${currentQuestionIndex + 1}`
                    }
                </div>
            </div>

            {quizState === 'playing' && currentQ && (
                <div className="single-question-container">
                    <QuestionCard
                        key={`${currentQ.word.id}-${currentQuestionIndex}`}
                        index={currentQuestionIndex + 1}
                        question={currentQ.word}
                        options={currentQ.options}
                        selectedOption={userAnswers[currentQ.word.id]}
                        onAnswer={(option) => handleAnswer(currentQ.word.id, option)}
                        showFeedback={!!userAnswers[currentQ.word.id]}
                        correctAnswer={currentQ.isGrammar ? currentQ.word.answer : getReading(currentQ.word)}
                    />

                    {isCurrentAnswered && (
                        <div className="immediate-feedback">
                            <div className={`feedback-status ${isCurrentCorrect ? 'correct' : 'wrong'}`}>
                                {isCurrentCorrect ? 'CORRECT!' : 'WRONG!'}
                            </div>

                            <div className="feedback-detail">
                                <p className="feedback-answer">
                                    Answer: <span>{currentQ.isGrammar ? currentQ.word.answer : getReading(currentQ.word)}</span>
                                </p>
                                <p className="feedback-meaning">
                                    {currentQ.isGrammar ? currentQ.word.grammar_meaning : currentQ.word.meaning}
                                </p>
                                {currentQ.word.example && (
                                    <p className="feedback-example">{currentQ.word.example}</p>
                                )}
                            </div>

                            <div className="feedback-actions">
                                {!isCurrentCorrect && (
                                    <button
                                        className="action-btn add-review"
                                        disabled={isInGlobalReview(currentQ.word.id)}
                                        onClick={() => addToGlobalReview(currentQ.word, currentQ.isGrammar ? 'grammar' : 'vocab')}
                                    >
                                        {isInGlobalReview(currentQ.word.id) ? "SAVED IN BOX" : "ADD TO REVIEW BOX"}
                                    </button>
                                )}

                                <button
                                    className="action-btn next-q"
                                    onClick={nextQuestion}
                                >
                                    NEXT QUESTION ➡
                                </button>

                                <button
                                    className="action-btn finish-q"
                                    onClick={submitAnswers}
                                    style={{ background: '#ff0055', color: '#fff' }}
                                >
                                    FINISH QUIZ 🏁
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {quizState === 'result' && (
                <div className="quiz-result">
                    <div className="result-summary">
                        <h3>RESULT</h3>
                        <p>Correct: {questions.filter(q => {
                            const ans = userAnswers[q.word.id];
                            return ans && ans === (q.isGrammar ? q.word.answer : getReading(q.word));
                        }).length} / {Object.keys(userAnswers).length}</p>

                        {wrongQuestions.length > 0 && (
                            <button
                                className="toggle-review-btn"
                                onClick={() => setShowReview(!showReview)}
                            >
                                {showReview ? "HIDE INCORRECT ANSWERS" : `REVIEW INCORRECT ANSWERS (${wrongQuestions.length})`}
                            </button>
                        )}
                    </div>

                    {showReview && (
                        <div className="review-list">
                            {wrongQuestions.map((q, index) => (
                                <div key={index} className="review-card">
                                    <div className="review-question">
                                        {q.isGrammar ? q.word.question : q.word.kanji}
                                    </div>
                                    <div className="review-answer">
                                        Correct: <span>{q.isGrammar ? q.word.answer : getReading(q.word)}</span>
                                    </div>
                                    <div className="review-explanation">
                                        {q.isGrammar ? q.word.grammar_meaning : q.word.meaning}
                                        {q.word.example && <div className="review-example">{q.word.example}</div>}
                                    </div>
                                    <button
                                        className="action-btn add-review small"
                                        disabled={isInGlobalReview(q.word.id)}
                                        onClick={() => addToGlobalReview(q.word, q.isGrammar ? 'grammar' : 'vocab')}
                                        style={{ marginTop: '10px' }}
                                    >
                                        {isInGlobalReview(q.word.id) ? "SAVED" : "ADD TO BOX"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="result-actions">
                        <button className="new-round-button" onClick={() => setQuizState('intro')}>
                            MAIN MENU
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizArea;

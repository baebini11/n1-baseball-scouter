import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionCard from './QuestionCard';
import './QuizArea.css';

const QuizArea = ({ vocab, kanji, grammar, addToGlobalReview, globalWrongAnswers, customData = null, initialMode = 'vocab' }) => {
    const navigate = useNavigate();
    const [quizState, setQuizState] = useState('intro'); // intro, playing, result
    const [mode, setMode] = useState(initialMode); // 'vocab', 'kanji', 'grammar', 'review'
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(0);
    const [wrongQuestions, setWrongQuestions] = useState([]);
    const [showReview, setShowReview] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        if (initialMode === 'review' && customData) {
            setMode('review');
            // Auto-start for review mode if desired, or let user click start
        }
    }, [initialMode, customData]);

    const getReading = (item) => {
        if (item.furigana) return item.furigana;
        const on = item.onyomi ? item.onyomi.join(', ') : '';
        const kun = item.kunyomi ? item.kunyomi.join(', ') : '';
        if (on && kun) return `${on} / ${kun}`;
        return on || kun || item.kanji;
    };

    const startQuiz = (count) => {
        let sourceData;
        if (mode === 'vocab') sourceData = vocab;
        else if (mode === 'kanji') sourceData = kanji;
        else if (mode === 'grammar') sourceData = grammar;
        else if (mode === 'review') sourceData = customData;

        if (!sourceData || sourceData.length === 0) {
            alert("No data available for this mode.");
            return;
        }

        const batchSize = count === 'all' ? sourceData.length : Math.min(count, sourceData.length);
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
        // Determine type based on item properties or mode
        const isGrammar = mode === 'grammar' || (mode === 'review' && item.grammar);

        if (isGrammar) {
            const shuffledOptions = [...item.options].sort(() => 0.5 - Math.random());
            return { word: item, options: shuffledOptions, isGrammar: true };
        } else {
            const distractors = [];
            const correctReading = getReading(item);

            // For review mode, we need to be careful about distractors. 
            // If sourceData is small (e.g. only 1 wrong answer), we might need to pull distractors from the main vocab/kanji data.
            // But for simplicity, let's try to pull from sourceData first, and fallback if needed.
            // Actually, if it's review mode, we should probably pull distractors from the FULL dataset (vocab/kanji) to ensure quality distractors.
            let distractorSource = sourceData;
            if (mode === 'review') {
                if (item.kanji && !item.grammar) {
                    // Try to find which dataset this item belongs to
                    // This is a bit tricky. Let's assume it's vocab or kanji.
                    // We can just use the full vocab/kanji lists if available.
                    if (vocab && vocab.some(v => v.id === item.id)) distractorSource = vocab;
                    else if (kanji && kanji.some(k => k.id === item.id)) distractorSource = kanji;
                }
            }

            // Fallback if distractorSource is too small (less than 4 items)
            if (distractorSource.length < 4) {
                if (vocab && vocab.length >= 4) distractorSource = vocab;
                else if (kanji && kanji.length >= 4) distractorSource = kanji;
            }

            let attempts = 0;
            while (distractors.length < 3 && attempts < 100) {
                const randomDistractor = distractorSource[Math.floor(Math.random() * distractorSource.length)];
                const distractorReading = getReading(randomDistractor);

                if (randomDistractor.id !== item.id && !distractors.includes(distractorReading) && distractorReading !== correctReading) {
                    distractors.push(distractorReading);
                }
                attempts++;
            }
            // Fill with placeholders if needed (shouldn't happen with proper data)
            while (distractors.length < 3) {
                distractors.push(`Option ${distractors.length + 1}`);
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
            let sourceData;
            if (mode === 'vocab') sourceData = vocab;
            else if (mode === 'kanji') sourceData = kanji;
            else if (mode === 'grammar') sourceData = grammar;
            else if (mode === 'review') sourceData = customData;

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

    const correctAnswerText = currentQ ? (currentQ.isGrammar ? currentQ.word.answer : getReading(currentQ.word)) : null;
    const isCurrentCorrect = currentQ && currentAnswer === correctAnswerText;

    const isInGlobalReview = (id) => globalWrongAnswers.some(item => item.id === id);

    if (quizState === 'intro') {
        return (
            <div className="quiz-intro">
                <button className="home-btn" onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>🏠 HOME</button>

                {mode !== 'review' && (
                    <>
                        <h2>SELECT MODE</h2>
                        <div className="mode-selection">
                            <button
                                className={`mode-btn ${mode === 'vocab' ? 'active' : ''}`}
                                onClick={() => setMode('vocab')}
                            >
                                VOCABULARY
                            </button>
                            <button
                                className={`mode-btn ${mode === 'kanji' ? 'active' : ''}`}
                                onClick={() => setMode('kanji')}
                            >
                                KANJI
                            </button>
                            <button
                                className={`mode-btn ${mode === 'grammar' ? 'active' : ''}`}
                                onClick={() => setMode('grammar')}
                            >
                                GRAMMAR
                            </button>
                        </div>
                    </>
                )}

                <h2>{mode === 'review' ? 'REVIEW QUIZ' : 'SELECT QUESTION COUNT'}</h2>
                <div className="count-buttons">
                    {mode === 'review' ? (
                        <button onClick={() => startQuiz(customData.length)} className="intro-btn">
                            START REVIEW ({customData.length})
                        </button>
                    ) : (
                        [1, 10, 20, 30].map(count => (
                            <button key={count} onClick={() => startQuiz(count)} className="intro-btn">
                                {`${count} QUESTIONS`}
                            </button>
                        ))
                    )}
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
                                        onClick={() => addToGlobalReview(currentQ.word, mode)}
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
                                        onClick={() => addToGlobalReview(q.word, mode)}
                                        style={{ marginTop: '10px' }}
                                    >
                                        {isInGlobalReview(q.word.id) ? "SAVED" : "ADD TO BOX"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="result-actions">
                        <button className="new-round-button" onClick={() => {
                            if (mode === 'review') {
                                // If in review mode, go back to main menu or restart review?
                                // Let's go back to main menu or reload page to reset state cleanly
                                navigate('/');
                            } else {
                                setQuizState('intro');
                            }
                        }}>
                            {mode === 'review' ? 'EXIT REVIEW' : 'MAIN MENU'}
                        </button>
                        <button className="home-btn" onClick={() => navigate('/')} style={{ marginLeft: '20px' }}>🏠 HOME</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizArea;

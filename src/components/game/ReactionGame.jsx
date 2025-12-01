import React, { useState, useEffect, useRef } from 'react';
import './ReactionGame.css';

const ReactionGame = ({ words, grammar, onExit, level, setLevel, xp, setXp, addToGlobalReview, globalWrongAnswers }) => {
    const [gameState, setGameState] = useState('menu'); // menu, playing, boss_intro, boss_playing, result, game_over
    const [mode, setMode] = useState('normal'); // normal, boss
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0); // Correct answers count in current session
    const [questionCount, setQuestionCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [combo, setCombo] = useState(0);
    const [wrongQuestions, setWrongQuestions] = useState([]);
    const [feedback, setFeedback] = useState(null); // null, 'correct', 'wrong'
    const [showReview, setShowReview] = useState(false);
    const [usedQuestionIds, setUsedQuestionIds] = useState([]); // Track used questions to prevent duplicates
    const [currentTotalQuestions, setCurrentTotalQuestions] = useState(20); // Fixed total questions for current session

    const timerRef = useRef(null);

    // Boss Mode: 10 questions at Level 1, +1 per level (Reduced scaling)
    const bossQuestionsCount = 10 + (level - 1) * 1;
    const bossCost = 100 + (level - 1) * 50;
    const totalQuestions = mode === 'boss' ? bossQuestionsCount : 20;
    const timeLimit = mode === 'boss' ? 3 : 5;

    useEffect(() => {
        if ((gameState === 'playing' || gameState === 'boss_playing') && !feedback) {
            if (timeLeft > 0) {
                timerRef.current = setTimeout(() => setTimeLeft(prev => Math.max(0, prev - 0.1)), 100);
            } else {
                handleTimeOut();
            }
        }
        return () => clearTimeout(timerRef.current);
    }, [timeLeft, gameState, feedback]);

    // Helper: Limit reading array to max 3 items
    const limitReading = (arr, max = 3) => {
        if (!arr || arr.length === 0) return '';
        return arr.slice(0, max).join(', ');
    };

    const getReadingString = (item) => {
        if (item.furigana) return item.furigana;
        const on = item.onyomi ? limitReading(item.onyomi, 3) : '';
        const kun = item.kunyomi ? limitReading(item.kunyomi, 3) : '';
        if (on && kun) return `${on} / ${kun}`;
        return on || kun || '';
    };

    const startGame = (selectedMode) => {
        setMode(selectedMode);
        setScore(0);
        setQuestionCount(0);
        setCombo(0);
        setWrongQuestions([]);
        setShowReview(false);
        setFeedback(null);
        setUsedQuestionIds([]); // Reset used questions for new game

        // Fix total questions for this session BEFORE level up
        const fixedTotal = selectedMode === 'boss' ? bossQuestionsCount : 20;
        setCurrentTotalQuestions(fixedTotal);

        setGameState(selectedMode === 'boss' ? 'boss_playing' : 'playing');
        nextQuestion(selectedMode, []);
    };

    const nextQuestion = (currentMode, currentUsedIds = null) => {
        setFeedback(null);
        const targetCount = currentMode === 'boss' ? bossQuestionsCount : 20;
        if (questionCount >= targetCount) {
            endGame(true);
            return;
        }

        // Check availability
        const hasWords = words && words.length > 0;
        const hasGrammar = grammar && grammar.length > 0;

        if (!hasWords && !hasGrammar) {
            alert("No data available for the game!");
            setGameState('menu');
            return;
        }

        // Use provided usedIds or current state
        const usedIds = currentUsedIds !== null ? currentUsedIds : usedQuestionIds;

        // Mix words and grammar
        let isWord;
        if (hasWords && hasGrammar) {
            isWord = Math.random() > 0.5;
        } else {
            isWord = hasWords; // If only words, true. If only grammar, false.
        }

        const source = isWord ? words : grammar;

        // Filter out already used questions
        let availableItems = source.filter(item => !usedIds.includes(item.id));

        // If all items have been used, reset the pool
        if (availableItems.length === 0) {
            availableItems = source;
            setUsedQuestionIds([]);
        }

        // Select random item from available pool
        const item = availableItems[Math.floor(Math.random() * availableItems.length)];

        let questionText, correct, distractors;

        if (isWord) {
            // Word question: Kanji -> Reading or Reading -> Kanji
            const reading = getReadingString(item);

            if (Math.random() > 0.5) {
                // Question: Kanji, Answer: Reading
                // Decide to ask for Onyomi or Kunyomi specifically if available
                const hasOnyomi = item.onyomi && item.onyomi.length > 0;
                const hasKunyomi = item.kunyomi && item.kunyomi.length > 0;
                let targetType = 'reading'; // default
                let targetLabel = '';

                if (hasOnyomi && hasKunyomi) {
                    targetType = Math.random() > 0.5 ? 'onyomi' : 'kunyomi';
                } else if (hasOnyomi) {
                    targetType = 'onyomi';
                } else if (hasKunyomi) {
                    targetType = 'kunyomi';
                }

                if (targetType === 'onyomi') {
                    questionText = `${item.kanji} (Onyomi?)`;
                    correct = limitReading(item.onyomi, 3);
                    targetLabel = 'Onyomi';
                } else if (targetType === 'kunyomi') {
                    questionText = `${item.kanji} (Kunyomi?)`;
                    correct = limitReading(item.kunyomi, 3);
                    targetLabel = 'Kunyomi';
                } else {
                    questionText = item.kanji;
                    correct = reading;
                }

                // If specific reading is empty (edge case), fallback to full reading
                if (!correct) {
                    questionText = item.kanji;
                    correct = reading;
                    targetLabel = '';
                }

                distractors = getDistractors(words, item, 'reading', targetLabel);
            } else {
                // Question: Reading, Answer: Kanji
                // Show reading and ask for Kanji. Maybe label it "Onyomi" or "Kunyomi"
                const hasOnyomi = item.onyomi && item.onyomi.length > 0;
                const hasKunyomi = item.kunyomi && item.kunyomi.length > 0;
                let sourceType = 'reading';

                if (hasOnyomi && hasKunyomi) {
                    sourceType = Math.random() > 0.5 ? 'onyomi' : 'kunyomi';
                } else if (hasOnyomi) {
                    sourceType = 'onyomi';
                } else if (hasKunyomi) {
                    sourceType = 'kunyomi';
                }

                let questionLabel = '';
                if (sourceType === 'onyomi') {
                    questionText = limitReading(item.onyomi, 3);
                    questionLabel = '(Onyomi)';
                } else if (sourceType === 'kunyomi') {
                    questionText = limitReading(item.kunyomi, 3);
                    questionLabel = '(Kunyomi)';
                } else {
                    questionText = reading;
                }

                if (questionLabel) questionText += ` ${questionLabel}`;

                correct = item.kanji;
                distractors = getDistractors(words, item, 'kanji');
            }
        } else {
            // Grammar question
            questionText = item.question.replace('____', '___'); // Normalize blanks
            correct = item.answer;
            distractors = item.options.filter(opt => opt !== item.answer);
            // If distractors are missing from data, pick randoms (fallback)
            if (distractors.length < 3) {
                distractors = ["Option A", "Option B", "Option C"]; // Placeholder fallback
            }
        }

        const allOptions = [correct, ...distractors].sort(() => Math.random() - 0.5);

        setCurrentQuestion({
            text: questionText,
            correct: correct,
            type: isWord ? 'word' : 'grammar',
            original: item
        });
        setOptions(allOptions);
        setTimeLeft(currentMode === 'boss' ? 3 : 5);
        setQuestionCount(prev => prev + 1);

        // Mark this question as used
        setUsedQuestionIds(prev => [...prev, item.id]);
    };



    const getDistractors = (dataset, currentItem, type, targetLabel = '') => {
        const others = dataset.filter(d => d.id !== currentItem.id);
        const shuffled = others.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3).map(d => {
            if (type === 'reading') {
                if (targetLabel === 'Onyomi' && d.onyomi && d.onyomi.length > 0) return limitReading(d.onyomi, 3);
                if (targetLabel === 'Kunyomi' && d.kunyomi && d.kunyomi.length > 0) return limitReading(d.kunyomi, 3);
                return getReadingString(d);
            }
            return d[type];
        });
    };

    const handleAnswer = (answer) => {
        if (gameState !== 'playing' && gameState !== 'boss_playing') return;
        if (feedback) return; // Prevent multiple clicks

        const isCorrect = answer === currentQuestion.correct;
        setFeedback(isCorrect ? 'correct' : 'wrong');

        if (isCorrect) {
            setScore(prev => prev + 1);
            setCombo(prev => prev + 1);

            // XP Gain
            if (mode === 'normal') {
                setXp(prev => prev + 10 + (combo * 2)); // Bonus for combo
            }

            // Check for Boss Mode Win
            if (mode === 'boss' && questionCount === bossQuestionsCount) {
                setTimeout(() => {
                    setLevel(prev => prev + 1);
                    endGame(true);
                }, 1000);
                return;
            }
        } else {
            setWrongQuestions(prev => [...prev, currentQuestion]);
        }

        setTimeout(() => {
            if (!isCorrect) {
                if (mode === 'boss') {
                    setGameState('game_over');
                } else {
                    setCombo(0);
                    nextQuestion(mode);
                }
            } else {
                nextQuestion(mode);
            }
        }, 800); // 0.8s delay for feedback
    };

    const handleTimeOut = () => {
        setFeedback('wrong');
        setWrongQuestions(prev => [...prev, currentQuestion]);

        setTimeout(() => {
            if (mode === 'boss') {
                setGameState('game_over');
            } else {
                setCombo(0);
                nextQuestion(mode);
            }
        }, 800);
    };

    const endGame = (completed) => {
        setGameState('result');
    };

    const canChallengeBoss = xp >= bossCost;

    return (
        <div className="reaction-game" style={{ height: 'calc(100vh - 80px)', position: 'relative' }}>
            {/* 홈 버튼을 항상 왼쪽 위에 고정 */}
            <button className="home-btn-fixed" onClick={onExit}>🏠 HOME</button>

            {gameState === 'menu' && (
                <div className="game-menu">
                    <h1 className="game-title">⚡ REACTION TEST ⚡</h1>
                    <div className="stats-display">
                        <div>LEVEL: {level}</div>
                        <div>XP: {xp} / {bossCost}</div>
                    </div>

                    <div className="xp-bar-container">
                        <div className="xp-bar" style={{ width: `${Math.min((xp / bossCost) * 100, 100)}%` }}></div>
                    </div>

                    <button className="menu-btn normal" onClick={() => startGame('normal')}>
                        NORMAL MODE <br />
                        <span className="btn-sub">20 Questions / 5s</span>
                    </button>

                    <button
                        className={`menu-btn boss ${canChallengeBoss ? 'active' : 'locked'}`}
                        onClick={() => canChallengeBoss && startGame('boss')}
                        disabled={!canChallengeBoss}
                    >
                        BOSS BATTLE <br />
                        <span className="btn-sub">
                            {canChallengeBoss ? "CLICK TO START!" : `Need ${bossCost - xp} more XP`}
                        </span>
                        <div style={{ fontSize: '0.6em', marginTop: '5px', color: '#ff0055' }}>
                            {bossQuestionsCount} Questions / 3s / Cost: {bossCost}XP
                        </div>
                    </button>

                    <button className="menu-btn exit" onClick={onExit}>EXIT</button>
                </div>
            )}

            {(gameState === 'playing' || gameState === 'boss_playing') && currentQuestion && (
                <>
                    <div className={`game-interface ${mode} ${feedback ? (feedback === 'correct' ? 'feedback-correct' : 'feedback-wrong') : ''}`}>
                        <div className="game-header">
                            <div className="timer-bar" style={{ width: `${(timeLeft / timeLimit) * 100}%`, transition: 'width 0.1s linear' }}></div>
                            <div className="game-info">
                                <span>Q: {questionCount} / {totalQuestions}</span>
                                <span>COMBO: {combo}</span>
                            </div>
                            <button
                                className="back-btn-small"
                                onClick={() => {
                                    // Reset all game states when exiting to menu
                                    setScore(0);
                                    setQuestionCount(0);
                                    setCombo(0);
                                    setWrongQuestions([]);
                                    setFeedback(null);
                                    setUsedQuestionIds([]);
                                    setGameState('menu');
                                }}
                                style={{
                                    marginTop: '10px',
                                    background: 'transparent',
                                    border: '1px solid #555',
                                    color: '#aaa',
                                    padding: '5px 10px',
                                    cursor: 'pointer',
                                    fontSize: '0.8em',
                                    fontFamily: 'Press Start 2P'
                                }}
                            >
                                EXIT TO MENU
                            </button>
                        </div>

                        <div className="question-display">
                            {currentQuestion.text}
                        </div>

                        <div className="options-grid">
                            {options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    className={`option-btn ${feedback === 'correct' && opt === currentQuestion.correct ? 'correct' : ''} ${feedback === 'wrong' && opt !== currentQuestion.correct ? 'dim' : ''}`}
                                    onClick={() => handleAnswer(opt)}
                                    disabled={feedback !== null}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>

                        {/* 피드백 아이콘을 우측 상단에 표시 (스터디 스타일) */}
                        {feedback && (
                            <div className={`feedback-icon ${feedback}`}>
                                {feedback === 'correct' ? 'O' : 'X'}
                            </div>
                        )}
                    </div>
                </>
            )}

            {gameState === 'game_over' && (
                <div className="result-screen fail">
                    <h2>GAME OVER</h2>
                    <p>The boss was too strong...</p>
                    {wrongQuestions.length > 0 && (
                        <button className="menu-btn review" onClick={() => {
                            setGameState('result');
                            setShowReview(true);
                        }}>REVIEW MISTAKES</button>
                    )}
                    <button className="menu-btn" onClick={() => {
                        // Reset all game states when trying again
                        setScore(0);
                        setQuestionCount(0);
                        setCombo(0);
                        setWrongQuestions([]);
                        setFeedback(null);
                        setUsedQuestionIds([]);
                        setShowReview(false);
                        setGameState('menu');
                    }}>TRY AGAIN</button>
                </div>
            )}

            {gameState === 'result' && !showReview && (
                <div className="result-screen success">
                    <h2>{mode === 'boss' && score === currentTotalQuestions ? "VICTORY!" : "COMPLETE!"}</h2>
                    <p>Score: {score} / {currentTotalQuestions}</p>
                    {mode === 'boss' && score === currentTotalQuestions && (
                        <>
                            <p className="levelup-text">LEVEL UP! 🆙</p>
                            <p style={{ color: '#ffd700', fontFamily: 'Press Start 2P' }}>+5 GACHA TICKETS!</p>
                        </>
                    )}

                    {wrongQuestions.length > 0 && (
                        <button className="menu-btn review" onClick={() => setShowReview(true)}>
                            REVIEW MISTAKES ({wrongQuestions.length})
                        </button>
                    )}

                    <button className="menu-btn" onClick={() => {
                        if (mode === 'boss' && score === currentTotalQuestions) {
                            setXp(prev => Math.max(0, prev - bossCost)); // Deduct cost
                        }
                        // Reset all game states before returning to menu
                        setScore(0);
                        setQuestionCount(0);
                        setCombo(0);
                        setWrongQuestions([]);
                        setFeedback(null);
                        setUsedQuestionIds([]);
                        setShowReview(false);
                        setGameState('menu');
                    }}>CONTINUE</button>
                </div>
            )}

            {gameState === 'result' && showReview && (
                <div className="review-screen">
                    <h2>REVIEW MISTAKES</h2>
                    <div className="review-list-container" style={{
                        maxHeight: '60vh',
                        overflowY: 'auto',
                        padding: '10px',
                        border: '2px solid #555',
                        background: 'rgba(0,0,0,0.8)',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#ff0055 #222',
                        marginBottom: '20px'
                    }}>
                        {wrongQuestions.map((q, idx) => (
                            <div key={idx} className="review-item">
                                <div className="review-q-text">{q.text}</div>
                                <div className="review-a-text">
                                    Correct: <span>{q.correct}</span>
                                </div>
                                <div className="review-detail">
                                    {q.type === 'word' ? (
                                        <>
                                            <div>{q.original.kanji}</div>
                                            <div style={{ color: '#ff00ff', fontSize: '0.9em' }}>
                                                {getReadingString(q.original)}
                                            </div>
                                            <div>{q.original.meaning}</div>
                                        </>
                                    ) : (
                                        <>
                                            <div>{q.original.grammar}</div>
                                            <div>{q.original.grammar_meaning}</div>
                                        </>
                                    )}
                                </div>
                                <button
                                    className="add-review-btn"
                                    disabled={globalWrongAnswers.some(item => item.id === q.original.id)}
                                    onClick={() => addToGlobalReview(q.original, q.type)}
                                    style={{ marginTop: '10px', padding: '5px 10px', fontSize: '0.7em', background: '#ffcc00', color: '#000', border: 'none', cursor: 'pointer' }}
                                >
                                    {globalWrongAnswers.some(item => item.id === q.original.id) ? "SAVED" : "ADD TO BOX"}
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="menu-btn" onClick={() => setShowReview(false)}>BACK</button>
                </div>
            )}
        </div>
    );
};

export default ReactionGame;

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
    const [showReview, setShowReview] = useState(false);

    const timerRef = useRef(null);

    // Boss Mode: 10 questions at Level 1, +1 per level (Reduced scaling)
    const bossQuestionsCount = 10 + (level - 1) * 1;
    const totalQuestions = mode === 'boss' ? bossQuestionsCount : 20;
    const timeLimit = mode === 'boss' ? 3 : 5;

    useEffect(() => {
        if (gameState === 'playing' || gameState === 'boss_playing') {
            if (timeLeft > 0) {
                timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
            } else {
                handleTimeOut();
            }
        }
        return () => clearTimeout(timerRef.current);
    }, [timeLeft, gameState]);

    const getReadingString = (item) => {
        if (item.furigana) return item.furigana;
        const on = item.onyomi ? item.onyomi.join(', ') : '';
        const kun = item.kunyomi ? item.kunyomi.join(', ') : '';
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
        setGameState(selectedMode === 'boss' ? 'boss_playing' : 'playing');
        nextQuestion(selectedMode);
    };

    const nextQuestion = (currentMode) => {
        const targetCount = currentMode === 'boss' ? bossQuestionsCount : 20;
        if (questionCount >= targetCount) {
            endGame(true);
            return;
        }

        // Mix words and grammar
        const isWord = Math.random() > 0.5;
        const source = isWord ? words : grammar;
        if (!source || source.length === 0) return;

        const item = source[Math.floor(Math.random() * source.length)];

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
                    correct = item.onyomi.join(', ');
                    targetLabel = 'Onyomi';
                } else if (targetType === 'kunyomi') {
                    questionText = `${item.kanji} (Kunyomi?)`;
                    correct = item.kunyomi.join(', ');
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
                    questionText = item.onyomi.join(', ');
                    questionLabel = '(Onyomi)';
                } else if (sourceType === 'kunyomi') {
                    questionText = item.kunyomi.join(', ');
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
    };

    const getDistractors = (dataset, currentItem, type, targetLabel = '') => {
        const others = dataset.filter(d => d.id !== currentItem.id);
        const shuffled = others.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3).map(d => {
            if (type === 'reading') {
                if (targetLabel === 'Onyomi' && d.onyomi && d.onyomi.length > 0) return d.onyomi.join(', ');
                if (targetLabel === 'Kunyomi' && d.kunyomi && d.kunyomi.length > 0) return d.kunyomi.join(', ');
                return getReadingString(d);
            }
            return d[type];
        });
    };

    const handleAnswer = (answer) => {
        if (gameState !== 'playing' && gameState !== 'boss_playing') return;

        if (answer === currentQuestion.correct) {
            setScore(prev => prev + 1);
            setCombo(prev => prev + 1);

            // XP Gain
            if (mode === 'normal') {
                setXp(prev => prev + 10 + (combo * 2)); // Bonus for combo
            }

            // Check for Boss Mode Win
            if (mode === 'boss' && questionCount === bossQuestionsCount) {
                // Level Up!
                setLevel(prev => prev + 1);
                // setXp(0); // Reset XP or keep it? Usually reset for next level
                endGame(true);
                return;
            }

            nextQuestion(mode);
        } else {
            // Wrong Answer
            setWrongQuestions(prev => [...prev, currentQuestion]);

            if (mode === 'boss') {
                // Boss mode: One mistake = Game Over
                setGameState('game_over');
            } else {
                setCombo(0);
                nextQuestion(mode);
            }
        }
    };

    const handleTimeOut = () => {
        setWrongQuestions(prev => [...prev, currentQuestion]);

        if (mode === 'boss') {
            setGameState('game_over');
        } else {
            setCombo(0);
            nextQuestion(mode);
        }
    };

    const endGame = (completed) => {
        setGameState('result');
    };

    const canChallengeBoss = xp >= 100;

    return (
        <div className="reaction-game" style={{ height: 'calc(100vh - 80px)' }}>
            {gameState === 'menu' && (
                <div className="game-menu">
                    <h1 className="game-title">⚡ REACTION TEST ⚡</h1>
                    <div className="stats-display">
                        <div>LEVEL: {level}</div>
                        <div>XP: {xp} / 100</div>
                    </div>

                    <div className="xp-bar-container">
                        <div className="xp-bar" style={{ width: `${Math.min(xp, 100)}%` }}></div>
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
                            {canChallengeBoss ? "CLICK TO START!" : `Need ${100 - xp} more XP`}
                        </span>
                        <div style={{ fontSize: '0.6em', marginTop: '5px', color: '#ff0055' }}>
                            {bossQuestionsCount} Questions / 3s
                        </div>
                    </button>

                    <button className="menu-btn exit" onClick={onExit}>EXIT</button>
                </div>
            )}

            {(gameState === 'playing' || gameState === 'boss_playing') && currentQuestion && (
                <div className={`game-interface ${mode}`}>
                    <div className="game-header">
                        <div className="timer-bar" style={{ width: `${(timeLeft / timeLimit) * 100}%` }}></div>
                        <div className="game-info">
                            <span>Q: {questionCount} / {totalQuestions}</span>
                            <span>COMBO: {combo}</span>
                        </div>
                    </div>

                    <div className="question-display">
                        {currentQuestion.text}
                    </div>

                    <div className="options-grid">
                        {options.map((opt, idx) => (
                            <button key={idx} className="option-btn" onClick={() => handleAnswer(opt)}>
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
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
                    <button className="menu-btn" onClick={() => setGameState('menu')}>TRY AGAIN</button>
                </div>
            )}

            {gameState === 'result' && !showReview && (
                <div className="result-screen success">
                    <h2>{mode === 'boss' && questionCount === bossQuestionsCount ? "VICTORY!" : "COMPLETE!"}</h2>
                    <p>Score: {score} / {totalQuestions}</p>
                    {mode === 'boss' && questionCount === bossQuestionsCount && (
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
                        if (mode === 'boss' && questionCount === bossQuestionsCount) {
                            setXp(prev => Math.max(0, prev - 100)); // Deduct cost
                        }
                        setGameState('menu');
                    }}>CONTINUE</button>
                </div>
            )}

            {gameState === 'result' && showReview && (
                <div className="review-screen">
                    <h2>REVIEW MISTAKES</h2>
                    <div className="review-list-container">
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

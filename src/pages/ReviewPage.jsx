import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizArea from '../components/study/QuizArea';

const ReviewPage = ({ globalWrongAnswers, removeFromGlobalReview }) => {
    const navigate = useNavigate();
    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying) {
        return (
            <div className="page-container">
                <QuizArea
                    customData={globalWrongAnswers}
                    initialMode="review"
                    addToGlobalReview={() => { }} // No need to add to review from review mode? Or maybe yes if they get it wrong again? But logic might need adjustment.
                    globalWrongAnswers={globalWrongAnswers}
                />
            </div>
        );
    }

    return (
        <div className="page-container">
            <button className="home-btn" onClick={() => navigate('/')}>🏠 HOME</button>
            <div className="review-box-container" style={{ marginTop: '60px' }}>
                <h2>REVIEW BOX ({globalWrongAnswers.length})</h2>

                {globalWrongAnswers.length > 0 && (
                    <button
                        className="play-review-btn"
                        onClick={() => setIsPlaying(true)}
                        style={{
                            fontFamily: "'Press Start 2P', cursive",
                            padding: '15px 30px',
                            background: '#39ff14',
                            color: '#000',
                            border: '4px solid #fff',
                            cursor: 'pointer',
                            marginBottom: '20px',
                            boxShadow: '4px 4px 0 #000'
                        }}
                    >
                        PLAY REVIEW QUIZ 🎮
                    </button>
                )}

                {globalWrongAnswers.length === 0 ? <p>No items to review.</p> : (
                    <div className="review-list" style={{
                        maxHeight: '60vh',
                        overflowY: 'auto',
                        padding: '10px',
                        border: '2px solid #555',
                        background: 'rgba(0,0,0,0.5)',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#ff0055 #222'
                    }}>
                        {globalWrongAnswers.map((item, idx) => (
                            <div key={idx} className="review-card">
                                <div className="review-question">
                                    {item.type === 'word' || item.type === 'vocab' ? (
                                        <>
                                            <div style={{ fontSize: '1.5em', color: '#fff' }}>{item.kanji}</div>
                                            <div style={{ fontSize: '0.9em', color: '#ff00ff', margin: '5px 0' }}>
                                                {item.furigana && <div>{item.furigana}</div>}
                                                {item.onyomi && <div>On: {item.onyomi.join(', ')}</div>}
                                                {item.kunyomi && <div>Kun: {item.kunyomi.join(', ')}</div>}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ fontSize: '1.2em', color: '#fff' }}>{item.grammar}</div>
                                            <div style={{ fontSize: '0.9em', color: '#aaa' }}>{item.connection}</div>
                                            {item.example && (
                                                <div style={{ marginTop: '10px', fontSize: '0.8em', color: '#ddd', fontStyle: 'italic' }}>
                                                    <div>Ex: {item.example}</div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="review-answer">
                                    {item.meaning || item.grammar_meaning || item.answer}
                                </div>
                                <button onClick={() => removeFromGlobalReview(item.id)}>REMOVE</button>
                            </div>
                        ))}
                    </div>
                )}
                <button className="back-btn" onClick={() => navigate('/')}>BACK TO MENU</button>
            </div>
        </div>
    );
};

export default ReviewPage;

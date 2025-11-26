import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReviewPage = ({ globalWrongAnswers, removeFromGlobalReview }) => {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            <button className="home-btn" onClick={() => navigate('/')}>🏠 HOME</button>
            <div className="review-box-container" style={{ marginTop: '60px' }}>
                <h2>REVIEW BOX ({globalWrongAnswers.length})</h2>
                {globalWrongAnswers.length === 0 ? <p>No items to review.</p> : (
                    <div className="review-list" style={{
                        maxHeight: '70vh',
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


import React from 'react';
import QuizArea from './QuizArea';
import WordTicker from './WordTicker';
import './QuizLayout.css';

const QuizLayout = ({ words, mode, onModeChange }) => {
    return (
        <div className="quiz-layout">
            <div className="quiz-sidebar">
                <WordTicker words={words} />
            </div>
            <div className="quiz-main">
                <div className="mode-switcher">
                    <button
                        className={`mode - btn ${mode === 'vocabulary' ? 'active' : ''} `}
                        onClick={() => onModeChange('vocabulary')}
                    >
                        VOCABULARY
                    </button>
                    <button
                        className={`mode - btn ${mode === 'grammar' ? 'active' : ''} `}
                        onClick={() => onModeChange('grammar')}
                    >
                        GRAMMAR
                    </button>
                </div>
                <QuizArea words={words} mode={mode} key={mode} /> {/* Key forces remount on mode change */}
            </div>
        </div>
    );
};

export default QuizLayout;

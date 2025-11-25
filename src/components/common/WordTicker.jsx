import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './WordTicker.css';

const WordTicker = ({ words, pipWindow }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (!isHovered) {
            const interval = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
            }, 5000); // Change word every 5 seconds

            return () => clearInterval(interval);
        }
    }, [words, isHovered]);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    };

    if (!words || words.length === 0) return null;

    // If PiP window is not active, do not render anything (hide from main view)
    if (!pipWindow) return null;

    const currentItem = words[currentIndex];
    const isGrammar = !!currentItem.grammar;

    const tickerContent = (
        <div
            id="ticker-container"
            className="ticker-container-inner"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleNext}
            style={{ cursor: 'pointer', position: 'relative' }}
        >
            <div className="ticker-title">JLPT N1 Essential</div>
            <div className="ticker-content">
                {isGrammar ? (
                    <>
                        <div className="ticker-kanji" style={{ fontSize: '1.2em', color: '#39ff14' }}>{currentItem.grammar}</div>
                        <div className="ticker-meaning">{currentItem.grammar_meaning}</div>
                        <div className="ticker-example-box">
                            <div className="ticker-example" style={{ color: '#fff', fontSize: '0.9em' }}>
                                {currentItem.example}
                                {currentItem.example_reading && <div className="ticker-example-reading" style={{ fontSize: '0.8em', color: '#ff00ff' }}>{currentItem.example_reading}</div>}
                            </div>
                            <div className="ticker-example-meaning" style={{ color: '#aaa' }}>{currentItem.meaning}</div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="ticker-kanji">{currentItem.kanji}</div>
                        <div className="ticker-readings" style={{ marginBottom: '15px' }}>
                            {currentItem.onyomi && currentItem.onyomi.length > 0 && (
                                <div style={{ color: '#00ffff', fontSize: '1rem' }}>On: {currentItem.onyomi.join(', ')}</div>
                            )}
                            {currentItem.kunyomi && currentItem.kunyomi.length > 0 && (
                                <div style={{ color: '#ff00ff', fontSize: '1rem' }}>Kun: {currentItem.kunyomi.join(', ')}</div>
                            )}
                        </div>
                        <div className="ticker-meaning">{currentItem.meaning}</div>
                        <div className="ticker-example-box">
                            <div className="ticker-example">
                                {currentItem.example}
                                {currentItem.example_reading && <div className="ticker-example-reading">{currentItem.example_reading}</div>}
                            </div>
                            <div className="ticker-example-meaning">{currentItem.example_meaning}</div>
                        </div>
                    </>
                )}
            </div>
            <div className="ticker-progress">
                {currentIndex + 1} / {words.length}
            </div>
        </div>
    );

    return (
        <div className="word-ticker" id="ticker-wrapper">
            {pipWindow
                ? createPortal(tickerContent, pipWindow.document.body)
                : tickerContent
            }
        </div >
    );
};

export default WordTicker;

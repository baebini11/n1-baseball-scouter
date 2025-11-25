import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReactionGame from '../components/game/ReactionGame';

const GamePage = ({ joyoKanji, jlptN1Grammar, level, setLevel, xp, setXp, addToGlobalReview, globalWrongAnswers }) => {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            <button className="home-btn" onClick={() => navigate('/')}>🏠 HOME</button>
            <ReactionGame
                words={joyoKanji}
                grammar={jlptN1Grammar}
                onExit={() => navigate('/')}
                level={level}
                setLevel={setLevel}
                xp={xp}
                setXp={setXp}
                addToGlobalReview={addToGlobalReview}
                globalWrongAnswers={globalWrongAnswers}
            />
        </div>
    );
};

export default GamePage;

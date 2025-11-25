import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuizArea from '../components/study/QuizArea';

const StudyPage = ({ joyoKanji, jlptN1Grammar, addToGlobalReview, globalWrongAnswers, xp, setXp }) => {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            <button className="home-btn" onClick={() => navigate('/')}>🏠 HOME</button>
            <QuizArea
                words={joyoKanji}
                grammar={jlptN1Grammar}
                addToGlobalReview={addToGlobalReview}
                globalWrongAnswers={globalWrongAnswers}
                xp={xp}
                setXp={setXp}
            />
        </div>
    );
};

export default StudyPage;

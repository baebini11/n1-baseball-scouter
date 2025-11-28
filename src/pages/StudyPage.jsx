import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuizArea from '../components/study/QuizArea';

const StudyPage = ({ vocab, kanji, grammar, addToGlobalReview, globalWrongAnswers, xp, setXp }) => {
    const navigate = useNavigate();

    return (
        <div className="page-container">

            <QuizArea
                vocab={vocab}
                kanji={kanji}
                grammar={grammar}
                addToGlobalReview={addToGlobalReview}
                globalWrongAnswers={globalWrongAnswers}
                xp={xp}
                setXp={setXp}
            />
        </div>
    );
};

export default StudyPage;

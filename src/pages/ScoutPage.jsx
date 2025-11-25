import React from 'react';
import { useNavigate } from 'react-router-dom';
import ScoutSection from '../components/team/ScoutSection';

const ScoutPage = ({ xp, setXp, addProspect }) => {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            <button className="home-btn" onClick={() => navigate('/')}>🏠 HOME</button>
            <ScoutSection
                xp={xp}
                setXp={setXp}
                addProspect={addProspect}
            />
        </div>
    );
};

export default ScoutPage;

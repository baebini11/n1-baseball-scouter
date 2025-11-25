import React from 'react';
import { useNavigate } from 'react-router-dom';
import TeamManagement from '../components/team/TeamManagement';

const TeamPage = ({ prospects, updateProspect, xp, setXp, level }) => {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            <button className="home-btn" onClick={() => navigate('/')}>🏠 HOME</button>
            <TeamManagement
                prospects={prospects}
                updateProspect={updateProspect}
                xp={xp}
                setXp={setXp}
                level={level}
            />
        </div>
    );
};

export default TeamPage;

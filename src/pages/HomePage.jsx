import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const HomePage = ({ level, xp, togglePip, pipWindow, globalWrongAnswers, user, onLogout }) => {
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    // Use the passed onLogout function which handles Redux state reset
    const handleLogoutClick = async () => {
        if (onLogout) {
            await onLogout();
        } else {
            // Fallback if prop is missing (shouldn't happen)
            try {
                await signOut(auth);
            } catch (error) {
                console.error("Logout failed:", error);
            }
        }
    };

    return (
        <div className="main-menu">
            <div className="auth-header" style={{ position: 'absolute', top: '0px', right: '20px', zIndex: 100 }}>
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '0.8em', color: '#aaa' }}>{user.displayName}</span>
                        <button onClick={handleLogoutClick} className="auth-btn logout">LOGOUT</button>
                    </div>
                ) : (
                    <button onClick={handleLogin} className="auth-btn login">GOOGLE LOGIN</button>
                )}
            </div>

            <h1 className="logo">N1 BASEBALL<br />SCOUTER</h1>

            <div className="status-bar-menu">
                <div className="xp-display">LV.{level}</div>
                <div className="xp-display">XP: {xp}</div>
            </div>

            <div className="menu-grid">
                <button className="menu-card" onClick={() => navigate('/study')}>
                    <div className="icon">📚</div>
                    <h3>STUDY QUIZ</h3>
                    <p>Vocab & Grammar</p>
                </button>

                <button className="menu-card" onClick={() => navigate('/game')}>
                    <div className="icon">⚡</div>
                    <h3>REACTION GAME</h3>
                    <p>Speed Test</p>
                </button>

                <button className={`menu-card ${!user ? 'disabled' : ''}`} onClick={() => user && navigate('/scout')} disabled={!user}>
                    <div className="icon">🧢</div>
                    <h3>SCOUT</h3>
                    <p>Recruit Prospects</p>
                </button>

                <button className={`menu-card ${!user ? 'disabled' : ''}`} onClick={() => user && navigate('/team')} disabled={!user}>
                    <div className="icon">⚾</div>
                    <h3>TEAM</h3>
                    <p>Manage your roster</p>
                </button>

                <button className="menu-card" onClick={() => navigate('/review')}>
                    <div className="icon">📦</div>
                    <h3>REVIEW BOX</h3>
                    <p>{globalWrongAnswers.length} Items</p>
                </button>

                <button className={`menu-card ${!user ? 'disabled' : ''}`} onClick={() => user && navigate('/hall-of-fame')} style={{ borderColor: '#ffd700' }}>
                    <div className="icon">🏆</div>
                    <h3 style={{ color: '#ffd700' }}>HALL OF FAME</h3>
                    <p>Legends</p>
                </button>
            </div>

            <div className="pip-controls-menu">
                <button onClick={togglePip} className="pip-btn">
                    {pipWindow ? "CLOSE PIP" : "OPEN PIP MODE"}
                </button>
            </div>
        </div >
    );
};

export default HomePage;

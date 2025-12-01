import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { generateProspect, getStatRank, BASIC_STATS } from '../../utils/prospectUtils';
import useXpValidation from '../../hooks/useXpValidation';
import './GachaSection.css';

const ScoutSection = ({ xp, setXp, addProspect, user, onXpReloadNeeded }) => {
    const [isRevealing, setIsRevealing] = useState(false);
    const [revealedProspect, setRevealedProspect] = useState(null);
    const [revealStage, setRevealStage] = useState(0); // 0: Start, 1: Rarity, 2: Name, 3: Trait, 4: Stats

    const SCOUT_COST = 300;

    // XP 검증 훅
    const { validateXP, isValidating } = useXpValidation(user, xp, onXpReloadNeeded);

    useEffect(() => {
        if (isRevealing && revealedProspect) {
            setRevealStage(0);
            const timers = [];
            timers.push(setTimeout(() => setRevealStage(1), 500)); // Show Rarity
            timers.push(setTimeout(() => setRevealStage(2), 1500)); // Show Name
            timers.push(setTimeout(() => setRevealStage(3), 2200)); // Show Trait
            timers.push(setTimeout(() => setRevealStage(4), 3000)); // Show Stats
            return () => timers.forEach(t => clearTimeout(t));
        }
    }, [isRevealing, revealedProspect]);

    const scoutPlayer = async () => {
        if (xp < SCOUT_COST) return;

        // XP 검증
        const isValid = await validateXP();
        if (!isValid) {
            console.log('[Scout] XP validation failed, aborting scout');
            return;
        }

        const newXP = xp - SCOUT_COST;
        setXp(newXP);

        // 즉시 Firestore에 XP 업데이트
        if (user) {
            try {
                await setDoc(doc(db, "users", user.uid), {
                    xp: newXP
                }, { merge: true });
                console.log('[Scout] XP immediately synced to Firestore:', newXP);
            } catch (error) {
                console.error('[Scout] Failed to sync XP:', error);
            }
        }

        const newProspect = generateProspect();
        addProspect(newProspect);

        setRevealedProspect(newProspect);
        setIsRevealing(true);
    };

    const closeReveal = () => {
        setIsRevealing(false);
        setRevealedProspect(null);
        setRevealStage(0);
    };

    return (
        <div className="gacha-section">
            <h2>PROSPECT SCOUTING</h2>
            <p style={{ fontSize: '0.8em', color: '#aaa', marginBottom: '20px' }}>
                Use your Japanese skills to recruit local talent!
            </p>

            <div className="status-bar">
                <div className="xp-display">
                    <span>JAPANESE SKILL (XP):</span>
                    <span className="xp-count">{xp}</span>
                </div>
            </div>

            <div className="gacha-machine">
                <div style={{ fontSize: '4em' }}>🧢</div>
                <p>Find the next Star!</p>
                <button
                    className="pull-button"
                    onClick={scoutPlayer}
                    disabled={xp < SCOUT_COST || isValidating}
                >
                    {isValidating ? "검증 중..." : xp >= SCOUT_COST ? `SCOUT (300 XP)` : "NEED MORE XP"}
                </button>
            </div>

            {isRevealing && revealedProspect && (
                <div className="card-reveal-overlay" onClick={revealStage === 4 ? closeReveal : undefined}>
                    <div className="revealed-card" onClick={(e) => e.stopPropagation()} style={{
                        borderColor: revealedProspect.rarity.color,
                        borderWidth: '4px',
                        boxShadow: `0 0 20px ${revealedProspect.rarity.color}`
                    }}>
                        {revealStage >= 1 && (
                            <div className={`reveal-rarity ${revealedProspect.rarity.label === 'S' || revealedProspect.rarity.label === 'A' ? 'epic-reveal' : ''}`} style={{
                                color: revealedProspect.rarity.color,
                                fontSize: '2em',
                                fontWeight: 'bold',
                                textShadow: '2px 2px 0 #000',
                                marginBottom: '10px',
                                animation: revealedProspect.rarity.label === 'S' || revealedProspect.rarity.label === 'A'
                                    ? 'epicPopIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                    : 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}>
                                {revealedProspect.rarity.label}
                            </div>
                        )}

                        {revealStage >= 2 && (
                            <div className="reveal-name" style={{
                                fontSize: '1.5em',
                                marginBottom: '5px',
                                animation: 'fadeIn 0.5s ease-out'
                            }}>
                                {revealedProspect.name}
                            </div>
                        )}

                        {revealStage >= 3 && revealedProspect.trait && (
                            <div style={{
                                color: '#ff00ff',
                                marginBottom: '20px',
                                fontSize: '0.9em',
                                animation: 'fadeIn 0.5s ease-out'
                            }}>
                                Trait: {revealedProspect.trait.label}
                            </div>
                        )}

                        {revealStage >= 4 && (
                            <div className="stat-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '15px',
                                textAlign: 'left',
                                marginTop: '15px',
                                width: '100%',
                                animation: 'slideUp 0.5s ease-out'
                            }}>
                                {BASIC_STATS.map((stat) => {
                                    const val = revealedProspect.stats[stat.key];
                                    const rankInfo = getStatRank(val.potential);
                                    const potPercent = (val.potential / 80) * 100;
                                    const currPercent = (val.current / 80) * 100;

                                    return (
                                        <div key={stat.key} style={{ fontSize: '0.8em' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                                <span style={{ color: '#aaa', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <span>{stat.icon}</span>
                                                    <span>{stat.korLabel}</span>
                                                </span>
                                                <span style={{ color: rankInfo.color }}>{rankInfo.rank}</span>
                                            </div>

                                            <div className="stat-gauge-container" style={{
                                                height: '10px',
                                                background: '#333',
                                                borderRadius: '5px',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}>
                                                {/* Potential Bar (Background) */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0, left: 0, bottom: 0,
                                                    width: `${potPercent}%`,
                                                    background: revealedProspect.rarity.color,
                                                    opacity: 0.3,
                                                    borderRadius: '5px'
                                                }}></div>

                                                {/* Current Bar (Foreground) */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0, left: 0, bottom: 0,
                                                    width: `${currPercent}%`,
                                                    background: revealedProspect.rarity.color,
                                                    borderRadius: '5px'
                                                }}></div>
                                            </div>
                                            <div style={{ textAlign: 'right', fontSize: '0.7em', color: '#777', marginTop: '2px' }}>
                                                {val.current} / {val.potential}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {revealStage === 4 && (
                            <button className="close-reveal-btn" onClick={closeReveal} style={{ marginTop: '20px' }}>CLOSE</button>
                        )}
                    </div>
                </div>
            )}
            <style>{`
                @keyframes popIn {
                    0% { transform: scale(0); opacity: 0; }
                    80% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes epicPopIn {
                    0% { transform: scale(0) rotate(-180deg); opacity: 0; filter: brightness(0); }
                    50% { transform: scale(1.5) rotate(0deg); opacity: 1; filter: brightness(2); }
                    70% { transform: scale(1.2); filter: brightness(1.5); }
                    100% { transform: scale(1); opacity: 1; filter: brightness(1); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ScoutSection;

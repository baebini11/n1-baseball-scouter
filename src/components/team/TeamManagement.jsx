import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BASIC_STATS, calculateTrainingCost, getStatRank, calculateBaseballStats, simulateProCareer } from '../../utils/prospectUtils';
import { removeProspect, updateProspect as updateProspectAction, setXp as setXpAction, addToHallOfFame } from '../../store/slices/gameSlice';
import './CardCollection.css'; // Reusing CSS for grid layout

const TeamManagement = ({ prospects, updateProspect, xp, setXp, level }) => {
    const dispatch = useDispatch();
    const [selectedProspect, setSelectedPlayer] = useState(null);
    const [activeTab, setActiveTab] = useState('roster'); // roster, training, matching
    const [mainTab, setMainTab] = useState('trainees'); // trainees, graduates, my_team
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    // Simulation State
    const [simulationStep, setSimulationStep] = useState('idle'); // idle, projected, revealing, finished
    const [projectedCareer, setProjectedCareer] = useState(null);
    const [actualCareer, setActualCareer] = useState(null);
    const [displayedSeasons, setDisplayedSeasons] = useState([]);

    const [sortBy, setSortBy] = useState('potential'); // potential, rating, name
    const [sortOrder, setSortOrder] = useState('desc'); // asc, desc

    // Filter prospects based on mainTab
    const trainees = prospects.filter(p => !p.position);
    const graduates = prospects.filter(p => p.position && !p.isTeamMember);
    const myTeam = prospects.filter(p => p.isTeamMember);

    let currentList = mainTab === 'trainees' ? trainees : mainTab === 'graduates' ? graduates : myTeam;

    // Helper to calculate growth ratio for dynamic glow
    const getGrowthRatio = (prospect) => {
        if (!prospect.stats) return 0;
        const stats = Object.values(prospect.stats);
        const totalCurrent = stats.reduce((sum, s) => sum + s.current, 0);
        const totalPotential = stats.reduce((sum, s) => sum + s.potential, 0);
        return totalPotential > 0 ? totalCurrent / totalPotential : 0;
    };

    // Sorting Logic
    currentList = [...currentList].sort((a, b) => {
        let valA, valB;

        if (sortBy === 'name') {
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
        } else if (sortBy === 'rating') {
            // Calculate current average rating
            const getRating = (p) => {
                if (p.baseballSkills) {
                    // Use baseball skills if available
                    const role = p.position === 'Pitcher' ? 'pitcher' : 'fielder';
                    const skills = p.baseballSkills[role];
                    if (role === 'pitcher') {
                        return (skills.stuff.current + skills.control.current + skills.breaking.current) / 3;
                    } else {
                        return (skills.contact.current + skills.power.current + skills.defense.current) / 3;
                    }
                } else {
                    // Use basic stats average
                    const stats = Object.values(p.stats);
                    return stats.reduce((sum, s) => sum + s.current, 0) / stats.length;
                }
            };
            valA = getRating(a);
            valB = getRating(b);
        } else {
            // Potential (default)
            const getPot = (p) => {
                const stats = Object.values(p.stats);
                return stats.reduce((sum, s) => sum + s.potential, 0) / stats.length;
            };
            valA = getPot(a);
            valB = getPot(b);
        }

        if (valA < valB) return sortOrder === 'asc' ? 1 : -1;
        if (valA > valB) return sortOrder === 'asc' ? -1 : 1;
        return 0;
    });

    const showXpAlert = (msg) => {
        setModalMessage(msg);
        setShowModal(true);
    };

    const handleTrain = (statKey) => {
        if (!selectedProspect) return;

        const stat = selectedProspect.stats[statKey];
        if (stat.current >= stat.potential) {
            alert("Potential Reached!");
            return;
        }

        const cost = calculateTrainingCost(stat.current, selectedProspect.trait);
        if (xp < cost) {
            showXpAlert("Not enough XP for Training!");
            return;
        }

        // Update Local State (Parent) & Redux
        const updatedXP = xp - cost;
        setXp(updatedXP); // Parent state update
        dispatch(setXpAction(updatedXP)); // Redux update

        const updatedProspect = {
            ...selectedProspect,
            stats: {
                ...selectedProspect.stats,
                [statKey]: {
                    ...stat,
                    current: stat.current + 1
                }
            }
        };

        updateProspect(updatedProspect);
        setSelectedPlayer(updatedProspect);
    };

    const handleMatching = (position) => {
        if (!selectedProspect) return;
        const MATCHING_COST = 300;

        if (xp < MATCHING_COST) {
            showXpAlert("Not enough XP for Coaching Matching!");
            return;
        }

        const updatedXP = xp - MATCHING_COST;
        setXp(updatedXP);
        dispatch(setXpAction(updatedXP));

        const calculated = calculateBaseballStats(selectedProspect, level);

        let newSkills = {};

        // Genius gets both sets if they are Genius
        if (selectedProspect.rarity.id === 'genius') {
            newSkills = {
                pitcher: calculated.pitcher,
                fielder: calculated.fielder,
                isDual: true
            };
        } else {
            // Normal prospects get only the selected position's stats
            if (position === 'Pitcher') {
                newSkills = {
                    pitcher: calculated.pitcher,
                    isDual: false
                };
            } else {
                newSkills = {
                    fielder: calculated.fielder,
                    isDual: false
                };
            }
        }

        const updatedProspect = {
            ...selectedProspect,
            position: position, // Primary position
            baseballSkills: newSkills
        };

        updateProspect(updatedProspect);
        setSelectedPlayer(null); // Return to list to see them move to Graduates
        setMainTab('graduates'); // Switch to Graduates tab
        showXpAlert(`Matching Complete! Assigned to ${position}. Moved to Graduates.`);
    };

    const handleRegisterToTeam = () => {
        if (!selectedProspect) return;
        const updatedProspect = { ...selectedProspect, isTeamMember: true };
        updateProspect(updatedProspect);
        setSelectedPlayer(null);
        setMainTab('my_team');
        showXpAlert(`${selectedProspect.name} has been registered to your team!`);
    };

    const handleRetire = () => {
        if (!selectedProspect) return;
        if (window.confirm(`Are you sure you want to retire ${selectedProspect.name}? This cannot be undone.`)) {
            dispatch(removeProspect(selectedProspect.id));
            setSelectedPlayer(null);
        }
    };

    // --- Simulation Logic ---

    const handleSendToPro = () => {
        if (!selectedProspect) return;
        // 1. Run "Projection" Simulation
        const projection = simulateProCareer(selectedProspect);
        setProjectedCareer(projection);
        setSimulationStep('projected');
    };

    const startActualCareer = () => {
        // 2. Run "Actual" Simulation
        const actual = simulateProCareer(selectedProspect);
        setActualCareer(actual);
        setDisplayedSeasons([]);
        setSimulationStep('revealing');

        // IMMEDIATE COMMIT: Add to Hall of Fame, Remove from Roster, Add XP
        const reward = actual.xpReward;
        const updatedXP = xp + reward;
        setXp(updatedXP);
        dispatch(setXpAction(updatedXP));

        const hallOfFameEntry = {
            ...selectedProspect,
            career: actual
        };
        dispatch(addToHallOfFame(hallOfFameEntry));
        dispatch(removeProspect(selectedProspect.id));

        // Note: We don't clear selectedProspect yet so the modal stays open
    };

    // Animation Effect for Revealing Seasons
    useEffect(() => {
        if (simulationStep === 'revealing' && actualCareer) {
            const totalSeasons = actualCareer.careerStats.length;
            const currentCount = displayedSeasons.length;

            if (currentCount < totalSeasons) {
                const nextSeason = actualCareer.careerStats[currentCount];
                // Check if this season has awards to determine delay
                const hasAwards = actualCareer.awards.some(award => award.includes(nextSeason.year.toString())); // Simplified check, ideally award object has year
                // Actually, awards array is just strings like "MVP (Year 5)". Let's just check if this season was a "good" one based on rating or stats for simplicity, or just constant speed.
                // Let's use a constant speed for now, maybe slower if it's a big year?

                const delay = 800; // 0.8s per season

                const timer = setTimeout(() => {
                    setDisplayedSeasons(prev => [...prev, nextSeason]);
                }, delay);

                return () => clearTimeout(timer);
            } else {
                setSimulationStep('finished');
            }
        }
    }, [simulationStep, actualCareer, displayedSeasons]);


    const closeSimulation = () => {
        // Close Modal and Reset
        setSimulationStep('idle');
        setProjectedCareer(null);
        setActualCareer(null);
        setDisplayedSeasons([]);
        setSelectedPlayer(null);
        showXpAlert(`Simulation Complete! Check the Hall of Fame.`);
    };

    const cancelSimulation = () => {
        setSimulationStep('idle');
        setProjectedCareer(null);
        setActualCareer(null);
        setDisplayedSeasons([]);
    };

    return (
        <div className="team-management">
            <h2>TEAM MANAGEMENT</h2>

            <div className="status-bar">
                <div className="xp-display">XP: {xp}</div>
                <div className="xp-display">Level: {level}</div>
            </div>

            {/* Main Tabs */}
            <div className="tabs" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                <button
                    onClick={() => { setMainTab('trainees'); setSelectedPlayer(null); }}
                    style={{ background: mainTab === 'trainees' ? '#ffd700' : '#333', color: mainTab === 'trainees' ? '#000' : '#fff' }}
                >
                    TRAINEES ({trainees.length})
                </button>
                <button
                    onClick={() => { setMainTab('graduates'); setSelectedPlayer(null); }}
                    style={{ background: mainTab === 'graduates' ? '#00ffff' : '#333', color: mainTab === 'graduates' ? '#000' : '#fff' }}
                >
                    GRADUATES ({graduates.length})
                </button>
                <button
                    onClick={() => { setMainTab('my_team'); setSelectedPlayer(null); }}
                    style={{ background: mainTab === 'my_team' ? '#39ff14' : '#333', color: mainTab === 'my_team' ? '#000' : '#fff' }}
                >
                    MY TEAM ({myTeam.length})
                </button>
            </div>

            {/* Sort Controls */}
            {!selectedProspect && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '10px', paddingRight: '20px' }}>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '5px', background: '#333', color: '#fff', border: '1px solid #555' }}>
                        <option value="potential">Sort by Potential</option>
                        <option value="rating">Sort by Rating</option>
                        <option value="name">Sort by Name</option>
                    </select>
                    <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} style={{ padding: '5px 10px', background: '#333', color: '#fff', border: '1px solid #555', cursor: 'pointer' }}>
                        {sortOrder === 'asc' ? '↑ ASC' : '↓ DESC'}
                    </button>
                </div>
            )}

            {/* Facility Tier Table (Only show on Trainees tab) */}
            {mainTab === 'trainees' && (
                <div className="facility-tier-table" style={{
                    marginBottom: '20px',
                    padding: '10px',
                    border: '1px solid #444',
                    borderRadius: '5px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    fontSize: '0.8em'
                }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#aaa' }}>Facility Tiers</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                        <div style={{ color: level < 11 ? '#39ff14' : '#777' }}>Lv. 1-10: Sandlot (Low)</div>
                        <div style={{ color: level >= 11 && level < 21 ? '#39ff14' : '#777' }}>Lv. 11-20: High School (Mid)</div>
                        <div style={{ color: level >= 21 ? '#39ff14' : '#777' }}>Lv. 21+: Pro 2nd Team (High)</div>
                    </div>
                </div>
            )}

            {/* Roster View */}
            {!selectedProspect && (
                <div className="card-grid">
                    {currentList.map(p => {
                        const growthRatio = getGrowthRatio(p);
                        const glowIntensity = growthRatio * 20; // Max 20px blur
                        const glowOpacity = 0.2 + (growthRatio * 0.6); // 0.2 to 0.8 opacity

                        return (
                            <div key={p.id} className="card-item" onClick={() => {
                                setSelectedPlayer(p);
                                setActiveTab(mainTab === 'trainees' ? 'training' : 'roster'); // Default tab based on main tab
                            }} style={{
                                borderColor: p.rarity.color,
                                borderWidth: '3px',
                                // Dynamic Glow Effect
                                boxShadow: `0 0 ${glowIntensity}px ${p.rarity.color}${Math.floor(glowOpacity * 255).toString(16).padStart(2, '0')}`
                            }}>
                                <div className="card-type" style={{ background: p.rarity.color, color: '#000' }}>{p.rarity.label}</div>
                                <h3>{p.name}</h3>
                                <p>Pos: {p.position || "Trainee"}</p>
                                {/* Mini Stat Bar for Overall Potential */}
                                <div style={{ marginTop: '10px', height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${(p.stats.power.potential / 80) * 100}%`, height: '100%', background: p.rarity.color }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detail View */}
            {selectedProspect && (
                <div className="prospect-detail">
                    <button className="back-btn" onClick={() => setSelectedPlayer(null)}>BACK TO LIST</button>

                    <div className="detail-header" style={{ borderBottom: `2px solid ${selectedProspect.rarity.color}`, paddingBottom: '10px' }}>
                        <h3 style={{ color: selectedProspect.rarity.color, fontSize: '2em' }}>{selectedProspect.name}</h3>
                        <p style={{ color: '#aaa' }}>{selectedProspect.rarity.label} | {selectedProspect.trait ? selectedProspect.trait.label : "No Trait"}</p>
                    </div>

                    {/* Action Buttons for Graduates */}
                    {mainTab === 'graduates' && (
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' }}>
                            <button onClick={handleRegisterToTeam} style={{ background: '#39ff14', color: '#000', flex: 1 }}>REGISTER TO TEAM</button>
                            <button onClick={handleSendToPro} style={{ background: '#00ffff', color: '#000', flex: 1 }}>SEND TO PRO</button>
                            <button onClick={handleRetire} style={{ background: '#ff5500', color: '#fff', flex: 1 }}>RETIRE</button>
                        </div>
                    )}

                    {/* Action Buttons for My Team */}
                    {mainTab === 'my_team' && (
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' }}>
                            <button onClick={handleSendToPro} style={{ background: '#00ffff', color: '#000', flex: 1 }}>SEND TO PRO</button>
                            <button onClick={handleRetire} style={{ background: '#ff5500', color: '#fff', flex: 1 }}>RETIRE FROM TEAM</button>
                        </div>
                    )}

                    {/* Trainee Tabs */}
                    {mainTab === 'trainees' && (
                        <div className="tabs" style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                            {activeTab === 'training' ? (
                                <button onClick={() => setActiveTab('matching')} style={{ width: '100%', maxWidth: '300px' }}>GO TO MATCHING</button>
                            ) : (
                                <button onClick={() => setActiveTab('training')} style={{ width: '100%', maxWidth: '300px' }}>BACK TO STATS</button>
                            )}
                        </div>
                    )}

                    {/* Training Section (Only for Trainees) */}
                    {mainTab === 'trainees' && activeTab === 'training' && (
                        <div className="training-section">
                            <h4>Basic Instruction</h4>
                            <p>Spend XP to improve stats.</p>
                            <div className="stat-list">
                                {BASIC_STATS.map(stat => {
                                    const pStat = selectedProspect.stats[stat.key];
                                    const cost = calculateTrainingCost(pStat.current, selectedProspect.trait);
                                    const isMaxed = pStat.current >= pStat.potential;

                                    const currentRankInfo = getStatRank(pStat.current);
                                    const potentialRankInfo = getStatRank(pStat.potential);

                                    const potPercent = (pStat.potential / 80) * 100;
                                    const currPercent = (pStat.current / 80) * 100;

                                    // Calculate opacity/intensity for current bar based on progress within rank
                                    const range = currentRankInfo.max - currentRankInfo.min + 1;
                                    const progress = pStat.current - currentRankInfo.min;
                                    const ratio = range > 0 ? progress / range : 0;
                                    const currentOpacity = 0.4 + (ratio * 0.6); // 0.4 (start of rank) to 1.0 (end of rank)

                                    return (
                                        <div key={stat.key} className="stat-row" style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '1.5em', marginRight: '8px' }} title={stat.label}>
                                                            {stat.icon}
                                                        </span>
                                                        <span style={{ fontSize: '0.9em', color: '#ddd', fontWeight: 'bold' }}>{stat.korLabel}</span>
                                                    </div>
                                                    <span>
                                                        {pStat.current}/{pStat.potential}
                                                        <span style={{ marginLeft: '8px', fontSize: '0.9em' }}>
                                                            (<span style={{ color: currentRankInfo.color }}>{currentRankInfo.rank}</span> / <span style={{ color: potentialRankInfo.color }}>{potentialRankInfo.rank}</span>)
                                                        </span>
                                                    </span>
                                                </div>

                                                <div className="stat-gauge-container" style={{
                                                    height: '12px',
                                                    background: '#333',
                                                    borderRadius: '6px',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}>
                                                    {/* Potential Bar (Background) */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 0, left: 0, bottom: 0,
                                                        width: `${potPercent}%`,
                                                        background: potentialRankInfo.color,
                                                        opacity: 0.3,
                                                        borderRadius: '6px'
                                                    }}></div>

                                                    {/* Current Bar (Foreground) */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 0, left: 0, bottom: 0,
                                                        width: `${currPercent}%`,
                                                        background: currentRankInfo.color,
                                                        opacity: currentOpacity,
                                                        borderRadius: '6px',
                                                        transition: 'width 0.3s ease'
                                                    }}></div>
                                                </div>
                                            </div>

                                            <button
                                                className="train-btn"
                                                onClick={() => handleTrain(stat.key)}
                                                disabled={isMaxed || xp < cost}
                                            >
                                                {isMaxed ? (
                                                    <span>MAX</span>
                                                ) : (
                                                    <>
                                                        <span className="train-text">+({cost}XP)</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Matching Section (Only for Trainees) */}
                    {mainTab === 'trainees' && activeTab === 'matching' && (
                        <div className="matching-section">
                            <h4>Coaching Matching</h4>
                            <p>Introduce to a Pro Coach to unlock potential.</p>
                            <p>Cost: 300 XP</p>
                            <div className="facility-info">
                                Current Facility Tier:
                                {level >= 21 ? " Pro 2nd Team (High)" : level >= 11 ? " High School (Mid)" : " Sandlot (Low)"}
                            </div>

                            <div className="position-select">
                                <button onClick={() => handleMatching('Pitcher')}>Pitcher</button>
                                <button onClick={() => handleMatching('Catcher')}>Catcher</button>
                                <button onClick={() => handleMatching('Infielder')}>Infielder</button>
                                <button onClick={() => handleMatching('Outfielder')}>Outfielder</button>
                            </div>
                        </div>
                    )}

                    {/* Pro Scouting Report (For Graduates and My Team) */}
                    {(mainTab === 'graduates' || mainTab === 'my_team') && selectedProspect.baseballSkills && (
                        <div className="player-card" style={{ marginTop: '20px', borderTop: '2px solid #555', paddingTop: '20px' }}>
                            <h4 style={{ color: '#ffd700', textAlign: 'center', marginBottom: '20px' }}>
                                PRO SCOUTING REPORT
                                {selectedProspect.baseballSkills.isDual && <span style={{ display: 'block', fontSize: '0.6em', color: '#ff00ff', marginTop: '5px' }}>★ TWO-WAY PLAYER (GENIUS) ★</span>}
                            </h4>

                            {/* Helper to render a skill set */}
                            {['pitcher', 'fielder'].map(role => {
                                const skills = selectedProspect.baseballSkills[role];
                                if (!skills) return null;

                                return (
                                    <div key={role} style={{ marginBottom: '20px' }}>
                                        <h5 style={{ color: role === 'pitcher' ? '#00ffff' : '#ff5500', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
                                            {role.toUpperCase()} SKILLS
                                        </h5>
                                        <div className="stat-list">
                                            {Object.entries(skills).map(([key, val]) => {
                                                if (key === 'mph') {
                                                    return (
                                                        <div key={key} style={{ marginBottom: '10px', textAlign: 'center', background: '#222', padding: '5px', borderRadius: '5px' }}>
                                                            <span style={{ color: '#aaa', fontSize: '0.8em' }}>TOP SPEED</span>
                                                            <div style={{ fontSize: '1.2em', color: '#fff', fontWeight: 'bold' }}>
                                                                {val.current} MPH <span style={{ fontSize: '0.7em', color: '#666' }}>/ {val.potential} MPH</span>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                if (key === 'breaking') {
                                                    const currentRank = getStatRank(val.current);
                                                    const potentialRank = getStatRank(val.potential);
                                                    return (
                                                        <div key={key} style={{ marginBottom: '10px' }}>
                                                            {/* Overall Breaking Gauge */}
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em', marginBottom: '3px' }}>
                                                                <span>{val.label}</span>
                                                                <span>
                                                                    {val.current}/{val.potential}
                                                                    <span style={{ marginLeft: '5px' }}>
                                                                        (<span style={{ color: currentRank.color }}>{currentRank.rank}</span>/<span style={{ color: potentialRank.color }}>{potentialRank.rank}</span>)
                                                                    </span>
                                                                </span>
                                                            </div>
                                                            <div className="stat-gauge-container" style={{ height: '8px', background: '#333', borderRadius: '4px', position: 'relative', overflow: 'hidden', marginBottom: '8px' }}>
                                                                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${(val.potential / 80) * 100}%`, background: potentialRank.color, opacity: 0.3 }}></div>
                                                                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${(val.current / 80) * 100}%`, background: currentRank.color }}></div>
                                                            </div>

                                                            {/* List of Pitches */}
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                                                                {val.pitches.current.map((pitch, idx) => {
                                                                    const pRank = getStatRank(pitch.grade);
                                                                    return (
                                                                        <span key={idx} style={{
                                                                            fontSize: '0.7em',
                                                                            padding: '2px 6px',
                                                                            background: '#333',
                                                                            borderRadius: '4px',
                                                                            color: pRank.color,
                                                                            border: `1px solid ${pRank.color}`
                                                                        }}>
                                                                            {pitch.name} {pRank.rank}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                const currentRank = getStatRank(val.current);
                                                const potentialRank = getStatRank(val.potential);

                                                return (
                                                    <div key={key} style={{ marginBottom: '10px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em', marginBottom: '3px' }}>
                                                            <span>{val.label}</span>
                                                            <span>
                                                                {val.current}/{val.potential}
                                                                <span style={{ marginLeft: '5px' }}>
                                                                    (<span style={{ color: currentRank.color }}>{currentRank.rank}</span>/<span style={{ color: potentialRank.color }}>{potentialRank.rank}</span>)
                                                                </span>
                                                            </span>
                                                        </div>
                                                        <div className="stat-gauge-container" style={{ height: '8px', background: '#333', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                                                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${(val.potential / 80) * 100}%`, background: potentialRank.color, opacity: 0.3 }}></div>
                                                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${(val.current / 80) * 100}%`, background: currentRank.color }}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div >
                    )}
                </div >
            )}

            {/* XP Alert Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content">
                        <p>{modalMessage}</p>
                        <button onClick={() => setShowModal(false)}>OK</button>
                    </div>
                </div>
            )}

            {/* Pro Career Simulation Result Modal */}
            {simulationStep !== 'idle' && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="modal-content simulation-modal" style={{
                        background: '#222', padding: '30px', borderRadius: '10px', maxWidth: '800px', width: '90%', maxHeight: '90vh',
                        border: '2px solid #00ffff', boxShadow: '0 0 20px #00ffff'
                    }}>
                        <h2 style={{ color: '#00ffff', textAlign: 'center' }}>PRO CAREER SIMULATION</h2>
                        <h3 style={{ color: '#fff', textAlign: 'center' }}>{selectedProspect.name}</h3>

                        {/* Step 1: Projected Career */}
                        {simulationStep === 'projected' && projectedCareer && (
                            <div className="simulation-step-container">
                                <h4 style={{ color: '#aaa' }}>SCOUT'S PROJECTION (EXPECTED)</h4>
                                <p style={{ fontSize: '1.2em', color: '#fff', margin: '20px 0' }}>
                                    "Based on current skills, we expect a career of roughly <span style={{ color: '#ffd700' }}>{projectedCareer.careerStats.length} years</span>."
                                </p>
                                <p style={{ fontSize: '1em', color: '#aaa', marginBottom: '20px' }}>
                                    Expected Awards: <span style={{ color: '#ffd700' }}>{projectedCareer.awards.length}</span>
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                                    <button onClick={startActualCareer} style={{
                                        background: '#39ff14', color: '#000', padding: '15px 30px', fontSize: '1.2em', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold',
                                        boxShadow: '0 0 15px #39ff14'
                                    }}>
                                        START CAREER
                                    </button>
                                    <button onClick={cancelSimulation} style={{ background: '#444', color: '#fff', padding: '15px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                        CANCEL
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2 & 3: Revealing / Finished */}
                        {(simulationStep === 'revealing' || simulationStep === 'finished') && actualCareer && (
                            <div className="simulation-step-container">
                                <h4 style={{ color: '#ffd700' }}>ACTUAL CAREER PATH</h4>

                                <div style={{ overflowX: 'auto', marginBottom: '20px', maxHeight: '400px' }}>
                                    <table className="simulation-table">
                                        <thead>
                                            <tr>
                                                <th>Year</th>
                                                <th>Age</th>
                                                <th>OVR</th>
                                                {selectedProspect.position === 'Pitcher' ? (
                                                    <>
                                                        <th>W</th>
                                                        <th>L</th>
                                                        <th>ERA</th>
                                                        <th>SO</th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <th>AVG</th>
                                                        <th>HR</th>
                                                        <th>RBI</th>
                                                        <th>OPS</th>
                                                    </>
                                                )}
                                                <th>Awards</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayedSeasons.map((stat, idx) => {
                                                // Check for awards in this year
                                                // Note: actualCareer.awards is array of strings like "MVP (Year 5)"
                                                // We need to parse or match.
                                                const yearAwards = actualCareer.awards.filter(a => a.includes(`(Year ${stat.year})`));
                                                const isAwardYear = yearAwards.length > 0;

                                                return (
                                                    <tr key={idx} className={`simulation-row ${isAwardYear ? 'highlight' : ''}`}>
                                                        <td>{stat.year}</td>
                                                        <td>{stat.age}</td>
                                                        <td style={{ color: '#ffd700' }}>{stat.rating}</td>
                                                        {selectedProspect.position === 'Pitcher' ? (
                                                            <>
                                                                <td>{stat.wins}</td>
                                                                <td>{stat.losses}</td>
                                                                <td>{stat.era}</td>
                                                                <td>{stat.strikeouts}</td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <td>{stat.avg}</td>
                                                                <td>{stat.hr}</td>
                                                                <td>{stat.rbi}</td>
                                                                <td>{stat.ops}</td>
                                                            </>
                                                        )}
                                                        <td>
                                                            {yearAwards.map((award, i) => (
                                                                <span key={i} style={{ fontSize: '0.8em', color: '#000', background: '#ffd700', padding: '2px 5px', borderRadius: '5px', display: 'block', marginBottom: '2px' }}>
                                                                    {award.split(' (')[0]}
                                                                </span>
                                                            ))}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {simulationStep === 'finished' && (
                                    <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #444', paddingTop: '20px', animation: 'fadeIn 1s' }}>
                                        <p style={{ fontSize: '1.2em', color: '#39ff14' }}>XP Reward: +{actualCareer.xpReward} XP</p>
                                        <p style={{ color: '#aaa', marginBottom: '20px' }}>{actualCareer.summary}</p>
                                        <button onClick={closeSimulation} style={{ background: '#00ffff', color: '#000', padding: '10px 30px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                                            CLOSE
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamManagement;

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromHallOfFame } from '../store/slices/gameSlice';
import '../components/team/CardCollection.css'; // Reuse card styles

const HallOfFamePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const hallOfFame = useSelector(state => state.game.hallOfFame);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [displayedStats, setDisplayedStats] = useState(null);
    const [displayMode, setDisplayMode] = useState('max'); // 'max' or 'year'

    const getTier = (awardsCount) => {
        if (awardsCount >= 15) return { label: 'LEGENDARY', color: '#ff00ff', shadow: '0 0 15px #ff00ff' };
        if (awardsCount >= 10) return { label: 'OUTSTANDING', color: '#00ffff', shadow: '0 0 10px #00ffff' };
        if (awardsCount >= 5) return { label: 'NAMED', color: '#ffd700', shadow: '0 0 10px #ffd700' };
        if (awardsCount >= 1) return { label: 'GOOD', color: '#00ff00', shadow: 'none' };
        return { label: 'NORMAL', color: '#aaaaaa', shadow: 'none' };
    };

    const calculateMaxStats = (player) => {
        if (!player || !player.career || !player.career.careerStats) return null;

        const maxStats = {};
        const statsList = player.career.careerStats;

        // Initialize keys from first year
        if (statsList.length > 0 && statsList[0].details) {
            Object.keys(statsList[0].details).forEach(key => {
                maxStats[key] = 0;
            });
        }

        // Find max for each key
        statsList.forEach(stat => {
            if (stat.details) {
                Object.entries(stat.details).forEach(([key, val]) => {
                    // Handle numeric values and strings like "95 MPH"
                    let numVal = val;
                    if (typeof val === 'string' && val.includes('MPH')) {
                        numVal = parseInt(val.replace(' MPH', ''));
                    } else if (typeof val === 'object' && val !== null && val.current !== undefined) {
                        // Handle Breaking object { current: 70, pitches: [...] }
                        numVal = val.current;
                    }

                    let currentMaxNum = 0;
                    if (typeof maxStats[key] === 'string' && maxStats[key].includes('MPH')) {
                        currentMaxNum = parseInt(maxStats[key].replace(' MPH', ''));
                    } else if (typeof maxStats[key] === 'object' && maxStats[key] !== null) {
                        currentMaxNum = maxStats[key].current;
                    } else {
                        currentMaxNum = maxStats[key] || 0;
                    }

                    if (numVal > currentMaxNum) {
                        maxStats[key] = val;
                    }
                });
            }
        });
        return maxStats;
    };

    const handlePlayerClick = (player) => {
        setSelectedPlayer(player);
        setSelectedSeason(null);
        setDisplayMode('max');
        setDisplayedStats(calculateMaxStats(player));
    };

    const handleRowClick = (stat) => {
        if (stat.details) {
            setSelectedSeason(stat);
            setDisplayMode('year');
            setDisplayedStats(stat.details);
        }
    };

    const handleMaxClick = () => {
        setSelectedSeason(null);
        setDisplayMode('max');
        setDisplayedStats(calculateMaxStats(selectedPlayer));
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to remove this player from the Hall of Fame? This cannot be undone.')) {
            dispatch(removeFromHallOfFame(id));
            if (selectedPlayer?.id === id) setSelectedPlayer(null);
        }
    };

    return (
        <div className="page-container hall-of-fame-page" style={{ color: '#fff', background: '#111' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button className="home-btn" onClick={() => navigate('/')}>🏠 HOME</button>
                <h1 style={{ color: '#ffd700', textShadow: '0 0 10px #ffd700' }}>HALL OF FAME</h1>
                <div style={{ width: '100px' }}></div> {/* Spacer */}
            </div>

            {hallOfFame.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
                    <h2>No Inductees Yet</h2>
                    <p>Send your best players to the Pro League to see them here.</p>
                </div>
            ) : (
                <div className="card-grid">
                    {hallOfFame.map((player, index) => {
                        const tier = getTier(player.career.awards.length);
                        return (
                            <div key={index} className="card-item" onClick={() => handlePlayerClick(player)} style={{
                                borderColor: tier.color,
                                borderWidth: '3px',
                                boxShadow: tier.shadow,
                                cursor: 'pointer',
                                position: 'relative'
                            }}>
                                <div className="card-type" style={{ background: tier.color, color: '#000', fontWeight: 'bold' }}>{tier.label}</div>
                                <h3>{player.name}</h3>
                                <p>{player.position}</p>
                                <p style={{ fontSize: '0.8em', color: '#aaa' }}>{player.career.summary || player.career.description}</p>
                                <button
                                    onClick={(e) => handleDelete(e, player.id)}
                                    style={{
                                        position: 'absolute', top: '5px', right: '5px',
                                        background: 'red', color: 'white',
                                        border: `2px solid ${tier.color}`, // Match card border
                                        borderRadius: '4px', // Square with slight radius
                                        width: '24px', height: '24px',
                                        cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                                        padding: 0,
                                        boxShadow: '0 0 5px red'
                                    }}
                                >
                                    X
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Player Detail Modal */}
            {selectedPlayer && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        background: '#222', padding: '30px', borderRadius: '10px', maxWidth: '1100px', width: '95%', maxHeight: '90vh', overflowY: 'auto',
                        border: `2px solid ${getTier(selectedPlayer.career.awards.length).color}`,
                        boxShadow: `0 0 20px ${getTier(selectedPlayer.career.awards.length).color}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
                            <h2 style={{ color: getTier(selectedPlayer.career.awards.length).color, margin: 0 }}>{selectedPlayer.name}</h2>
                            <button onClick={() => setSelectedPlayer(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5em', cursor: 'pointer' }}>×</button>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h4 style={{ color: '#aaa' }}>Career Summary</h4>
                                <p style={{ fontSize: '1.2em' }}>{selectedPlayer.career.summary || selectedPlayer.career.description}</p>
                            </div>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h4 style={{ color: '#aaa' }}>Awards ({selectedPlayer.career.awards.length})</h4>
                                {selectedPlayer.career.awards.length > 0 ? (
                                    <ul style={{ listStyle: 'none', padding: 0, maxHeight: '150px', overflowY: 'auto' }}>
                                        {(() => {
                                            // Group awards by type
                                            const awardCounts = selectedPlayer.career.awards.reduce((acc, award) => {
                                                const type = award.split(' (')[0]; // Remove year suffix
                                                acc[type] = (acc[type] || 0) + 1;
                                                return acc;
                                            }, {});

                                            return Object.entries(awardCounts).map(([type, count], idx) => (
                                                <li key={idx} style={{ color: '#00ffff', marginBottom: '5px' }}>
                                                    🏆 {type} {count > 1 ? `x${count}` : ''}
                                                </li>
                                            ));
                                        })()}
                                    </ul>
                                ) : (
                                    <p style={{ color: '#666' }}>No major awards.</p>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ flex: 2 }}>
                                <h4 style={{ color: '#aaa', marginBottom: '10px' }}>Season Stats (Click row for details)</h4>
                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.9em' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: '#222' }}>
                                            <tr style={{ borderBottom: '1px solid #444', color: '#ffd700' }}>
                                                <th style={{ padding: '8px', textAlign: 'left' }}>Year</th>
                                                <th style={{ padding: '8px', textAlign: 'center' }}>Age</th>
                                                <th style={{ padding: '8px', textAlign: 'center' }}>OVR</th>
                                                {(selectedPlayer.position === '투수' || selectedPlayer.position === 'Pitcher') ? (
                                                    <>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>W</th>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>L</th>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>ERA</th>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>HLD</th>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>SV</th>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>ERA+</th>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>WAR</th>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>IP</th>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>SO</th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>AVG</th>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>HR</th>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>RBI</th>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>SB</th>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>OPS</th>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>OPS+</th>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>WAR</th>
                                                    </>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedPlayer.career.careerStats.map((stat, idx) => (
                                                <tr key={idx}
                                                    onClick={() => handleRowClick(stat)}
                                                    style={{
                                                        borderBottom: '1px solid #333',
                                                        background: selectedSeason === stat ? '#333' : 'transparent',
                                                        cursor: stat.details ? 'pointer' : 'default'
                                                    }}
                                                >
                                                    <td style={{ padding: '8px' }}>{stat.yearRecord || stat.year}</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>{stat.age}</td>
                                                    <td style={{ padding: '8px', textAlign: 'center', color: '#00ffff' }}>
                                                        {stat.rating}
                                                        {idx > 0 && selectedPlayer.career.careerStats[idx - 1] && (
                                                            <span style={{ fontSize: '0.7em', marginLeft: '3px', color: stat.rating >= selectedPlayer.career.careerStats[idx - 1].rating ? '#00ff00' : '#ff0000' }}>
                                                                {stat.rating >= selectedPlayer.career.careerStats[idx - 1].rating ? '▲' : '▼'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    {(selectedPlayer.position === '투수' || selectedPlayer.position === 'Pitcher') ? (
                                                        <>
                                                            <td style={{ padding: '8px', textAlign: 'right' }}>{stat.wins}</td>
                                                            <td style={{ padding: '8px', textAlign: 'right' }}>{stat.losses}</td>
                                                            <td style={{ padding: '8px', textAlign: 'right' }}>{stat.era}</td>
                                                            <td style={{ padding: '8px', textAlign: 'right' }}>{stat.holds || 0}</td>
                                                            <td style={{ padding: '8px', textAlign: 'right' }}>{stat.saves || 0}</td>
                                                            <td style={{ padding: '8px', textAlign: 'right', color: '#aaa' }}>{stat.eraPlus || '-'}</td>
                                                            <td style={{ padding: '8px', textAlign: 'right', color: '#00ff00', fontWeight: 'bold' }}>{stat.war || '-'}</td>
                                                            <td style={{ padding: '8px', textAlign: 'right' }}>{stat.innings}</td>
                                                            <td style={{ padding: '8px', textAlign: 'right' }}>{stat.strikeouts}</td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td style={{ padding: '8px', textAlign: 'right' }}>{stat.avg}</td>
                                                            <td style={{ padding: '8px', textAlign: 'right' }}>{stat.hr}</td>
                                                            <td style={{ padding: '8px', textAlign: 'right' }}>{stat.rbi}</td>
                                                            <td style={{ padding: '8px', textAlign: 'right' }}>{stat.sb}</td>
                                                            <td style={{ padding: '8px', textAlign: 'right' }}>{stat.ops}</td>
                                                            <td style={{ padding: '8px', textAlign: 'right', color: '#aaa' }}>{stat.opsPlus || '-'}</td>
                                                            <td style={{ padding: '8px', textAlign: 'right', color: '#00ff00', fontWeight: 'bold' }}>{stat.war || '-'}</td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                            <tr style={{ borderTop: '2px solid #ffd700', fontWeight: 'bold', background: '#333' }}>
                                                <td style={{ padding: '8px' }} colSpan="3">{selectedPlayer.career.careerStats.length} Years</td>
                                                {(selectedPlayer.position === '투수' || selectedPlayer.position === 'Pitcher') ? (
                                                    <>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>{selectedPlayer.career.careerTotals?.wins || 0}</td>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>{selectedPlayer.career.careerTotals?.losses || 0}</td>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>{selectedPlayer.career.careerTotals?.era || '-'}</td>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>{selectedPlayer.career.careerTotals?.holds || 0}</td>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>{selectedPlayer.career.careerTotals?.saves || 0}</td>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>-</td>
                                                        <td style={{ padding: '8px', textAlign: 'right', color: '#00ff00' }}>{selectedPlayer.career.careerTotals?.war || 0}</td>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>{selectedPlayer.career.careerTotals?.innings || 0}</td>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>{selectedPlayer.career.careerTotals?.strikeouts || 0}</td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>{selectedPlayer.career.careerTotals?.avg || '-'}</td>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>{selectedPlayer.career.careerTotals?.hr || 0}</td>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>{selectedPlayer.career.careerTotals?.rbi || 0}</td>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>{selectedPlayer.career.careerTotals?.sb || 0}</td>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>{selectedPlayer.career.careerTotals?.ops || '-'}</td>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>-</td>
                                                        <td style={{ padding: '8px', textAlign: 'right', color: '#00ff00' }}>{selectedPlayer.career.careerTotals?.war || 0}</td>
                                                    </>
                                                )}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Right Side: Stats Display */}
                            <div style={{ flex: 1, minWidth: '250px', background: '#1a1a1a', padding: '15px', borderRadius: '10px', border: '1px solid #444' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h4 style={{ margin: 0, color: displayMode === 'max' ? '#ffd700' : '#fff' }}>
                                        {displayMode === 'max' ? 'MAX STATS' : `Year ${selectedSeason?.yearRecord || selectedSeason?.year} Stats`}
                                    </h4>
                                    {displayMode === 'year' && (
                                        <button onClick={handleMaxClick} style={{
                                            background: '#333', color: '#ffd700', border: '1px solid #ffd700',
                                            padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8em'
                                        }}>
                                            Show Max
                                        </button>
                                    )}
                                </div>

                                {displayedStats ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {Object.entries(displayedStats).map(([key, val]) => {
                                            let arrow = null;
                                            let displayVal = val;
                                            let pitchList = null;

                                            // Handle Breaking object
                                            if (typeof val === 'object' && val !== null && val.current !== undefined) {
                                                displayVal = val.current;
                                                if (val.pitches && val.pitches.length > 0) {
                                                    pitchList = val.pitches;
                                                }
                                            }

                                            if (displayMode === 'year' && selectedSeason) {
                                                const currentYear = selectedSeason.year;
                                                const prevSeason = selectedPlayer.career.careerStats.find(s => s.year === currentYear - 1);
                                                if (prevSeason && prevSeason.details && prevSeason.details[key]) {
                                                    let currentVal = parseInt(displayVal) || 0;
                                                    let prevVal = prevSeason.details[key];

                                                    if (typeof prevVal === 'object' && prevVal !== null) prevVal = prevVal.current;
                                                    prevVal = parseInt(prevVal) || 0;

                                                    if (currentVal !== prevVal) {
                                                        const diff = currentVal - prevVal;
                                                        const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
                                                        arrow = (
                                                            <span style={{ fontSize: '0.8em', marginLeft: '5px', color: currentVal > prevVal ? '#00ff00' : '#ff0000' }}>
                                                                {currentVal > prevVal ? '▲' : '▼'} {diffStr}
                                                            </span>
                                                        );
                                                    }
                                                }
                                            }
                                            return (
                                                <div key={key} style={{ borderBottom: '1px solid #333', paddingBottom: '5px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ color: '#aaa' }}>{key}</span>
                                                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{arrow} {displayVal}</span>
                                                    </div>
                                                    {pitchList && (
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px', justifyContent: 'flex-end' }}>
                                                            {pitchList.map((p, i) => (
                                                                <span key={i} style={{ fontSize: '0.7em', background: '#333', padding: '2px 5px', borderRadius: '3px', color: '#00ffff' }}>
                                                                    {p.name} {p.grade}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p style={{ color: '#666', textAlign: 'center' }}>No stats available</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default HallOfFamePage;

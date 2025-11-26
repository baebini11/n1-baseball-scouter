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

    const getTier = (awardsCount) => {
        if (awardsCount >= 15) return { label: 'LEGENDARY', color: '#ff00ff', shadow: '0 0 15px #ff00ff' };
        if (awardsCount >= 10) return { label: 'OUTSTANDING', color: '#00ffff', shadow: '0 0 10px #00ffff' };
        if (awardsCount >= 5) return { label: 'NAMED', color: '#ffd700', shadow: '0 0 10px #ffd700' };
        if (awardsCount >= 1) return { label: 'GOOD', color: '#00ff00', shadow: 'none' };
        return { label: 'NORMAL', color: '#aaaaaa', shadow: 'none' };
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to remove this player from the Hall of Fame? This cannot be undone.')) {
            dispatch(removeFromHallOfFame(id));
            if (selectedPlayer?.id === id) setSelectedPlayer(null);
        }
    };

    const handleRowClick = (stat) => {
        if (stat.details) {
            setSelectedSeason(stat);
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
                            <div key={index} className="card-item" onClick={() => { setSelectedPlayer(player); setSelectedSeason(null); }} style={{
                                borderColor: tier.color,
                                borderWidth: '3px',
                                boxShadow: tier.shadow,
                                cursor: 'pointer',
                                position: 'relative'
                            }}>
                                <div className="card-type" style={{ background: tier.color, color: '#000', fontWeight: 'bold' }}>{tier.label}</div>
                                <h3>{player.name}</h3>
                                <p>{player.position}</p>
                                <p style={{ fontSize: '0.8em', color: '#aaa' }}>{player.career.summary}</p>
                                <button
                                    onClick={(e) => handleDelete(e, player.id)}
                                    style={{
                                        position: 'absolute', top: '5px', right: '5px',
                                        background: 'red', color: 'white', border: 'none', borderRadius: '50%',
                                        width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px'
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
                        background: '#222', padding: '30px', borderRadius: '10px', maxWidth: '900px', width: '95%', maxHeight: '90vh', overflowY: 'auto',
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
                                <p style={{ fontSize: '1.2em' }}>{selectedPlayer.career.summary}</p>
                            </div>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h4 style={{ color: '#aaa' }}>Awards ({selectedPlayer.career.awards.length})</h4>
                                {selectedPlayer.career.awards.length > 0 ? (
                                    <ul style={{ listStyle: 'none', padding: 0, maxHeight: '150px', overflowY: 'auto' }}>
                                        {selectedPlayer.career.awards.map((award, idx) => (
                                            <li key={idx} style={{ color: '#00ffff', marginBottom: '5px' }}>🏆 {award}</li>
                                        ))}
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
                                                {selectedPlayer.position === 'Pitcher' ? (
                                                    <>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>W</th>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>L</th>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>ERA</th>
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
                                                    <td style={{ padding: '8px' }}>{stat.year}</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>{stat.age}</td>
                                                    <td style={{ padding: '8px', textAlign: 'center', color: '#00ffff' }}>{stat.rating}</td>
                                                    {selectedPlayer.position === 'Pitcher' ? (
                                                        <>
                                                            <td style={{ padding: '8px', textAlign: 'right' }}>{stat.wins}</td>
                                                            <td style={{ padding: '8px', textAlign: 'right' }}>{stat.losses}</td>
                                                            <td style={{ padding: '8px', textAlign: 'right' }}>{stat.era}</td>
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
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                            <tr style={{ borderTop: '2px solid #ffd700', fontWeight: 'bold', background: '#333' }}>
                                                <td style={{ padding: '8px' }} colSpan="3">TOTALS</td>
                                                {selectedPlayer.position === 'Pitcher' ? (
                                                    <>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>{selectedPlayer.career.careerTotals?.wins || 0}</td>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>{selectedPlayer.career.careerTotals?.losses || 0}</td>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>{selectedPlayer.career.careerTotals?.era || '-'}</td>
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
                                                    </>
                                                )}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Detailed Stats Panel */}
                            {selectedSeason && selectedSeason.details && (
                                <div style={{ flex: 1, background: '#333', padding: '15px', borderRadius: '8px', border: '1px solid #555' }}>
                                    <h4 style={{ color: '#ffd700', marginTop: 0 }}>Year {selectedSeason.year} (Age {selectedSeason.age})</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        {Object.entries(selectedSeason.details).map(([key, value]) => (
                                            <div key={key} style={{ background: '#222', padding: '10px', borderRadius: '5px' }}>
                                                <div style={{ color: '#aaa', fontSize: '0.8em', textTransform: 'capitalize' }}>{key}</div>
                                                <div style={{ fontSize: '1.2em', color: '#fff' }}>{value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div >
                </div >
            )
            }
        </div >
    );
};

export default HallOfFamePage;

import React, { useState } from 'react';
import baseballCards from '../data/baseball_cards.json';
import './GachaSection.css';

const GachaSection = ({ tickets, setTickets, collectedCards, setCollectedCards, xp, setXp }) => {
    const [isRevealing, setIsRevealing] = useState(false);
    const [revealedCard, setRevealedCard] = useState(null);
    const [isNew, setIsNew] = useState(false);

    const TICKET_PRICE = 300;

    const buyTicket = () => {
        if (xp >= TICKET_PRICE) {
            setXp(prev => prev - TICKET_PRICE);
            setTickets(prev => prev + 1);
        }
    };

    const pullCard = () => {
        if (tickets <= 0) return;

        // Deduct ticket
        setTickets(prev => prev - 1);

        // Weighted Random Selection
        let pool = [];
        baseballCards.forEach(card => {
            // Add 'card' to pool 'card.rarity_weight' times
            for (let i = 0; i < card.rarity_weight; i++) {
                pool.push(card);
            }
        });

        const randomCard = pool[Math.floor(Math.random() * pool.length)];

        // Check if new
        const alreadyOwned = collectedCards.some(c => c.id === randomCard.id);
        setIsNew(!alreadyOwned);

        if (!alreadyOwned) {
            setCollectedCards(prev => [...prev, { ...randomCard, obtainedAt: new Date().toISOString() }]);
        }

        setRevealedCard(randomCard);
        setIsRevealing(true);
    };

    const closeReveal = () => {
        setIsRevealing(false);
        setRevealedCard(null);
    };

    return (
        <div className="gacha-section">
            <h2>BASEBALL CARD GACHA</h2>

            <div className="status-bar">
                <div className="ticket-display">
                    <span>TICKETS:</span>
                    <span className="ticket-count">{tickets}</span>
                </div>
                <div className="xp-display">
                    <span>XP:</span>
                    <span className="xp-count">{xp}</span>
                </div>
            </div>

            <div className="shop-section">
                <h3>TICKET SHOP</h3>
                <button
                    className="buy-btn"
                    onClick={buyTicket}
                    disabled={xp < TICKET_PRICE}
                >
                    BUY TICKET (300 XP)
                </button>
            </div>

            <div className="gacha-machine">
                <div style={{ fontSize: '4em' }}>⚾</div>
                <p>Get Legendary Players!</p>
                <button
                    className="pull-button"
                    onClick={pullCard}
                    disabled={tickets <= 0}
                >
                    {tickets > 0 ? "PULL CARD!" : "NO TICKETS"}
                </button>
            </div>

            {isRevealing && revealedCard && (
                <div className="card-reveal-overlay" onClick={closeReveal}>
                    <div className="revealed-card" onClick={(e) => e.stopPropagation()}>
                        {isNew && <div className="new-badge">NEW!</div>}
                        <div className="card-type">{revealedCard.type.toUpperCase()}</div>
                        <img src={revealedCard.image_url} alt={revealedCard.name} className="card-image" />
                        <div className="card-info">
                            <h3>{revealedCard.name}</h3>
                            <div className="card-stats">
                                {revealedCard.stat_name}: {revealedCard.stat_value}
                            </div>
                            <a
                                href={revealedCard.wiki_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#00ffff', fontSize: '0.8em' }}
                            >
                                VIEW WIKI
                            </a>
                        </div>
                        <button className="close-reveal-btn" onClick={closeReveal}>CLOSE</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GachaSection;

import React, { useState } from 'react';
import './CardCollection.css';

const CardCollection = ({ collectedCards }) => {
    const [selectedCard, setSelectedCard] = useState(null);

    // Group by unique cards (count duplicates if needed, or just show unique)
    // User requirement: "Card Collection". Usually implies seeing what you have.
    // Let's show all unique cards collected, maybe with a count?
    // For now, let's just list them. If duplicates are allowed in the state, we can show count.

    // Process cards to find unique ones and counts
    const uniqueCards = collectedCards.reduce((acc, card) => {
        const existing = acc.find(c => c.id === card.id);
        if (existing) {
            existing.count += 1;
        } else {
            acc.push({ ...card, count: 1 });
        }
        return acc;
    }, []);

    // Sort by ID or Rarity? Let's sort by ID for now (Batters then Pitchers)
    uniqueCards.sort((a, b) => {
        // Custom sort: Batters (b) first, then Pitchers (p)
        // Within that, by ID number
        const typeA = a.id.charAt(0);
        const typeB = b.id.charAt(0);
        if (typeA !== typeB) return typeA.localeCompare(typeB); // 'b' comes before 'p'

        const numA = parseInt(a.id.substring(1));
        const numB = parseInt(b.id.substring(1));
        return numA - numB;
    });

    return (
        <div className="card-collection">
            <div className="collection-stats">
                <h2>MY COLLECTION</h2>
                <p>Collected: {uniqueCards.length} / 40</p>
            </div>

            <div className="collection-grid">
                {uniqueCards.map(card => (
                    <div
                        key={card.id}
                        className={`collection-card ${card.type}`}
                        onClick={() => setSelectedCard(card)}
                    >
                        <img src={card.image_url} alt={card.name} loading="lazy" />
                        <div className="collection-card-info">
                            <div className="collection-card-name">{card.name}</div>
                            <div className="collection-card-stat">
                                {card.stat_name}: {card.stat_value}
                            </div>
                            {card.count > 1 && (
                                <div style={{ fontSize: '0.7em', color: '#ffd700', marginTop: '5px' }}>
                                    x{card.count}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {selectedCard && (
                <div className="card-detail-overlay" onClick={() => setSelectedCard(null)}>
                    <div className="card-detail-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-detail-btn" onClick={() => setSelectedCard(null)}>×</button>

                        <div className="detail-name">{selectedCard.name}</div>
                        <div style={{ marginBottom: '10px', color: '#aaa' }}>
                            {selectedCard.type.toUpperCase()}
                        </div>

                        <img src={selectedCard.image_url} alt={selectedCard.name} className="detail-image" />

                        <div className="detail-info">
                            <div className="detail-stats">
                                <div>{selectedCard.stat_name}</div>
                                <div style={{ fontSize: '1.5em', color: '#fff' }}>{selectedCard.stat_value}</div>
                            </div>

                            <p style={{ fontSize: '0.8em', color: '#888', marginBottom: '15px' }}>
                                Rarity Tier: {selectedCard.rarity_weight} (Lower is rarer)
                            </p>

                            <a
                                href={selectedCard.wiki_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="detail-wiki-btn"
                            >
                                VIEW ON WIKIPEDIA
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CardCollection;

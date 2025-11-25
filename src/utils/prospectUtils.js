import { v4 as uuidv4 } from 'uuid';

export const BASIC_STATS = [
    { key: 'power', label: 'Power (힘)', icon: '💪', korLabel: '근력' },
    { key: 'flexibility', label: 'Flexibility (유연성)', icon: '🧘', korLabel: '유연' },
    { key: 'speed', label: 'Speed (스피드)', icon: '👟', korLabel: '주력' },
    { key: 'throwing', label: 'Throwing (쓰로잉)', icon: '⚾', korLabel: '어깨' },
    { key: 'bat_speed', label: 'Bat Speed (배트 스피드)', icon: '🏏', korLabel: '스윙' },
    { key: 'grip_strength', label: 'Grip (악력)', icon: '✊', korLabel: '악력' }
];

export const RARITY_TYPES = {
    GENIUS: { id: 'genius', label: '천재 (Genius)', minPot: 420, maxPot: 480, color: '#ff00ff', prob: 0.05 },
    ACE: { id: 'ace', label: '에이스 (Ace)', minPot: 360, maxPot: 419, color: '#ffd700', prob: 0.15 },
    SOLID: { id: 'solid', label: '솔리드 (Solid)', minPot: 300, maxPot: 359, color: '#00ffff', prob: 0.40 },
    HARD_WORKER: { id: 'hard_worker', label: '노력가 (Hard Worker)', minPot: 120, maxPot: 300, color: '#00ff00', prob: 0.25 },
    LATE_BLOOMER: { id: 'late_bloomer', minPot: 120, maxPot: 420, color: '#ff5500', prob: 0.15 }
};

export const TRAITS = [
    { id: 'workaholic', label: '연습벌레', desc: 'Training Cost -10%', type: 'training' },
    { id: 'lazy', label: '게으름', desc: 'Training Cost +10%', type: 'training' },
    { id: 'iron_will', label: '강철 심장', desc: 'Boss Combo Saver', type: 'game' },
    { id: 'glass_heart', label: '유리 멘탈', desc: 'Boss Time -1s', type: 'game' },
    { id: 'clutch', label: '승부사', desc: 'Boss Last 3 Qs Score x2', type: 'game' },
    { id: 'star', label: '스타성', desc: 'Rewards +10%', type: 'reward' }
];

export const BREAKING_BALL_TYPES = [
    'Slider', 'Curve', 'Cutter', 'Changeup', 'Fork', 'Sinker', 'Splitter', 'Knuckle', 'Screwball'
];


const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateName = () => {
    const lastNames = ['Satou', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato'];
    const firstNames = ['Ren', 'Haruto', 'Minato', 'Yuma', 'Souta', 'Itsuki', 'Riku', 'Takumi', 'Kaito', 'Hiroto'];
    return `${lastNames[getRandomInt(0, lastNames.length - 1)]} ${firstNames[getRandomInt(0, firstNames.length - 1)]}`;
};

export const generateProspect = () => {
    // 1. Determine Rarity
    const rand = Math.random();
    let cumulative = 0;
    let rarity = RARITY_TYPES.SOLID;

    for (const key in RARITY_TYPES) {
        cumulative += RARITY_TYPES[key].prob;
        if (rand < cumulative) {
            rarity = RARITY_TYPES[key];
            break;
        }
    }

    // 2. Determine Total Potential
    const totalPot = getRandomInt(rarity.minPot, rarity.maxPot);

    // 3. Distribute Potential to Stats
    let stats = {};
    let remainingPot = totalPot;

    // Initialize with min value (20)
    BASIC_STATS.forEach(stat => {
        stats[stat.key] = { current: getRandomInt(20, 40), potential: 20 }; // Start low
        remainingPot -= 20;
    });

    // Distribute remaining
    // Logic varies by Rarity
    if (rarity.id === 'genius') {
        // Ensure at least one stat is >= 75
        const targetStat = BASIC_STATS[getRandomInt(0, 5)].key;
        const boost = Math.min(remainingPot, 55); // 20 + 55 = 75
        stats[targetStat].potential += boost;
        remainingPot -= boost;
    } else if (rarity.id === 'hard_worker') {
        // Can reach 80 (S) in one stat
        const targetStat = BASIC_STATS[getRandomInt(0, 5)].key;
        const boost = Math.min(remainingPot, 60); // 20 + 60 = 80
        stats[targetStat].potential += boost;
        remainingPot -= boost;
    }

    // Random distribution for the rest
    while (remainingPot > 0) {
        const target = BASIC_STATS[getRandomInt(0, 5)].key;
        if (stats[target].potential < 80) {
            stats[target].potential++;
            remainingPot--;
        } else {
            // If all maxed (unlikely), break
            if (Object.values(stats).every(s => s.potential >= 80)) break;
        }
    }

    // Cap initial current stats at 65
    Object.keys(stats).forEach(key => {
        stats[key].current = Math.min(stats[key].current, 65, stats[key].potential);
    });

    // 4. Assign Trait
    let trait = null;
    if (Math.random() < 0.3) { // 30% chance
        if (rarity.id === 'genius') trait = Math.random() > 0.5 ? TRAITS.find(t => t.id === 'lazy') : TRAITS.find(t => t.id === 'star');
        else if (rarity.id === 'hard_worker') trait = TRAITS.find(t => t.id === 'workaholic');
        else if (rarity.id === 'late_bloomer') trait = TRAITS.find(t => t.id === 'iron_will');
        else trait = TRAITS[getRandomInt(0, TRAITS.length - 1)];
    }

    return {
        id: uuidv4(),
        name: generateName(),
        rarity: rarity,
        stats: stats,
        trait: trait,
        position: null, // Assigned later
        baseballSkills: null, // Assigned later
        recruitedAt: new Date().toISOString()
    };
};

export const getStatRank = (value) => {
    if (value >= 80) return { rank: 'S', color: '#ff00ff', min: 80, max: 100 }; // Magenta
    if (value >= 75) return { rank: 'A+', color: '#ffd700', min: 75, max: 79 }; // Gold
    if (value >= 70) return { rank: 'A', color: '#ffaa00', min: 70, max: 74 }; // Orange
    if (value >= 60) return { rank: 'B', color: '#00ffff', min: 60, max: 69 }; // Cyan
    if (value >= 50) return { rank: 'C', color: '#00ff00', min: 50, max: 59 }; // Green
    if (value >= 40) return { rank: 'D', color: '#ffff00', min: 40, max: 49 }; // Yellow
    if (value >= 30) return { rank: 'E', color: '#aaaaaa', min: 30, max: 39 }; // Light Grey
    return { rank: 'F', color: '#555555', min: 0, max: 29 }; // Dark Grey
};

export const calculateTrainingCost = (currentValue, trait) => {
    // Base cost increases with value
    let cost = Math.floor((currentValue * 1.5) / 4); // Reduced by 4x as requested

    if (trait?.id === 'workaholic') cost = Math.floor(cost * 0.9);
    if (trait?.id === 'lazy') cost = Math.floor(cost * 1.1);

    return Math.max(10, cost);
};

export const calculateBaseballStats = (prospect, level) => {
    // Multiplier based on Facility Level
    let multiplier = 1.0;
    if (level >= 21) multiplier = 1.2;
    else if (level >= 11) multiplier = 1.1;

    const getAvg = (stat1, stat2, type) => {
        const val1 = prospect.stats[stat1][type];
        const val2 = prospect.stats[stat2][type];
        return (val1 + val2) / 2;
    };

    const getWeightedAvg = (stat1, stat2, stat3, type) => {
        const val1 = prospect.stats[stat1][type];
        const val2 = prospect.stats[stat2][type];
        const val3 = prospect.stats[stat3][type];
        // Grip (stat3) gets 0.5 weight. Total weight 2.5.
        return (val1 + val2 + (val3 * 0.5)) / 2.5;
    };

    const calcStat = (baseVal) => {
        // Apply multiplier
        let target = baseVal * multiplier;

        // Add Randomness (-3 to +3)
        const noise = Math.floor(Math.random() * 7) - 3;
        let final = Math.floor(target + noise);

        return final;
    };

    const generateSet = (role) => {
        let stats = {};
        if (role === 'Pitcher') {
            // Calculate Stuff (Guwi) - formerly Velocity
            const stuffCurrent = Math.min(40, calcStat(getAvg('throwing', 'power', 'current')));
            const stuffPotential = Math.min(80, calcStat(getAvg('throwing', 'power', 'potential')));

            // Calculate MPH based on Stuff
            // Base 88, Max 107. 
            // Map 20 -> 88, 80 -> 99. 
            // Formula: 88 + (val - 20) * (11/60)
            const calcMPH = (val) => {
                let mph = 88 + (val - 20) * (11 / 60);
                // Add small random variance
                mph += (Math.random() * 2 - 1);
                // Cap at 107
                return Math.min(107, Math.floor(mph));
            };

            // Calculate Breaking
            const breakingCurrent = Math.min(40, calcStat(getAvg('grip_strength', 'bat_speed', 'current')));
            const breakingPotential = Math.min(80, calcStat(getAvg('grip_strength', 'bat_speed', 'potential')));

            // Generate Breaking Balls
            const generatePitches = (breakingVal) => {
                let numPitches = 2;
                if (breakingVal >= 60) numPitches = 4;
                else if (breakingVal >= 40) numPitches = 3;

                // Shuffle and pick types
                const shuffled = [...BREAKING_BALL_TYPES].sort(() => 0.5 - Math.random());
                const selectedTypes = shuffled.slice(0, numPitches);

                return selectedTypes.map(type => {
                    // Bonus/Penalty based on number of pitches?
                    // User said: "If 2 pitches, add bonus. If 3+, max is limit."
                    // Let's just vary them slightly around the main breaking stat.
                    const variance = Math.floor(Math.random() * 10) - 5;
                    return {
                        name: type,
                        grade: Math.max(20, Math.min(80, breakingVal + variance))
                    };
                });
            };

            stats = {
                mph: {
                    label: 'Top Speed',
                    current: calcMPH(stuffCurrent),
                    potential: calcMPH(stuffPotential)
                },
                stuff: {
                    label: 'Stuff (구위)',
                    current: stuffCurrent,
                    potential: stuffPotential
                },
                control: {
                    label: 'Control (제구)',
                    current: Math.min(40, calcStat(getAvg('grip_strength', 'flexibility', 'current'))),
                    potential: Math.min(80, calcStat(getAvg('grip_strength', 'flexibility', 'potential')))
                },
                breaking: {
                    label: 'Breaking (변화)',
                    current: breakingCurrent,
                    potential: breakingPotential,
                    pitches: {
                        current: generatePitches(breakingCurrent),
                        potential: generatePitches(breakingPotential)
                    }
                }
            };
        } else {
            stats = {
                power: {
                    label: 'Power (파워)',
                    current: Math.min(40, calcStat(getWeightedAvg('power', 'bat_speed', 'grip_strength', 'current'))),
                    potential: Math.min(80, calcStat(getWeightedAvg('power', 'bat_speed', 'grip_strength', 'potential')))
                },
                contact: {
                    label: 'Contact (컨택)',
                    current: Math.min(40, calcStat(getWeightedAvg('bat_speed', 'flexibility', 'grip_strength', 'current'))),
                    potential: Math.min(80, calcStat(getWeightedAvg('bat_speed', 'flexibility', 'grip_strength', 'potential')))
                },
                defense: {
                    label: 'Defense (수비/주루)',
                    current: Math.min(40, calcStat(getAvg('speed', 'throwing', 'current'))),
                    potential: Math.min(80, calcStat(getAvg('speed', 'throwing', 'potential')))
                }
            };
        }
        return stats;
    };

    return {
        pitcher: generateSet('Pitcher'),
        fielder: generateSet('Fielder')
    };
};

export const simulateProCareer = (prospect) => {
    const role = prospect.position === 'Pitcher' ? 'pitcher' : 'fielder';
    const skills = prospect.baseballSkills[role];
    const isPitcher = role === 'pitcher';

    // Base ratings (0-100 scale roughly)
    // Use potential as the "Peak" ability
    const potentialRating = isPitcher
        ? (skills.stuff.potential + skills.control.potential + skills.breaking.potential) / 3
        : (skills.contact.potential + skills.power.potential + skills.defense.potential) / 3;

    const currentRating = isPitcher
        ? (skills.stuff.current + skills.control.current + skills.breaking.current) / 3
        : (skills.contact.current + skills.power.current + skills.defense.current) / 3;

    // Career Length: 10 to 20 years
    const careerLength = Math.floor(Math.random() * 11) + 10;
    const startAge = 20;
    const peakAgeStart = 27;
    const peakAgeEnd = 31;

    let careerStats = [];
    let careerTotals = isPitcher
        ? { wins: 0, losses: 0, eraSum: 0, innings: 0, strikeouts: 0, saves: 0 }
        : { avgSum: 0, hr: 0, rbi: 0, sb: 0, opsSum: 0, hits: 0, ab: 0 };

    let awards = [];

    for (let year = 1; year <= careerLength; year++) {
        const age = startAge + year - 1;

        // Aging Curve Logic
        let progress = 0;
        let isDecline = false;
        let declineAmount = 0;

        if (age < peakAgeStart) {
            // Growth phase
            progress = (age - startAge) / (peakAgeStart - startAge);
        } else if (age <= peakAgeEnd) {
            // Peak phase
            progress = 1;
        } else {
            // Decline phase
            isDecline = true;
            declineAmount = (age - peakAgeEnd) * 2; // -2 per year
        }

        const calculateSeasonValue = (current, potential) => {
            let val = 0;
            if (!isDecline) {
                val = current + (potential - current) * progress;
            } else {
                val = Math.max(20, potential - declineAmount);
            }
            // Add small variance
            return Math.floor(val + (Math.random() * 6 - 3));
        };

        // Calculate Detailed Stats Snapshot
        let seasonDetails = {};
        if (isPitcher) {
            seasonDetails = {
                mph: calculateSeasonValue(skills.mph.current, skills.mph.potential),
                stuff: calculateSeasonValue(skills.stuff.current, skills.stuff.potential),
                control: calculateSeasonValue(skills.control.current, skills.control.potential),
                breaking: calculateSeasonValue(skills.breaking.current, skills.breaking.potential)
            };
        } else {
            seasonDetails = {
                contact: calculateSeasonValue(skills.contact.current, skills.contact.potential),
                power: calculateSeasonValue(skills.power.current, skills.power.potential),
                defense: calculateSeasonValue(skills.defense.current, skills.defense.potential)
            };
        }

        // Calculate Overall Ability Factor from details
        let abilityFactor = 0;
        if (isPitcher) {
            abilityFactor = (seasonDetails.stuff + seasonDetails.control + seasonDetails.breaking) / 3;
        } else {
            abilityFactor = (seasonDetails.contact + seasonDetails.power + seasonDetails.defense) / 3;
        }

        // Add Random Variance for the season performance (separate from attribute variance)
        const seasonRating = abilityFactor + (Math.floor(Math.random() * 6) - 3);
        const displayRating = Math.floor(seasonRating);

        // Bench Warmer / Minor League Logic
        // If rating < 35, they get limited playing time and reduced stats
        const isBenchWarmer = seasonRating < 35;

        let seasonStat = {};

        if (isPitcher) {
            // ERA: Lower is better. 80 rating -> ~2.00, 20 rating -> ~6.00
            // Formula: 7.5 - (rating / 15)
            let era = Math.max(1.5, 7.5 - (seasonRating / 13));
            era += (Math.random() * 1 - 0.5); // Variance

            // Penalty for low rating
            if (isBenchWarmer) era += (Math.random() * 2 + 1); // Add 1.00-3.00 to ERA

            // Wins: Rating * 0.25 -> Tuned to 0.22
            let wins = Math.floor(seasonRating * 0.22 + (Math.random() * 5 - 2));
            if (isBenchWarmer) wins = Math.max(0, Math.floor(Math.random() * 3)); // 0-2 wins max
            wins = Math.max(0, wins);

            // Losses: Inverse of wins roughly
            let losses = Math.floor((100 - seasonRating) * 0.15 + (Math.random() * 5 - 2));
            if (isBenchWarmer) losses = Math.max(0, Math.floor(Math.random() * 3)); // Low losses too since low innings
            losses = Math.max(0, losses);

            // Innings: Rating * 2.5
            let innings = Math.floor(seasonRating * 2.5 + (Math.random() * 20 - 10));
            if (isBenchWarmer) innings = Math.floor(Math.random() * 30) + 10; // 10-40 IP

            // Strikeouts: Rating * 2.2
            let strikeouts = Math.floor(seasonRating * 2.2 + (Math.random() * 20 - 10));
            if (isBenchWarmer) strikeouts = Math.floor(innings * 0.6); // Low K rate

            seasonStat = {
                year: year,
                age: age,
                rating: displayRating,
                details: seasonDetails,
                wins: wins,
                losses: losses,
                era: era.toFixed(2),
                innings: innings,
                strikeouts: strikeouts
            };

            careerTotals.wins += wins;
            careerTotals.losses += losses;
            careerTotals.eraSum += era; // For avg calculation later
            careerTotals.innings += innings;
            careerTotals.strikeouts += strikeouts;

            // Awards Logic (Harder thresholds)
            if (wins >= 18 && era < 2.50) awards.push(`Year ${year} MVP`);
            else if (wins >= 16 && era < 2.80) awards.push(`Year ${year} Cy Young`);
            if (year === 1 && wins >= 10 && era < 3.50) awards.push(`Rookie of the Year`);

        } else {
            // Batter
            // AVG: 20 -> .200, 80 -> .350
            // Formula: 0.150 + (rating / 400)
            let avg = 0.180 + (seasonRating / 350);
            avg += (Math.random() * 0.04 - 0.02);
            if (isBenchWarmer) avg -= (Math.random() * 0.05); // Penalty

            // HR: Rating * 0.6 -> Tuned to 0.5
            let hr = Math.floor(seasonRating * 0.5 + (Math.random() * 10 - 5));
            if (isBenchWarmer) hr = Math.max(0, Math.floor(Math.random() * 5)); // 0-4 HR
            hr = Math.max(0, hr);

            // RBI: HR * 2.5 + (Rating * 0.5)
            let rbi = Math.floor(hr * 2.5 + seasonRating * 0.5 + (Math.random() * 20 - 10));
            if (isBenchWarmer) rbi = Math.floor(hr * 2 + Math.random() * 10);

            // SB: Speed based
            let sb = Math.floor(seasonRating * 0.3 + (Math.random() * 10 - 5));
            sb = Math.max(0, sb);

            // OPS: AVG + SLG (approx)
            let ops = avg + (hr * 0.015) + 0.300;

            // AB Adjustment
            let ab = 500;
            if (isBenchWarmer) ab = Math.floor(Math.random() * 100) + 50; // 50-150 AB

            seasonStat = {
                year: year,
                age: age,
                rating: displayRating,
                details: seasonDetails,
                avg: avg.toFixed(3),
                hr: hr,
                rbi: rbi,
                sb: sb,
                ops: ops.toFixed(3)
            };

            careerTotals.avgSum += avg;
            careerTotals.hr += hr;
            careerTotals.rbi += rbi;
            careerTotals.sb += sb;
            careerTotals.opsSum += ops;
            careerTotals.hits += Math.floor(avg * ab);
            careerTotals.ab += ab;

            // Awards Logic
            if (hr >= 45 || avg >= 0.340) awards.push(`Year ${year} MVP`);
            else if (hr >= 35 || avg >= 0.320) awards.push(`Year ${year} Golden Glove`);
            if (year === 1 && (hr >= 20 || avg >= 0.290)) awards.push(`Rookie of the Year`);
        }

        careerStats.push(seasonStat);
    }

    // Finalize Totals
    if (isPitcher) {
        careerTotals.era = (careerTotals.eraSum / careerLength).toFixed(2);
    } else {
        // Weighted Average for Career AVG/OPS based on AB would be better, but simple avg for now
        // Or recalculate from hits/ab
        careerTotals.avg = (careerTotals.hits / careerTotals.ab).toFixed(3);
        careerTotals.ops = (careerTotals.opsSum / careerLength).toFixed(3);
    }

    // Calculate XP Reward
    // Base 1000 + 1000 per award
    const xpReward = 1000 + (awards.length * 1000);

    return {
        careerStats,
        careerTotals,
        awards,
        xpReward,
        summary: `Played ${careerLength} seasons. ${isPitcher ? `Wins: ${careerTotals.wins}, SO: ${careerTotals.strikeouts}` : `HR: ${careerTotals.hr}, AVG: ${careerTotals.avg}`}`
    };
};
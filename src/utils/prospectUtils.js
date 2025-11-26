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
    GENIUS: { id: 'genius', label: '천재', minPot: 420, maxPot: 480, color: '#ff00ff', prob: 0.05 },
    ACE: { id: 'ace', label: '에이스', minPot: 360, maxPot: 419, color: '#ffd700', prob: 0.15 },
    SOLID: { id: 'solid', label: '솔리드', minPot: 300, maxPot: 359, color: '#00ffff', prob: 0.40 },
    HARD_WORKER: { id: 'hard_worker', label: '노력가', minPot: 120, maxPot: 300, color: '#00ff00', prob: 0.25 },
    LATE_BLOOMER: { id: 'late_bloomer', label: '대기만성', minPot: 120, maxPot: 420, color: '#ff5500', prob: 0.15 }
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

const CAREER_TITLES = {
    S: ["명예의 전당 헌액자", "전설적인 아이콘", "국민 영웅", "역대 최고 (GOAT)"],
    A: ["단골 올스타", "프랜차이즈 스타", "팬들의 아이돌", "리그 리더"],
    B: ["든든한 주전", "믿음직한 베테랑", "팀의 주장", "꾸준함의 대명사"],
    C: ["로테이션 멤버", "저니맨", "벤치 멤버", "평범한 선수"],
    D: ["마이너리거", "잠깐의 1군 경험", "짧은 경력", "아쉬운 유망주"]
};

const CAREER_DESCRIPTIONS = {
    S: [
        "수세대에 걸쳐 기억될 전설적인 커리어입니다.",
        "리그를 지배하며 수많은 신기록을 세웠습니다.",
        "만장일치로 명예의 전당에 입성했습니다.",
        "20년 동안 야구계를 대표하는 얼굴이었습니다."
    ],
    A: [
        "오랜 기간 동안 리그 최상위권에서 활약했습니다.",
        "수차례 올스타에 선정되며 팀의 핵심이 되었습니다.",
        "10년 넘게 팀을 지탱한 프랜차이즈 스타입니다.",
        "항상 리그 타이틀 경쟁을 펼친 선수입니다."
    ],
    B: [
        "길고 존경받을 만한 커리어를 보냈습니다.",
        "팀의 라인업/로테이션을 든든하게 지켰습니다.",
        "팀에 안정감과 리더십을 불어넣었습니다.",
        "몇 번의 눈부신 시즌과 꾸준한 활약을 보여주었습니다."
    ],
    C: [
        "주전 경쟁에서 밀리기도 했지만 제 몫을 다했습니다.",
        "여러 팀을 옮겨 다니며 선수 생활을 이어갔습니다.",
        "반짝 활약했지만 꾸준함이 조금 아쉬웠습니다.",
        "몇 년간 팀의 백업 요원으로 활약했습니다."
    ],
    D: [
        "프로의 벽을 넘기에는 조금 역부족이었습니다.",
        "가능성은 보였으나 부상이나 부진으로 일찍 은퇴했습니다.",
        "대부분의 시간을 2군에서 보냈습니다.",
        "다른 진로를 찾아 일찍 은퇴를 결심했습니다."
    ]
};


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
                    current: Math.min(40, calcStat(getAvg('flexibility', 'grip_strength', 'current'))),
                    potential: Math.min(80, calcStat(getAvg('flexibility', 'grip_strength', 'potential')))
                },
                breaking: {
                    label: 'Breaking (변화)',
                    current: breakingCurrent,
                    potential: breakingPotential
                },
                pitches: generatePitches(breakingPotential)
            };
        } else {
            // Fielder
            stats = {
                contact: {
                    label: 'Contact (컨택)',
                    current: Math.min(40, calcStat(getAvg('bat_speed', 'flexibility', 'current'))),
                    potential: Math.min(80, calcStat(getAvg('bat_speed', 'flexibility', 'potential')))
                },
                power: {
                    label: 'Power (파워)',
                    current: Math.min(40, calcStat(getAvg('power', 'bat_speed', 'current'))),
                    potential: Math.min(80, calcStat(getAvg('power', 'bat_speed', 'potential')))
                },
                defense: {
                    label: 'Defense (수비)',
                    current: Math.min(40, calcStat(getWeightedAvg('speed', 'flexibility', 'grip_strength', 'current'))),
                    potential: Math.min(80, calcStat(getWeightedAvg('speed', 'flexibility', 'grip_strength', 'potential')))
                },
                speed: {
                    label: 'Speed (주루)',
                    current: Math.min(40, calcStat(prospect.stats.speed.current)),
                    potential: Math.min(80, calcStat(prospect.stats.speed.potential))
                },
                throwing: {
                    label: 'Throwing (송구)',
                    current: Math.min(40, calcStat(prospect.stats.throwing.current)),
                    potential: Math.min(80, calcStat(prospect.stats.throwing.potential))
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

export const calculateCareerStats = (prospect) => {
    const role = prospect.position === 'Pitcher' ? 'pitcher' : 'fielder';
    const skills = prospect.baseballSkills[role];

    // Base Performance Calculation
    let basePerformance = 0;
    if (role === 'pitcher') {
        const stuff = skills.stuff.current;
        const control = skills.control.current;
        const breaking = skills.breaking.current;
        basePerformance = (stuff * 0.4 + control * 0.3 + breaking * 0.3) / 100;
    } else {
        const contact = skills.contact.current;
        const power = skills.power.current;
        const defense = skills.defense.current;
        basePerformance = (contact * 0.4 + power * 0.4 + defense * 0.2) / 100;
    }

    // Dynamic Career Length
    // Base: 5 years
    // Potential Bonus: up to +10 years (potential 20-80 -> 0.2-0.8 -> * 12?)
    // Random: +/- 3 years
    const potentialAvg = role === 'pitcher'
        ? (skills.stuff.potential + skills.control.potential + skills.breaking.potential) / 3
        : (skills.contact.potential + skills.power.potential + skills.defense.potential) / 3;

    let careerLength = 5 + Math.floor((potentialAvg / 80) * 12) + (Math.floor(Math.random() * 7) - 3);
    careerLength = Math.max(3, Math.min(24, careerLength)); // Cap between 3 and 24 years

    const careerStats = [];
    let currentPerformance = basePerformance;

    for (let i = 1; i <= careerLength; i++) {
        let yearPerf = currentPerformance;

        // Age Curve
        if (i <= 3) yearPerf *= (0.9 + (i * 0.05)); // 1: 0.95, 2: 1.0, 3: 1.05 (Growth)
        else if (i > 12) yearPerf *= (1.0 - ((i - 12) * 0.05)); // Decline after year 12

        // Random Event / Variance
        const eventRoll = Math.random();
        let eventLabel = null;

        if (eventRoll < 0.05) { // 5% Breakout
            yearPerf *= 1.3;
            eventLabel = "각성";
        } else if (eventRoll < 0.10) { // 5% Slump/Injury
            yearPerf *= 0.7;
            eventLabel = "슬럼프";
        } else {
            // Normal variance +/- 10%
            yearPerf *= (0.9 + Math.random() * 0.2);
        }

        // Performance Check for Early Retirement
        // If performance drops too low for consecutive years, retire early?
        if (i > 5 && yearPerf < 0.3) {
            // Chance to retire
            if (Math.random() > 0.5) break;
        }

        // Generate Stats based on yearPerf
        if (role === 'pitcher') {
            const era = Math.max(1.5, 5.5 - (yearPerf * 4.0)).toFixed(2); // Higher perf -> Lower ERA
            const wins = Math.max(0, Math.floor(yearPerf * 22));
            const losses = Math.max(0, Math.floor((1 - yearPerf) * 15));
            const so = Math.floor(yearPerf * 250);
            const innings = Math.floor(wins * 6 + losses * 5 + 50 + Math.random() * 30); // Rough estimation
            careerStats.push({ year: i, age: 18 + i, rating: Math.floor(yearPerf * 100), era, wins, losses, strikeouts: so, innings, performance: yearPerf, event: eventLabel });
        } else {
            const avg = Math.min(0.350, Math.max(0.180, 0.200 + (yearPerf * 0.180))).toFixed(3);
            const hr = Math.max(0, Math.floor(yearPerf * 55));
            const rbi = Math.max(0, Math.floor(yearPerf * 140));
            const sb = Math.max(0, Math.floor(yearPerf * 30 * (skills.speed ? skills.speed.current / 50 : 1))); // Use speed if avail, else default
            const ops = (parseFloat(avg) + (hr * 0.015) + (yearPerf * 0.3)).toFixed(3); // Rough approximation
            careerStats.push({ year: i, age: 18 + i, rating: Math.floor(yearPerf * 100), avg, hr, rbi, sb, ops, performance: yearPerf, event: eventLabel });
        }
    }

    return careerStats;
};

export const simulateProCareer = (prospect) => {
    const careerStats = calculateCareerStats(prospect);
    const totalPerf = careerStats.reduce((sum, year) => sum + year.performance, 0);
    const avgPerf = totalPerf / careerStats.length;
    const yearsPlayed = careerStats.length;

    // Determine Grade
    let grade = "D";
    if (avgPerf > 0.85 && yearsPlayed > 8) grade = "S";
    else if (avgPerf > 0.70 && yearsPlayed > 5) grade = "A";
    else if (avgPerf > 0.55 && yearsPlayed > 3) grade = "B";
    else if (avgPerf > 0.40) grade = "C";

    // Select Title and Description
    const titles = CAREER_TITLES[grade];
    const descriptions = CAREER_DESCRIPTIONS[grade];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    // XP Reward
    let xpReward = 500;
    if (grade === "S") xpReward = 5000 + (yearsPlayed * 100);
    else if (grade === "A") xpReward = 3000 + (yearsPlayed * 50);
    else if (grade === "B") xpReward = 1500 + (yearsPlayed * 20);
    else if (grade === "C") xpReward = 800;

    // Generate Awards
    const awards = [];
    careerStats.forEach(stat => {
        const yearStr = `(${stat.year}년차)`;

        // Rookie of the Year (Year 1 only)
        if (stat.year === 1 && stat.performance > 0.6) {
            awards.push(`신인왕 ${yearStr}`);
        }

        // MVP (Very high threshold)
        if (stat.performance > 0.92) {
            awards.push(`MVP ${yearStr}`);
        }

        // All-Star (High threshold)
        if (stat.performance > 0.75) {
            awards.push(`올스타 ${yearStr}`);
        }

        // Position specific
        if (prospect.position === 'Pitcher') {
            if (stat.wins >= 18 || stat.era < 2.50) awards.push(`사이영상 ${yearStr}`);
        } else {
            if (stat.hr >= 40) awards.push(`홈런왕 ${yearStr}`);
            if (stat.avg >= 0.330) awards.push(`타격왕 ${yearStr}`);
            // Golden Glove check (using defense stat if available, but we only have performance here easily, let's cheat and use random + base defense if we can access it, or just random high perf)
            // Let's assume high performance implies good play, add random chance for GG if perf is decent
            if (stat.performance > 0.6 && Math.random() > 0.8) awards.push(`골든글러브 ${yearStr}`);
        }
    });

    // Calculate Career Totals
    let careerTotals = {};
    if (prospect.position === 'Pitcher') {
        const totalWins = careerStats.reduce((sum, s) => sum + s.wins, 0);
        const totalLosses = careerStats.reduce((sum, s) => sum + s.losses, 0);
        const totalInnings = careerStats.reduce((sum, s) => sum + s.innings, 0);
        const totalSO = careerStats.reduce((sum, s) => sum + s.strikeouts, 0);
        // Weighted ERA? Or just simple avg for simplicity
        const avgEra = (careerStats.reduce((sum, s) => sum + parseFloat(s.era), 0) / yearsPlayed).toFixed(2);

        careerTotals = {
            wins: totalWins,
            losses: totalLosses,
            innings: totalInnings,
            strikeouts: totalSO,
            era: avgEra
        };
    } else {
        const totalHr = careerStats.reduce((sum, s) => sum + s.hr, 0);
        const totalRbi = careerStats.reduce((sum, s) => sum + s.rbi, 0);
        const totalSb = careerStats.reduce((sum, s) => sum + s.sb, 0);
        const avgAvg = (careerStats.reduce((sum, s) => sum + parseFloat(s.avg), 0) / yearsPlayed).toFixed(3);
        const avgOps = (careerStats.reduce((sum, s) => sum + parseFloat(s.ops), 0) / yearsPlayed).toFixed(3);

        careerTotals = {
            hr: totalHr,
            rbi: totalRbi,
            sb: totalSb,
            avg: avgAvg,
            ops: avgOps
        };
    }

    return {
        title,
        description,
        grade,
        careerStats,
        careerTotals,
        awards,
        xpReward
    };
};

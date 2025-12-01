import { v4 as uuidv4 } from 'uuid';
import { LEAGUE_HISTORY } from '../data/baseballEras';

export const BASIC_STATS = [
    { key: 'power', label: 'Power (힘)', icon: '💪', korLabel: '근력' },
    { key: 'flexibility', label: 'Flexibility (유연성)', icon: '🧘', korLabel: '유연' },
    { key: 'speed', label: 'Speed (스피드)', icon: '👟', korLabel: '주력' },
    { key: 'throwing', label: 'Throwing (쓰로잉)', icon: '⚾', korLabel: '어깨' },
    { key: 'bat_speed', label: 'Bat Speed (배트 스피드)', icon: '🏏', korLabel: '스윙' },
    { key: 'grip_strength', label: 'Grip (악력)', icon: '✊', korLabel: '악력' },
    { key: 'stamina', label: 'Stamina (체력)', icon: '🔋', korLabel: '체력' }
];

export const RARITY_TYPES = {
    GENIUS: { id: 'genius', label: '천재', minPot: 420, maxPot: 480, color: '#ff00ff', prob: 0.05, costMod: 5 },
    ACE: { id: 'ace', label: '에이스', minPot: 360, maxPot: 419, color: '#ffd700', prob: 0.15, costMod: 4 },
    SOLID: { id: 'solid', label: '솔리드', minPot: 300, maxPot: 359, color: '#00ffff', prob: 0.40, costMod: 3 },
    HARD_WORKER: { id: 'hard_worker', label: '노력가', minPot: 120, maxPot: 300, color: '#00ff00', prob: 0.25, costMod: 2 },
    LATE_BLOOMER: { id: 'late_bloomer', label: '대기만성', minPot: 120, maxPot: 370, color: '#ff5500', prob: 0.15, costMod: 2 }
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
    // 일본 성씨 (한자, 히라가나)
    const lastNames = [
        { kanji: '佐藤', reading: 'さとう' },
        { kanji: '鈴木', reading: 'すずき' },
        { kanji: '高橋', reading: 'たかはし' },
        { kanji: '田中', reading: 'たなか' },
        { kanji: '渡辺', reading: 'わたなべ' },
        { kanji: '伊藤', reading: 'いとう' },
        { kanji: '山本', reading: 'やまもと' },
        { kanji: '中村', reading: 'なかむら' },
        { kanji: '小林', reading: 'こばやし' },
        { kanji: '加藤', reading: 'かとう' },
        { kanji: '吉田', reading: 'よしだ' },
        { kanji: '山田', reading: 'やまだ' },
        { kanji: '佐々木', reading: 'ささき' },
        { kanji: '山口', reading: 'やまぐち' },
        { kanji: '松本', reading: 'まつもと' }
    ];

    // 일본 이름 (한자, 히라가나)
    const firstNames = [
        { kanji: '蓮', reading: 'れん' },
        { kanji: '陽翔', reading: 'はると' },
        { kanji: '湊', reading: 'みなと' },
        { kanji: '悠真', reading: 'ゆうま' },
        { kanji: '蒼太', reading: 'そうた' },
        { kanji: '樹', reading: 'いつき' },
        { kanji: '陸', reading: 'りく' },
        { kanji: '拓海', reading: 'たくみ' },
        { kanji: '海斗', reading: 'かいと' },
        { kanji: '大翔', reading: 'ひろと' },
        { kanji: '颯', reading: 'はやて' },
        { kanji: '翔', reading: 'しょう' },
        { kanji: '健太', reading: 'けんた' },
        { kanji: '大輝', reading: 'だいき' },
        { kanji: '翼', reading: 'つばさ' }
    ];

    const lastName = lastNames[getRandomInt(0, lastNames.length - 1)];
    const firstName = firstNames[getRandomInt(0, firstNames.length - 1)];

    return `${lastName.kanji} ${firstName.kanji} (${lastName.reading} ${firstName.reading})`;
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

    // Determine base current stat range based on rarity
    // 현재 능력치를 20-40 범위로 제한 (천재는 약간 높게)
    let minCurrent = 20;
    let maxCurrent = 40; // Avg 30 (Solid/Ace/HardWorker)

    if (rarity.id === 'genius') {
        minCurrent = 25;
        maxCurrent = 40; // Avg 32.5
    } else if (rarity.id === 'late_bloomer') {
        minCurrent = 20;
        maxCurrent = 35; // Avg 27.5
    }

    // Initialize with rarity-based current value
    BASIC_STATS.forEach(stat => {
        const currentVal = getRandomInt(minCurrent, maxCurrent);

        if (stat.key === 'stamina') {
            stats[stat.key] = { current: currentVal, potential: getRandomInt(40, 99) };
        } else {
            stats[stat.key] = { current: currentVal, potential: 20 }; // Start low potential, will add later
            remainingPot -= 20;
        }
    });

    // Distribute remaining
    if (rarity.id === 'genius') {
        const targetStat = BASIC_STATS[getRandomInt(0, 5)].key;
        const boost = Math.min(remainingPot, 55);
        stats[targetStat].potential += boost;
        remainingPot -= boost;
    } else if (rarity.id === 'hard_worker') {
        const targetStat = BASIC_STATS[getRandomInt(0, 5)].key;
        const boost = Math.min(remainingPot, 60);
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
            if (Object.values(stats).slice(0, 6).every(s => s.potential >= 80)) break;
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

export const calculateTrainingCost = (currentValue, trait, rarity) => {
    let baseCost = rarity?.costMod || 1;
    let cost = baseCost + Math.floor(currentValue / 10);

    if (trait?.id === 'workaholic') cost = Math.floor(cost * 0.9);
    if (trait?.id === 'lazy') cost = Math.floor(cost * 1.1);

    return Math.max(1, cost);
};

export const calculateBaseballStats = (prospect, level) => {
    // multiplier를 더 낮게 설정하여 초기 능력치를 20-40 범위로 제한
    let multiplier = 0.6; // Scale down initial stats significantly
    if (level >= 21) multiplier = 0.9;
    else if (level >= 11) multiplier = 0.75;

    const getAvg = (stat1, stat2, type) => {
        const val1 = Number(prospect.stats[stat1]?.[type] || 0);
        const val2 = Number(prospect.stats[stat2]?.[type] || 0);
        return (val1 + val2) / 2;
    };

    const getWeightedAvg = (stat1, stat2, stat3, type) => {
        const val1 = Number(prospect.stats[stat1]?.[type] || 0);
        const val2 = Number(prospect.stats[stat2]?.[type] || 0);
        const val3 = Number(prospect.stats[stat3]?.[type] || 0);
        return (val1 + val2 + (val3 * 0.5)) / 2.5;
    };

    const calcStat = (baseVal) => {
        let target = baseVal * multiplier;
        const noise = Math.floor(Math.random() * 7) - 3;
        let final = Math.floor(target + noise);

        // Hard Worker Bonus: +3 to all converted stats
        if (prospect.rarity?.id === 'hard_worker') {
            final += 3;
        }

        // Ensure minimum 20
        return Math.max(20, final);
    };

    const generateSet = (role) => {
        let stats = {};
        if (role === 'Pitcher') {
            const stuffCurrent = Math.min(99, calcStat(getAvg('throwing', 'power', 'current')));
            const stuffPotential = Math.min(99, calcStat(getAvg('throwing', 'power', 'potential')));

            const calcMPH = (val) => {
                let mph = 88 + (val - 20) * (11 / 60);
                mph += (Math.random() * 2 - 1);
                return Math.min(107, Math.floor(mph));
            };

            const breakingCurrent = Math.min(99, calcStat(getAvg('grip_strength', 'bat_speed', 'current')));
            const breakingPotential = Math.min(99, calcStat(getAvg('grip_strength', 'bat_speed', 'potential')));

            const generatePitches = (breakingVal) => {
                let numPitches = 2;
                if (breakingVal >= 60) numPitches = 4;
                else if (breakingVal >= 40) numPitches = 3;

                // Knuckleball Condition: MPH < 90, Control >= 60, Stuff >= 60, Breaking >= 70
                // Note: We access stats here, so stats must be defined before this is called.
                const canThrowKnuckle = (stats.mph.current < 90 && stats.control.current >= 60 && stats.stuff.current >= 60 && breakingVal >= 70);

                let availableTypes = [...BREAKING_BALL_TYPES];
                if (!canThrowKnuckle) {
                    availableTypes = availableTypes.filter(t => t !== 'Knuckleball');
                }

                const shuffled = availableTypes.sort(() => 0.5 - Math.random());
                const selectedTypes = shuffled.slice(0, numPitches);

                return selectedTypes.map(type => {
                    const variance = Math.floor(Math.random() * 10) - 5;
                    return {
                        name: type,
                        grade: Math.max(20, Math.min(99, breakingVal + variance))
                    };
                });
            };

            // Independent Random Stamina
            const staminaPotential = Math.floor(20 + Math.random() * 61); // 20 - 80
            const staminaCurrent = Math.floor(20 + Math.random() * (staminaPotential - 20 + 1)); // 20 - Potential

            stats = {
                mph: {
                    label: 'Top Speed',
                    current: calcMPH(stuffCurrent),
                    potential: calcMPH(stuffPotential)
                },
                stuff: {
                    label: 'Stuff (구위)',
                    current: Math.min(stuffCurrent, stuffPotential),
                    potential: stuffPotential
                },
                control: {
                    label: 'Control (제구)',
                    current: Math.min(Math.min(99, calcStat(getAvg('flexibility', 'grip_strength', 'current'))), Math.min(99, calcStat(getAvg('flexibility', 'grip_strength', 'potential')))),
                    potential: Math.min(99, calcStat(getAvg('flexibility', 'grip_strength', 'potential')))
                },
                breaking: {
                    label: 'Breaking (변화)',
                    current: Math.min(breakingCurrent, breakingPotential),
                    potential: breakingPotential,
                    pitches: []
                },
                stamina: {
                    label: 'Stamina (체력)',
                    current: staminaCurrent,
                    potential: staminaPotential
                }
            };

            // Populate pitches after stats are generated
            stats.breaking.pitches = generatePitches(stats.breaking.current);

        } else {
            stats = {
                contact: {
                    label: 'Contact (컨택)',
                    current: Math.min(Math.min(99, calcStat(getAvg('bat_speed', 'flexibility', 'current'))), Math.min(99, calcStat(getAvg('bat_speed', 'flexibility', 'potential')))),
                    potential: Math.min(99, calcStat(getAvg('bat_speed', 'flexibility', 'potential')))
                },
                power: {
                    label: 'Power (파워)',
                    current: Math.min(Math.min(99, calcStat(getAvg('power', 'bat_speed', 'current'))), Math.min(99, calcStat(getAvg('power', 'bat_speed', 'potential')))),
                    potential: Math.min(99, calcStat(getAvg('power', 'bat_speed', 'potential')))
                },
                defense: {
                    label: 'Defense (수비)',
                    current: Math.min(Math.min(99, calcStat(getWeightedAvg('speed', 'flexibility', 'grip_strength', 'current'))), Math.min(99, calcStat(getWeightedAvg('speed', 'flexibility', 'grip_strength', 'potential')))),
                    potential: Math.min(99, calcStat(getWeightedAvg('speed', 'flexibility', 'grip_strength', 'potential')))
                },
                speed: {
                    label: 'Speed (주루)',
                    current: Math.min(Math.min(99, calcStat(prospect.stats.speed?.current || 0)), Math.min(99, calcStat(prospect.stats.speed?.potential || 0))),
                    potential: Math.min(99, calcStat(prospect.stats.speed?.potential || 0))
                },
                throwing: {
                    label: 'Throwing (송구)',
                    current: Math.min(Math.min(99, calcStat(prospect.stats.throwing?.current || 0)), Math.min(99, calcStat(prospect.stats.throwing?.potential || 0))),
                    potential: Math.min(99, calcStat(prospect.stats.throwing?.potential || 0))
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
    const role = prospect.position === '투수' ? 'pitcher' : 'fielder';
    const initialSkills = prospect.baseballSkills?.[role];
    const rarityId = prospect.rarity?.id || 'solid';

    if (!initialSkills) return [];

    // Deep copy skills to evolve them
    let currentSkills = JSON.parse(JSON.stringify(initialSkills));
    let lowOvrYears = 0; // Track consecutive years with OVR < 30
    let previousRating = 0; // Track previous year's rating for growth detection


    // Determine Pitcher Role (개선된 로직)
    let pitcherRole = 'Starter';
    if (role === 'pitcher') {
        const stamina = currentSkills.stamina.current;
        const mph = currentSkills.mph.current;
        const stuff = currentSkills.stuff.current;
        const control = currentSkills.control.current;
        const breaking = currentSkills.breaking.current;

        // 초기 OVR 계산 (마무리 판단용)
        const initialOVR = Math.floor((stuff + control + breaking) / 3);

        // 마무리 투수 조건 (엄격화)
        // 1. 구속 96mph 이상 OR
        // 2. 구위 A급(70) 이상 OR  
        // 3. 제구와 변화구 모두 A급(70) 이상
        const canBeCloser = (
            mph >= 96 ||
            stuff >= 70 ||
            (control >= 70 && breaking >= 70)
        );

        if (canBeCloser && stamina < 55) {
            pitcherRole = 'Closer';
        } else if (stamina >= 80 && initialOVR >= 35) {
            // 체력 충분하고 OVR 35 이상이면 선발
            pitcherRole = 'Starter';
        } else if (stamina >= 60 && initialOVR >= 35) {
            // 체력이 적당하지만 OVR 35 이상이면 선발 기회
            pitcherRole = Math.random() > 0.5 ? 'Starter' : 'Reliever';
        } else {
            // 그 외는 중간계투
            pitcherRole = 'Reliever';
        }
    }

    let careerLength = 5 + (Math.floor(Math.random() * 7) - 3);
    if (rarityId === 'genius') careerLength += 8;
    else if (rarityId === 'ace') careerLength += 6;
    else if (rarityId === 'hard_worker') careerLength += 5;
    else if (rarityId === 'late_bloomer') careerLength += 10;
    careerLength = Math.max(3, Math.min(25, careerLength));

    const careerStats = [];

    // Decline Rate based on Flexibility (hidden stat influence) or just Age
    // We don't have flexibility here easily unless we pass it, but let's use a base decline.
    let declineRate = 0.03;
    if (rarityId === 'genius') declineRate = 0.02;
    if (rarityId === 'late_bloomer') declineRate = 0.015;

    for (let i = 1; i <= careerLength; i++) {
        // Calculate current rating for decline check
        let rating = 0;
        if (role === 'pitcher') {
            const { stuff, control, breaking } = currentSkills;
            rating = Math.floor((stuff.current + control.current + breaking.current) / 3);
        } else {
            const { contact, power, defense, speed, throwing } = currentSkills;
            rating = Math.floor((contact.current + power.current + defense.current + speed.current + throwing.current) / 5);
        }

        let growthFactor = 1.0;
        let isDecline = false;

        // Smoother Growth Curves
        if (rarityId === 'genius') {
            if (i <= 4) growthFactor = 1.05; // Steady early growth
            else if (i < 12) growthFactor = 1.01; // Prime
            else isDecline = true;
        } else if (rarityId === 'hard_worker') {
            if (i <= 8) growthFactor = 1.03; // Long steady growth
            else if (i < 14) growthFactor = 1.01;
            else isDecline = true;
        } else if (rarityId === 'ace') {
            if (i <= 6) growthFactor = 1.04;
            else if (i < 11) growthFactor = 1.01;
            else isDecline = true;
        } else if (rarityId === 'late_bloomer') {
            if (i < 8) growthFactor = 1.01;
            else if (i <= 12) growthFactor = 1.06; // Late bloom
            else isDecline = true;
        } else {
            if (i <= 3) growthFactor = 1.03;
            else if (i > 8) isDecline = true;
        }

        // Prevent decline if rating is still good (OVR > 40)
        // This ensures decent players play longer (15+ years)
        if (rating > 40 && i < 18) {
            isDecline = false;
            growthFactor = 1.0; // Maintain stats
        }

        // Early Retirement Logic
        if (rating < 30) {
            lowOvrYears++;
        } else {
            lowOvrYears = 0;
        }

        // 6년차 이하: 능력치 상승이 있으면 은퇴 방지
        if (i <= 6 && rating > previousRating) {
            lowOvrYears = 0; // Reset retirement counter if improving in first 6 years
        }

        // 7년차 이후: 기존 로직 적용 (3년 연속 OVR < 30이면 은퇴)
        if (i > 6 && lowOvrYears >= 3) {
            // Force retirement
            break;
        }

        // Update previous rating for next iteration
        previousRating = rating;

        if (isDecline) {
            growthFactor = 1.0 - (declineRate * (i - 8)); // Accelerating decline
            if (growthFactor < 0.8) growthFactor = 0.8; // Cap max decline per year
        }

        // Apply Growth to Skills
        let limitBreak = false;
        if (rarityId === 'late_bloomer' && i >= 10 && i <= 12 && Math.random() < 0.2) {
            growthFactor += 0.1; // Limit break boost
            limitBreak = true;
        }

        const evolveStat = (val, potential) => {
            let next = Math.floor(val * growthFactor);
            // Random variance +/- 1
            next += Math.floor(Math.random() * 3) - 1;
            return Math.min(potential, Math.max(20, next));
        };

        // Evolve all skills
        Object.keys(currentSkills).forEach(key => {
            if (currentSkills[key].current !== undefined) {
                const potential = currentSkills[key].potential || 100;
                currentSkills[key].current = evolveStat(currentSkills[key].current, potential);
            }
        });

        // Recalculate OVR (Average of Stats) after evolution
        if (role === 'pitcher') {
            const { stuff, control, breaking } = currentSkills;
            rating = Math.floor((stuff.current + control.current + breaking.current) / 3);
        } else {
            const { contact, power, defense, speed, throwing } = currentSkills;
            rating = Math.floor((contact.current + power.current + defense.current + speed.current + throwing.current) / 5);
        }

        // Calculate Game Stats based on SKILLS
        let eventLabel = limitBreak ? "🔥 한계 돌파!" : null;
        if (!eventLabel) {
            const roll = Math.random();
            if (roll < 0.05 && !isDecline) { eventLabel = "각성"; rating += 3; }
            else if (roll < 0.10) { eventLabel = "슬럼프"; rating -= 3; }
        }

        // Performance Factor (0.0 - 1.0) derived from Rating for generic scaling
        // But specific stats will drive specific results.

        if (role === 'pitcher') {
            const s = currentSkills.stuff.current;
            const c = currentSkills.control.current;
            const b = currentSkills.breaking.current;
            const mph = currentSkills.mph.current;
            const stamina = currentSkills.stamina.current;

            // 매년 투수 역할 재평가 (능력치 변화에 따라 역할 변경)
            const yearRating = Math.floor((s + c + b) / 3);

            // 마무리 투수 조건 재확인
            const canBeCloser = (
                mph >= 96 ||
                s >= 70 ||
                (c >= 70 && b >= 70)
            );

            if (canBeCloser && stamina < 55) {
                pitcherRole = 'Closer';
            } else if (stamina >= 80 && yearRating >= 35) {
                pitcherRole = 'Starter';
            } else if (stamina >= 60 && yearRating >= 35) {
                pitcherRole = Math.random() > 0.5 ? 'Starter' : 'Reliever';
            } else {
                pitcherRole = 'Reliever';
            }

            // ERA: Driven by Stuff and Control
            // Base 4.50. -0.04 per Stuff, -0.03 per Control.
            // 50/50 -> 4.50 - 2.0 - 1.5 = 1.0? No formula needs tuning.
            // Target: 50 avg -> 4.50 ERA. 80 avg -> 2.50 ERA.
            // 4.50 - (Avg - 50) * 0.06
            const avgRating = (s + c + b) / 3;
            let era = 4.50 - ((avgRating - 50) * 0.07);
            era += (Math.random() * 0.5 - 0.25); // Variance
            era = Math.max(1.20, Math.min(9.99, era));

            // Wins: Driven by ERA and luck
            // Good ERA (2.50) -> 15-20 wins. Bad ERA (5.00) -> 5-8 wins.
            let winExp = Math.max(0, (5.00 - era) * 5);
            if (pitcherRole === 'Reliever' || pitcherRole === 'Closer') winExp /= 3;
            let wins = Math.floor(winExp + Math.random() * 4 - 2);
            wins = Math.max(0, wins);

            let losses = Math.floor((Math.random() * 10) + (era - 3) * 2);
            losses = Math.max(0, losses);

            // SO: Driven by Stuff and Breaking
            let soExp = (s * 1.5) + (b * 1.0); // 50/50 -> 125. 80/80 -> 200.
            if (pitcherRole !== 'Starter') soExp *= 0.4;
            let so = Math.floor(soExp + Math.random() * 20 - 10);

            let innings = 0;
            let holds = 0;
            let saves = 0;

            // Realistic Stats Logic
            // Save Opportunities (SVO) approx 50% of wins for a good team, but let's base it on Wins + Losses (Total Games)
            // A team plays 144 games. ~70-80 wins. ~40-50 save opps.
            // Let's approximate team strength by pitcher's win/loss ratio? No, that's circular.
            // Let's just assume a standard distribution of opportunities.

            if (pitcherRole === 'Starter') {
                innings = Math.floor(wins * 6.5 + losses * 5.5 + 40);
                innings = Math.max(50, innings); // Minimum innings for a starter
            } else if (pitcherRole === 'Reliever') {
                innings = Math.floor(40 + Math.random() * 30);

                // Hold Opportunities: ~20-30 per season for a setup man.
                // Conversion rate based on Control and Stuff.
                // Base Hold % = 60% + (Control-50)*0.5 + (Stuff-50)*0.5
                let holdOpp = 15 + Math.random() * 20; // 15-35 opportunities
                let holdRate = 0.60 + ((c - 50) * 0.005) + ((s - 50) * 0.005);
                holdRate = Math.min(0.95, Math.max(0.40, holdRate));

                holds = Math.floor(holdOpp * holdRate);
                holds = Math.max(0, holds);

            } else { // Closer
                innings = Math.floor(30 + Math.random() * 30);

                // Save Opportunities: ~30-50 per season.
                let saveOpp = 25 + Math.random() * 25; // 25-50 opportunities
                let saveRate = 0.70 + ((c - 50) * 0.005) + ((s - 50) * 0.005); // Closers usually better
                saveRate = Math.min(0.98, Math.max(0.50, saveRate));

                saves = Math.floor(saveOpp * saveRate);
                saves = Math.max(0, saves);
            }

            // OVR < 35 Penalty
            if (rating < 35) {
                innings = Math.floor(innings * 0.3);
                wins = Math.floor(wins * 0.3);
                so = Math.floor(so * 0.3);
            }

            careerStats.push({
                year: i,
                age: 18 + i,
                rating,
                era: era.toFixed(2),
                wins, losses, strikeouts: so, innings, holds, saves,
                performance: rating / 100, // Approximate for awards
                event: eventLabel,
                role: pitcherRole,
                details: {
                    Stuff: currentSkills.stuff.current,
                    Control: currentSkills.control.current,
                    Breaking: currentSkills.breaking.current,
                    'Top Speed': `${Math.min(108, Math.floor(currentSkills.mph.current))} MPH`,
                    Stamina: currentSkills.stamina.current
                }
            });

        } else {
            const c = currentSkills.contact.current;
            const p = currentSkills.power.current;
            const sp = currentSkills.speed.current;
            const d = currentSkills.defense.current;

            // AVG: Driven by Contact and Speed
            // 50 -> .260. 80 -> .320.
            let avg = 0.200 + (c * 0.0015) + (sp * 0.0003);
            avg += (Math.random() * 0.04 - 0.02); // Variance
            avg = Math.max(0.150, Math.min(0.400, avg));

            // HR: Driven by Power
            // 50 -> 15. 80 -> 40.
            let hrExp = (p - 40) * 0.8;
            let hr = Math.floor(hrExp + Math.random() * 5 - 2);
            hr = Math.max(0, hr);

            // RBI: Driven by HR and Contact
            let rbi = Math.floor(hr * 2.5 + (avg - 0.200) * 400);
            rbi = Math.max(0, rbi);

            // SB: Driven by Speed
            let sb = Math.floor((sp - 40) * 0.8 + Math.random() * 5);
            sb = Math.max(0, sb);

            // OPS
            // Realistic SLG approx: AVG + ISO.
            // ISO is roughly driven by Power. 40 Power -> .100 ISO, 80 Power -> .300 ISO.
            let iso = (p - 20) * 0.005;
            iso += (Math.random() * 0.05 - 0.025); // Variance
            iso = Math.max(0.050, iso);

            let slg = avg + iso;
            let obp = avg + 0.060 + (Math.random() * 0.040); // OBP is usually AVG + .060~.100

            let ops = (obp + slg).toFixed(3);

            // OVR < 35 Penalty (강화)
            // 백업 선수 수준으로 모든 기록 감소
            if (rating < 35) {
                hr = Math.floor(hr * 0.3);
                rbi = Math.floor(rbi * 0.3);
                sb = Math.floor(sb * 0.3);
            }

            careerStats.push({
                year: i,
                age: 18 + i,
                rating,
                avg: avg.toFixed(3),
                hr, rbi, sb, ops,
                performance: rating / 100,
                event: eventLabel,
                details: {
                    Contact: currentSkills.contact.current,
                    Power: currentSkills.power.current,
                    Speed: currentSkills.speed.current,
                    Defense: currentSkills.defense.current,
                    Throwing: currentSkills.throwing.current
                }
            });
        }
    }

    return careerStats;
};

export const simulateProCareer = (prospect, startYear = 2024) => {
    const careerStats = calculateCareerStats(prospect);
    const totalPerf = careerStats.reduce((sum, year) => sum + year.performance, 0);
    const avgPerf = totalPerf / careerStats.length;
    const yearsPlayed = careerStats.length;

    let grade = "D";
    if (avgPerf > 0.85 && yearsPlayed > 8) grade = "S";
    else if (avgPerf > 0.70 && yearsPlayed > 5) grade = "A";
    else if (avgPerf > 0.55 && yearsPlayed > 3) grade = "B";
    else if (avgPerf > 0.40) grade = "C";

    const titles = CAREER_TITLES[grade];
    const descriptions = CAREER_DESCRIPTIONS[grade];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    let xpReward = 500;
    if (grade === "S") xpReward = 5000 + (yearsPlayed * 100);
    else if (grade === "A") xpReward = 3000 + (yearsPlayed * 50);
    else if (grade === "B") xpReward = 1500 + (yearsPlayed * 20);
    else if (grade === "C") xpReward = 800;

    const awards = [];

    // Calculate Advanced Stats (WAR, OPS+, ERA+)
    careerStats.forEach((stat, index) => {
        const currentYear = startYear + index;
        const leagueAvg = LEAGUE_HISTORY[currentYear] || LEAGUE_HISTORY['default'];

        stat.yearRecord = currentYear; // Store actual year
        stat.leagueEra = leagueAvg.era;
        stat.leagueOps = leagueAvg.ops;

        if (prospect.position === '투수') {
            // ERA+ = 100 * (League ERA / Player ERA)
            const pEra = parseFloat(stat.era);
            stat.eraPlus = pEra > 0 ? Math.floor(100 * (leagueAvg.era / pEra)) : 999;

            // Pitcher WAR (Refined)
            // Replacement Level ERA approx 1.35x League ERA (Increased from 1.25)
            const replacementERA = leagueAvg.era * 1.35;
            const runsAboveRep = (replacementERA - pEra) * (stat.innings / 9);
            const war = runsAboveRep / 10;
            stat.war = parseFloat(war.toFixed(2));

        } else {
            // OPS+ = 100 * (Player OPS / League OPS)
            const pOps = parseFloat(stat.ops);
            stat.opsPlus = Math.floor(100 * (pOps / leagueAvg.ops));

            // Batter WAR (Refined)
            const estimatedPA = Math.floor(stat.performance * 600);

            // wRAA approximation: ((OPS - LeagueOPS) / Scale) * PA * 0.5
            const wRAA = ((pOps - leagueAvg.ops) / 1.2) * estimatedPA * 0.5;

            // Replacement Level Adjustment: +25 runs per 600 PA (Increased from 20)
            const replacementAdj = (estimatedPA / 600) * 25;

            const defenseRating = stat.details?.Defense || 50;
            // Defense WAR: 50 is average (0.0), range -2.0 to +2.0
            const dWar = (defenseRating - 50) / 15;
            const fieldingRuns = dWar * 10;

            const totalRuns = wRAA + fieldingRuns + replacementAdj;
            const war = totalRuns / 10;
            stat.war = parseFloat(war.toFixed(2));
        }

        const yearStr = `(${stat.year}년차)`;

        if (stat.year === 1 && stat.performance > 0.6) awards.push(`신인왕 ${yearStr}`);
        if (stat.war > 7.0 || stat.performance > 0.90) awards.push(`MVP ${yearStr}`);
        if (stat.war > 4.0 || stat.performance > 0.70) awards.push(`올스타 ${yearStr}`);

        if (prospect.position === '투수') {
            if (stat.role === 'Starter') {
                if (stat.wins >= 15 || stat.era < 2.80 || stat.war > 5.0) awards.push(`사이영상 ${yearStr}`);
            } else if (stat.role === 'Reliever') {
                if (stat.holds >= 20) awards.push(`홀드왕 ${yearStr}`);
            } else {
                if (stat.saves >= 30) awards.push(`구원왕 ${yearStr}`);
            }
        } else {
            if (stat.hr >= 35) awards.push(`홈런왕 ${yearStr}`);
            if (stat.avg >= 0.330) awards.push(`타격왕 ${yearStr}`);
            if ((stat.performance > 0.6 && Math.random() > 0.8) || (stat.details?.Defense > 70 && stat.performance > 0.5)) awards.push(`골든글러브 ${yearStr}`);
        }
    });

    let careerTotals = {};
    if (prospect.position === '투수') {
        const totalWins = careerStats.reduce((sum, s) => sum + s.wins, 0);
        const totalLosses = careerStats.reduce((sum, s) => sum + s.losses, 0);
        const totalInnings = careerStats.reduce((sum, s) => sum + s.innings, 0);
        const totalSO = careerStats.reduce((sum, s) => sum + s.strikeouts, 0);
        const totalHolds = careerStats.reduce((sum, s) => sum + (s.holds || 0), 0);
        const totalSaves = careerStats.reduce((sum, s) => sum + (s.saves || 0), 0);
        const avgEra = (careerStats.reduce((sum, s) => sum + parseFloat(s.era), 0) / yearsPlayed).toFixed(2);
        const totalWar = careerStats.reduce((sum, s) => sum + s.war, 0).toFixed(2);

        careerTotals = {
            wins: totalWins,
            losses: totalLosses,
            innings: totalInnings,
            strikeouts: totalSO,
            holds: totalHolds,
            saves: totalSaves,
            era: avgEra,
            war: totalWar
        };
    } else {
        const totalHr = careerStats.reduce((sum, s) => sum + s.hr, 0);
        const totalRbi = careerStats.reduce((sum, s) => sum + s.rbi, 0);
        const totalSb = careerStats.reduce((sum, s) => sum + s.sb, 0);
        const avgAvg = (careerStats.reduce((sum, s) => sum + parseFloat(s.avg), 0) / yearsPlayed).toFixed(3);
        const avgOps = (careerStats.reduce((sum, s) => sum + parseFloat(s.ops), 0) / yearsPlayed).toFixed(3);
        const totalWar = careerStats.reduce((sum, s) => sum + s.war, 0).toFixed(2);

        careerTotals = {
            hr: totalHr,
            rbi: totalRbi,
            sb: totalSb,
            avg: avgAvg,
            ops: avgOps,
            war: totalWar
        };
    }

    return {
        title,
        description,
        summary: description,
        grade,
        careerStats,
        careerTotals,
        awards,
        xpReward
    };
};

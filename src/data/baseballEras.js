export const LEAGUE_HISTORY = {};

// Helper to generate range
const generateEra = (start, end, startEra, endEra, startOps, endOps, desc) => {
    const years = end - start + 1;
    const eraStep = (endEra - startEra) / years;
    const opsStep = (endOps - startOps) / years;

    for (let i = 0; i < years; i++) {
        const year = start + i;
        LEAGUE_HISTORY[year] = {
            era: parseFloat((startEra + (eraStep * i)).toFixed(2)),
            ops: parseFloat((startOps + (opsStep * i)).toFixed(3)),
            description: desc
        };
    }
};

// 1980-1989: High Offense Era
generateEra(1980, 1989, 4.10, 3.90, 0.790, 0.770, "80년대 강타자 시대");

// 1990-1999: Balanced / Ichiro Era
generateEra(1990, 1999, 3.80, 3.60, 0.760, 0.740, "90년대 밸런스 시대");

// 2000-2010: Rabbit Ball Era (Extreme Offense)
generateEra(2000, 2010, 4.20, 3.90, 0.780, 0.750, "래빗볼 투고타저 시대"); // Actually Rabbit ball was high offense, so ERA should be high.
// Correction: Rabbit ball means ball flies far -> High Offense -> High ERA.
// Let's overwrite 2000-2005 specifically as peak rabbit ball.
generateEra(2000, 2004, 4.30, 4.50, 0.800, 0.820, "초강력 래빗볼 시대");
generateEra(2005, 2010, 4.00, 3.50, 0.780, 0.720, "통일구 도입 과도기");

// 2011-2023: Unified Ball / Pitcher Dominance
generateEra(2011, 2024, 2.80, 3.10, 0.650, 0.690, "투고타저(통일구) 시대");

// Future / Default
LEAGUE_HISTORY['default'] = { era: 3.50, ops: 0.730, description: "평균적인 리그 환경" };

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    xp: 0,
    level: 1,
    prospects: [],
    wrongAnswers: [],
    hallOfFame: [],
    lastSynced: null,
};

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setGameData: (state, action) => {
            const newState = { ...state, ...action.payload, lastSynced: Date.now() };
            // Ensure new fields exist if missing from payload/state
            if (!newState.hallOfFame) newState.hallOfFame = [];
            return newState;
        },
        setXp: (state, action) => {
            state.xp = action.payload;
        },
        setLevel: (state, action) => {
            state.level = action.payload;
        },
        addProspect: (state, action) => {
            state.prospects.push(action.payload);
        },
        updateProspect: (state, action) => {
            const index = state.prospects.findIndex(p => p.id === action.payload.id);
            if (index !== -1) {
                state.prospects[index] = action.payload;
            }
        },
        removeProspect: (state, action) => {
            state.prospects = state.prospects.filter(p => p.id !== action.payload);
        },
        addToHallOfFame: (state, action) => {
            if (!state.hallOfFame) state.hallOfFame = [];
            state.hallOfFame.push(action.payload);
        },
        removeFromHallOfFame: (state, action) => {
            if (state.hallOfFame) {
                state.hallOfFame = state.hallOfFame.filter(p => p.id !== action.payload);
            }
        },
        addWrongAnswer: (state, action) => {
            const exists = state.wrongAnswers.some(item => item.id === action.payload.id);
            if (!exists) {
                state.wrongAnswers.push(action.payload);
            }
        },
        removeWrongAnswer: (state, action) => {
            state.wrongAnswers = state.wrongAnswers.filter(item => item.id !== action.payload);
        },
        resetGame: () => initialState,
    },
});

export const {
    setGameData,
    setXp,
    setLevel,
    addProspect,
    updateProspect,
    removeProspect,
    addToHallOfFame,
    removeFromHallOfFame,
    addWrongAnswer,
    removeWrongAnswer,
    resetGame
} = gameSlice.actions;

export default gameSlice.reducer;

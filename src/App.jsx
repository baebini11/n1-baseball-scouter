import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM for createPortal
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Import signOut
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { setUser, setLoading } from './store/slices/authSlice';

import { setGameData, setXp, setLevel, addProspect, updateProspect, addWrongAnswer, removeWrongAnswer, resetGame } from './store/slices/gameSlice';

import HomePage from './pages/HomePage';
import StudyPage from './pages/StudyPage';
import GamePage from './pages/GamePage';
import ScoutPage from './pages/ScoutPage';
import TeamPage from './pages/TeamPage';
import ReviewPage from './pages/ReviewPage';
import HallOfFamePage from './pages/HallOfFamePage';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

import WordTicker from './components/common/WordTicker';
import joyoKanji from './data/joyo_kanji.json';
import jlptN1Grammar from './data/jlpt_n1_grammar.json';
import './App.css';

const RefreshButton = ({ onRefresh, isRefreshing }) => {
  const location = useLocation();
  if (location.pathname !== '/') return null;

  return (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      style={{
        position: 'absolute',
        top: '20px',
        left: '10%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.7)',
        border: '1px solid #444',
        borderRadius: '20px',
        color: '#fff',
        cursor: 'pointer',
        padding: '5px 15px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.8rem',
        fontFamily: "'Press Start 2P', cursive",
        transition: 'all 0.2s'
      }}
    >
      <span style={{
        display: 'inline-block',
        animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
        fontSize: '1.2em'
      }}>↻</span>

    </button>
  );
};

function App() {
  const [pipWindow, setPipWindow] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dispatch = useDispatch();

  // Redux State
  const { user, loading } = useSelector(state => state.auth);
  const { xp, level, prospects, wrongAnswers } = useSelector(state => state.game);

  // Auth Listener & Data Loading
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Only store serializable data in Redux to avoid freezing the Firestore instance
      const serializableUser = currentUser ? {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
      } : null;

      dispatch(setUser(serializableUser));

      if (currentUser) {
        // Load data from Firestore
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          dispatch(setGameData(docSnap.data()));
        } else {
          // New user or no data, save initial state? 
          // Or just let the auto-save handle it on first change.
        }
      } else {
        // Guest mode: Redux Persist handles loading from LocalStorage
        // If we want to clear data on explicit logout, we handle it in the logout function.
        // But if the user just visits without login, we keep the local data.
      }
      dispatch(setLoading(false));
    });

    return () => unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (location.pathname !== '/') {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(setUser(null));
      dispatch(resetGame()); // Clear game data on logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleRefresh = async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        dispatch(setGameData(docSnap.data()));
        console.log("Data refreshed from Firestore!");
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    }
    // Artificial delay for visual feedback
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Auto-Save to Firestore (Debounced or on change)
  useEffect(() => {
    if (user) {
      const saveData = async () => {
        try {
          await setDoc(doc(db, "users", user.uid), {
            xp,
            level,
            prospects,
            wrongAnswers,
            lastUpdated: new Date()
          }, { merge: true });
          console.log("Data saved to Firestore successfully!");
        } catch (e) {
          console.error("Error saving data:", e);
        }
      };

      // Simple debounce using timeout
      const timeoutId = setTimeout(saveData, 2000);
      return () => clearTimeout(timeoutId);
    }
    // Guest data is handled by Redux Persist automatically
  }, [user, xp, level, prospects, wrongAnswers]);


  // Action Wrappers for Components
  const handleAddToGlobalReview = (item, type) => {
    dispatch(addWrongAnswer({ ...item, type }));
  };

  const handleRemoveFromGlobalReview = (id) => {
    dispatch(removeWrongAnswer(id));
  };

  const handleAddProspect = (newProspect) => {
    dispatch(addProspect(newProspect));
  };

  const handleUpdateProspect = (updatedProspect) => {
    dispatch(updateProspect(updatedProspect));
  };

  const handleSetXp = (newXpOrFn) => {
    // Handle functional updates if passed (e.g. setXp(prev => prev + 10))
    // But Redux actions expect value. We need to check type.
    // Ideally components should pass value, but if they pass function we need to resolve it.
    // However, our components mostly do setXp(prev => ...).
    // We can create a wrapper that mimics useState setter.
    if (typeof newXpOrFn === 'function') {
      dispatch(setXp(newXpOrFn(xp)));
    } else {
      dispatch(setXp(newXpOrFn));
    }
  };

  const handleSetLevel = (newLevelOrFn) => {
    if (typeof newLevelOrFn === 'function') {
      dispatch(setLevel(newLevelOrFn(level)));
    } else {
      dispatch(setLevel(newLevelOrFn));
    }
  };

  const togglePip = async () => {
    if (pipWindow) {
      pipWindow.close();
      return;
    }

    if (!window.documentPictureInPicture) {
      alert("Your browser doesn't support Document Picture-in-Picture.");
      return;
    }

    try {
      const pip = await window.documentPictureInPicture.requestWindow({
        width: 400,
        height: 600,
      });

      setPipWindow(pip);

      pip.addEventListener('pagehide', () => {
        setPipWindow(null);
      });

      // Copy styles
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
          const style = document.createElement('style');
          style.textContent = cssRules;
          pip.document.head.appendChild(style);
        } catch (e) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = styleSheet.type;
          link.media = styleSheet.media;
          link.href = styleSheet.href;
          pip.document.head.appendChild(link);
        }
      });

    } catch (err) {
      console.error("PiP failed:", err);
    }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="app-container">
        {user && <RefreshButton onRefresh={handleRefresh} isRefreshing={isRefreshing} />}
        {pipWindow ? (
          <div className="pip-placeholder">
            <div style={{ fontSize: '3em', marginBottom: '20px' }}>📺</div>
            <h2>Playing in Picture-in-Picture Mode...</h2>
            <button onClick={togglePip} style={{ marginTop: '20px', padding: '10px 20px', background: '#fff', color: '#000', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              CLOSE PIP
            </button>
          </div>
        ) : (
          <div className="main-content">
            <Routes>
              <Route path="/" element={
                <HomePage
                  level={level}
                  xp={xp}
                  togglePip={togglePip}
                  pipWindow={pipWindow}
                  globalWrongAnswers={wrongAnswers}
                  user={user}
                  onLogout={handleLogout}
                />
              } />
              <Route path="/study" element={
                <StudyPage
                  joyoKanji={joyoKanji}
                  jlptN1Grammar={jlptN1Grammar}
                  addToGlobalReview={handleAddToGlobalReview}
                  globalWrongAnswers={wrongAnswers}
                  xp={xp}
                  setXp={handleSetXp}
                />
              } />
              <Route path="/game" element={
                <GamePage
                  joyoKanji={joyoKanji}
                  jlptN1Grammar={jlptN1Grammar}
                  level={level}
                  setLevel={handleSetLevel}
                  xp={xp}
                  setXp={handleSetXp}
                  addToGlobalReview={handleAddToGlobalReview}
                  globalWrongAnswers={wrongAnswers}
                />
              } />
              <Route path="/scout" element={
                <ScoutPage
                  xp={xp}
                  setXp={handleSetXp}
                  addProspect={handleAddProspect}
                />
              } />
              <Route path="/team" element={
                <TeamPage
                  prospects={prospects}
                  updateProspect={handleUpdateProspect}
                  xp={xp}
                  setXp={handleSetXp}
                  level={level}
                />
              } />
              <Route path="/review" element={
                <ReviewPage
                  globalWrongAnswers={wrongAnswers}
                  removeFromGlobalReview={handleRemoveFromGlobalReview}
                />
              } />
              <Route path="/hall-of-fame" element={
                <HallOfFamePage />
              } />
            </Routes>
          </div>
        )}

        {pipWindow && (
          <WordTicker words={joyoKanji} pipWindow={pipWindow} />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
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

import SessionConflictModal from './components/common/SessionConflictModal';
import XpSyncModal from './components/common/XpSyncModal';
import useSessionManager from './hooks/useSessionManager';

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
import jlptN1Vocab from './data/jlpt_n1.json';
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
  const [dataLoaded, setDataLoaded] = useState(false); // Track if Firestore data is loaded
  const dispatch = useDispatch();

  // Redux State
  const { user, loading } = useSelector(state => state.auth);
  const { xp, level, prospects, wrongAnswers } = useSelector(state => state.game);

  // Session Management
  const [conflictType, setConflictType] = useState(null);
  const { sessionId, previousSessionId } = useSessionManager(user, setConflictType);

  // XP Sync Modal
  const [xpSyncModal, setXpSyncModal] = useState(null);

  const handleXpReloadNeeded = (serverXP) => {
    setXpSyncModal({ localXP: xp, serverXP });
  };

  const confirmXpReload = async () => {
    await handleRefresh();
    setXpSyncModal(null);
  };

  const handleSessionAction = async (action) => {
    if (action === 'logout_other') {
      // 사용자가 '예' 선택 - 타 기기 로그아웃
      // console.log('[Session] User chose to logout other session');

      if (!previousSessionId) {
        console.error('[Session] No previous session ID found');
        setConflictType(null);
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);

        // sessionStorage에서 현재 sessionId 직접 읽기 (클로저 문제 방지)
        const currentSessionId = sessionStorage.getItem('sessionId');

        // console.log('[App DEBUG] Saving sessionId to Firestore:', currentSessionId);
        // console.log('[App DEBUG] previousSessionId:', previousSessionId);

        // 1. 새 세션 저장하고 동시에 기존 세션에 forceLogout 설정
        await setDoc(docRef, {
          activeSession: {
            sessionId: currentSessionId,
            loginTime: new Date(),
            userAgent: navigator.userAgent,
            lastActivity: new Date(),
            forceLogout: previousSessionId,  // 기존 세션을 강제 로그아웃
          }
        }, { merge: true });

        // console.log(`[Session] New session saved, force logout set for: ${previousSessionId}`);

      } catch (error) {
        console.error('[Session] Failed to set force logout:', error);
      }

      setConflictType(null); // 모달 닫기
    } else if (action === 'keep_both') {
      // 사용자가 '아니요' 선택 - 새 세션 저장하지만 기존 세션 유지
      // console.log('[Session] User chose to keep both sessions');

      try {
        const docRef = doc(db, "users", user.uid);

        // sessionStorage에서 현재 sessionId 직접 읽기 (클로저 문제 방지)
        const currentSessionId = sessionStorage.getItem('sessionId');

        // console.log('[App DEBUG keep_both] Saving sessionId to Firestore:', currentSessionId);

        // 새 세션만 저장 (forceLogout 없음)
        await setDoc(docRef, {
          activeSession: {
            sessionId: currentSessionId,
            loginTime: new Date(),
            userAgent: navigator.userAgent,
            lastActivity: new Date(),
          }
        }, { merge: true });

        // console.log(`[Session] New session saved, keeping previous session active`);

      } catch (error) {
        console.error('[Session] Failed to save session:', error);
      }

      setConflictType(null); // 모달 닫기
      // TODO: XP 검증 로직 필요
    }
  };

  // kicked 타입일 때 자동 로그아웃
  useEffect(() => {
    if (conflictType === 'kicked') {
      const timer = setTimeout(async () => {
        // console.log('[Session] Logging out due to force logout...');
        await handleLogout();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [conflictType]);

  // Auth Listener & Data Loading (Firestore First!)
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
        // Load data from Firestore FIRST (Priority)
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const firestoreData = docSnap.data();
            // console.log('[Data Load] Firestore data loaded:', firestoreData);
            // Override Redux Persist data with Firestore data
            dispatch(setGameData(firestoreData));
          } else {
            // console.log('[Data Load] No Firestore data, using local/default');
            // New user - will save on first change
          }
        } catch (error) {
          console.error('[Data Load] Firestore load error:', error);
        } finally {
          setDataLoaded(true); // Data load complete
        }
      } else {
        // Guest mode: Redux Persist handles loading from LocalStorage
        setDataLoaded(true);
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

  // Auto-reload on window focus/visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        // console.log('[App] Window focused, refreshing data...');
        handleRefresh();
      }
    };

    const handleWindowFocus = () => {
      if (user) {
        // console.log('[App] Window focus event, refreshing data...');
        handleRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(setUser(null));
      dispatch(resetGame()); // Clear game data on logout

      // 페이지 새로고침으로 세션 상태 완전히 초기화
      window.location.reload();
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
        const firestoreData = docSnap.data();
        // console.log('[Refresh] Firestore data:', firestoreData);
        // console.log('[Refresh] Prospects from Firestore:', firestoreData.prospects);

        dispatch(setGameData(firestoreData));
        // console.log("Data refreshed from Firestore!");
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
          // console.log("Data saved to Firestore successfully!");
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

  // Show loading until both auth and data are ready
  if (loading || !dataLoaded) {
    return (
      <div className="loading-screen">
        <div style={{ fontSize: '3em', marginBottom: '20px' }}>⏳</div>
        <h2>Loading...</h2>
        <p style={{ marginTop: '10px', color: '#888' }}>
          {loading ? 'Checking authentication...' : 'Loading your data...'}
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />

      {/* Session Conflict Modal */}
      {conflictType && <SessionConflictModal type={conflictType} onAction={handleSessionAction} />}

      {/* XP Sync Modal */}
      {xpSyncModal && (
        <XpSyncModal
          localXP={xpSyncModal.localXP}
          serverXP={xpSyncModal.serverXP}
          onConfirm={confirmXpReload}
        />
      )}

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
                  vocab={jlptN1Vocab}
                  kanji={joyoKanji}
                  grammar={jlptN1Grammar}
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
                  user={user}
                  onXpReloadNeeded={handleXpReloadNeeded}
                />
              } />
              <Route path="/team" element={
                <TeamPage
                  prospects={prospects}
                  updateProspect={handleUpdateProspect}
                  xp={xp}
                  setXp={handleSetXp}
                  level={level}
                  user={user}
                  onXpReloadNeeded={handleXpReloadNeeded}
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
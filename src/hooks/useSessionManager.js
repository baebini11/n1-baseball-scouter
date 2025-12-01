import { useEffect, useState, useRef } from 'react';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * 세션 관리 훅
 * - 중복 로그인 감지 및 처리
 * - Firestore 실시간 리스너를 통한 세션 동기화
 * - sessionStorage에 sessionId 저장하여 같은 탭 식별
 * - sessionId 비교만으로 충돌 판단 (간단하고 명확함)
 */
const useSessionManager = (user, setConflictType) => {
    // sessionStorage에서 sessionId 직접 가져오기 (useState 사용 안 함 - 리렌더링 시 변경 방지)
    const getSessionId = () => {
        let stored = sessionStorage.getItem('sessionId');
        // console.log('[getSessionId] Current value in sessionStorage:', stored);

        if (!stored) {
            stored = crypto.randomUUID();
            sessionStorage.setItem('sessionId', stored);
            // console.log('[getSessionId] Created NEW sessionId:', stored);
        } else {
            // console.log('[getSessionId] REUSING existing sessionId:', stored);
        }
        return stored;
    };

    const sessionId = getSessionId(); // 매번 sessionStorage에서 읽기
    // console.log('[useSessionManager] Final sessionId:', sessionId);

    const [previousSessionId, setPreviousSessionId] = useState(null);
    const unsubscribeRef = useRef(null);
    const isSettingSessionRef = useRef(false);
    const previousUserRef = useRef(user); // 이전 user 값 추적

    useEffect(() => {
        if (!user) {
            // 실제 로그아웃인지 확인 (이전에 user가 있었는지)
            if (previousUserRef.current) {
                // console.log('[Session] User logged out, removing sessionId');
                sessionStorage.removeItem('sessionId');
            } else {
                // console.log('[Session] User is null (initial state or auth loading)');
            }

            // 리스너 정리
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
            if (setConflictType) setConflictType(null);
            setPreviousSessionId(null);
            previousUserRef.current = null; // 이전 user 업데이트
            return;
        }

        // user가 있으면 이전 값 업데이트
        previousUserRef.current = user;

        let sessionInitialized = false; // 초기화 완료 플래그

        // 로그인 시 세션 정보 확인
        const initSession = async () => {
            isSettingSessionRef.current = true;
            try {
                const userDocRef = doc(db, "users", user.uid);
                const existingDoc = await getDoc(userDocRef);
                const existingSessionId = existingDoc.exists() ? existingDoc.data().activeSession?.sessionId : null;

                // console.log('[Session DEBUG] Current sessionId:', sessionId);
                // console.log('[Session DEBUG] Firestore sessionId:', existingSessionId);
                // console.log('[Session DEBUG] Are they equal?', existingSessionId === sessionId);

                // 기존 세션이 있고, 현재 세션과 다르면 모달 표시
                if (existingSessionId && existingSessionId !== sessionId) {
                    // console.log(`[Session] Detected different session: ${existingSessionId} vs ${sessionId}`);
                    setPreviousSessionId(existingSessionId);
                    if (setConflictType) setConflictType('kicking');
                    // 새 세션은 아직 저장하지 않음 - 사용자가 선택할 때까지 대기
                } else {
                    // 기존 세션이 없거나 같은 세션이면 바로 저장
                    // console.log(`[Session] ${existingSessionId ? 'Same session, updating' : 'Creating new session'}: ${sessionId}`);
                    await setDoc(userDocRef, {
                        activeSession: {
                            sessionId: sessionId,
                            loginTime: new Date(),
                            userAgent: navigator.userAgent,
                            lastActivity: new Date()
                        }
                    }, { merge: true });
                }

                sessionInitialized = true;
            } catch (error) {
                console.error('[Session] Failed to check session:', error);
            } finally {
                isSettingSessionRef.current = false;
            }
        };

        initSession();

        // 실시간 세션 모니터링
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
            // 자신이 세션을 설정하는 중이거나 아직 초기화되지 않았으면 무시
            if (isSettingSessionRef.current || !sessionInitialized) return;

            if (snapshot.exists()) {
                const data = snapshot.data();
                const serverSessionId = data.activeSession?.sessionId;
                const forceLogout = data.activeSession?.forceLogout;

                // forceLogout 플래그가 자신의 세션 ID와 일치하면 강제 로그아웃
                if (forceLogout === sessionId) {
                    // console.log(`[Session] Force logout requested for session: ${sessionId}`);
                    if (setConflictType) setConflictType('kicked');
                } else if (serverSessionId && serverSessionId !== sessionId) {
                    // 세션 ID가 다르면 경고만
                    // console.log(`[Session] Session changed: ${serverSessionId}`);
                }
            }
        }, (error) => {
            console.error('[Session] Snapshot error:', error);
        });

        unsubscribeRef.current = unsubscribe;

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [user, setConflictType]); // sessionId를 의존성에서 제거!

    return { sessionId, previousSessionId };
};

export default useSessionManager;

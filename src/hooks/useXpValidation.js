import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * XP 검증 훅
 * XP 소비 전 서버 XP와 로컬 XP를 비교하여 동기화 상태 확인
 */
const useXpValidation = (user, localXP, onReloadNeeded) => {
    const [isValidating, setIsValidating] = useState(false);

    const validateXP = async () => {
        if (!user) return true; // 게스트는 검증 불필요

        setIsValidating(true);
        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const serverXP = docSnap.data().xp || 0;

                // 서버 XP와 로컬 XP가 다르면
                if (serverXP !== localXP) {
                    console.warn(`[XP Validation] Mismatch! Local: ${localXP}, Server: ${serverXP}`);
                    if (onReloadNeeded) onReloadNeeded(serverXP);
                    return false; // 검증 실패
                }
            }

            return true; // 검증 성공
        } catch (error) {
            console.error('[XP Validation] Error:', error);
            return true; // 에러 시 작업 계속 진행 (네트워크 문제로 차단하지 않음)
        } finally {
            setIsValidating(false);
        }
    };

    return { validateXP, isValidating };
};

export default useXpValidation;

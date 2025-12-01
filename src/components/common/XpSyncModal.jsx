import React from 'react';
import './SessionConflictModal.css'; // 기존 스타일 재사용

const XpSyncModal = ({ localXP, serverXP, onConfirm }) => {
    return (
        <div className="session-modal-overlay">
            <div className="session-modal">
                <div className="session-modal-emoji">🔄</div>
                <h2 className="session-modal-title">데이터 동기화 필요</h2>
                <p className="session-modal-body">
                    다른 기기에서 데이터 변경이 감지되었습니다.
                </p>
                <div style={{ margin: '20px 0', fontSize: '1.1em', color: '#fff' }}>
                    <div style={{ marginBottom: '10px' }}>
                        현재 XP: <span style={{ color: '#aaa' }}>{localXP}</span>
                    </div>
                    <div>
                        서버 XP: <span style={{ color: '#ff0055', fontWeight: 'bold' }}>{serverXP}</span>
                    </div>
                </div>
                <div className="session-modal-buttons">
                    <button className="session-btn yes" onClick={onConfirm}>
                        리로드
                    </button>
                </div>
            </div>
        </div>
    );
};

export default XpSyncModal;

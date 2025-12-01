import React from 'react';
import './SessionConflictModal.css';

const SessionConflictModal = ({ type, onAction }) => {
    // type: 'kicked' (기존 세션 감지) or 'kicking' (새 로그인 감지)

    const messages = {
        kicked: {
            title: '중복 로그인 감지',
            body: '다른 기기에서 로그인되어 로그아웃됩니다.',
            emoji: '⚠️',
            showButtons: false // 자동 로그아웃 진행 중
        },
        kicking: {
            title: '타 기기 로그아웃',
            body: '다른 기기에서 로그인 중입니다. 타 기기를 로그아웃할까요?',
            emoji: '🔐',
            showButtons: true // 새 로그인이므로 선택 가능
        }
    };

    const message = messages[type] || messages.kicked;

    const handleYes = () => {
        if (onAction) onAction('logout_other');
    };

    const handleNo = () => {
        if (onAction) onAction('keep_both');
    };

    return (
        <div className="session-modal-overlay">
            <div className="session-modal">
                <div className="session-modal-emoji">{message.emoji}</div>
                <h2 className="session-modal-title">{message.title}</h2>
                <p className="session-modal-body">{message.body}</p>

                {message.showButtons ? (
                    <div className="session-modal-buttons">
                        <button className="session-btn yes" onClick={handleYes}>예</button>
                        <button className="session-btn no" onClick={handleNo}>아니요</button>
                    </div>
                ) : (
                    <div className="session-modal-spinner"></div>
                )}
            </div>
        </div>
    );
};

export default SessionConflictModal;

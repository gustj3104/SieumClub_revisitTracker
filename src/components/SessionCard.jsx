// components/SessionCard.js
import { useMemo, useState, useEffect } from 'react';
import '../styles.css';

const toLines = (arr = []) => (Array.isArray(arr) ? arr.join('\n') : '');
const fromLines = (text = '') =>
    (text || '')
        .split(/\r?\n|,|;|\t/g)
        .map((s) => s.trim())
        .filter(Boolean);

const safeDateLabel = (d) => {
    if (!d) return '-';
    const t = new Date(d).getTime();
    return Number.isFinite(t) ? new Date(d).toLocaleDateString() : '-';
};
const sanitizeSession = (s) => ({
    id: s?.id ?? null,
    name: typeof s?.name === 'string' ? s.name : '',
    date: typeof s?.date === 'string' ? s.date : '',
    participants: Array.isArray(s?.participants) ? s.participants.map(String) : [],
});

export default function SessionCard({ session, onDelete = () => {}, onUpdate = () => {} }) {
    const s = useMemo(() => sanitizeSession(session), [session]);

    const [edit, setEdit] = useState(false);
    const [name, setName] = useState(s.name);
    const [date, setDate] = useState(s.date);
    const [participantsText, setParticipantsText] = useState(toLines(s.participants));

    useEffect(() => {
        if (!edit) {
            const ns = sanitizeSession(session);
            setName(ns.name);
            setDate(ns.date);
            setParticipantsText(toLines(ns.participants));
        }
    }, [edit, session]);

    const participantsParsed = useMemo(() => fromLines(participantsText), [participantsText]);

    const dirty = useMemo(() => {
        return (
            (name || '') !== (s.name || '') ||
            (date || '') !== (s.date || '') ||
            (participantsText || '') !== toLines(s.participants || [])
        );
    }, [name, date, participantsText, s.name, s.date, s.participants]);

    const nameError = !name.trim();

    const revisitLabel = useMemo(() => {
        const rate = session?.revisitRate,
            cnt = session?.revisitCount,
            uniq = session?.uniqueCount;
        if (typeof rate === 'number' && typeof cnt === 'number' && typeof uniq === 'number') {
            return rate > 0 ? `${rate}% 재방문 (${cnt}/${uniq})` : '신규 모임';
        }
        return null;
    }, [session?.revisitRate, session?.revisitCount, session?.uniqueCount]);

    const handleCancel = () => setEdit(false);

    const handleSave = async () => {
        if (nameError) return; // 이름만 체크
        const next = { id: s.id, name: name.trim(), date, participants: participantsParsed };
        await onUpdate(next);
        setEdit(false);
    };

    const handleDelete = () => {
        if (!s.id) return;
        if (window.confirm(`${s.name || '이 회차'}를 삭제하시겠습니까?`)) onDelete(s.id);
    };

    const onKeyDown = (e) => {
        if (!edit) return;
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && dirty && !nameError) {
            e.preventDefault();
            handleSave();
        }
    };

    return (
        <div className="session-card" onKeyDown={onKeyDown}>
            {!edit ? (
                <>
                    <h2>{s.name || '(제목 없음)'}</h2>
                    <p>날짜: {safeDateLabel(s.date)}</p>
                    <p>인원(입력값 기준): {Array.isArray(s.participants) ? s.participants.length : 0}명</p>
                    {revisitLabel && <p>{revisitLabel}</p>}
                    <div className="btn-row">
                        <button className="primary-btn" onClick={() => setEdit(true)}>
                            수정
                        </button>
                        <button className="delete-btn" onClick={handleDelete}>
                            삭제
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <h2>회차 수정</h2>

                    <label className="field">
                        <span>회차명</span>
                        <input
                            type="text"
                            className="textarea"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="예: 제14회 시음회"
                        />
                        {nameError && (
                            <span className="hint" style={{ color: '#e11d48' }}>
                                회차명을 입력하세요.
                            </span>
                        )}
                    </label>

                    <label className="field">
                        <span>날짜 (선택)</span>
                        <input
                            type="date"
                            className="textarea"
                            value={date || ''}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </label>

                    <label className="field">
                        <span>참가자 (줄바꿈/쉼표/세미콜론/탭 구분, 중복 허용)</span>
                        <textarea
                            className="textarea"
                            rows={6}
                            value={participantsText}
                            onChange={(e) => setParticipantsText(e.target.value)}
                            placeholder={'현지'}
                        />
                    </label>

                    <div className="btn-row">
                        <button
                            className="primary-btn"
                            onClick={handleSave}
                            disabled={nameError}
                            style={nameError ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                        >
                            저장
                        </button>
                        <button className="ghost-btn" onClick={handleCancel}>
                            취소
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

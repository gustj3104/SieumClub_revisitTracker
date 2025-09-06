// pages/MainPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { getSessions, updateSession, deleteSession } from '../utils/db';
import { annotateSessionsWithRevisit } from '../utils/revisit';
import SessionCard from '../components/SessionCard';
import AddSessionButton from '../components/AddSessionButton';
import '../styles.css';

const sanitize = (s) => ({
    id: s?.id ?? null,
    name: typeof s?.name === 'string' ? s.name : '',
    date: typeof s?.date === 'string' ? s.date : '',
    participants: Array.isArray(s?.participants) ? s.participants.map(String) : [],
});

const safeTime = (d) => {
    const t = d ? new Date(d).getTime() : NaN;
    return Number.isFinite(t) ? t : -Infinity;
};

const MainPage = () => {
    const [sessions, setSessions] = useState([]);

    const refresh = useCallback(async () => {
        const raw = (await getSessions()) ?? [];
        // 1) 완전 무효 항목 제거 → 2) 필드 정상화
        const base = raw.filter((r) => r && typeof r === 'object').map(sanitize);

        // 3) 재방문 주석 붙이기(내부에서 날짜 오름차순으로 이전 방문자 판별)
        const annotated = annotateSessionsWithRevisit(base);

        // 4) 표시용 정렬: 날짜 내림차순(최근 먼저) → 이름 오름차순
        annotated.sort((a, b) => {
            const byDate = safeTime(b.date) - safeTime(a.date);
            return byDate !== 0 ? byDate : (a.name || '').localeCompare(b.name || '');
        });

        setSessions(annotated);
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const handleDeleteSession = async (id) => {
        await deleteSession(id);
        await refresh();
    };

    const handleUpdateSession = async (patch) => {
        await updateSession(patch.id, patch); // { id, name, date, participants }
        await refresh();
    };

    return (
        <div className="container">
            <h1>재방문 추적</h1>
            <div className="session-grid">
                {sessions
                    .filter((s) => s && typeof s === 'object') // 최종 가드
                    .map((session, i) => (
                        <SessionCard
                            key={session.id ?? `${session.name || 'no-name'}-${i}`}
                            session={session}
                            onDelete={handleDeleteSession}
                            onUpdate={handleUpdateSession}
                        />
                    ))}
                <AddSessionButton />
            </div>
        </div>
    );
};

export default MainPage;

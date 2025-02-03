import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessions } from '../utils/db'; // IndexedDB에서 회차 목록 가져오기
import SessionCard from '../components/SessionCard';
import AddSessionButton from '../components/AddSessionButton';
import '../styles.css';

const MainPage = () => {
    const [sessions, setSessions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSessions = async () => {
            const data = await getSessions();
            const sortedSessions = data.sort((a, b) => a.name.localeCompare(b.name));
            setSessions(sortedSessions);
        };
        fetchSessions();
    }, []);

    const handleDeleteSession = (id) => {
        setSessions((prevSessions) => prevSessions.filter((s) => s.id !== id));
    };

    return (
        <div className="container">
            <h1>재방문 추적</h1>
            <div className="session-grid">
                {sessions.map((session) => (
                    <SessionCard key={session.id} session={session} onDelete={handleDeleteSession} />
                ))}
                <AddSessionButton onClick={() => navigate('/add')} />
            </div>
        </div>
    );
};

export default MainPage;

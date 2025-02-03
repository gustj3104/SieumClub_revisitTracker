import { deleteSession } from '../utils/db';
import '../styles.css';

const calculateRevisitRate = (participants) => {
    // 2회 이상 참여한 사람 비율 계산 (예제 로직)
    const revisitCount = participants.length > 5 ? participants.length - 5 : 0;
    const revisitRate = ((revisitCount / participants.length) * 100).toFixed(1);
    return revisitRate > 0 ? `${revisitRate}% 재방문` : '신규 모임';
};

const SessionCard = ({ session, onDelete }) => {
    const handleDelete = async () => {
        if (window.confirm(`${session.name}를 삭제하시겠습니까?`)) {
            await deleteSession(session.id);
            onDelete(session.id);
        }
    };

    return (
        <div className="session-card">
            <h2>{session.name}</h2>
            <p>인원: {session.participants.length}</p>
            <p>{calculateRevisitRate(session.participants)}</p>
            <button onClick={handleDelete} className="delete-btn">
                삭제
            </button>
        </div>
    );
};

export default SessionCard;

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { addSession } from '../utils/db';
import '../addSessionStyles.css';
import '../styles.css';

const splitNames = (text = '') =>
    text
        .split(/\r?\n|,|;|\t/g)
        .map((s) => s.trim())
        .filter(Boolean);

const todayStr = () => new Date().toISOString().slice(0, 10);

const AddSessionPage = () => {
    const [sessionName, setSessionName] = useState('');
    const [date, setDate] = useState(todayStr());
    const [participants, setParticipants] = useState('');
    const navigate = useNavigate();

    const parsed = useMemo(() => splitNames(participants), [participants]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!sessionName.trim()) return alert('회차 이름을 입력하세요.');
        if (!date) return alert('날짜를 선택하세요.');
        if (parsed.length === 0) return alert('참가자 명단을 입력하세요.');

        await addSession({ name: sessionName.trim(), date, participants: parsed });
        navigate('/');
    };

    return (
        <div className="add-session-page">
            <h1>새로운 회차 추가</h1>
            {/* ⬇⬇⬇ equal-container 추가 */}
            <div className="container equal-container">
                <form onSubmit={handleSubmit}>
                    <label>
                        <div className="text">회차 이름</div>
                        <input
                            className="textarea"
                            type="text"
                            value={sessionName}
                            onChange={(e) => setSessionName(e.target.value)}
                            placeholder="예: 제14회 시음회"
                        />
                    </label>

                    <p />

                    <label>
                        <div className="text">날짜</div>
                        <input
                            className="textarea"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </label>

                    <p />

                    <label>
                        <div className="text">참가자 명단 (줄바꿈/쉼표/세미콜론/탭 구분)</div>
                        <textarea
                            className="textarea"
                            value={participants}
                            onChange={(e) => setParticipants(e.target.value)}
                            placeholder={'예: 윤현지, 윤현서'}
                            rows={8}
                        />
                        <div className="hint">입력 인원: {parsed.length}명</div>
                    </label>

                    <div className="btn-row">
                        <button className="btn" type="submit">
                            추가
                        </button>
                        <button className="btn cancel" type="button" onClick={() => navigate('/')}>
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSessionPage;

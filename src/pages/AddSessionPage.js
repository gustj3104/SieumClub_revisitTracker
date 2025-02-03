import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addSession } from '../utils/db';
import '../styles.css';
import '../addSessionStyles.css';

const AddSessionPage = () => {
    const [sessionName, setSessionName] = useState('');
    const [participants, setParticipants] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!sessionName.trim() || !participants.trim()) {
            alert('회차 이름과 참가자 명단을 입력하세요.');
            return;
        }

        // 입력된 참가자 명단을 배열로 변환
        const participantList = participants.split(',').map((name) => name.trim());

        // IndexedDB에 저장
        await addSession({ name: sessionName, participants: participantList });

        // 메인 페이지로 이동
        navigate('/');
    };

    return (
        <div className="container">
            <h1>새로운 회차 추가</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    <div className="text"> 회차 이름: </div>
                    <input
                        type="text"
                        value={sessionName}
                        onChange={(e) => setSessionName(e.target.value)}
                        placeholder="예: 1회차"
                    />
                </label>
                <p></p>
                <label>
                    <div className="text">참가자 명단 (쉼표로 구분): </div>
                    <textarea
                        value={participants}
                        onChange={(e) => setParticipants(e.target.value)}
                        placeholder="예: 윤현지, 윤현서"
                    />
                </label>
                <button className="btn" type="submit">
                    추가
                </button>
            </form>
            <button className="btn" onClick={() => navigate('/')}>
                취소
            </button>
        </div>
    );
};

export default AddSessionPage;

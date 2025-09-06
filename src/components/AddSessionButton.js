// components/AddSessionButton.jsx
import '../styles.css';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

const AddSessionButton = ({ onClick }) => {
    const navigate = useNavigate();

    const handleClick = useCallback(() => {
        if (typeof onClick === 'function') {
            onClick();
        } else {
            // basename 유지 위해 상대 경로로 이동
            navigate('add');
        }
    }, [onClick, navigate]);

    return (
        <button type="button" className="add-session-button" onClick={handleClick}>
            + 새로운 회차 추가
        </button>
    );
};

export default AddSessionButton;

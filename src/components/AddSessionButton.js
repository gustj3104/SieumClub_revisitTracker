import '../styles.css';

const AddSessionButton = ({ onClick }) => {
    return (
        <button className="add-session-button" onClick={onClick}>
            + 새로운 회차 추가
        </button>
    );
};

export default AddSessionButton;

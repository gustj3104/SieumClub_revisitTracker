// components/GlobalActions.jsx
import { NavLink } from 'react-router-dom';

export default function GlobalActions() {
    return (
        <div className="global-actions">
            <div className="global-actions__inner">
                <NavLink to="/" end className={({ isActive }) => `nav-chip${isActive ? ' active' : ''}`}>
                    홈
                </NavLink>
                <NavLink to="/add" className={({ isActive }) => `nav-chip${isActive ? ' active' : ''}`}>
                    새 회차 추가
                </NavLink>
                <NavLink to="/stats" className={({ isActive }) => `nav-chip${isActive ? ' active' : ''}`}>
                    재방문 통계
                </NavLink>
            </div>
        </div>
    );
}

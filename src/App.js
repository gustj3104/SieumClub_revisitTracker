import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MainPage from './pages/MainPage';
import AddSessionPage from './pages/AddSessionPage';
import RevisitStatsPage from './pages/RevisitStatePage';
import './styles.css';

const App = () => {
    return (
        <Router basename={process.env.PUBLIC_URL}>
            <nav>
                <ul className="nav-list">
                    <li>
                        <Link to="/" className="nav-link">
                            홈
                        </Link>
                    </li>
                    <li>
                        <Link to="/add" className="nav-link">
                            새 회차 추가
                        </Link>
                    </li>
                    <li>
                        <Link to="/stats" className="nav-link">
                            재방문 통계
                        </Link>
                    </li>
                </ul>
            </nav>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/add" element={<AddSessionPage />} />
                <Route path="/stats" element={<RevisitStatsPage />} />
            </Routes>
        </Router>
    );
};

export default App;

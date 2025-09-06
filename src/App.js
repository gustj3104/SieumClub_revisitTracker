import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import AddSessionPage from './pages/AddSessionPage';
import RevisitStatsPage from './pages/RevisitStatsPage'; // 파일명에 맞게
import GlobalActions from './components/GlobalActions'; // ← 추가
import './styles.css';

const App = () => {
    return (
        <Router basename={process.env.PUBLIC_URL}>
            <GlobalActions /> {/* ← 이 한 줄만 추가: 모든 페이지 컨테이너 위에 항상 노출 */}
            <main className="page-wrap">
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/add" element={<AddSessionPage />} />
                    <Route path="/stats" element={<RevisitStatsPage />} />
                </Routes>
            </main>
        </Router>
    );
};

export default App;

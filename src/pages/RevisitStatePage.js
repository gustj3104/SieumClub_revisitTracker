import { useEffect, useState } from 'react';
import { getSessions } from '../utils/db';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import '../RevisitStyles.css';

const RevisitStatsPage = () => {
    const [sessions, setSessions] = useState([]);
    const [revisitStats, setRevisitStats] = useState({ twoPlus: 0, threePlus: 0, fourPlus: 0, total: 0 });

    useEffect(() => {
        const fetchSessions = async () => {
            const data = await getSessions();
            setSessions(data);
            calculateRevisitStats(data);
        };
        fetchSessions();
    }, []);

    const calculateRevisitStats = (sessions) => {
        let totalParticipants = new Set();
        let revisitCount = {};

        sessions.forEach((session) => {
            session.participants.forEach((name) => {
                totalParticipants.add(name);
                revisitCount[name] = (revisitCount[name] || 0) + 1;
            });
        });

        const total = totalParticipants.size;
        const twoPlus = Object.values(revisitCount).filter((count) => count >= 2).length;
        const threePlus = Object.values(revisitCount).filter((count) => count >= 3).length;
        const fourPlus = Object.values(revisitCount).filter((count) => count >= 4).length;

        setRevisitStats({
            twoPlus,
            threePlus,
            fourPlus,
            total,
        });
    };

    const data = {
        labels: ['2회 이상 방문자', '3회 이상 방문자', '4회 이상 방문자'],
        datasets: [
            {
                label: '재방문자 수',
                data: Object.values(revisitStats),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // 이 설정을 false로 하면 width 100% 적용 가능
    };

    return (
        <div className="container">
            <h1>재방문 통계</h1>
            <div className="chart-container">
                <Bar data={data} options={options} />
            </div>
            <p>
                2회 이상 방문자: {revisitStats.twoPlus}명 (
                {((revisitStats.twoPlus / revisitStats.total) * 100).toFixed(1)}%)
            </p>
            <p>
                3회 이상 방문자: {revisitStats.threePlus}명 (
                {((revisitStats.threePlus / revisitStats.total) * 100).toFixed(1)}%)
            </p>
            <p>
                4회 이상 방문자: {revisitStats.fourPlus}명 (
                {((revisitStats.fourPlus / revisitStats.total) * 100).toFixed(1)}%)
            </p>
        </div>
    );
};

export default RevisitStatsPage;

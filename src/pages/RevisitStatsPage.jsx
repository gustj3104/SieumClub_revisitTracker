import { useEffect, useState } from 'react';
import { getSessions } from '../utils/db';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import '../RevisitStyles.css';
import '../styles.css';

const normalizeName = (s) => (s ?? '').toString().trim().toLowerCase().replace(/\s+/g, ' ');

const RevisitStatsPage = () => {
    const [revisitStats, setRevisitStats] = useState({
        twoPlus: 0,
        threePlus: 0,
        fourPlus: 0,
        fivePlus: 0,
        sixPlus: 0,
        total: 0,
    });

    useEffect(() => {
        const fetchSessions = async () => {
            const data = (await getSessions()) || [];
            calculateRevisitStats(data);
        };
        fetchSessions();
    }, []);

    const calculateRevisitStats = (sessions) => {
        const totalParticipants = new Set();
        const revisitCount = {};

        sessions.forEach((session) => {
            const uniqueAttendees = new Set((session?.participants ?? []).map(normalizeName).filter(Boolean));
            uniqueAttendees.forEach((name) => {
                totalParticipants.add(name);
                revisitCount[name] = (revisitCount[name] || 0) + 1;
            });
        });

        const counts = Object.values(revisitCount);
        setRevisitStats({
            twoPlus: counts.filter((c) => c >= 2).length,
            threePlus: counts.filter((c) => c >= 3).length,
            fourPlus: counts.filter((c) => c >= 4).length,
            fivePlus: counts.filter((c) => c >= 5).length,
            sixPlus: counts.filter((c) => c >= 6).length,
            total: totalParticipants.size,
        });
    };

    const denom = revisitStats.total || 1;

    const data = {
        labels: ['2회 이상', '3회 이상', '4회 이상', '5회 이상', '6회 이상'],
        datasets: [
            {
                label: '재방문자 수',
                data: [
                    revisitStats.twoPlus,
                    revisitStats.threePlus,
                    revisitStats.fourPlus,
                    revisitStats.fivePlus,
                    revisitStats.sixPlus,
                ],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            },
        ],
    };

    const options = { responsive: true, maintainAspectRatio: false };

    return (
        <div className="stats-page">
            <div className="container equal-container">
                <h1>재방문 통계</h1>
                {/* ⬇⬇⬇ 여기를 chart-container로 변경 */}
                <div className="chart-container">
                    <Bar data={data} options={options} />
                </div>

                <p>
                    2회 이상 방문자: {revisitStats.twoPlus}명 ({((revisitStats.twoPlus / denom) * 100).toFixed(1)}%)
                </p>
                <p>
                    3회 이상 방문자: {revisitStats.threePlus}명 ({((revisitStats.threePlus / denom) * 100).toFixed(1)}%)
                </p>
                <p>
                    4회 이상 방문자: {revisitStats.fourPlus}명 ({((revisitStats.fourPlus / denom) * 100).toFixed(1)}%)
                </p>
                <p>
                    5회 이상 방문자: {revisitStats.fivePlus}명 ({((revisitStats.fivePlus / denom) * 100).toFixed(1)}%)
                </p>
                <p>
                    6회 이상 방문자: {revisitStats.sixPlus}명 ({((revisitStats.sixPlus / denom) * 100).toFixed(1)}%)
                </p>
            </div>
        </div>
    );
};

export default RevisitStatsPage;

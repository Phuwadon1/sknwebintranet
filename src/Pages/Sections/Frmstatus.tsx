import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const Frmstatus = () => {
    const [stats, setStats] = useState({
        total_visits: 0,
        start_date: '',
        online_count: 0
    });

    useEffect(() => {
        // Generate or retrieve unique Visitor ID
        let visitorId = localStorage.getItem('skn_visitor_id');
        if (!visitorId) {
            visitorId = 'v_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
            localStorage.setItem('skn_visitor_id', visitorId);
        }

        const fetchStats = async () => {
            try {
                const res = await api.get('/visitor', {
                    headers: {
                        'X-Visitor-ID': visitorId
                    }
                });
                setStats(res.data);
            } catch (error) {
                console.error("Error fetching visitor stats:", error);
            }
        };

        fetchStats();
        // Refresh every 1 minute to keep alive
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);

    }, []);

    // Helper to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Primary Theme Color (Blue)
    const themeColor = "#1977cc";

    // Configuration for each stat card
    const statItems = [
        {
            icon: "fa-solid fa-user-doctor",
            count: 250,
            label: "แพทย์",
        },
        {
            icon: "fa-regular fa-hospital",
            count: 35,
            label: "แผนก",
        },
        {
            icon: "fas fa-bed",
            count: 909,
            label: "เตียง",
        },
        {
            icon: "fas fa-award",
            count: 150,
            label: "รางวัล",
        }
    ];

    // Style Generators
    const cardStyle: React.CSSProperties = {
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px 10px',
        boxShadow: '0 2px 15px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease-in-out',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderTop: `3px solid ${themeColor}`
    };

    const iconStyle: React.CSSProperties = {
        fontSize: '36px',
        color: themeColor,
        marginBottom: '15px',
        backgroundColor: 'transparent',
        width: 'auto',
        height: 'auto',
        boxShadow: 'none',
        borderRadius: '0'
    };

    const countStyle: React.CSSProperties = {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '5px',
        lineHeight: 1
    };

    const labelStyle: React.CSSProperties = {
        fontSize: '14px',
        color: '#6c757d',
        margin: 0
    };

    return (
        <section id="stats" className="stats section" style={{ backgroundColor: '#f9f9fa', padding: '40px 0' }}>
            <div className="container" data-aos="fade-up" data-aos-delay={100}>

                <style>
                    {`
                    .stats-card-hover:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1) !important;
                    }
                `}
                </style>

                <div className="row row-cols-1 row-cols-md-3 row-cols-lg-5 g-3 justify-content-center">

                    {statItems.map((item, index) => (
                        <div className="col" key={index}>
                            <div className="stats-item stats-card-hover" style={cardStyle}>
                                <i className={item.icon} style={iconStyle} />
                                <span className="purecounter" style={countStyle}> {item.count} </span>
                                <p style={labelStyle}>{item.label}</p>
                            </div>
                        </div>
                    ))}

                    {/* Visitor Counter */}
                    <div className="col">
                        <div className="stats-item stats-card-hover" style={cardStyle}>
                            <i className="fas fa-users" style={iconStyle} />

                            <span className="purecounter" style={{ ...countStyle, fontSize: stats.total_visits > 1000000 ? '24px' : '28px' }}>
                                {stats.total_visits.toLocaleString()}
                            </span>
                            <p style={labelStyle}>ผู้เข้าชม</p>

                            <div className="mt-2 pt-2 w-100 border-top text-center" style={{ color: '#888', fontSize: '11px' }}>
                                <div>Online: <strong>{stats.online_count}</strong> คน</div>
                                <div>เริ่ม: {formatDate(stats.start_date)}</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default Frmstatus

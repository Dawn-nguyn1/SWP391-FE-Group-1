import React from 'react'
import { Drawer, notification } from 'antd';
import { useState, useEffect } from 'react';
import { getUserByIdAPI } from '../../../services/api.service';

const ViewUserDetail = (props) => {
    const { dataDetail, setDataDetail, isDetailOpen, setIsDetailOpen, loadUser } = props;
    const [userDetail, setUserDetail] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isDetailOpen && dataDetail?.id) fetchUserDetail();
    }, [isDetailOpen, dataDetail]);

    const fetchUserDetail = async () => {
        setLoading(true);
        try {
            const res = await getUserByIdAPI(dataDetail.id);
            if (res && res.id) setUserDetail(res);
            else notification.error({ message: "Error", description: "Không thể tải thông tin user" });
        } catch (error) {
            notification.error({ message: "Error", description: error?.message || "Lỗi khi tải thông tin user" });
        }
        setLoading(false);
    };

    const getRoleColor = (role) => {
        const map = { admin: '#7c3aed', user: '#0891b2', moderator: '#0e7490' };
        return map[role?.toLowerCase()] || '#6366f1';
    };

    const getStatusColor = (status) => status === 'active' ? '#0891b2' : '#a78bfa';

    const fields = userDetail ? [
        { label: 'Email', value: userDetail.email, icon: '✉️' },
        { label: 'Phone Number', value: userDetail.phone, icon: '📞' },
        { label: 'Role', value: userDetail.role, icon: '🛡️', type: 'role' },
        { label: 'Status', value: userDetail.status, icon: '⚡', type: 'status' },
        { label: 'Created At', value: new Date(userDetail.createdAt).toLocaleString(), icon: '📅' },
    ] : [];

    return (
        <>
            <style>{`
                .user-drawer .ant-drawer-content {
                    background: #f8f9fc;
                }
                .user-drawer .ant-drawer-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-bottom: none;
                    padding: 20px 24px;
                }
                .user-drawer .ant-drawer-title {
                    color: #ffffff !important;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    font-size: 18px;
                    font-weight: 600;
                }
                .user-drawer .ant-drawer-close {
                    color: rgba(255,255,255,0.9) !important;
                    transition: color 0.2s;
                }
                .user-drawer .ant-drawer-close:hover { color: #fff !important; }
                .user-drawer .ant-drawer-body { padding: 24px; }

                .ud-header-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 20px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
                    transition: all 0.2s ease;
                }
                .ud-header-card:hover {
                    border-color: #667eea;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
                    transform: translateY(-2px);
                }
                .ud-name { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                    font-size: 20px; 
                    font-weight: 600; 
                    color: #1f2937; 
                }

                .ud-field {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.2s ease;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
                }
                .ud-field:hover {
                    border-color: #667eea;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
                    transform: translateY(-2px);
                }
                .ud-icon {
                    width: 40px; height: 40px;
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 16px; flex-shrink: 0;
                }
                .ud-label {
                    font-size: 12px; font-weight: 500; text-transform: uppercase; 
                    color: #6b7280; margin-bottom: 4px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                }
                .ud-value {
                    font-size: 14px; font-weight: 500; color: #1f2937;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                }
                .ud-badge {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 6px 12px; border-radius: 20px;
                    font-size: 12px; font-weight: 500;
                    text-transform: capitalize;
                }

                .ud-empty {
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    height: 60%;
                    gap: 16px; color: #6b7280;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                }
                .ud-empty-icon {
                    width: 64px; height: 64px;
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 28px;
                }

                .ud-loading { display: flex; gap: 8px; justify-content: center; margin: 40px 0; }
                .ud-dot {
                    width: 8px; height: 8px; border-radius: 50%;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    animation: udBounce 1.2s ease-in-out infinite;
                }
                .ud-dot:nth-child(2) { animation-delay: 0.2s; }
                .ud-dot:nth-child(3) { animation-delay: 0.4s; }
                @keyframes udBounce {
                    0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
                    40% { transform: scale(1); opacity: 1; }
                }
            `}</style>

            <Drawer
                className="user-drawer"
                width={"42vw"}
                title={
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}></span>
                        Chi tiết User
                    </span>
                }
                onClose={() => { setDataDetail(null); setUserDetail(null); setIsDetailOpen(false); }}
                open={isDetailOpen}
            >
                {loading ? (
                    <div className="ud-loading">
                        <div className="ud-dot" />
                        <div className="ud-dot" />
                        <div className="ud-dot" />
                    </div>
                ) : userDetail ? (
                    <>
                        {/* Avatar & Header */}
                        <div className="ud-header-card">
                                <div className="ud-name">{userDetail.fullName }</div>                            
                        </div>

                        {/* Fields */}
                        {fields.map(({ label, value, icon, type }) => (
                            <div className="ud-field" key={label}>
                                <div className="ud-icon">{icon}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="ud-label">{label}</div>
                                    {type === 'role' ? (
                                        <span className="ud-badge" style={{
                                            background: `${getRoleColor(value)}18`,
                                            color: getRoleColor(value),
                                            border: `1px solid ${getRoleColor(value)}40`
                                        }}>
                                            🛡️ {value || 'N/A'}
                                        </span>
                                    ) : type === 'status' ? (
                                        <span className="ud-badge" style={{
                                            background: `${getStatusColor(value)}18`,
                                            color: getStatusColor(value),
                                            border: `1px solid ${getStatusColor(value)}40`
                                        }}>
                                            <span style={{
                                                width: 6, height: 6, borderRadius: '50%',
                                                background: getStatusColor(value),
                                                display: 'inline-block'
                                            }} />
                                            {value || 'N/A'}
                                        </span>
                                    ) : (
                                        <div className="ud-value">{value || 'N/A'}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="ud-empty">
                        <div className="ud-empty-icon">🔍</div>
                        <div style={{ fontWeight: 600, color: '#4b5563' }}>Không có dữ liệu</div>
                        <div style={{ fontSize: 13 }}>User không tồn tại hoặc đã bị xoá</div>
                    </div>
                )}
            </Drawer>
        </>
    );
};

export default ViewUserDetail;
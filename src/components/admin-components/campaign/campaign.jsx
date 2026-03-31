import React, { useState, useEffect } from 'react';
import CampaignTable from './campaign.table';
import CampaignForm from './campaign.form';
import './campaign.css';
import { fetchPreorderCampaignsAPI } from '../../../services/api.service';

const CampaignPage = () => {
    const [dataCampaigns, setDataCampaigns] = useState([]);
    const [current, setCurrent] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCampaigns();
    }, [current, pageSize]);

    const loadCampaigns = async () => {
        setLoading(true);
        try {
            const res = await fetchPreorderCampaignsAPI(current, pageSize);
            console.log("Campaign API response:", res);
            console.log("Response data type:", typeof res);
            console.log("Is array?", Array.isArray(res));
            
            // API trả về array trực tiếp, không có content wrapper
            if (res && Array.isArray(res)) {
                setDataCampaigns(res);
                setTotal(res.length);
            } else if (res && res.content) {
                // Fallback nếu có pagination wrapper
                setDataCampaigns(res.content);
                setTotal(res.totalElements || res.content.length);
            } else {
                setDataCampaigns([]);
                setTotal(0);
            }
        } catch (error) {
            console.error("Error loading campaigns:", error);
            setDataCampaigns([]);
            setTotal(0);
        }
        setLoading(false);
    };

    return (
        <div className="campaign-page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ color: '#ffffff' }}>Preorder Campaign Management</h1>
                    <p className="page-subtitle" style={{ color: '#ffffff' }}>Manage and view all preorder campaigns in the system</p>
                </div>
            </div>

            {/* Campaign Form */}
            <CampaignForm loadCampaigns={loadCampaigns} />

            {/* Campaign Table */}
            <CampaignTable
                loadCampaigns={loadCampaigns}
                dataCampaigns={dataCampaigns}
                setDataCampaigns={setDataCampaigns}
                current={current}
                pageSize={pageSize}
                total={total}
                setCurrent={setCurrent}
                setPageSize={setPageSize}
                loading={loading}
            />
        </div>
    );
};

export default CampaignPage;
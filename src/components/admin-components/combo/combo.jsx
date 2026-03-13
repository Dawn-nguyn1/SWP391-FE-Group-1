import React, { useState, useEffect } from 'react';
import ComboTable from './combo.table';
import ComboForm from './combo.form';
import './combo.css';
import { fetchCombosAPI } from '../../../services/api.service';

const ComboPage = () => {
    const [dataCombos, setDataCombos] = useState([]);
    const [current, setCurrent] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCombos();
    }, [current, pageSize]);

    const loadCombos = async () => {
        setLoading(true);
        try {
            const res = await fetchCombosAPI(current, pageSize);
            console.log("Combo API response:", res);
            
            if (res && res.content) {
                setDataCombos(res.content);
                setTotal(res.totalElements || res.content.length);
            } else {
                setDataCombos([]);
                setTotal(0);
            }
        } catch (error) {
            console.error("Error loading combos:", error);
            setDataCombos([]);
            setTotal(0);
        }
        setLoading(false);
    };

    return (
        <div className="combo-page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Combo Management</h1>
                    <p className="page-subtitle">Manage and view all combos in the system</p>
                </div>
            </div>

            {/* Combo Form */}
            <ComboForm loadCombos={loadCombos} />

            {/* Combo Table */}
            <ComboTable
                loadCombos={loadCombos}
                dataCombos={dataCombos}
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

export default ComboPage;
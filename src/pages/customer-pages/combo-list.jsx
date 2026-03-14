import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Pagination, Spin, Empty } from 'antd';
import { getPublicCombosAPI } from '../../services/api.service';
import './combo-list.css';

const ComboListPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    const page = parseInt(searchParams.get('page') || '0', 10);
    const size = 12;

    useEffect(() => {
        let cancelled = false;
        const fetchCombos = async () => {
            try {
                const res = await getPublicCombosAPI(page, size);
                if (cancelled) return;
                const data = res?.content || res?.data?.content || res?.data?.result?.content;
                const totalElements = res?.totalElements || res?.data?.totalElements || res?.data?.result?.totalElements;
                if (Array.isArray(data)) {
                    setCombos(data);
                    setTotal(typeof totalElements === 'number' ? totalElements : data.length);
                } else {
                    setCombos([]);
                    setTotal(0);
                }
            } catch {
                if (!cancelled) {
                    setCombos([]);
                    setTotal(0);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        setLoading(true);
        fetchCombos();
        return () => { cancelled = true; };
    }, [page]);

    const formatVND = (n) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

    return (
        <div className="combo-list-page">
            <div className="combo-topbar">
                <div className="combo-topbar-inner">
                    <div>
                        <h2>Combo ưu đãi</h2>
                        <p>Chọn combo để tiết kiệm hơn khi mua nhiều sản phẩm.</p>
                    </div>
                    <span className="combo-count">{total} combo</span>
                </div>
            </div>

            <div className="combo-list-body">
                {loading ? (
                    <div className="combo-loading"><Spin size="large" /></div>
                ) : combos.length === 0 ? (
                    <Empty description="Chưa có combo phù hợp" style={{ marginTop: 60 }} />
                ) : (
                    <>
                        <div className="combo-grid">
                            {combos.map((combo) => (
                                <Link key={combo.id} to={`/customer/combos/${combo.id}`} className="combo-card">
                                    <div className="combo-image-wrap">
                                        {combo.imageUrl ? (
                                            <img src={combo.imageUrl} alt={combo.name} />
                                        ) : (
                                            <div className="combo-image-placeholder">COMBO</div>
                                        )}
                                        <span className="combo-badge">Combo</span>
                                    </div>
                                    <div className="combo-info">
                                        <h3>{combo.name}</h3>
                                        <p className="combo-desc">{combo.description || 'Bộ sưu tập combo ưu đãi'}</p>
                                        <div className="combo-meta">
                                            <span>{combo.items?.length || 0} items</span>
                                            <strong>{formatVND(combo.comboPrice)}</strong>
                                        </div>
                                        <p className="combo-status-note">Tạm thời chỉ hỗ trợ xem chi tiết combo</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        {total > size && (
                            <div className="combo-pagination">
                                <Pagination
                                    current={page + 1}
                                    pageSize={size}
                                    total={total}
                                    onChange={(p) => {
                                        const sp = new URLSearchParams(searchParams);
                                        sp.set('page', p - 1);
                                        setSearchParams(sp);
                                    }}
                                    showSizeChanger={false}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ComboListPage;

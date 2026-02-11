import '../layout/footer.css'
import React from 'react'
import { Link } from 'react-router-dom'
const Footer = () => {
    return (
        <footer style={{
            backgroundColor: 'var(--primary-color)',
            color: '#fff',
            padding: 'var(--spacing-xl) 0 0 0',
            marginTop: 'auto'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 var(--spacing-lg)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '40px',
                paddingBottom: '40px'
            }}>
                <div>
                    <h3 style={{ color: 'var(--accent-color)', marginBottom: '20px' }}>GENETIX</h3>
                    <p style={{ color: '#ccc', fontSize: '14px' }}>
                        Cung cấp những giải pháp kính mắt thời thượng và đẳng cấp.
                        Đồng hành cùng phong cách và sức khỏe đôi mắt của bạn.
                    </p>
                </div>
                <div>
                    <h4 style={{ marginBottom: '20px' }}>Khám phá</h4>
                    <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', color: '#ccc' }}>
                        <li style={{ marginBottom: '10px' }}><Link to="/products">Bộ sưu tập mới</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link to="/products">Kính nam</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link to="/products">Kính nữ</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link to="/products">Phụ kiện</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 style={{ marginBottom: '20px' }}>Hỗ trợ</h4>
                    <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', color: '#ccc' }}>
                        <li style={{ marginBottom: '10px' }}>Chính sách bảo hành</li>
                        <li style={{ marginBottom: '10px' }}>Hướng dẫn mua hàng</li>
                        <li style={{ marginBottom: '10px' }}>Câu hỏi thường gặp</li>
                        <li style={{ marginBottom: '10px' }}>Liên hệ với chúng tôi</li>
                    </ul>
                </div>
                <div>
                    <h4 style={{ marginBottom: '20px' }}>Bản tin</h4>
                    <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '15px' }}>
                        Đăng ký để nhận thông tin về sản phẩm mới nhất.
                    </p>
                    <div style={{ display: 'flex' }}>
                        <input
                            type="email"
                            placeholder="Email của bạn"
                            style={{
                                padding: '8px 12px',
                                border: 'none',
                                borderRadius: '4px 0 0 4px',
                                flex: 1
                            }}
                        />
                        <button style={{
                            backgroundColor: 'var(--accent-color)',
                            color: 'var(--primary-color)',
                            padding: '8px 16px',
                            fontWeight: 'bold',
                            borderRadius: '0 4px 4px 0'
                        }}>
                            GỬI
                        </button>
                    </div>
                </div>
            </div>
            <div style={{
                borderTop: '1px solid #333',
                padding: '20px 0',
                textAlign: 'center',
                fontSize: '12px',
                color: '#666'
            }}>
                <p>© 2026 GENETIX Eyewear. All rights reserved. Version 1.1.0</p>
            </div>
        </footer>
    );
}
export default Footer;
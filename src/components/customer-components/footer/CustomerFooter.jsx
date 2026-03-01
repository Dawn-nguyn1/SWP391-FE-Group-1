import React from 'react';
import { Link } from 'react-router-dom';
import './CustomerFooter.css';

const CustomerFooter = () => (
    <footer className="customer-footer">
        <div className="footer-inner">
            <div className="footer-brand">
                <div className="footer-logo">
                    <span>👓</span> GENETIX
                </div>
                <p>Kính mắt chất lượng cao – phong cách hiện đại.<br />Giao hàng toàn quốc qua GHN.</p>
                <div className="footer-socials">
                    <a href="#" aria-label="Facebook">📘</a>
                    <a href="#" aria-label="Instagram">📸</a>
                    <a href="#" aria-label="TikTok">🎵</a>
                </div>
            </div>
            <div className="footer-col">
                <h4>Sản phẩm</h4>
                <Link to="/customer/products">Tất cả kính</Link>
                <Link to="/customer/products?inStock=true">Còn hàng</Link>
                <Link to="/customer/products?brand=Ray-Ban">Ray-Ban</Link>
                <Link to="/customer/products?brand=Oakley">Oakley</Link>
            </div>
            <div className="footer-col">
                <h4>Tài khoản</h4>
                <Link to="/customer/profile">Hồ sơ cá nhân</Link>
                <Link to="/customer/orders">Đơn hàng</Link>
                <Link to="/customer/cart">Giỏ hàng</Link>
            </div>
            <div className="footer-col">
                <h4>Hỗ trợ</h4>
                <a href="mailto:support@genetix.vn">support@genetix.vn</a>
                <a href="tel:19001234">1900 1234</a>
                <span>T2–T7: 8h–18h</span>
            </div>
        </div>
        <div className="footer-bottom">
            © 2026 GENETIX. Bảo lưu mọi quyền. | Được thanh toán bảo mật qua VNPay
        </div>
    </footer>
);

export default CustomerFooter;

import React from 'react';
import { Button, Row, Col, Card, Typography } from 'antd';
import { ArrowRightOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const HomePage = () => {
  const navigate = useNavigate();

  const featuredProducts = [
    { id: 1, name: 'Aviator Classic', price: '2,500,000đ', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=400', tag: 'Bán chạy' },
    { id: 2, name: 'Round Metal', price: '3,200,000đ', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=400', tag: 'Mới về' },
    { id: 3, name: 'Wayfarer Lite', price: '2,800,000đ', image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&q=80&w=400', tag: 'Pre-order' },
    { id: 4, name: 'Clubmaster Square', price: '3,500,000đ', image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&q=80&w=400', tag: 'Limited' },
  ];

  return (
    <div style={{ background: 'var(--background-color)' }}>
      {/* Hero Section */}
      <section style={{
        height: '90vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("https://images.unsplash.com/photo-1574258495973-f327dfca5301?auto=format&fit=crop&q=80&w=1600")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '0 10%'
      }}>
        <div style={{ maxWidth: '600px', color: '#fff' }}>
          <Text style={{ color: 'var(--accent-color)', fontSize: '1rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>
            Bộ sưu tập mới 2026
          </Text>
          <Title level={1} style={{ color: '#fff', fontSize: '4rem', margin: '20px 0', fontFamily: 'var(--font-heading)' }}>
            Nâng tầm phong cách của bạn
          </Title>
          <Text style={{ color: '#eee', fontSize: '1.2rem', display: 'block', marginBottom: '40px' }}>
            Khám phá những mẫu kính mắt độc quyền, kết hợp hoàn hảo giữa công nghệ hiện đại và thiết kế cổ điển.
          </Text>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              style={{ height: '56px', padding: '0 32px' }}
              onClick={() => navigate('/products')}
            >
              Mua ngay
            </Button>
            <Button
              size="large"
              ghost
              style={{ height: '56px', padding: '0 32px' }}
            >
              Xem bộ sưu tập
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section style={{ padding: '80px 10%' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <Title level={2} style={{ fontFamily: 'var(--font-heading)' }}>Sản phẩm nổi bật</Title>
          <Text type="secondary">Những lựa chọn tinh tế nhất dành cho bạn</Text>
        </div>

        <Row gutter={[32, 32]}>
          {featuredProducts.map((product) => (
            <Col xs={24} sm={12} md={6} key={product.id}>
              <Card
                hoverable
                cover={
                  <div style={{ position: 'relative', overflow: 'hidden', height: '300px' }}>
                    <img alt={product.name} src={product.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      left: '15px',
                      backgroundColor: product.tag === 'Pre-order' ? 'var(--accent-color)' : 'var(--primary-color)',
                      color: product.tag === 'Pre-order' ? 'var(--primary-color)' : '#fff',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      borderRadius: '4px'
                    }}>
                      {product.tag}
                    </div>
                  </div>
                }
                styles={{ body: { padding: '20px' } }}
                style={{ borderRadius: 'var(--border-radius-md)', border: 'none', boxShadow: 'var(--shadow-sm)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <Title level={5} style={{ margin: 0 }}>{product.name}</Title>
                  <div style={{ color: '#fadb14' }}><StarFilled /><StarFilled /><StarFilled /><StarFilled /><StarFilled /></div>
                </div>
                <Text strong style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}>{product.price}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* Pre-order Awareness Section */}
      <section style={{
        padding: '100px 10%',
        backgroundColor: 'var(--surface-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '60px'
      }}>
        <div style={{ flex: 1 }}>
          <img
            src="https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&q=80&w=800"
            alt="Pre-order promo"
            style={{ width: '100%', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-lg)' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Title level={2} style={{ fontFamily: 'var(--font-heading)' }}>Đặt trước sản phẩm độc quyền</Title>
          <Text style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '30px' }}>
            Đừng bỏ lỡ cơ hội sở hữu những thiết kế giới hạn trước khi chúng chính thức lên kệ.
            Đặt cọc ngay hôm nay để nhận ưu đãi lên đến 20% và đảm bảo suất sở hữu sớm nhất.
          </Text>
          <ul style={{ marginBottom: '40px', padding: 0, listStyle: 'none' }}>
            <li style={{ marginBottom: '15px' }}>✅ Thanh toán trước chỉ 30% giá trị</li>
            <li style={{ marginBottom: '15px' }}>✅ Nhận hàng đầu tiên vào tháng 04/2026</li>
            <li style={{ marginBottom: '15px' }}>✅ Chứng nhận sở hữu phiên bản giới hạn</li>
          </ul>
          <Button type="primary" size="large" onClick={() => navigate('/products')}>Tìm hiểu thêm về Pre-order</Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
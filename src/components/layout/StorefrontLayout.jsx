import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header';
import Footer from './footer';

const StorefrontLayout = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1 }}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default StorefrontLayout;

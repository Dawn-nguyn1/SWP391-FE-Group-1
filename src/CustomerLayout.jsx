import React from 'react'
import { Outlet } from 'react-router-dom'
import CustomerHeader from './components/customer-components/header/CustomerHeader'
import CustomerFooter from './components/customer-components/footer/CustomerFooter'
import { CartWrapper } from './context/cart.context'
import './customer-layout.css'

const CustomerLayout = () => {
  return (
    <CartWrapper>
      <div className="customer-layout">
        <CustomerHeader />
        <main className="customer-main">
          <Outlet />
        </main>
        <CustomerFooter />
      </div>
    </CartWrapper>
  )
}

export default CustomerLayout

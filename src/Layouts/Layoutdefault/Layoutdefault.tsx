import React from 'react';
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import { Content } from "antd/es/layout/layout";
import Header from './Frmheader';
import Footer from './Frmfooter';
import ChatWidget from '../../Components/ChatWidget';

const Layoutdefault = () => {
    return (
        <Layout>
            <Header />
            <Content>
                <Outlet />
            </Content>
            <Footer />
            <ChatWidget />
        </Layout>
    )
}

export default Layoutdefault
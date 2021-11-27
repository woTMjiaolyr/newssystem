import React, { useEffect } from 'react'
import SideMenu from '../../components/newssandbox/SideMenu'
import TopHeader from '../../components/newssandbox/TopHeader'
import NewsRouter from '../../components/newssandbox/NewsRouter';
import NProgress from 'nprogress';
//css
import './NewsSandBox.css'
import 'nprogress/nprogress.css'

//antd
import { Layout } from 'antd';
const { Content } = Layout;

export default function NewsSandBox() {
    NProgress.start(); //页面刷新进度条开始
    useEffect(() => {
        NProgress.done(); //进度条结束
    }) //useEffect后面不加空数组相当于componentDidMount() 
    return (
        <Layout>
            <SideMenu></SideMenu>
            <Layout className="site-layout">
                <TopHeader></TopHeader>

                <Content
                    className="site-layout-background"
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        overflow: 'auto'
                    }}
                >
                    <NewsRouter></NewsRouter>
                </Content>

            </Layout>
        </Layout>
    )
}

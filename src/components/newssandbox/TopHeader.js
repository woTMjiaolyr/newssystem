import React from 'react'
import { Layout, Menu, Dropdown, Avatar } from 'antd';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux'

const { Header } = Layout;

function TopHeader(props) {

    // console.log(props);

    const changeCollapsedxxx = () => {
        // setCollapsed(!collapsed);
        //改变state中的isCollapsed
        // console.log(props);
        props.changeCollapsed()
    }

    const { role: { roleName }, username } = JSON.parse(localStorage.getItem('token'))

    const menu = (
        <Menu>
            <Menu.Item key={'1'}>{roleName}</Menu.Item>
            <Menu.Item danger key={'2'} onClick={() => {
                // 需要引入withRouter
                localStorage.removeItem('token');
                props.history.replace('/login');
            }}>退出登录</Menu.Item>
        </Menu >
    );

    return (
        <Header className="site-layout-background" style={{ padding: '0 16px' }}>
            {
                props.isCollapsed ? <MenuUnfoldOutlined onClick={changeCollapsedxxx} /> : <MenuFoldOutlined onClick={changeCollapsedxxx} />
            }
            <div style={{ float: 'right' }}>
                <span>欢迎<span style={{ color: '#1890ff' }}>{username}</span>回来</span>
                <Dropdown overlay={menu}>
                    <Avatar size="large" icon={<UserOutlined />} />
                </Dropdown>
            </div>
        </Header >
    )
}

const mapStateToProps = ({ CollapsedReducer: { isCollapsed } }) => {
    // console.log(state);
    return {
        isCollapsed
    }
}

const mapDispatchToProps = {
    changeCollapsed() {
        return {
            type: 'change_collapsed'
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(TopHeader))

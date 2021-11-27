import React, { useEffect, useState } from 'react'
import { Layout, Menu } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import axios from 'axios'
import { connect } from 'react-redux'
//css
import './index.css'

const { Sider } = Layout;
const { SubMenu } = Menu;

//模拟数组结构
// const menuList = [
//     {
//         key: '/home',
//         title: '首页',
//         icon: <UserOutlined />
//     },
//     {
//         key: '/user-manage',
//         title: '用户管理',
//         icon: <UserOutlined />,
//         children: [
//             {
//                 key: '/user-manage/list',
//                 title: '用户列表',
//                 icon: <UserOutlined />
//             }
//         ]
//     },
//     {
//         key: '/right-manage',
//         title: '权限管理',
//         icon: <UserOutlined />,
//         children: [
//             {
//                 key: '/right-manage/role/list',
//                 title: '角色列表',
//                 icon: <UserOutlined />
//             },
//             {
//                 key: '/right-manage/right/list',
//                 title: '权限列表',
//                 icon: <UserOutlined />
//             }
//         ]
//     }

// ]

//模拟icon的映射数组

const iconList = {
    '/home': <UserOutlined />,
    '/user-manage/list': <UserOutlined />,
    '/user-manage': <UserOutlined />,
    '/right-manage': <UserOutlined />,
    '/right-manage/role/list': <UserOutlined />,
    '/right-manage/right/list': <UserOutlined />
}

function SideMenu(props) {

    const [menu, setMenu] = useState([])

    useEffect(() => {
        axios.get('/rights?_embed=children').then(res => {
            // console.log(res.data);
            setMenu(res.data);
        })
    }, []) //空数组，仅在装载或卸载时执行

    const { role: { rights } } = JSON.parse(localStorage.getItem('token'));

    //后端属性中有些不是sidemenu子菜单，所以需要做个判断
    const checkPagePermission = (item) => {
        //需要并上当前用户的权限列表.include(item.key)
        return item.pagepermisson === 1 && (rights.checked ? rights.checked : rights).includes(item.key);
    }

    const renderMenu = (menuList) => {
        return menuList.map(item => {
            if (item.children?.length > 0 && checkPagePermission(item)) {
                return <SubMenu key={item.key} icon={iconList[item.key]} title={item.title}>
                    {/* 这里的子列表用的是递归思想 */}
                    {renderMenu(item.children)}
                </SubMenu>
            }
            return checkPagePermission(item) && <Menu.Item key={item.key} icon={iconList[item.key]} onClick={() => {
                // 因为上一级不是路由组件，所以不能用props.history.push 
                // 所以整个组件要用withRouter()包一下，成高阶组件，使其拥有上面属性
                props.history.push(item.key)
            }}>{item.title}</Menu.Item>
        })
    }

    // console.log(props.location);
    const selectKeys = [props.location.pathname];
    const openKeys = ['/' + props.location.pathname.split('/')[1]];

    return (
        <Sider trigger={null} collapsible collapsed={props.isCollapsed}>
            <div style={{ display: 'flex', height: '100%', 'flexDirection': 'column' }}>
                <div className="logo" >全球新闻发布管理系统</div>
                <div style={{ flex: 1, 'overflow': 'auto' }}>
                    <Menu theme="dark" mode="inline" selectedKeys={selectKeys} defaultOpenKeys={openKeys}>
                        {/* 
                    <Menu.Item key="1">Option 1</Menu.Item>
                    <SubMenu key="sub4" icon={<SettingOutlined />} title="用户管理">
                        <Menu.Item key="9">Option 9</Menu.Item>
                    </SubMenu> */}

                        {renderMenu(menu)}

                    </Menu>
                </div>
            </div>
        </Sider>
    )
}

const mapStateToProps = ({ CollapsedReducer: { isCollapsed } }) => ({ isCollapsed }) //不写return的话，要再加一个（），要不会被当做对象

export default connect(mapStateToProps)(withRouter(SideMenu))
import React, { useEffect, useState } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { Spin } from 'antd'
import { connect } from 'react-redux'
import axios from 'axios'
import Home from '../../views/newssandbox/home/Home'
import UserList from '../../views/newssandbox/user-manage/UserList'
import RoleList from '../../views/newssandbox/right-manage/RoleList'
import RightList from '../../views/newssandbox/right-manage/RightList'
import NewsAdd from '../../views/newssandbox/news-manage/NewsAdd'
import NewsDraft from '../../views/newssandbox/news-manage/NewsDraft'
import NewsCategory from '../../views/newssandbox/news-manage/NewsCategory'
import NewsPreview from '../../views/newssandbox/news-manage/NewsPreview'
import NewsUpdate from '../../views/newssandbox/news-manage/NewsUpdate'
import Audit from '../../views/newssandbox/audit-manage/Audit'
import AuditList from '../../views/newssandbox/audit-manage/AuditList'
import Unpublished from '../../views/newssandbox/publish-manage/Unpublished'
import Published from '../../views/newssandbox/publish-manage/Published'
import Sunset from '../../views/newssandbox/publish-manage/Sunset'

import NoPermission from '../../views/newssandbox/nopermission/NoPermission'

const LocalRouterMap = {
    '/home': Home,
    '/user-manage/list': UserList,
    '/right-manage/role/list': RoleList,
    '/right-manage/right/list': RightList,
    '/news-manage/add': NewsAdd,
    '/news-manage/draft': NewsDraft,
    '/news-manage/category': NewsCategory,
    '/news-manage/preview/:id': NewsPreview,
    '/news-manage/update/:id': NewsUpdate,
    '/audit-manage/audit': Audit,
    '/audit-manage/list': AuditList,
    "/publish-manage/unpublished": Unpublished,
    "/publish-manage/published": Published,
    "/publish-manage/sunset": Sunset
}

function NewsRouter(props) {

    const [BackRouteList, setBackRouteList] = useState([])

    useEffect(() => {
        Promise.all([
            axios.get('/rights'),
            axios.get('/children'),
        ]).then(res => {
            // console.log(res);
            setBackRouteList([...res[0].data, ...res[1].data]);
        })
    }, [])

    const { role: { rights } } = JSON.parse(localStorage.getItem('token'))

    const checkRoute = (item) => { //改完刷新页面就行
        //判断这个权限还在不在或关了没有 配置项按钮
        return LocalRouterMap[item.key] && (item.pagepermisson || item.routepermisson)
    }

    const checkUserPermission = (item) => {
        //改完需要重新登录
        return (rights.checked ? rights.checked : rights).includes(item.key);
    }

    return (
        <Spin size='large' spinning={props.isLoading}>
            <Switch>
                {
                    BackRouteList.map(item => {
                        if (checkRoute(item) && checkUserPermission(item)) {
                            return <Route path={item.key} key={item.key} component={LocalRouterMap[item.key]} exact />
                        } else {
                            return null
                        }
                    }

                    )
                }
                <Redirect from='/' to='/home' exact />
                {
                    BackRouteList.length > 0 && <Route path='*' component={NoPermission} />
                }

            </Switch>
        </Spin>
    )
}

const mapStateToProps = ({ LoadingReducer: { isLoading } }) => {
    // console.log(state);
    return {
        isLoading
    }
}

export default connect(mapStateToProps)(NewsRouter)

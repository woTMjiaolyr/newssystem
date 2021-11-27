import React from 'react'
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom'
import Login from '../views/login/Login'
import Detail from '../views/news/Detail'
import News from '../views/news/News'
import NewsSandBox from '../views/newssandbox/NewsSandBox'

export default function indeRouter() {
    return (
        <HashRouter>
            <Switch>
                <Route path='/login' component={Login} />
                <Route path='/news' component={News} />
                <Route path='/detail/:id' component={Detail} />
                {/* path='/'这样的路径在模糊匹配下，对应组件在为选择的情况下也会显示 */}
                {/* 需要用精确匹配  或者用swith，匹配到之后停止往下匹配 */}
                {/* <Route path='/' component={NewsSandBox} /> 也可以写成render回调，两者等价 */}
                <Route path='/' render={() =>
                    localStorage.getItem('token') ?
                        <NewsSandBox></NewsSandBox> :
                        <Redirect to='/login' />
                } />
            </Switch>
        </HashRouter>
    )
}

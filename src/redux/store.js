import { createStore, combineReducers } from 'redux'

import { CollapsedReducer } from './reducer/CollapsedReducer'
import { LoadingReducer } from './reducer/LoadingReducer';

import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

const reducer = combineReducers({
    CollapsedReducer,
    LoadingReducer
})

// 把CollapsedReducer做数据持久化，先从redux-persist中引入persistStore, persistReducer
// 第一步：reducer持久化的配置信息
const persistConfig = {
    key: 'kerwin',
    storage,
    blacklist: ['LoadingReducer'],
    // whitelist:['CollapsedReducer'] 白名单是只给哪些reducer做数据持久化，黑名单相反
}

// 第二步：利用persistReducer生成持久化reducer
const persistedReducer = persistReducer(persistConfig, reducer)

// 第三步：将持久化的reducer传入createstore中生成store
const store = createStore(persistedReducer);
// 第四步：利用persistStore生成持久化store
let persistor = persistStore(store)

// 第五步：持久化store也要导出
export {
    store,
    persistor
}
// 之后在其他引入过store的页面，引入方式要修改为  import {store} from './redux/store' 加大括号

// 持久化store是在provider页面中引入，在provider内部在包裹一个 <PersistGate loading={null} persistor={persistor}></Provider>
// 不包裹PersistGate，每次打开页面都会有一个过渡效果



/*
 store.dispatch()

 store.subsribe()

*/
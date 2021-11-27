一、如何让自己的css文件不影响父组件：
      1.将.css文件后缀改为.module.css
      2.加module的方法在写css是只能用类选择器或者id选择器，不能用标签选择器
      3.import './xxx.module.css' 改为 import style from './xxx.module.css'
      4.将标签中的类名改为 className={style.item}

二、利用switch
       <Route path='/' component={NewsSandBox} />  中path='/'在模糊匹配下，任何时候都能匹配上，因此相关组件也会显示。
       解决方法：
            1.改成精确匹配 exact
            2.利用switch包裹路由组件，即一旦匹配到就不会继续往下匹配

二、未授权重定向
      1.<Route path='/' render={() =>localStorage.getItem('token') ?<NewsSandBox></NewsSandBox> :<Redirect to='/login' />} />
       根据localStoragelocalStorage.getItem('token')来判断是否授权，继而是否需要重定向
       
       Web Storage实际上由两部分组成：sessionStorage与localStorage。

      （1）sessionStorage用于本地存储一个会话（session）中的数据，这些数据只有在同一个会话中的页面才能访问并且当会话结束后数据也随之销毁。
            因此sessionStorage不是一种持久化的本地存储，仅仅是会话级别的存储。
      （2）localStorage用于持久化的本地存储，除非主动删除数据，否则数据是永远不会过期的。
       方法 :
       1.localStorage.getItem(key):获取指定key本地存储的值
       2.localStorage.setItem(key,value)：将value存储到key字段
       3.localStorage.removeItem(key):删除指定key本地存储的值
       4.localstroage.clear();删除所有值
      
三、重定向
      <Redirect from='/' to='/home' exact /> 开启严格模式避免任何时候由于from='/'，Home组件都会显示出来
      <Route path='*' component={NoPermission} />  搭配上面的严格模式，若地址输入有误，则显示NoPermission组件

四、注意引入content时的问题
      
      这是在写完Layout系统自动引入的，路径会出现问题，报错
         import Layout from 'antd/lib/layout/layout' 
      正确写法： 
         import { Layout } from 'antd'; 
         const { Content } = Layout;
      所以：
         在系统帮我引入组件时，要检查引入的路径

五、sidemenu组件
      动态sidemenu组件：
        1.侧边栏是根据后端返回的数组动态生成的，所以要用 arr.map遍历数组生成menu 
        2.含有二级结构的menu，都含有一个item.children属性
        3.最好把遍历数组封装成一个函数renderMenu()，函数封装时，对于含有二级结构的menu元素，要善于利用递归
        4.点击菜单跳转到相关路径。利用props.history.push(path) 这是路由组件的属性  编程式路由导航
              但是路由组件的<NewsSandBox /> 的子组件<SideMenu />就不能直接获取路由中的属性了。
              此时子组件必须通过 withRouter() 的修饰成高阶组件后才能获取到路由组件的属性。
        5.从后端获取数据动态生成sideMenu
              const [menu, setMenu] = useState([])  让函数式组件也可以拥有state属性

              useEffect(() => {             在函数式组件中向ajax请求数据（副作用操作）
                  axios.get('http://localhost:5000/rights?_embed=children').then(res => {
                      // console.log(res.data);
                      setMenu(res.data);
                  })
              }, []) //空数组，仅在装载或卸载时执行
        6.修改sidemenu的首页也会有下拉按钮的bug
                     item.children.length > 0 这样写会在一个问题，那就是有些次级菜单没有children属性，说以是undefined
            解决办法：item.children？.length > 0  加一个问号（?），先判断是否有这一属性
        7.保证刷新后显示的还是刷新前所选中的menu
             const selectKeys = [props.location.pathname];
             selectedKeys={selectKeys}           受控组件非受控组件
             defaultSelectedKeys={selectKeys}    初始选中的菜单项 key 数组

             const openKeys = ['/' + props.location.pathname.split('/')[1]];
             defaultOpenKeys={openKeys}          初始展开的 SubMenu 菜单项 key 数组

开启json-server: json-server --watch .\test.json --port 8000

六、RightList
        1.防止content内容高度过长而调出整个页面的滚动条：
                （1）给本区域设置style属性  overflow:'auto' 这样只是调出本区域的滚动条
                （2）或者给表格设置分页 pagination={{pageSize: 5}}
        2.防止首页前面也有展开按钮
            const list = res.data;   
            list[0].children = '';   list[0]就是首页
        3.防止删完之后第二项前面没有展开按钮
            list.forEach(item => {   加一个判断
                if (item.children.length === 0) {
                    item.children = '';
                }
            })
        4.deleteMethod方法中：
            （1）filter只能过滤第一次层，set时要深复制
            （2）整个流程：
                  先根据自己中的rightId找到父级菜单（filter）
                  再在父级菜单中过滤掉filter自己
                  最后setDataSource
                  最后在后端中删除axios.delete
        5.根据属性值配置按钮button不可用：
                  （1） 按钮中添加属性disabled={item.pagepermisson === undefined}
                  （2） 禁用后不能点击：trigger='click' =》trigger={item.pagepermisson === undefined ? '' : 'click'}
        6.配置项按钮switchMethod()控制页面状态和后端状态
                   item.pagepermisson = item.pagepermisson === 1 ? 0 : 1;
                   setDataSource([...dataSource]);  //当前页面同步状态
                   //后端同步
                   if (item.grade === 1) {
                       axios.patch(`http://localhost:5000/rights/${item.id}`, {
                           pagepermisson: item.pagepermisson
                       })
                   } else {
                       axios.patch(`http://localhost:5000/children/${item.id}`, {
                           pagepermisson: item.pagepermisson
                       })
                   }

七、rolelist
        1.树型组件
            <Tree checkable
                    checkedKeys={curRights}
                    onCheck={(checkedKeys) => {setCurRights(checkedKeys);}}     在点击按钮时就获取当前的rights
                    checkStrictly={true}    默认状态下（false），只要父级勾选，子级就算没有也勾选，所以改成true
                    treeData={rightList}
                />
                  (1)非受控组件：只在第一次的时候更改，后面不再变化，所以在权限分配中要改成受控组件
                        角色列表->权限分配
                        defaultCheckedKeys={curRights} =》checkedKeys={curRights}
        2.修改权限列表
            a.因为Tree是弹出窗口中的内容，所以再点击编辑button时，需要获取当前角色的的id(curId)和权限(curRights)，都交给state保存
            b.在Tree中oncheck时，需要把修改后的权限(checkedKeys)赋给/修改state中保存的权限setCurRights(checkedKeys); 
            c.点击OK后：
                    第一步：先关闭弹出窗口
                    第二部：把修改后的权限数据（在state中保存的）同步给datasource  ？？？？
                              遍历datasource，找到id与当前点击的id(curId，在state中保存)相同的，return {...item , rights : curRights }
                    第三步：同步给后端

八、userlist
        1.页面数据展示：
               （1）从后端获取useEffect  axios.get 交给state保存  setState
               （2）后端数据中没有key属性的，拿在生成的时候需要加key <Table/>中的 rowKey={item => item.id}  
        2.添加用户按钮 userform
               （1）后端数据中心没有key属性，<Option/>中需要加 key={item.id}
               （2）函数式组件用ref属性：
                           a.先从react中引入useRef， const addForm = useRef(null);
                           b.父级元素的ref也可以传给子级，把子级的函数式组件用forwardRef()包裹一下，之后函数式组件就能接收来自父级的ref参数
                           c.把ref设置在<form />组件中，这样父级拿到的就是 表单信息
                           d.addForm.current. / ref.current  得到一个包含表单信息的对象 上面有.setFieldsValue()和validateFields()还有.resetFields()等方法，
                                    ref.current.setFieldsValue({region: ''}) 可以设置ref对应的对象上的属性
                                    .resetFields() 可以重置（清空表单数据）
                (3)点击ok后：
                           a.窗口消失
                           b.post给后端，让后端自动生成一个id。之后再同步页面状态setDataSource
                           c.确保表单再次出现时，信息是空白的 addForm.current.resetFields();
                （4）更新按钮：
                        ***a.react中状态的更新不一定是同步的，所以setIsUpDateVisible(true)的时候状态没有更新完，这时候执行就会
                             出现'setFieldsValue' of null的报错。解决办法，将二者执行语句设为同步的,即第一步模态框创建出来之后，再setState
                             将二者放入异步中setTimeout

九、topheader组件
        1、退出登录 点击后转到login界面
                onClick={() => { localStorage.removeItem('token');  props.history.replace('/login');}}
                第一步清除登录信息缓存，第二部跳转到login界面。由于用到了history属性，所以需要。。。
        2、路由组件的<NewsSandBox /> 的子组件<TopHeader />不能直接获取路由中的属性history localStorage.removeItem
              所以子组件必须通过 withRouter() 的修饰成高阶组件后才能获取到路由组件的属性。
        
        
十、登录界面
        1、<Form onFinish={onFinish}>表单中的onfinish属性，可以获取表单各个输入框的值
            const onFinish = (values) => {console.log(values);}; 
        2、跟后端匹配验证  （注意：！！！链接换行写，下边的横线消失，就会报错，所以不要换行写）
                 axios.get(`http://localhost:5000/users?password=${values.password}
                 &password=${values.password}&roleState=true&_expand=role`).then(res => {
                     console.log(res.data);
                     if (res.data.length === 0) {
                         message.error('用户名或密码不正确')
                     } else {
                         localStorage.setItem('token', res.data[0]);
                         props.history.push('/');
                     }
                 })
        3、后端数据存在嵌套的时候如何取值： const { role: { roleName }, username } = JSON.parse(localStorage.getItem('token'))
        4、sidemenu根据用户权限显示而不是全部显示:
             const { role: { rights } } = JSON.parse(localStorage.getItem('token'));
             在checkPagePermission函数中在添加一个判断 && (rights.checked ? rights.checked : rights).includes(item.key);
             TMD有些角色right就是数组，有些是rights.checked才是数组
        5.用户列表bug：
             userform中用户只能看到比自己级别低的用户： 只限两类管理员，编辑看不到
               a.先在userlist中改：
                  setDataSource(roleObj[roleId] === 'superadmin' ? res.data :[
                         ...res.data.filter(item=>item.username===username),    先把自己过滤出来
                         ...res.data.filter(item=>item.region===region&&roleObj[item.roleId]==='editor'),  再把同一个区域的编辑（低级别）过滤出来
                        ]);
                  同样的，不用权限的用户在添加用户和修改用户属性时也只能添加或修改小于等于自己的
               b.其后在userform中改：
                  修改option组件中的disabled属性，可以封装一个checkRegionDisabled()函数
                     可以在更新唤起的UserForm组件中给子表单传一个isUpdate属性，用于让form判断是更新还是添加
                     对于管理员来说：是更新的话就只能更新自己所在区域
                                    是添加的话只能添加自己所在区域

十一、路由权限 NewsRouter
        1.由于存在二级路径所匹配的组件存在，而对应的一级路径没有对应组件，在路由的模糊匹配下，会生成如<Route path='user-manage' />，
          什么也匹配不到,所以路由要精准匹配exact
        2.刚开始还没有setBackRouteList ，此时BackRouteList为空数组，不应该匹配到<Route path='*' component={NoPermission} />，所以前面加个判断
        3.在加载路由组件也应该加判断，if（有权限） 再<Route>
           这里的有权限应包括：1.判断这个权限还在不在或关了没有。操作配置项按钮  LocalRouterMap[item.key] && item.pagepermission
                              2.当前用户是否有权利看这个权限
        4.页面刷新时的进度条：在NewsSandbox组价中加
                            import NProgress from 'nprogress';
                            import 'nprogress/nprogress.css'
                            NProgress.start();       //页面刷新进度条开始
                            useEffect(() => {
                                NProgress.done();    //进度条结束
                            })                       //useEffect后面不加空数组相当于componentDidMount() 
        5.创建一个http.js 并引入index.js中 ,其中包括
             axios.defaults.baseURL = 'http://localhost:5000'  其他文件就可以直接写子路径就可以了

tips:箭头函数加{}时，要写return ，若不写{} 就不用写return

十二、新闻业务NewsAdd
        1.编辑区域：利用类名来控制相关区域的显示和隐藏
              <div className={current === 1 ? '' : style.active}>2222222</div>
              而不要用  current < 2 && <Button type='primary' onClick={handleNext}>下一步</Button> 来做判断，因为这样的话，每一次做判断，
            就会把之前的输入框内容清空
        2.表单验证：
            a.先利用ref获取表单 ref={NewsForm}  再 NewsForm.current.validateFields().then(res=>res.data).catch(error=>...)
        3. NewsEditor组件给NewsAdd组件传数据：子传父，用回调函数  在父组件中利用props定义函数，在子组件中调用(传参)，父组件中接收，操作
           利用 draftToHtml 组件使获取页面信息更容易
        4.往第三步走的时候利用state收集页面上的信息（formInfo, content），若为空给出提示 message.error()弹出错误提示
        5.用axios.post往后端存数据是，后端是会自增长id的
        6.table中的每条数据若没有key值，需要自己加，就加在table中，rowKey={item => item.id}

十三、新闻预览newspreview
        1.利用axios.get从后端拿数据，存到页面状态setstate。在把页面状态存储的值展示在页面中
        2.经典错误，因为state的初始值设置为null，所以在渲染时会报错，axios有一定的滞后性。解决办法，加一个？判断 title={newsInfor?.title} 
        3.若渲染节点过多，每一个都加问号麻烦，可以在整体的div前加一个 newsInfor &&
        4.moment方法 moment(newsInfor.createTime).format('YYYY/MM/DD HH:mm:ss')
        5.在页面渲染发布状态和审核状态时，要根据后端的数据匹配相应的状态，而不是把数据渲染在页面，需要提前创建一个数组
        6.页面数据写style设置颜色不起作用是，可以在套一个div 给div设置颜色
        7.<div dangerouslySetInnerHTML={{ _html: newsInfor.content }}></div>  转成正常文本

十四、新闻修改newsupdate
        1.PageHeader组件中的返回属性 onBack={() => { props.history.goBack() }} 需要用回调函数
        2.点完更新按钮把相应的内容渲染在表单中 NewsForm.current.setFieldsValue（）
        3.newseditor中，要把拿到的content从html转成draft，放到页面上
                            //html==>>draft
                                   const html = props.content;
                                   if (html === undefined) return;         这一步是防止从newsAdd进入时，content是undefined，会报错
                                   const contentBlock = htmlToDraft(html);
                                   if (contentBlock) {
                                       const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                                       const editorState = EditorState.createWithContent(contentState);
                                       setEditorState(editorState);
                                   }
                               }, [props.content])
        4.auditList：根据状态值显示相应的文字或颜色的方法
                     a.创建一个数组，const auditList = ['草稿箱', '审核中', '已通过', '未通过'] auditList[auditState]
                     b.  {item.auditState === 1 && <Button danger>发布</Button>}

十五、发布管理
        1.由于三个界面基本一样，可以封装成一个组件
        2.由于三个界面在数据渲染到页面前，从后端获取数据axios.get的时候，只有publishState的数据不一样，所以也可以封装成一个hooks函数usePublish()，
          只把不用的参数传过去就行了
        3.可以把三个界面的操作按钮的三个函数也都放在hooks里面,每个界面用的时候按需索取

十六、状态管理 topheader  sidemenu
        1.创建reducer，并暴露 其中的preState要初始化
        2.创建store.js，引入reducer，如果有多个reducer时，要利用combineReducer包裹，生成一个总的reducer，再createStore，并暴露
        3.在App.js中，把父组件利用Provider包裹一下，传入store,这样所有用connect包装的组件，都能获取到store
            高阶函数：connect(mapStateToProps,mapDispatchToProps)(被包装的组件) 
            mapStateToProps(形参)=>{} 映射状态 接收到的形参就是reducer中的状态  
                返回一个对象，就说说通过connect拿到reducer中的state，返回成自己的state，通过props接收

            mapDispatchToProps={} 点完小图标之后实现dispatch方法的调用，dispatch方法中return一个action
        
        4.如何保障redux持久化存储在系统中  readux-persist
          
             const persistConfig = {           
                 key: 'kerwin',
                 storage,
                 blacklist: ['LoadingReducer']   黑名单就是摆明那些reducer不用持久化
             }
             const persistedReducer = persistReducer(persistConfig, reducer)
             const store = createStore(persistedReducer);
             let persistor = persistStore(store)
         将我们的reducer按照persistConfig配置生成persistedReducer，存储在storage中       
         由于暴露方式变为 export {store,persistor}，所以其他组件在引入store时，要变为 import { store } from '../redux/store'
         
 

             
                  
             
                    
                  
              
        
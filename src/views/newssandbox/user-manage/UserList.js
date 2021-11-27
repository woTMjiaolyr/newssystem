import React, { useState, useEffect, useRef } from 'react'
import { Table, Button, Modal, Switch, } from 'antd'
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import axios from 'axios'
import UserForm from '../../../components/user-manage/UserForm'
const { confirm } = Modal;


export default function UserList() {

    const [dataSource, setDataSource] = useState([]);
    const [isAddVisible, setIsAddVisible] = useState(false);  //控制弹出窗口显示与否的状态
    const [isUpDateVisible, setIsUpDateVisible] = useState(false) //更新时弹出窗口的显示状态
    const [regionList, setRegionList] = useState([]);
    const [roleList, setRoleList] = useState([]);
    const [current, setCurrent] = useState(null);  //用来保存需要更新的角色

    const [isUpDateDisabled, setIsUpDateDisabled] = useState(false);//根据弹出窗口中的角色控制区域是否可选
    const addForm = useRef(null);
    const upDateForm = useRef(null);

    const { roleId, region, username } = JSON.parse(localStorage.getItem('token')) //获取当前用户roleId和地区

    useEffect(() => {
        const roleObj = {
            '1': 'superadmin',
            '2': 'admin',
            '3': 'editor'
        }
        axios.get('/users?_expand=role').then(res => {
            setDataSource(roleObj[roleId] === 'superadmin' ? res.data : [
                ...res.data.filter(item => item.username === username),
                ...res.data.filter(item => item.region === region && roleObj[item.roleId] === 'editor'),
            ]);
        })
    }, [roleId, region, username])

    useEffect(() => {  //获取区域原始数据
        axios.get('/regions').then(res => {
            setRegionList(res.data);
        })
    }, [])

    useEffect(() => {  //获取角色原始数据
        axios.get('/roles').then(res => {
            setRoleList(res.data);
        })
    }, [])

    const columns = [
        {
            title: '区域',
            dataIndex: 'region',
            filters: [
                ...regionList.map(item => ({
                    text: item.title,
                    value: item.value
                })),
                {
                    text: '全球',
                    value: '全球'
                }
            ],
            onFilter: (value, item) => {
                if (value === '全球') {
                    return item.region === ''
                } else {
                    return item.region === value
                }
            },
            render: (region) => {  //render的作用是对获得到的数据进行操作 
                return <b>{region === '' ? '全球' : region}</b>
            }
        },
        {
            title: '角色名称',
            dataIndex: 'role',
            render: (role) => {   //render的作用是对获得到的数据进行操作 
                return role?.roleName
            }
        },
        {
            title: '用户名',
            dataIndex: 'username'
            //不写render就直接把dataIndex得到的属性值渲染在页面
        },
        {
            title: '用户状态',
            dataIndex: 'roleState',
            render: (roleState, item) => {
                return <Switch checked={roleState} disabled={item.default} onChange={() => handleChange(item)}></Switch>
            }
        },
        {
            title: '操作',
            render: (item) => {
                // console.log(item);
                return <div>
                    <Button danger shape="circle" icon={<DeleteOutlined />} onClick={() => confirmMethod(item)} disabled={item.default} />
                    <Button type="primary" shape="circle" icon={<EditOutlined />} disabled={item.default} onClick={() => handleUpDate(item)} />
                </div>
            }
        }
    ];

    //添加用户
    const addFormOk = () => {
        // console.log('add', addForm);得到的是表单信息{username: " ", password: " ", region: " ", roleId:**}
        addForm.current.validateFields().then(value => {
            // console.log(value)
            //一：窗口消失
            setIsAddVisible(false);
            //二：post到后端，生成id(后端自动生成)，再设置DataSource，方便后面的删除和更新处理
            axios.post(`/users`, {
                ...value, //给后端的时候直接可以...value展开，剩余的两个数据自己补充就行了
                "roleState": true,
                "default": false,
            }).then(res => {
                // console.log(res.data);
                //三：同步页面状态(因为每条数据都需要id，所以先post给后端，让后端自动生成一个id，再同步页面状态)
                setDataSource([
                    ...dataSource, {
                        ...res.data,
                        role: roleList.filter(item => item.id === value.roleId)[0]
                    }])
            })
            //四、确保表单再次出现时，信息是空白的
            addForm.current.resetFields();
        }).catch(err => {
            console.log(err);
        })
    }

    //用户状态
    const handleChange = (item) => {
        // console.log(item);
        //同步当前页面
        item.roleState = !item.roleState;
        setDataSource([...dataSource]);
        //同步后端
        axios.patch(`/users/${item.id}`, {
            roleState: item.roleState
        })
    }

    //删除前确认
    const confirmMethod = (item) => {
        confirm({
            title: '你确定要删除？',
            icon: <ExclamationCircleOutlined />,
            onOk() {
                // console.log('add', addForm);
                deleteMethod(item);
            },
            onCancel() {
                // console.log('Cancel');
            },
        });
    }

    //删除
    const deleteMethod = (item) => {
        // 当前页面同步状态 + 后端同步
        setDataSource(dataSource.filter(data => data.id !== item.id));
        axios.delete(`/users/${item.id}`);
    }

    //更新按钮
    const handleUpDate = (item) => {
        setTimeout(() => {
            setIsUpDateVisible(true);
            //如果是超级管理员，需要控制区域的禁用
            if (item.roleId === 1) {
                //禁用
                setIsUpDateDisabled(true);
            } else {
                //取消禁用
                setIsUpDateDisabled(false);
            }
            upDateForm.current.setFieldsValue(item);
        }, 0);
        //获取当前需要更新的对象角色
        setCurrent(item);
    }

    const upDateFormOk = () => {
        upDateForm.current.validateFields().then(value => {
            // console.log(value);
            setIsUpDateVisible(false);
            setDataSource(dataSource.map(item => {
                if (item.id === current.id) {
                    return {
                        ...item,
                        ...value,
                        role: roleList.filter(data => data.id === value.roleId)[0]
                    }
                }
                return item
            }))
            setIsUpDateDisabled(!isUpDateDisabled);
            axios.patch(`/users/${current.id}`, value);
        })
    }

    return (
        <div>
            <Button type='primary' onClick={() => { setIsAddVisible(true) }}>添加用户</Button>
            <Table dataSource={dataSource} columns={columns}
                pagination={{
                    pageSize: 5
                }}
                // RightList中因为原始数据中带有key，所以不需要写
                rowKey={item => item.id}
            />

            <Modal
                visible={isAddVisible}
                title="添加用户"
                okText="确定"
                cancelText="取消"
                onCancel={() => {
                    setIsAddVisible(false);
                }}
                onOk={() => addFormOk()}
            >
                <UserForm regionList={regionList} roleList={roleList} ref={addForm}></UserForm>
            </Modal>

            <Modal
                visible={isUpDateVisible}
                title="更新用户"
                okText="更新"
                cancelText="取消"
                onCancel={() => {
                    setIsUpDateVisible(false);
                    setIsUpDateDisabled(!isUpDateDisabled);
                }}
                onOk={() => upDateFormOk()}
            >
                <UserForm regionList={regionList} roleList={roleList} ref={upDateForm} isUpDateDisabled={isUpDateDisabled} isUpdate={true}></UserForm>
            </Modal>
        </div>
    )
}

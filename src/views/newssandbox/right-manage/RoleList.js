import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Tree } from 'antd'
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import axios from 'axios'

export default function RoleList() {
    const [dataSource, setDataSource] = useState([]);
    const [rightList, setRightList] = useState([]);  //权限列表原始数据
    const [curRights, setCurRights] = useState();    //获取当前点击的所对应的权限列表
    const [curId, setCurId] = useState(0);           //当前点击的id
    const [isModalVisible, setIsModalVisible] = useState(false);  //控制弹出窗口开关
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            render: (id) => {
                return <b>{id}</b>
            }
        },
        {
            title: '角色名称',
            dataIndex: 'roleName'
        },
        {
            title: '操作',
            render: (item) => {
                // console.log(item);
                return <div>
                    <Button danger shape="circle" icon={<DeleteOutlined />} onClick={() => confirmMethod(item)} />

                    <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => {
                        setIsModalVisible(true)
                        setCurRights(item.rights); //点击按钮时就获取当前按钮对应的right
                        setCurId(item.id);
                    }} />

                </div >
            }
        }
    ]

    const { confirm } = Modal;
    const confirmMethod = (item) => {
        confirm({
            title: '你确定要删除？',
            icon: <ExclamationCircleOutlined />,
            onOk() {
                // console.log('OK');
                deleteMethod(item);
                // 当前页面同步状态 + 后端同步
            },
            onCancel() {
                // console.log('Cancel');
            },
        });
    }

    const deleteMethod = (item) => {
        // console.log(item);
        setDataSource(dataSource.filter(data => data.id !== item.id));
        axios.delete(`/roles/${item.id}`);
    }

    useEffect(() => {
        axios.get('/roles').then(res => {
            // console.log(res.data);
            setDataSource(res.data);
        })
    }, [])

    useEffect(() => {
        axios.get('/rights?_embed=children').then(res => {
            // console.log(res.data);
            setRightList(res.data);
        })
    }, [])

    const handleOk = () => {
        // console.log(curRights.checked); //修改后的权限数组数组
        //第一步：隐藏弹出窗口
        setIsModalVisible(false);
        //第二步：同步给dataSource  为了下一次点击设置按钮能正常显示权限
        setDataSource(dataSource.map(item => {
            if (item.id === curId) {
                //console.log(item.rights)  原本的权限数组
                return {
                    ...item,
                    rights: curRights  //二者都是一个含有checked属性(属性值是权限数组)的对象
                }
            }
            return item
        }))
        //第三步：同步给后端 patch
        axios.patch(`/roles/${curId}`, {
            rights: curRights
        })
    }

    const handleCancel = () => {
        setIsModalVisible(false)
    }

    const onCheck = (checkedKeys) => {
        // console.log(checkedKeys); checkedKeys是修改后的权限列表数组
        setCurRights(checkedKeys); //将修改后的权限列表数组给state中的curRights，
    }

    return (
        <div>
            <Table dataSource={dataSource} columns={columns} rowKey={(item) => item.id}></Table>
            <Modal title="权限分配" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Tree checkable
                    checkedKeys={curRights}  //curRights是当前点击的对象的权限列表数组,在点击button时获取的
                    onCheck={onCheck}
                    checkStrictly={true}
                    treeData={rightList}
                />
            </Modal>
        </div>
    )
}

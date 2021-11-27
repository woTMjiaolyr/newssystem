import React, { useState, useEffect } from 'react'
import { Table, Tag, Button, Modal, Popover, Switch } from 'antd'
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios'

export default function RightList() {

    const [dataSource, setDataSource] = useState([]);

    useEffect(() => {
        axios.get('/rights?_embed=children').then(res => {
            //防止首页前面也有展开按钮
            const list = res.data;
            list.forEach(item => {
                if (item.children.length === 0) {
                    item.children = '';
                }
            })
            setDataSource(res.data);
        })
    }, [])

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            render: (id) => {
                return <b>{id}</b>
            }
        },
        {
            title: '权限名称',
            dataIndex: 'title'
        },
        {
            title: '权限路径',
            dataIndex: 'key',
            render: (key) => {
                return <Tag color='orange'>{key}</Tag>
            }
        },
        {
            title: '操作',
            render: (item) => {
                // console.log(item);
                return <div>
                    <Button danger shape="circle" icon={<DeleteOutlined />} onClick={() => confirmMethod(item)} />
                    <Popover content={<div style={{ textAlign: 'center' }}>
                        <Switch checked={item.pagepermisson} onClick={() => switchMethod(item)}></Switch>
                    </div>} title="配置项" trigger={item.pagepermisson === undefined ? '' : 'click'}>
                        <Button type="primary" shape="circle" icon={<EditOutlined />} disabled={item.pagepermisson === undefined} />
                    </Popover>

                </div>
            }
        }
    ];

    const switchMethod = (item) => {
        item.pagepermisson = item.pagepermisson === 1 ? 0 : 1;
        setDataSource([...dataSource]);  //当前页面同步状态

        //后端同步
        if (item.grade === 1) {
            axios.patch(`/rights/${item.id}`, {
                pagepermisson: item.pagepermisson
            })
        } else {
            axios.patch(`/children/${item.id}`, {
                pagepermisson: item.pagepermisson
            })
        }
    }

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
        if (item.grade === 1) {
            setDataSource(dataSource.filter(data => data.id !== item.id));
            axios.delete(`/rights/${item.id}`);
        } else {
            // console.log(item.rightId);  rightId是对应父级的id

            //通过rightId找到上一级菜单，找到的list是父级   
            let list = dataSource.filter(data => data.id === item.rightId);
            // console.log(list);  根据自己的id（次级id），过滤掉自己
            list[0].children = list[0].children.filter(data => data.id !== item.id);
            // console.log(list);

            setDataSource([...dataSource]);
            axios.delete(`/children/${item.id}`);
        }

    }

    return (
        <div>
            <Table dataSource={dataSource} columns={columns}
                pagination={{
                    pageSize: 5
                }}
            />
        </div>
    )
}

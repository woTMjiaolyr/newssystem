import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, notification } from 'antd'
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios'

export default function NewsDraft(props) {

    const [dataSource, setDataSource] = useState([]);

    const { username } = JSON.parse(localStorage.getItem('token'))
    useEffect(() => {
        axios.get(`/news?author=${username}&auditState=0&_expand=category`).then(res => {
            setDataSource(res.data);
        })
    }, [username])

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            render: (id) => {
                return <b>{id}</b>
            }
        },
        {
            title: '新闻路径',
            dataIndex: 'title',
            render: (title, item) => {
                return <a href={`#/news-manage/preview/${item.id}`}>{title}</a>
            }
        },
        {
            title: '作者',
            dataIndex: 'author'
        },
        {
            title: '分类信息',
            dataIndex: 'category',
            render: (category) => {
                return category.title
            }
        },
        {
            title: '操作',
            render: (item) => {
                // console.log(item);
                return <div>
                    <Button danger shape="circle" icon={<DeleteOutlined />} onClick={() => confirmMethod(item)} />
                    <Button type="primary" shape="circle" icon={<EditOutlined />}
                        onClick={() => { props.history.push(`/news-manage/update/${item.id}`) }} />
                    <Button shape="circle" icon={<UploadOutlined />} onClick={() => handleCheck(item.id)} />
                </div>
            }
        }
    ];

    const handleCheck = (id) => {
        axios.patch(`/news/${id}`, {
            auditState: 1
        }).then(res => {
            console.log(res.data);
            props.history.push('/audit-manage/list');
            notification.info({
                message: `通知`,
                description: `您可以到审核列表中查看您的新闻`,
                placement: 'bottomRight',
            });
        })
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
        setDataSource(dataSource.filter(data => data.id !== item.id));
        axios.delete(`/news/${item.id}`);

    }

    return (
        <div>
            <Table dataSource={dataSource} columns={columns}
                pagination={{
                    pageSize: 5
                }}
                // RightList中因为原始数据中带有key，所以不需要写
                rowKey={item => item.id}
            />
        </div>
    )
}


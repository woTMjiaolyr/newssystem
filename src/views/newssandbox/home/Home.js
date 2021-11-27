import { List, Card, Col, Row, Avatar, Drawer } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react'
import axios from 'axios'
const { Meta } = Card;

export default function Home() {

    const [viewList, setViewList] = useState([])
    const [starList, setStarList] = useState([])
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        axios.get('/news?publishState=2&_expand=category&_sort=view_order=desc&_limit=6').then(res => {
            // console.log('view', res.data);
            setViewList(res.data);
        })
    }, [])

    useEffect(() => {
        axios.get('/news?publishState=2&_expand=category&_sort=star_order=desc&_limit=6').then(res => {
            // console.log('star', res.data);
            setStarList(res.data)
        })
    }, [])


    const { username, region, role: { roleName } } = JSON.parse(localStorage.getItem('token'))

    return (
        <div>
            <div className="site-card-wrapper">
                <Row gutter={16}>
                    <Col span={8}>
                        <Card title="用户最长浏览" bordered={true} >
                            <List
                                size="large"
                                dataSource={viewList}
                                renderItem={item => <List.Item><a href={`#/news-manage/preview/${item.id}`}>{item.title}</a></List.Item>}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="用户点赞最多" bordered={true} >
                            <List
                                size="large"
                                dataSource={starList}
                                renderItem={item => <List.Item><a href={`#/news-manage/preview/${item.id}`}>{item.title}</a></List.Item>}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card
                            cover={
                                <img
                                    alt="example"
                                    src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                                />
                            }
                            actions={[
                                <SettingOutlined key="setting" onClick={() => { setVisible(true); }} />,
                                <EditOutlined key="edit" />,
                                <EllipsisOutlined key="ellipsis" />,
                            ]}
                        ><Meta
                                avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                                title={username}
                                description={
                                    <div>
                                        <b>{region ? region : '全球'}</b>
                                        <span style={{ paddingLeft: '30px' }}>{roleName}</span>
                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
            <Drawer
                width='500px'
                title="个人新闻分类"
                placement="right"
                closable={true}
                onClose={() => {
                    setVisible(false);
                }}
                visible={visible}
            >
                <p>Some contents...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
            </Drawer>
        </div>
    )
}

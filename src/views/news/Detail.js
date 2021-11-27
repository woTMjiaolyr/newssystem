import React, { useEffect, useState } from 'react'
import { PageHeader, Descriptions } from 'antd';
import { HeartTwoTone } from '@ant-design/icons';
import moment from 'moment'
import axios from 'axios';

export default function Detail(props) {

    const [newsInfor, setNewsInfor] = useState(null);

    useEffect(() => {
        // console.log(props.match.params.id);
        axios.get(`/news/${props.match.params.id}?_expand=category&_expand=role`).then(res => {
            setNewsInfor({
                ...res.data,
                view: res.data.view + 1 //每刷新一次访问数量+1
            });
            return res.data
        }).then(res => {
            axios.patch(`/news/${props.match.params.id}?_expand=category&_expand=role`, {
                view: res.view + 1
            })
        })
    }, [props.match.params.id])

    const handleStar = () => {
        setNewsInfor({
            ...newsInfor,
            star: newsInfor.star + 1 //每刷新一次访问数量+1
        });
        axios.patch(`/news/${props.match.params.id}?_expand=category&_expand=role`, {
            star: newsInfor.star + 1
        })
    }

    return (
        <div>
            {
                // 经典错误解决办法 错误原因，axios有一定滞后性，所以页面开始渲染时没有数据（初始化为null），就报错了
                newsInfor && <div>
                    <PageHeader
                        onBack={() => window.history.back()}
                        title={newsInfor.title} //经典错误,要加问号
                        subTitle={
                            <div>
                                {newsInfor.category.title}
                                <HeartTwoTone twoToneColor="#eb2f96"
                                    onClick={() => handleStar()} />
                            </div>
                        }
                    >
                        <Descriptions size="small" column={3}>
                            <Descriptions.Item label="创建者">{newsInfor.author}</Descriptions.Item>
                            <Descriptions.Item label="发布时间">{
                                newsInfor.publishTime ? moment(newsInfor.publishTime).format('YYYY/MM/DD HH:mm:ss') : '-'
                            }</Descriptions.Item>
                            <Descriptions.Item label="区域">{newsInfor.region}</Descriptions.Item>
                            <Descriptions.Item label="访问数量">{newsInfor.view}</Descriptions.Item>
                            <Descriptions.Item label="点赞数量">{newsInfor.star}</Descriptions.Item>
                            <Descriptions.Item label="评论数量">0</Descriptions.Item>
                        </Descriptions>
                    </PageHeader>
                    <div dangerouslySetInnerHTML={{ __html: newsInfor.content }} style={{ padding: '0 24px', border: '1px solid gray' }}>
                    </div>
                </div>

            }

        </div >
    )
}

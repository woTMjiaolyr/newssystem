import React, { useEffect, useState } from 'react'
import { PageHeader, Descriptions } from 'antd';
import moment from 'moment'
import axios from 'axios';

export default function NewsPreview(props) {

    const [newsInfor, setNewsInfor] = useState(null);

    useEffect(() => {
        // console.log(props.match.params.id);
        axios.get(`/news/${props.match.params.id}?_expand=category&_expand=role`).then(res => {
            setNewsInfor(res.data);
            // console.log(res.data);
        })
    }, [props.match.params.id])

    const auditList = ['未审核', '审核中', '已通过', '未通过'];
    const publishList = ['未发布', '待发布', '已上线', '已下线'];
    const colorList = ['balck', 'orange', 'green', 'red'];

    return (
        <div>
            {
                // 经典错误解决办法 错误原因，axios有一定滞后性，所以页面开始渲染时没有数据（初始化为null），就报错了
                newsInfor && <div>
                    <PageHeader
                        onBack={() => window.history.back()}
                        title={newsInfor.title} //经典错误,要加问号
                        subTitle={newsInfor.category.title}
                    >
                        <Descriptions size="small" column={3}>
                            <Descriptions.Item label="创建者">{newsInfor.author}</Descriptions.Item>
                            <Descriptions.Item label="创建时间">{moment(newsInfor.createTime).format('YYYY/MM/DD HH:mm:ss')}</Descriptions.Item>
                            <Descriptions.Item label="发布时间">{
                                newsInfor.publishTime ? moment(newsInfor.publishTime).format('YYYY/MM/DD HH:mm:ss') : '-'
                            }</Descriptions.Item>
                            <Descriptions.Item label="区域">{newsInfor.region}</Descriptions.Item>
                            <Descriptions.Item label="审核状态"><span style={{ color: colorList[newsInfor.auditState] }}>{auditList[newsInfor.auditState]}</span></Descriptions.Item>
                            <Descriptions.Item label="发布状态"><span style={{ color: colorList[newsInfor.auditState] }}>{publishList[newsInfor.publishState]}</span></Descriptions.Item>
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

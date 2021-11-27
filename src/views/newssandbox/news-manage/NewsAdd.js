import React, { useState, useEffect, useRef } from 'react'
import { Form, Input, PageHeader, Steps, Button, Select, message, notification } from 'antd'
import style from './News.module.css'
import axios from 'axios';
import NewsEditor from '../../../components/news-manage/NewsEditor';
const { Step } = Steps;
const { Option } = Select;

export default function NewsAdd(props) {
    const [current, setCurrent] = useState(0);
    const [categoryList, setCategoryList] = useState([]);//保存后端取过来的新闻分类数据
    const [formInfo, setFormInfo] = useState([]);//用来保存获取到的页面表单信息
    const [content, setContent] = useState('');//用来保存页面获取到的内容信息
    const User = JSON.parse(localStorage.getItem('token'));

    const NewsForm = useRef(null);//获取表单
    const handleNext = () => {
        if (current === 0) { //先验证是第一步，再进行下一步
            //表单验证
            NewsForm.current.validateFields().then(res => {
                // console.log(res);
                setFormInfo(res);
                setCurrent(current + 1);
            }).catch(error => {
                console.log(error);
            })

        } else {
            if (content === '' || content.trim() === '<p></p>') {
                message.error('新闻内容不能为空');//错误弹窗提示
            } else {
                setCurrent(current + 1);
                console.log(formInfo, content);//再点下一步的时候要收集两类信息
            }
        }
    }

    const handlePrevious = () => {
        setCurrent(current - 1);
    }

    const layout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 }
    }

    useEffect(() => {
        axios.get('/categories').then(res => {
            // console.log(res.data);
            setCategoryList(res.data);
        })
    }, [])

    const handleSave = (auditState) => {
        axios.post('/news', {
            // "title": "千锋教育",
            // "categoryId": 3,
            ...formInfo, //展开就是上面两项
            "content": content,
            "region": User.region ? User.region : '全球',
            "author": User.username,
            "roleId": User.roleId,
            "auditState": auditState, //传0就是保存草稿箱，传1就是提交审核
            "publishState": 0,
            "createTime": Date.now(),
            "star": 0,
            "view": 0
            // "publishTime": 0
        }).then(res => {
            props.history.push(auditState === 0 ? '/news-manage/draft' : '/audit-manage/list');
            notification.info({
                message: `通知`,
                description:
                    `您可以到${auditState === 0 ? '草稿箱' : '审核列表'}中查看您的新闻`,
                placement: 'bottomRight',
            });
        })
    }

    return (
        <div>
            <PageHeader
                className="site-page-header"
                title="撰写新闻"
                subTitle="This is a subtitle"
            />
            <Steps current={current}>
                <Step title="基本信息" description="新闻标题，新闻分类" />
                <Step title="新闻内容" subTitle="" description="新闻主题内容" />
                <Step title="新闻提交" description="保存草稿或者提交审核" />
            </Steps>

            <div style={{ marginTop: '50px' }}>
                <div className={current === 0 ? '' : style.active}>
                    <Form
                        {...layout}
                        name="basic"
                        ref={NewsForm}
                    >
                        <Form.Item
                            label="新闻标题"
                            name="title"
                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="新闻分类"
                            name="categoryId"
                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Select>
                                {
                                    categoryList.map(item =>
                                        <Option value={item.id} key={item.id}>{item.title}</Option>
                                    )
                                }
                            </Select>
                        </Form.Item>
                    </Form>
                </div>

                <div className={current === 1 ? '' : style.active}>
                    <NewsEditor getContent={(value) => {
                        // console.log(value);
                        setContent(value);
                    }}></NewsEditor>
                </div>

                <div className={current === 2 ? '' : style.active}>3333333</div>
            </div>

            <div style={{ marginTop: '50px' }}>
                {
                    current === 2 && <span>
                        <Button type='primary' onClick={() => handleSave(0)}>保存到草稿箱</Button>
                        <Button danger onClick={() => handleSave(1)}>提交审核</Button>
                    </span>
                }
                {
                    current < 2 && <Button type='primary' onClick={handleNext}>下一步</Button>
                }
                {
                    current > 0 && <Button onClick={handlePrevious}>上一步</Button>
                }
            </div>
        </div>
    )
}

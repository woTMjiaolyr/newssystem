import React, { forwardRef, useState, useEffect } from 'react'
import { Form, Input, Select } from 'antd'
const { Option } = Select

const UserForm = forwardRef((props, ref) => {
    const [isDisabled, setIsDisabled] = useState(false) //根据角色，控制区域是否可选。为true，则区域不可选 

    useEffect(() => {
        setIsDisabled(props.isUpDateDisabled)
    }, [props.isUpDateDisabled])

    const { roleId, region } = JSON.parse(localStorage.getItem('token')) //获取当前用户roleId和地区
    const roleObj = {
        '1': 'superadmin',
        '2': 'admin',
        '3': 'editor'
    }
    const checkRegionDisabled = (item) => {
        //根据父组件传过来的isUpdate来判断是更新还是添加
        if (props.isUpdate) {
            //创建
            if (roleObj[roleId] === 'superadmin') {
                //超级管理员 禁用为假，就是不禁用
                return false;
            } else {
                //普通管理员，全禁，也就是不能改
                return true;
            }
        } else {
            //更新
            if (roleObj[roleId] === 'superadmin') {
                //超级管理员
                return false;
            } else {
                //当前这一项item的item.value是否等于region,作为编辑也就是只有当前自己所在的区域不被禁
                return item.value !== region
            }
        }
    }

    const checkRoleDisabled = (item) => {
        //根据父组件传过来的isUpdate来判断是更新还是添加
        if (props.isUpdate) {
            //创建
            if (roleObj[roleId] === 'superadmin') {
                //超级管理员 禁用为假，就是不禁用
                return false;
            } else {
                //普通管理员，全禁，也就是不能改
                return true;
            }
        } else {
            //更新
            if (roleObj[roleId] === 'superadmin') {
                //超级管理员
                return false;
            } else {
                //只要不是超级管理员，name这里只能添加普通editor
                return roleObj[item.id] !== 'editor'
            }
        }
    }

    return (
        <Form ref={ref} layout="vertical">
            {/* layout="vertical"属性表示输入框和title上下排列 默认是左右水平排列*/}
            <Form.Item
                name="username" //后端对应的属性名
                label="用户名"
                rules={[{ required: true, message: '不能为空！' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '不能为空！' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="region"
                label="区域"
                rules={isDisabled ? [] : [{ required: true, message: '不能为空！' }]}
            >
                <Select disabled={isDisabled}>
                    {
                        //利用props的时候函数式组件括号内一定要先接收props
                        // 函数式组件 直接 props.***  类式组件才写 this.props.***   
                        props.regionList.map((item) => {
                            return (
                                <Option value={item.value} key={item.id}
                                    disabled={checkRegionDisabled(item)}>{item.title}</Option>
                            )

                        })
                    }
                </Select>
            </Form.Item>
            <Form.Item
                name="roleId"
                label="角色"
                rules={[{ required: true, message: '不能为空！' }]}
            >
                <Select onChange={(value) => {
                    // console.log(value); 这个value得到的是roleId
                    if (value === 1) {
                        setIsDisabled(true);
                        ref.current.setFieldsValue({
                            region: ''
                        })
                    } else {
                        setIsDisabled(false)
                    }
                }}>
                    {
                        props.roleList.map((item) => {
                            return (
                                <Option value={item.id} key={item.id} disabled={checkRoleDisabled(item)}>{item.roleName}</Option>
                            )
                        })
                    }
                </Select>
            </Form.Item>

        </Form>
    )
})
export default UserForm

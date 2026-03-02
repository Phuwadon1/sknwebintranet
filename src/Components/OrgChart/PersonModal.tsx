import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Modal, Button, Form, Input, Select, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

interface PersonModalProps {
    visible: boolean;
    onCancel: () => void;
    onSave: (data: any) => void;
    editData?: any;
    allPersons: any[];
}

const PersonModal: React.FC<PersonModalProps> = ({ visible, onCancel, onSave, editData, allPersons }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (editData) {
            // Map data correctly to form fields
            form.setFieldsValue({
                name: editData.Name,
                title: editData.Title,
                specialTitle: editData.SpecialTitle,
                level: editData.Level,
                parentId: editData.ParentId,
                position: editData.Position,
                order: editData.Order,
                prefix: editData.Prefix,
            });

            if (editData.Photo) {
                setFileList([{
                    uid: '-1',
                    name: 'current-photo.jpg',
                    status: 'done',
                    url: `${editData.Photo}`, // Ensure correct port
                }]);
            }
        } else {
            form.resetFields();
            setFileList([]);
        }
    }, [editData, form, visible]);

    const handleUpload = async (file: any) => {
        const formData = new FormData();
        formData.append('photo', file);

        setUploading(true);
        try {
            const response = await api.post('/orgchart/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            message.success('อัปโหลดรูปภาพสำเร็จ');
            return response.data.path;
        } catch (error: any) {
            if (error.message === 'Unauthorized') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                message.error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                message.error('อัปโหลดรูปภาพไม่สำเร็จ');
            }
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Determine photo path based on fileList state
            let photoPath = '';

            if (fileList.length > 0) {
                const file = fileList[0];
                if (file.url) {
                    // Existing photo (user didn't change it)
                    photoPath = file.url;
                } else {
                    // New photo upload
                    const fileToUpload = file.originFileObj || file;
                    const uploadedPath = await handleUpload(fileToUpload);
                    if (uploadedPath) {
                        photoPath = uploadedPath;
                    }
                }
            }
            // If fileList is empty, photoPath remains '' (effectively deleting the photo)

            const submitData = {
                ...values,
                photo: photoPath,
                id: editData?.Id,
            };

            onSave(submitData);
            form.resetFields();
            setFileList([]);
        } catch (error) {
            console.error('Validation error:', error);
        }
    };

    const uploadProps = {
        beforeUpload: (file: any) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น!');
                return false;
            }
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('ขนาดไฟล์ต้องน้อยกว่า 5MB!');
                return false;
            }
            setFileList([file]);
            return false; // Prevent auto upload
        },
        fileList,
        onRemove: () => {
            setFileList([]);
        },
    };

    return (
        <Modal
            title={editData ? 'แก้ไขข้อมูลบุคคล' : 'เพิ่มบุคคลใหม่'}
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    ยกเลิก
                </Button>,
                <Button key="submit" type="primary" onClick={handleSubmit} loading={uploading}>
                    บันทึก
                </Button>,
            ]}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    level: 1,
                    position: null,
                    order: 0,
                }}
            >
                <Form.Item
                    name="prefix"
                    label="คำนำหน้า"
                >
                    <Select placeholder="เลือกคำนำหน้า" allowClear>
                        <Select.Option value="นาย">นาย</Select.Option>
                        <Select.Option value="นาง">นาง</Select.Option>
                        <Select.Option value="น.ส.">น.ส.</Select.Option>
                        <Select.Option value="ดร.">ดร.</Select.Option>
                        <Select.Option value="ผศ.">ผศ.</Select.Option>
                        <Select.Option value="รศ.">รศ.</Select.Option>
                        <Select.Option value="ศ.">ศ.</Select.Option>
                        <Select.Option value="นพ.">นพ.</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="name"
                    label="ชื่อ-นามสกุล"
                    rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}
                >
                    <Input placeholder="สมชาย ใจดี" />
                </Form.Item>

                <Form.Item
                    name="specialTitle"
                    label="ตำแหน่งพิเศษ เช่น นายแพทย์ชำนาญการ"
                >
                    <Input placeholder="ระบุตำแหน่งพิเศษ" />
                </Form.Item>

                <Form.Item
                    name="title"
                    label="ตำแหน่งบริหาร"
                    rules={[{ required: true, message: 'กรุณากรอกตำแหน่ง' }]}
                >
                    <Input placeholder="นักวิชาการคอมพิวเตอร์" />
                </Form.Item>

                <Form.Item
                    name="level"
                    label="ระดับ"
                    rules={[{ required: true, message: 'กรุณาเลือกระดับ' }]}
                >
                    <Select>
                        <Select.Option value={1}>Level 1 (ระดับบนสุด)</Select.Option>
                        <Select.Option value={2}>Level 2</Select.Option>
                        <Select.Option value={3}>Level 3</Select.Option>
                        <Select.Option value={4}>Level 4</Select.Option>
                        <Select.Option value={5}>Level 5</Select.Option>
                        <Select.Option value={6}>Level 6</Select.Option>
                        <Select.Option value={7}>Level 7</Select.Option>
                        <Select.Option value={8}>Level 8</Select.Option>
                        <Select.Option value={9}>Level 9</Select.Option>
                        <Select.Option value={10}>Level 10</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="parentId"
                    label="เรียงต่อจาก"
                >
                    <Select allowClear placeholder="เรียงต่อจาก">
                        <Select.Option value={null}>ไม่มี (Root)</Select.Option>
                        {allPersons
                            .filter(person => !editData || person.Id !== editData.Id) // Filter out self
                            .map(person => (
                                <Select.Option key={person.Id} value={person.Id}>
                                    {person.Name} - {person.Title}
                                </Select.Option>
                            ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="position"
                    label="ตำแหน่งในแผนผัง"
                >
                    <Select allowClear placeholder="เลือกตำแหน่ง">
                        <Select.Option value={null}>อัตโนมัติ</Select.Option>
                        <Select.Option value="left">ซ้าย</Select.Option>
                        <Select.Option value="center">กลาง</Select.Option>
                        <Select.Option value="right">ขวา</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="order"
                    label="ลำดับ (Order)"
                >
                    <Input type="number" min={0} />
                </Form.Item>

                <Form.Item label="รูปภาพ">
                    <Upload {...uploadProps} maxCount={1}>
                        <Button icon={<UploadOutlined />}>เลือกรูปภาพ</Button>
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PersonModal;

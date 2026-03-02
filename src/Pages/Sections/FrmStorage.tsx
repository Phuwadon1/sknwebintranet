import React, { useState, useEffect } from 'react';
import { Card, Statistic, Table, Button, Input, Upload, message, Popconfirm, Tooltip, Empty } from 'antd';
import {
    CloudServerOutlined,
    CloudUploadOutlined,
    FolderOpenOutlined,
    FilePdfOutlined,
    FileImageOutlined,
    FileTextOutlined,
    FileExcelOutlined,
    FileUnknownOutlined,
    DeleteOutlined,
    DownloadOutlined,
    InboxOutlined
} from '@ant-design/icons';
import api from '../../api/axios';

const { Search } = Input;
const { Dragger } = Upload;

interface FileItem {
    id: number;
    file_name: string;
    original_name: string;
    file_size: string;
    file_type: string;
    upload_date: string;
}

const FrmStorage: React.FC = () => {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ totalFiles: 0, totalSize: '0 MB' });

    const fetchFiles = async (search = '') => {
        setLoading(true);
        try {
            const response = await api.get(`/storage?search=${search}`);
            const data = response.data.map((item: any) => ({
                ...item,
                key: item.id,
                upload_date: new Date(item.upload_date).toLocaleDateString('th-TH')
            }));
            setFiles(data);

            // Calculate stats
            setStats({
                totalFiles: data.length,
                totalSize: calculateTotalSize(data)
            });
        } catch (error) {
            console.error('Error fetching files:', error);
            message.error('ไม่สามารถดึงข้อมูลไฟล์ได้');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalSize = (data: any[]) => {
        let total = 0;
        data.forEach(item => {
            const size = parseFloat(item.file_size);
            if (item.file_size.includes('MB')) {
                total += size;
            } else if (item.file_size.includes('KB')) {
                total += size / 1024;
            }
        });
        return total.toFixed(2) + ' MB';
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const onSearch = (value: string) => {
        fetchFiles(value);
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/storage/${id}`);
            message.success('ลบไฟล์สำเร็จ');
            fetchFiles();
        } catch (error: any) {
            console.error('Error deleting file:', error);
            message.error('ลบไฟล์ไม่สำเร็จ');
        }
    };

    const handleDownload = (id: number, fileName: string) => {
        window.open(`/api/storage/download/${id}`, '_blank');
    };

    const uploadProps = {
        name: 'file',
        multiple: true,
        customRequest: async (options: any) => {
            const { onSuccess, onError, file } = options;
            const formData = new FormData();
            formData.append('file', file);
            try {
                const res = await api.post('/storage', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                onSuccess(res.data, file);
                message.success(`${file.name} อัปโหลดสำเร็จ`);
                fetchFiles();
            } catch (err: any) {
                onError(err);
                message.error(`${file.name} อัปโหลดไม่สำเร็จ`);
            }
        },
        showUploadList: false,
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'PDF': return <FilePdfOutlined className="text-red-500 text-2xl" />;
            case 'Image': return <FileImageOutlined className="text-blue-500 text-2xl" />;
            case 'Doc': return <FileTextOutlined className="text-blue-700 text-2xl" />;
            case 'Excel': return <FileExcelOutlined className="text-green-600 text-2xl" />;
            default: return <FileUnknownOutlined className="text-gray-400 text-2xl" />;
        }
    };

    const columns = [
        {
            title: 'ชื่อไฟล์',
            dataIndex: 'original_name',
            key: 'original_name',
            render: (text: string, record: FileItem) => (
                <div className="flex items-center gap-3">
                    {getFileIcon(record.file_type)}
                    <span className="font-medium text-gray-700">{text}</span>
                </div>
            )
        },
        { title: 'ประเภท', dataIndex: 'file_type', key: 'file_type', width: 100 },
        { title: 'ขนาด', dataIndex: 'file_size', key: 'file_size', width: 100 },
        { title: 'วันที่อัปโหลด', dataIndex: 'upload_date', key: 'upload_date', width: 150 },
        {
            title: 'จัดการ',
            key: 'action',
            width: 250,
            render: (_: any, record: FileItem) => (
                <div style={{ display: 'flex', gap: '50px' }}>
                    <Button
                        type="primary"
                        ghost
                        size="small"
                        onClick={() => handleDownload(record.id, record.original_name)}
                    >
                        ดาวน์โหลด
                    </Button>
                    <Popconfirm
                        title="ยืนยันการลบ"
                        description="คุณแน่ใจหรือไม่ที่จะลบไฟล์นี้?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="ลบ"
                        cancelText="ยกเลิก"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="primary"
                            danger
                            ghost
                            size="small"
                        >
                            ลบ
                        </Button>
                    </Popconfirm>
                </div>
            )
        },
    ];

    return (
        <div className="min-h-screen bg-white pb-10 font-sans" style={{ paddingTop: '50px' }}>
            {/* Header Section - Clean and Minimal */}
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 mb-6 py-2">
                    โปรแกรมจัดเก็บเอกสาร
                </h1>
                <div className="w-32 h-1 bg-gradient-to-r from-violet-600 to-indigo-600 mx-auto rounded-full"></div>
                <p className="text-xl text-gray-500 mt-6 font-light max-w-2xl mx-auto">
                    ระบบคลังเอกสารออนไลน์ จัดเก็บ ค้นหา และแชร์ไฟล์ภายในองค์กร
                </p>
            </div>

            <div className="container mx-auto px-4">

                {/* Stats & Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ marginBottom: '100px' }}>
                    {/* Stat: Total Storage */}
                    <Card bordered={false} className="rounded-2xl border-l-4 border-blue-500 hover:bg-gray-50 transition-all duration-300">
                        <Statistic
                            title={<span className="font-semibold text-gray-600">ขนาดไฟล์รวม</span>}
                            value={stats.totalSize}
                            prefix={<CloudServerOutlined className="text-blue-500 mr-2" />}
                            valueStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                        />
                    </Card>

                    {/* Stat: Total Files */}
                    <Card bordered={false} className="rounded-2xl border-l-4 border-cyan-500 hover:bg-gray-50 transition-all duration-300">
                        <Statistic
                            title={<span className="font-semibold text-gray-600">จำนวนไฟล์ทั้งหมด</span>}
                            value={stats.totalFiles}
                            prefix={<FolderOpenOutlined className="text-cyan-500 mr-2" />}
                            valueStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                        />
                    </Card>

                    {/* Upload Area */}
                    <div className="col-span-1 md:col-span-1">
                        <Dragger {...uploadProps} style={{ padding: '20px', backgroundColor: '#fff', border: '2px dashed #1890ff', borderRadius: '16px' }} className="hover:bg-gray-50 transition-colors h-full bg-white">
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined style={{ color: '#1890ff' }} />
                            </p>
                            <p className="ant-upload-text text-sm font-medium text-gray-600">คลิกหรือลากไฟล์มาวางที่นี่เพื่ออัปโหลด</p>
                            <p className="ant-upload-hint text-xs text-gray-400">รองรับการอัปโหลดทีละหลายไฟล์</p>
                        </Dragger>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-2xl p-6" style={{ marginTop: '50px' }}>

                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row justify-end items-center mb-6 gap-4">
                        <div className="w-full md:w-1/3">
                            <Search
                                placeholder="ค้นหาชื่อไฟล์..."
                                allowClear
                                enterButton="ค้นหา"
                                size="large"
                                onSearch={onSearch}
                                onChange={(e) => onSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <Table
                        dataSource={files}
                        columns={columns}
                        loading={loading}
                        pagination={{
                            pageSize: 8,
                            showTotal: (total) => `ทั้งหมด ${total} รายการ`,
                            position: ['bottomCenter']
                        }}
                        locale={{
                            emptyText: <Empty description="ไม่พบข้อมูลไฟล์" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        }}
                        rowClassName="hover:bg-gray-50 transition-colors"
                    />
                </div>
            </div>
        </div>
    );
};

export default FrmStorage;

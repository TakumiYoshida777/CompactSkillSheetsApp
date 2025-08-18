// 取引先一覧コンポーネント

import React, { useState } from 'react'
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Tag, 
  Input, 
  Select, 
  Dropdown, 
  Modal,
  Tooltip,
  message
} from 'antd'
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  MoreOutlined,
  UserOutlined,
  LinkOutlined,
  SettingOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { usePartners, useDeletePartner } from '@/hooks/queries/usePartnerQueries'
import type { BusinessPartner } from '@/types/partner'
import { format } from 'date-fns'

const { Search } = Input
const { Option } = Select

const PartnerList: React.FC = () => {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedPartner, setSelectedPartner] = useState<BusinessPartner | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  // Query hooks
  const { data: partners, isLoading } = usePartners({
    searchQuery: searchText,
    contractStatus: statusFilter as any
  })
  const deletePartnerMutation = useDeletePartner()

  // テーブルカラム定義
  const columns: ColumnsType<BusinessPartner> = [
    {
      title: '取引先企業名',
      dataIndex: 'partnerCompanyName',
      key: 'partnerCompanyName',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/company/partners/${record.id}`)}
          className="p-0"
        >
          {text}
        </Button>
      ),
    },
    {
      title: '契約ステータス',
      dataIndex: 'contractStatus',
      key: 'contractStatus',
      render: (status) => {
        const statusConfig = {
          active: { color: 'success', text: '有効' },
          expired: { color: 'error', text: '期限切れ' },
          pending: { color: 'warning', text: '保留中' }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return <Tag color={config?.color}>{config?.text}</Tag>
      }
    },
    {
      title: '契約期間',
      key: 'contractPeriod',
      render: (_, record) => (
        <span>
          {format(new Date(record.contractStartDate), 'yyyy/MM/dd')}
          {record.contractEndDate && (
            <> 〜 {format(new Date(record.contractEndDate), 'yyyy/MM/dd')}</>
          )}
        </span>
      )
    },
    {
      title: '閲覧可能エンジニア',
      key: 'engineers',
      render: (_, record) => (
        <span>
          {record.currentViewableEngineers} / {record.maxViewableEngineers}
        </span>
      )
    },
    {
      title: '担当者',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      render: (contactPerson) => contactPerson?.name || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="詳細">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/company/partners/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="編集">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/company/partners/${record.id}/edit`)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'users',
                  icon: <UserOutlined />,
                  label: 'ユーザー管理',
                  onClick: () => navigate(`/company/partners/${record.id}/users`)
                },
                {
                  key: 'permissions',
                  icon: <SettingOutlined />,
                  label: '権限設定',
                  onClick: () => navigate(`/company/partners/${record.id}/permissions`)
                },
                {
                  key: 'urls',
                  icon: <LinkOutlined />,
                  label: 'アクセスURL管理',
                  onClick: () => navigate(`/company/partners/${record.id}/urls`)
                },
                {
                  type: 'divider'
                },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: '削除',
                  danger: true,
                  onClick: () => {
                    setSelectedPartner(record)
                    setDeleteModalVisible(true)
                  }
                }
              ]
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ]

  // 削除処理
  const handleDelete = async () => {
    if (!selectedPartner) return
    
    try {
      await deletePartnerMutation.mutateAsync(selectedPartner.id)
      setDeleteModalVisible(false)
      setSelectedPartner(null)
    } catch (error) {
      // エラーハンドリングはhooksで処理
    }
  }

  return (
    <div className="p-6">
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">取引先管理</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/company/partners/new')}
          >
            新規取引先登録
          </Button>
        </div>

        <div className="mb-4 flex gap-4">
          <Search
            placeholder="企業名・担当者名で検索"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 400 }}
            onSearch={(value) => setSearchText(value)}
          />
          <Select
            placeholder="契約ステータス"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => setStatusFilter(value || '')}
          >
            <Option value="">すべて</Option>
            <Option value="active">有効</Option>
            <Option value="expired">期限切れ</Option>
            <Option value="pending">保留中</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={partners || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `全 ${total} 件`
          }}
        />
      </Card>

      {/* 削除確認モーダル */}
      <Modal
        title="取引先の削除"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => {
          setDeleteModalVisible(false)
          setSelectedPartner(null)
        }}
        confirmLoading={deletePartnerMutation.isPending}
        okText="削除"
        cancelText="キャンセル"
        okButtonProps={{ danger: true }}
      >
        <p>
          取引先「{selectedPartner?.partnerCompanyName}」を削除してもよろしいですか？
        </p>
        <p className="text-red-500 text-sm mt-2">
          この操作は取り消せません。関連するすべてのデータが削除されます。
        </p>
      </Modal>
    </div>
  )
}

export default PartnerList
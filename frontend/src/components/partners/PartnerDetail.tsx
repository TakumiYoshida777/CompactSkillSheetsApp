// 取引先詳細コンポーネント

import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Card, 
  Descriptions, 
  Button, 
  Tabs, 
  Tag, 
  Space, 
  Statistic, 
  Row, 
  Col,
  Empty,
  Spin
} from 'antd'
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  UserOutlined, 
  SettingOutlined,
  LinkOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import { 
  usePartner, 
  usePartnerActivity, 
  usePartnerAnalytics 
} from '@/hooks/queries/usePartnerQueries'
import { format } from 'date-fns'

const PartnerDetail: React.FC = () => {
  const { partnerId } = useParams<{ partnerId: string }>()
  const navigate = useNavigate()

  // Query hooks
  const { data: partner, isLoading } = usePartner(partnerId!)
  const { data: activity } = usePartnerActivity(partnerId!)
  const { data: analytics } = usePartnerAnalytics(partnerId!)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  if (!partner) {
    return (
      <Card className="m-6">
        <Empty description="取引先が見つかりませんでした" />
      </Card>
    )
  }

  const statusConfig = {
    active: { color: 'success', text: '有効' },
    expired: { color: 'error', text: '期限切れ' },
    pending: { color: 'warning', text: '保留中' }
  }

  const tabItems = [
    {
      key: 'overview',
      label: '概要',
      children: (
        <div>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="企業名" span={2}>
              {partner.partnerCompanyName}
            </Descriptions.Item>
            <Descriptions.Item label="メールアドレス">
              {partner.partnerCompanyEmail}
            </Descriptions.Item>
            <Descriptions.Item label="電話番号">
              {partner.partnerCompanyPhone || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="住所" span={2}>
              {partner.partnerCompanyAddress || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Webサイト" span={2}>
              {partner.websiteUrl ? (
                <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer">
                  {partner.websiteUrl}
                </a>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="契約ステータス">
              <Tag color={statusConfig[partner.contractStatus].color}>
                {statusConfig[partner.contractStatus].text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="契約期間">
              {format(new Date(partner.contractStartDate), 'yyyy年MM月dd日')}
              {partner.contractEndDate && (
                <> 〜 {format(new Date(partner.contractEndDate), 'yyyy年MM月dd日')}</>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="閲覧可能エンジニア数">
              {partner.currentViewableEngineers} / {partner.maxViewableEngineers} 名
            </Descriptions.Item>
            {partner.contactPerson && (
              <>
                <Descriptions.Item label="担当者名">
                  {partner.contactPerson.name}
                </Descriptions.Item>
                <Descriptions.Item label="担当者メール">
                  {partner.contactPerson.email}
                </Descriptions.Item>
                <Descriptions.Item label="担当者電話">
                  {partner.contactPerson.phone || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="担当者役職">
                  {partner.contactPerson.position || '-'}
                </Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="登録日">
              {format(new Date(partner.createdAt), 'yyyy年MM月dd日 HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="最終更新日">
              {format(new Date(partner.updatedAt), 'yyyy年MM月dd日 HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        </div>
      )
    },
    {
      key: 'statistics',
      label: '統計',
      children: (
        <div>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="今月のオファー数"
                  value={analytics?.monthlyOffers || 0}
                  suffix="件"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="累計オファー数"
                  value={analytics?.totalOffers || 0}
                  suffix="件"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="成約率"
                  value={analytics?.conversionRate || 0}
                  suffix="%"
                  precision={1}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="アクティブユーザー"
                  value={analytics?.activeUsers || 0}
                  suffix="名"
                />
              </Card>
            </Col>
          </Row>

          <Card className="mt-4">
            <h3 className="text-lg font-semibold mb-4">最近のアクティビティ</h3>
            {activity && activity.length > 0 ? (
              <div className="space-y-2">
                {activity.map((item: any, index: number) => (
                  <div key={index} className="border-b pb-2">
                    <div className="flex justify-between">
                      <span>{item.action}</span>
                      <span className="text-gray-500 text-sm">
                        {format(new Date(item.timestamp), 'yyyy/MM/dd HH:mm')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="アクティビティはありません" />
            )}
          </Card>
        </div>
      )
    }
  ]

  return (
    <div className="p-6">
      <Card>
        <div className="mb-4">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/company/partners')}
            className="mb-4"
          >
            取引先一覧に戻る
          </Button>

          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">{partner.partnerCompanyName}</h1>
            <Space>
              <Button 
                icon={<EditOutlined />}
                onClick={() => navigate(`/company/partners/${partnerId}/edit`)}
              >
                編集
              </Button>
              <Button 
                icon={<UserOutlined />}
                onClick={() => navigate(`/company/partners/${partnerId}/users`)}
              >
                ユーザー管理
              </Button>
              <Button 
                icon={<SettingOutlined />}
                onClick={() => navigate(`/company/partners/${partnerId}/permissions`)}
              >
                権限設定
              </Button>
              <Button 
                icon={<LinkOutlined />}
                onClick={() => navigate(`/company/partners/${partnerId}/urls`)}
              >
                URL管理
              </Button>
            </Space>
          </div>
        </div>

        <Tabs items={tabItems} />
      </Card>
    </div>
  )
}

export default PartnerDetail
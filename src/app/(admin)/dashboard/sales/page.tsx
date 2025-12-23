import { useState, useEffect } from 'react'
import { Col, Row } from 'react-bootstrap'

import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import DateFilter, { FilterPeriod } from './components/DateFilter'
import Accounts from './components/Accounts'
import OverviewChart from './components/OverviewChart'
import RecentOrders from './components/RecentOrders'
import SalesByCategory from './components/SalesByCategory'
import Stats from './components/Stats'
import Transactions from './components/Transactions'
import {
  getSalesDashboardStats,
  SalesDashboardParams,
  SalesDashboardStats,
} from '@/features/admin/api/analyticsApi'
import Preloader from '@/components/Preloader'

const SalesPage = () => {
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>('30d')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  const [dashboardData, setDashboardData] = useState<SalesDashboardStats | null>(null)

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const params: SalesDashboardParams = {}
      
      if (selectedPeriod === 'custom') {
        if (customStartDate && customEndDate) {
          params.startDate = customStartDate
          params.endDate = customEndDate
        } else {
          setLoading(false)
          return
        }
      } else {
        params.period = selectedPeriod
      }

      const response = await getSalesDashboardStats(params)
      if (response.success) {
        setDashboardData(response.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, customStartDate, customEndDate])

  const handlePeriodChange = (period: FilterPeriod) => {
    setSelectedPeriod(period)
  }

  const handleCustomDateChange = (startDate: string, endDate: string) => {
    setCustomStartDate(startDate)
    setCustomEndDate(endDate)
  }

  if (loading && !dashboardData) {
    return (
      <>
        <PageBreadcrumb subName="Dashboards" title="Sales" />
        <PageMetaData title="Sales" />
        <div className="text-center py-5">
          <Preloader />
          <p className="mt-3 text-muted">Loading sales data...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <PageBreadcrumb subName="Dashboards" title="Sales" />
      <PageMetaData title="Sales" />

      <DateFilter
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomDateChange={handleCustomDateChange}
      />

      {dashboardData && (
        <>
          <Stats
            totalSales={dashboardData.stats.totalSales}
            profit={dashboardData.stats.profit}
            salesGrowth={dashboardData.stats.salesGrowth}
          />
          <Row>
            <Col xxl={8}>
              <OverviewChart chartData={dashboardData.chartData} />
            </Col>
            <Col xxl={4}>
              <SalesByCategory categorySales={dashboardData.categorySales} />
            </Col>
          </Row>
          <Row>
            <Col xl={6}>
              <Accounts recentUsers={dashboardData.recentUsers} />
            </Col>
            <Col xl={6}>
              <Transactions transactions={dashboardData.transactions} />
            </Col>
          </Row>
          <Row>
            <Col>
              <RecentOrders orders={dashboardData.recentOrders} />
            </Col>
          </Row>
        </>
      )}
    </>
  )
}

export default SalesPage

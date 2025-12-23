import type { ApexOptions } from 'apexcharts'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, CardHeader, CardTitle, Table } from 'react-bootstrap'
import type { CategorySales } from '@/features/admin/api/analyticsApi'

interface SalesByCategoryProps {
  categorySales: CategorySales[]
}

const SalesByCategory = ({ categorySales }: SalesByCategoryProps) => {
  // Calculate total revenue for percentage calculation
  const totalRevenue = categorySales.reduce((sum, cat) => sum + cat.totalRevenue, 0)
  
  // Prepare chart data
  const chartSeries = categorySales.slice(0, 4).map((cat) => parseFloat((cat.totalRevenue / 1000).toFixed(2)))
  const chartLabels = categorySales.slice(0, 4).map((cat) => cat.categoryName || 'Uncategorized')
  const chartColors = ['#f9b931', '#ff86c8', '#4ecac2', '#7f56da', '#22c55e', '#ef4444']

  const chartOptions: ApexOptions = {
    chart: {
      height: 250,
      type: 'donut',
    },
    legend: {
      show: false,
      position: 'bottom',
      horizontalAlign: 'center',
      offsetX: 0,
      offsetY: -5,
      markers: {
        width: 9,
        height: 9,
        radius: 6,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 0,
      },
    },
    stroke: {
      width: 0,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '80%',
          labels: {
            show: true,
            total: {
              showAlways: true,
              show: true,
            },
          },
        },
      },
    },
    series: chartSeries.length > 0 ? chartSeries : [0],
    labels: chartLabels.length > 0 ? chartLabels : ['No Data'],
    colors: chartColors,
    dataLabels: {
      enabled: false,
    },
  }
  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <CardTitle>Sales By Category</CardTitle>
      </CardHeader>
      <CardBody>
        <div dir="ltr">
          <ReactApexChart height={250} options={chartOptions} series={chartOptions.series} type="donut" className="apex-charts" />
        </div>
        <div className="table-responsive mb-n1 mt-2">
          <Table borderless size="sm" className="table-nowrap table-centered mb-0">
            <thead className="bg-light bg-opacity-50 thead-sm">
              <tr>
                <th className="py-1">Category</th>
                <th className="py-1">Orders</th>
                <th className="py-1">Perc.</th>
              </tr>
            </thead>
            <tbody>
              {categorySales.length > 0 ? (
                categorySales.slice(0, 3).map((cat, idx) => {
                  const percentage = totalRevenue > 0 ? ((cat.totalRevenue / totalRevenue) * 100).toFixed(2) : '0.00'
                  return (
                    <tr key={idx}>
                      <td>{cat.categoryName || 'Uncategorized'}</td>
                      <td>{cat.totalOrders.toLocaleString()}</td>
                      <td>
                        {percentage}%
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={3} className="text-center text-muted">No category sales data available</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </CardBody>
    </Card>
  )
}

export default SalesByCategory

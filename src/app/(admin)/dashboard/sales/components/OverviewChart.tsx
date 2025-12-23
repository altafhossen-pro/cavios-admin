import type { ApexOptions } from 'apexcharts'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap'
import { currency } from '@/context/constants'
import type { ChartDataPoint } from '@/features/admin/api/analyticsApi'

interface OverviewChartProps {
  chartData: ChartDataPoint[]
}

const OverviewChart = ({ chartData }: OverviewChartProps) => {
  // Format chart data for ApexCharts
  const categories = chartData.map((item) => {
    const date = new Date(item._id.year, item._id.month - 1, item._id.day)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })
  
  const revenueData = chartData.map((item) => parseFloat((item.revenue / 1000).toFixed(2)))
  const ordersData = chartData.map((item) => item.orders)

  const chartOptions: ApexOptions = {
    series: [
      {
        name: 'Revenue',
        type: 'area',
        data: revenueData.length > 0 ? revenueData : [0],
      },
      {
        name: 'Orders',
        type: 'line',
        data: ordersData.length > 0 ? ordersData : [0],
      },
    ],
    chart: {
      height: 369,
      type: 'line',
      toolbar: {
        show: false,
      },
    },
    stroke: {
      dashArray: [0, 8],
      width: [2, 2],
      curve: 'smooth',
    },
    fill: {
      opacity: [1, 1],
      type: ['gradient', 'solid'],
      gradient: {
        type: 'vertical',
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 70],
      },
    },
    markers: {
      size: [0, 0, 0],
      strokeWidth: 2,
      hover: {
        size: 4,
      },
    },
    xaxis: {
      categories: categories.length > 0 ? categories : ['No Data'],
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      min: 0,
      labels: {
        formatter: function (val) {
          return val.toFixed(0) + 'k'
        },
      },
      axisBorder: {
        show: false,
      },
    },
    grid: {
      show: true,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: -2,
        bottom: 15,
        left: 15,
      },
    },
    legend: {
      show: true,
      horizontalAlign: 'center',
      offsetX: 0,
      offsetY: 5,
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
    plotOptions: {
      bar: {
        columnWidth: '30%',
        barHeight: '70%',
        borderRadius: 3,
      },
    },
    colors: ['#7f56da', '#22c55e'],
    tooltip: {
      shared: true,
      y: [
        {
          formatter: function (y) {
            if (typeof y !== 'undefined') {
              return currency + y.toFixed(2) + 'k'
            }
            return y
          },
        },
        {
          formatter: function (y) {
            if (typeof y !== 'undefined') {
              return y.toString()
            }
            return y
          },
        },
      ],
    },
  }
  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardBody>
        <div dir="ltr">
          <ReactApexChart height={369} options={chartOptions} series={chartOptions.series} type="line" className="apex-charts" />
        </div>
      </CardBody>
    </Card>
  )
}

export default OverviewChart

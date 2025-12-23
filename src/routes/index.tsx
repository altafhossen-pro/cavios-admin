import { lazy } from 'react'
import { Navigate, type RouteProps } from 'react-router-dom'

// Dashboard Routes
const Analytics = lazy(() => import('@/app/(admin)/dashboard/analytics/page'))
const Finance = lazy(() => import('@/app/(admin)/dashboard/finance/page'))
const Sales = lazy(() => import('@/app/(admin)/dashboard/sales/page'))

// Apps Routes
const EcommerceProducts = lazy(() => import('@/app/(admin)/ecommerce/products/NewProducts'))
const EcommerceProductDetails = lazy(() => import('@/app/(admin)/ecommerce/products/[productId]/page'))
const EcommerceProductCreate = lazy(() => import('@/app/(admin)/ecommerce/products/create/page'))
const EcommerceProductEdit = lazy(() => import('@/app/(admin)/ecommerce/products/[productId]/edit/page'))
const EcommerceCategories = lazy(() => import('@/app/(admin)/ecommerce/categories/NewCategories'))
const EcommerceCustomers = lazy(() => import('@/app/(admin)/ecommerce/customers/NewCustomers'))
const EcommerceStaff = lazy(() => import('@/app/(admin)/ecommerce/customers/NewStaff'))
const EcommerceOrders = lazy(() => import('@/app/(admin)/ecommerce/orders/NewOrders'))
const EcommerceOrderDetails = lazy(() => import('@/app/(admin)/ecommerce/orders/[orderId]/NewOrderDetail'))
const EcommerceInventory = lazy(() => import('@/app/(admin)/ecommerce/inventory/NewInventory'))
const ProductVariantsStock = lazy(() => import('@/app/(admin)/ecommerce/inventory/products/[productId]/variants/page'))
const Testimonials = lazy(() => import('@/app/(admin)/ecommerce/testimonials/page'))
const BannerCollections = lazy(() => import('@/app/(admin)/ecommerce/banner-collections/page'))
const BannerCountdowns = lazy(() => import('@/app/(admin)/ecommerce/banner-countdowns/page'))
const Blogs = lazy(() => import('@/app/(admin)/ecommerce/blogs/page'))
const BlogCreate = lazy(() => import('@/app/(admin)/ecommerce/blogs/create/page'))
const BlogEdit = lazy(() => import('@/app/(admin)/ecommerce/blogs/[blogId]/edit/page'))
const Comments = lazy(() => import('@/app/(admin)/ecommerce/comments/page'))
const StaticPages = lazy(() => import('@/app/(admin)/ecommerce/static-pages/page'))
const StaticPageCreate = lazy(() => import('@/app/(admin)/ecommerce/static-pages/create/page'))
const StaticPageEdit = lazy(() => import('@/app/(admin)/ecommerce/static-pages/[pageId]/edit/page'))
const Chat = lazy(() => import('@/app/(admin)/apps/chat/page'))
const Email = lazy(() => import('@/app/(admin)/apps/email/page'))
const Todo = lazy(() => import('@/app/(admin)/apps/todo/page'))
const Social = lazy(() => import('@/app/(admin)/apps/social/page'))
const Contacts = lazy(() => import('@/app/(admin)/apps/contacts/page'))
const Invoices = lazy(() => import('@/app/(admin)/invoices/page'))
const InvoiceDetails = lazy(() => import('@/app/(admin)/invoices/[invoiceId]/page'))

// Pages Routes
const Profile = lazy(() => import('@/app/(admin)/pages/profile/page'))
const ComingSoon = lazy(() => import('@/app/(other)/coming-soon/page'))
const Maintenance = lazy(() => import('@/app/(other)/maintenance/page'))
const Widgets = lazy(() => import('@/app/(admin)/widgets/page'))

// Base UI Routes
const Accordions = lazy(() => import('@/app/(admin)/ui/accordions/page'))
const Alerts = lazy(() => import('@/app/(admin)/ui/alerts/page'))
const Avatars = lazy(() => import('@/app/(admin)/ui/avatars/page'))
const Badges = lazy(() => import('@/app/(admin)/ui/badges/page'))
const Breadcrumb = lazy(() => import('@/app/(admin)/ui/breadcrumb/page'))
const Buttons = lazy(() => import('@/app/(admin)/ui/buttons/page'))
const Cards = lazy(() => import('@/app/(admin)/ui/cards/page'))
const Carousel = lazy(() => import('@/app/(admin)/ui/carousel/page'))
const Collapse = lazy(() => import('@/app/(admin)/ui/collapse/page'))
const Dropdowns = lazy(() => import('@/app/(admin)/ui/dropdowns/page'))
const ListGroup = lazy(() => import('@/app/(admin)/ui/list-group/page'))
const Modals = lazy(() => import('@/app/(admin)/ui/modals/page'))
const Tabs = lazy(() => import('@/app/(admin)/ui/tabs/page'))
const Offcanvas = lazy(() => import('@/app/(admin)/ui/offcanvas/page'))
const Pagination = lazy(() => import('@/app/(admin)/ui/pagination/page'))
const Placeholders = lazy(() => import('@/app/(admin)/ui/placeholders/page'))
const Popovers = lazy(() => import('@/app/(admin)/ui/popovers/page'))
const Progress = lazy(() => import('@/app/(admin)/ui/progress/page'))
const Spinners = lazy(() => import('@/app/(admin)/ui/spinners/page'))
const Toasts = lazy(() => import('@/app/(admin)/ui/toasts/page'))
const Tooltips = lazy(() => import('@/app/(admin)/ui/tooltips/page'))

// Advanced UI Routes
const Ratings = lazy(() => import('@/app/(admin)/advanced/ratings/page'))
const SweetAlerts = lazy(() => import('@/app/(admin)/advanced/alert/page'))
const Swiper = lazy(() => import('@/app/(admin)/advanced/swiper/page'))
const Scrollbar = lazy(() => import('@/app/(admin)/advanced/scrollbar/page'))
const Toastify = lazy(() => import('@/app/(admin)/advanced/toastify/page'))

// Charts and Maps Routes
const Area = lazy(() => import('@/app/(admin)/charts/area/page'))
const Bar = lazy(() => import('@/app/(admin)/charts/bar/page'))
const Bubble = lazy(() => import('@/app/(admin)/charts/bubble/page'))
const Candlestick = lazy(() => import('@/app/(admin)/charts/candlestick/page'))
const Column = lazy(() => import('@/app/(admin)/charts/column/page'))
const Heatmap = lazy(() => import('@/app/(admin)/charts/heatmap/page'))
const Line = lazy(() => import('@/app/(admin)/charts/line/page'))
const Mixed = lazy(() => import('@/app/(admin)/charts/mixed/page'))
const Timeline = lazy(() => import('@/app/(admin)/charts/timeline/page'))
const Boxplot = lazy(() => import('@/app/(admin)/charts/boxplot/page'))
const Treemap = lazy(() => import('@/app/(admin)/charts/treemap/page'))
const Pie = lazy(() => import('@/app/(admin)/charts/pie/page'))
const Radar = lazy(() => import('@/app/(admin)/charts/radar/page'))
const RadialBar = lazy(() => import('@/app/(admin)/charts/radial-bar/page'))
const Scatter = lazy(() => import('@/app/(admin)/charts/scatter/page'))
const Polar = lazy(() => import('@/app/(admin)/charts/polar/page'))
const GoogleMaps = lazy(() => import('@/app/(admin)/maps/google/page'))
const VectorMaps = lazy(() => import('@/app/(admin)/maps/vector/page'))

// Form Routes
const GridjsTable = lazy(() => import('@/app/(admin)/tables/gridjs/page'))

// Not Found Routes
const NotFoundAdmin = lazy(() => import('@/app/(admin)/not-found'))
const NotFound = lazy(() => import('@/app/(other)/(error-pages)/error-404/page'))
const NotFound2 = lazy(() => import('@/app/(other)/(error-pages)/error-404-2/page'))

// Auth Routes
const AuthSignIn = lazy(() => import('@/app/(other)/auth/sign-in/page'))
const AuthSignIn2 = lazy(() => import('@/app/(other)/auth/sign-in-2/page'))
const AuthSignUp = lazy(() => import('@/app/(other)/auth/sign-up/page'))
const AuthSignUp2 = lazy(() => import('@/app/(other)/auth/sign-up-2/page'))
const ResetPassword = lazy(() => import('@/app/(other)/auth/reset-pass/page'))
const ResetPassword2 = lazy(() => import('@/app/(other)/auth/reset-pass-2/page'))
const LockScreen = lazy(() => import('@/app/(other)/auth/lock-screen/page'))
const LockScreen2 = lazy(() => import('@/app/(other)/auth/lock-screen-2/page'))

export type RoutesProps = {
  path: RouteProps['path']
  name: string
  element: RouteProps['element']
  exact?: boolean
}

const initialRoutes: RoutesProps[] = [
  {
    path: '/',
    name: 'root',
    element: <Navigate to="/dashboard/finance" />,
  },
  {
    path: '*',
    name: 'not-found',
    element: <NotFound />,
  },
]

const generalRoutes: RoutesProps[] = [
  {
    path: '/dashboard/analytics',
    name: 'Analytics',
    element: <Analytics />,
  },
  {
    path: '/dashboard/finance',
    name: 'Finance',
    element: <Finance />,
  },
  {
    path: '/dashboard/sales',
    name: 'Sales',
    element: <Sales />,
  },
]

const appsRoutes: RoutesProps[] = [
  {
    name: 'Products',
    path: '/products',
    element: <EcommerceProducts />,
  },
  {
    name: 'Create Product',
    path: '/products/create',
    element: <EcommerceProductCreate />,
  },
  {
    name: 'Edit Product',
    path: '/products/:productId/edit',
    element: <EcommerceProductEdit />,
  },
  {
    name: 'Product Details',
    path: '/products/:productId',
    element: <EcommerceProductDetails />,
  },
  {
    name: 'Categories',
    path: '/categories',
    element: <EcommerceCategories />,
  },
  {
    name: 'Customers',
    path: '/customers',
    element: <EcommerceCustomers />,
  },
  {
    name: 'Staff',
    path: '/staff',
    element: <EcommerceStaff />,
  },
  {
    name: 'Orders',
    path: '/ecommerce/orders',
    element: <EcommerceOrders />,
  },
  {
    name: 'Order Details',
    path: '/ecommerce/orders/:orderId',
    element: <EcommerceOrderDetails />,
  },
  {
    name: 'Inventory',
    path: '/inventory',
    element: <EcommerceInventory />,
  },
  {
    name: 'Product Variants Stock',
    path: '/inventory/products/:productId/variants',
    element: <ProductVariantsStock />,
  },
  {
    name: 'Testimonials',
    path: '/ecommerce/testimonials',
    element: <Testimonials />,
  },
  {
    name: 'Banner Collections',
    path: '/ecommerce/banner-collections',
    element: <BannerCollections />,
  },
  {
    name: 'Banner Countdowns',
    path: '/ecommerce/banner-countdowns',
    element: <BannerCountdowns />,
  },
  {
    name: 'Blogs',
    path: '/ecommerce/blogs',
    element: <Blogs />,
  },
  {
    name: 'Create Blog',
    path: '/ecommerce/blogs/create',
    element: <BlogCreate />,
  },
  {
    name: 'Edit Blog',
    path: '/ecommerce/blogs/:blogId/edit',
    element: <BlogEdit />,
  },
  {
    name: 'Comments',
    path: '/ecommerce/comments',
    element: <Comments />,
  },
  {
    name: 'Static Pages',
    path: '/ecommerce/static-pages',
    element: <StaticPages />,
  },
  {
    name: 'Create Static Page',
    path: '/ecommerce/static-pages/create',
    element: <StaticPageCreate />,
  },
  {
    name: 'Edit Static Page',
    path: '/ecommerce/static-pages/:pageId/edit',
    element: <StaticPageEdit />,
  },
  {
    name: 'Chat',
    path: '/apps/chat',
    element: <Chat />,
  },
  {
    name: 'Email',
    path: '/apps/email',
    element: <Email />,
  },
  {
    name: 'Todo',
    path: '/apps/todo',
    element: <Todo />,
  },
  {
    name: 'Social',
    path: '/apps/social',
    element: <Social />,
  },
  {
    name: 'Contacts',
    path: '/apps/contacts',
    element: <Contacts />,
  },
  {
    name: 'Invoices List',
    path: '/invoices',
    element: <Invoices />,
  },
  {
    name: 'Invoices Details',
    path: '/invoices/:invoiceId',
    element: <InvoiceDetails />,
  },
]

const customRoutes: RoutesProps[] = [
  {
    name: 'Profile',
    path: '/pages/profile',
    element: <Profile />,
  },
  {
    name: 'Error 404 Alt',
    path: '/pages/error-404-alt',
    element: <NotFoundAdmin />,
  },
  {
    name: 'Widgets',
    path: '/widgets',
    element: <Widgets />,
  },
]

const baseUIRoutes: RoutesProps[] = [
  {
    name: 'Accordions',
    path: '/ui/accordions',
    element: <Accordions />,
  },
  {
    name: 'Alerts',
    path: '/ui/alerts',
    element: <Alerts />,
  },
  {
    name: 'Avatars',
    path: '/ui/avatars',
    element: <Avatars />,
  },
  {
    name: 'Badges',
    path: '/ui/badges',
    element: <Badges />,
  },
  {
    name: 'Breadcrumb',
    path: '/ui/breadcrumb',
    element: <Breadcrumb />,
  },
  {
    name: 'Buttons',
    path: '/ui/buttons',
    element: <Buttons />,
  },
  {
    name: 'Cards',
    path: '/ui/cards',
    element: <Cards />,
  },
  {
    name: 'Carousel',
    path: '/ui/carousel',
    element: <Carousel />,
  },
  {
    name: 'Collapse',
    path: '/ui/collapse',
    element: <Collapse />,
  },
  {
    name: 'Dropdowns',
    path: '/ui/dropdowns',
    element: <Dropdowns />,
  },
  {
    name: 'List Group',
    path: '/ui/list-group',
    element: <ListGroup />,
  },
  {
    name: 'Modals',
    path: '/ui/modals',
    element: <Modals />,
  },
  {
    name: 'Tabs',
    path: '/ui/tabs',
    element: <Tabs />,
  },
  {
    name: 'Offcanvas',
    path: '/ui/offcanvas',
    element: <Offcanvas />,
  },
  {
    name: 'Pagination',
    path: '/ui/pagination',
    element: <Pagination />,
  },
  {
    name: 'Placeholders',
    path: '/ui/placeholders',
    element: <Placeholders />,
  },
  {
    name: 'Popovers',
    path: '/ui/popovers',
    element: <Popovers />,
  },
  {
    name: 'Progress',
    path: '/ui/progress',
    element: <Progress />,
  },
  {
    name: 'Spinners',
    path: '/ui/spinners',
    element: <Spinners />,
  },
  {
    name: 'Toasts',
    path: '/ui/toasts',
    element: <Toasts />,
  },
  {
    name: 'Tooltips',
    path: '/ui/tooltips',
    element: <Tooltips />,
  },
]

const advancedUIRoutes: RoutesProps[] = [
  {
    name: 'Ratings',
    path: '/advanced/ratings',
    element: <Ratings />,
  },
  {
    name: 'Sweet Alert',
    path: '/advanced/alert',
    element: <SweetAlerts />,
  },
  {
    name: 'Swiper Slider',
    path: '/advanced/swiper',
    element: <Swiper />,
  },
  {
    name: 'Scrollbar',
    path: '/advanced/scrollbar',
    element: <Scrollbar />,
  },
  {
    name: 'Toastify',
    path: '/advanced/toastify',
    element: <Toastify />,
  },
]

const chartsNMapsRoutes: RoutesProps[] = [
  {
    name: 'Area',
    path: '/charts/area',
    element: <Area />,
  },
  {
    name: 'Bar',
    path: '/charts/bar',
    element: <Bar />,
  },
  {
    name: 'Bubble',
    path: '/charts/bubble',
    element: <Bubble />,
  },
  {
    name: 'Candle Stick',
    path: '/charts/candlestick',
    element: <Candlestick />,
  },
  {
    name: 'Column',
    path: '/charts/column',
    element: <Column />,
  },
  {
    name: 'Heatmap',
    path: '/charts/heatmap',
    element: <Heatmap />,
  },
  {
    name: 'Line',
    path: '/charts/line',
    element: <Line />,
  },
  {
    name: 'Mixed',
    path: '/charts/mixed',
    element: <Mixed />,
  },
  {
    name: 'Timeline',
    path: '/charts/timeline',
    element: <Timeline />,
  },
  {
    name: 'Boxplot',
    path: '/charts/boxplot',
    element: <Boxplot />,
  },
  {
    name: 'Treemap',
    path: '/charts/treemap',
    element: <Treemap />,
  },
  {
    name: 'Pie',
    path: '/charts/pie',
    element: <Pie />,
  },
  {
    name: 'Radar',
    path: '/charts/radar',
    element: <Radar />,
  },
  {
    name: 'Radial Bar',
    path: '/charts/radial-bar',
    element: <RadialBar />,
  },
  {
    name: 'Scatter',
    path: '/charts/scatter',
    element: <Scatter />,
  },
  {
    name: 'Polar Area',
    path: '/charts/polar',
    element: <Polar />,
  },
  {
    name: 'Google',
    path: '/maps/google',
    element: <GoogleMaps />,
  },
  {
    name: 'Vector',
    path: '/maps/vector',
    element: <VectorMaps />,
  },
]

const formsRoutes: RoutesProps[] = []

const tableRoutes: RoutesProps[] = [
  {
    name: 'Grid JS',
    path: '/tables/gridjs',
    element: <GridjsTable />,
  },
]

const iconRoutes: RoutesProps[] = []

export const authRoutes: RoutesProps[] = [
  {
    path: '/auth/sign-in',
    name: 'Sign In',
    element: <AuthSignIn />,
  },
  {
    name: 'Sign In 2',
    path: '/auth/sign-in-2',
    element: <AuthSignIn2 />,
  },
  {
    name: 'Sign Up',
    path: '/auth/sign-up',
    element: <AuthSignUp />,
  },
  {
    name: 'Sign Up 2',
    path: '/auth/sign-up-2',
    element: <AuthSignUp2 />,
  },
  {
    name: 'Reset Password',
    path: '/auth/reset-pass',
    element: <ResetPassword />,
  },
  {
    name: 'Reset Password 2',
    path: '/auth/reset-pass-2',
    element: <ResetPassword2 />,
  },
  {
    name: 'Lock Screen',
    path: '/auth/lock-screen',
    element: <LockScreen />,
  },
  {
    name: 'Lock Screen 2',
    path: '/auth/lock-screen-2',
    element: <LockScreen2 />,
  },
  {
    name: '404 Error',
    path: '/error-404',
    element: <NotFound />,
  },
  {
    name: 'Maintenance',
    path: '/maintenance',
    element: <Maintenance />,
  },
  {
    name: '404 Error 2',
    path: '/error-404-2',
    element: <NotFound2 />,
  },
  {
    name: 'Coming Soon',
    path: '/coming-soon',
    element: <ComingSoon />,
  },
]

export const appRoutes = [
  ...initialRoutes,
  ...generalRoutes,
  ...appsRoutes,
  ...customRoutes,
  ...baseUIRoutes,
  ...advancedUIRoutes,
  ...chartsNMapsRoutes,
  ...formsRoutes,
  ...tableRoutes,
  ...iconRoutes,
  ...authRoutes,
]

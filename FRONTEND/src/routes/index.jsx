import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from '../App'

const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const SignUp = lazy(() => import("../pages/SignUp"));
const AdminPanel = lazy(() => import("../pages/AdminPanel"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const CategoryManagement = lazy(() => import("../pages/CategoryManagement"));
const AllUsers = lazy(() => import("../pages/AllUsers"));
const Customers = lazy(() => import("../pages/Customers"));
const Analytics = lazy(() => import("../pages/Analytics"));
const AllProducts = lazy(() => import("../pages/AllProducts"));
const Orders = lazy(() => import("../pages/Orders"));
const Settings = lazy(() => import("../pages/Settings"));
const CategoryProduct = lazy(() => import("../pages/CategoryProduct"));
const CategoryBrand = lazy(() => import("../pages/CategoryBrand"));
const ProductDetails = lazy(() => import("../pages/ProductDetails"));
const Cart = lazy(() => import("../pages/Cart"));
const SearchProduct = lazy(() => import("../pages/SearchProduct"));
const Wishlist = lazy(() => import("../pages/Wishlist"));
const CustomerLayout = lazy(() => import("../pages/CustomerLayout"));
const CustomerDashboard = lazy(() => import("../pages/CustomerDashboard"));
const CustomerOrders = lazy(() => import("../pages/CustomerOrders"));
const CustomerProfile = lazy(() => import("../pages/CustomerProfile"));
const CustomerAddresses = lazy(() => import("../pages/CustomerAddresses"));
const CustomerPaymentMethods = lazy(() => import("../pages/CustomerPaymentMethods"));
const CustomerSecurity = lazy(() => import("../pages/CustomerSecurity"));
const Help = lazy(() => import("../pages/Help"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("../pages/TermsConditions"));
const CookiePolicy = lazy(() => import("../pages/CookiePolicy"));
const ReportProduct = lazy(() => import("../pages/ReportProduct"));
const BecomeVendor = lazy(() => import("../pages/BecomeVendor"));
const VendorPanel = lazy(() => import("../pages/VendorPanel"));
const VendorDashboard = lazy(() => import("../pages/VendorDashboard"));
const VendorProducts = lazy(() => import("../pages/VendorProducts"));
const VendorOrders = lazy(() => import("../pages/VendorOrders"));
const VendorWallet = lazy(() => import("../pages/VendorWallet"));
const VendorSettings = lazy(() => import("../pages/VendorSettings"));
const VendorAnalytics = lazy(() => import("../pages/VendorAnalytics"));
const VendorApplications = lazy(() => import("../pages/VendorApplications"));

const Loading = () => <div className="min-h-screen flex items-center justify-center">Loading...</div>;

const router = createBrowserRouter([
    {
        path : "/",
        element : <App/>,
        children : [
            {
                path : "",
                element : <Home/>
            },
            {
                path : "login",
                element : <Login/>
            },
            {
                path : "forgot-password",
                element : <ForgotPassword/>
            },
            {
                path : "sign-up",
                element : <SignUp/>
            },
            {
                path : "brand-category/:brandName",
                element : <CategoryBrand/>
            },
            {
                path : "product-category",
                element : <CategoryProduct/>
            },   
            {
               path : "product/:id",
               element : <ProductDetails/>
            },
            {
                path : "cart",
                element : <Cart/>
            },
            {
                path : "search",
                element : <SearchProduct/>
            },
            {
                path : "help",
                element : <Help/>
            },
            {
                path : "privacy-policy",
                element : <PrivacyPolicy/>
            },
            {
                path : "terms",
                element : <TermsConditions/>
            },
            {
                path : "cookies",
                element : <CookiePolicy/>
            },
            {
                path : "report-product",
                element : <ReportProduct/>
            },
            {
                path : "search/:keyword",
                element : <SearchProduct/>
            },
            {
                path : "search/:keyword/:category",
                element : <SearchProduct/>
            },
            {
                path : "search/:keyword/:category/:brand",
                element : <SearchProduct/>
            },
            {
                path : "wishlist",
                element : <Wishlist/>
            },
            {
                path : "my-account",
                element : <CustomerLayout/>,
                children : [
                    {
                        path : "",
                        element : <CustomerDashboard/>
                    },
                    {
                        path : "orders",
                        element : <CustomerOrders/>
                    },
                    {
                        path : "profile",
                        element : <CustomerProfile/>
                    },
                    {
                        path : "addresses",
                        element : <CustomerAddresses/>
                    },
                    {
                        path : "payment-methods",
                        element : <CustomerPaymentMethods/>
                    },
                    {
                        path : "security",
                        element : <CustomerSecurity/>
                    }
                ]
            },
            {
                path : "orders",
                element : <CustomerLayout/>,
                children : [
                    {
                        path : "",
                        element : <CustomerOrders/>
                    }
                ]
            },
            {
                path : "become-vendor",
                element : <BecomeVendor/>
            },
            {
                path : "vendor-panel",
                element : <VendorPanel/>,
                children : [
                    {
                        path : "",
                        element : <VendorDashboard/>
                    },
                    {
                        path : "products",
                        element : <VendorProducts/>
                    },
                    {
                        path : "orders",
                        element : <VendorOrders/>
                    },
                    {
                        path : "wallet",
                        element : <VendorWallet/>
                    },
                    {
                        path : "settings",
                        element : <VendorSettings/>
                    },
                    {
                        path : "analytics",
                        element : <VendorAnalytics/>
                    }
                ]
            },
            {
                path : "admin-panel",
                element : <AdminPanel/>,
                children : [
                    {
                        path : "",
                        element : <Dashboard/>
                    },
                    {
                        path : "all-users",
                        element : <AllUsers/>
                    },
                    {
                        path : "customers",
                        element : <Customers/>
                    },
                    {
                        path : "analytics",
                        element : <Analytics/>
                    },
                    {
                        path : "all-products",
                        element : <AllProducts/>
                    },
                    {
                        path : "categories",
                        element : <CategoryManagement/>
                    },
                    {
                        path : "orders",
                        element : <Orders/>
                    },
                    {
                        path : "settings",
                        element : <Settings/>
                    },
                    {
                        path : "vendor-applications",
                        element : <VendorApplications/>
                    }
                ]
            },
        ]
    }
])


export default router

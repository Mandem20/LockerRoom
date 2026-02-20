import { createBrowserRouter } from "react-router-dom";
import App from '../App'
import Home from "../pages/Home";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import SignUp from "../pages/SignUp";
import AdminPanel from "../pages/AdminPanel";
import Dashboard from "../pages/Dashboard";
import CategoryManagement from "../pages/CategoryManagement";
import AllUsers from "../pages/AllUsers";
import Customers from "../pages/Customers";
import Analytics from "../pages/Analytics";
import AllProducts from "../pages/AllProducts";
import Orders from "../pages/Orders";
import Settings from "../pages/Settings";
import CategoryProduct from "../pages/CategoryProduct";
import CategoryBrand from "../pages/CategoryBrand";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";
import SearchProduct from "../pages/SearchProduct";
import Wishlist from "../pages/Wishlist";
import CustomerLayout from "../pages/CustomerLayout";
import CustomerDashboard from "../pages/CustomerDashboard";
import CustomerOrders from "../pages/CustomerOrders";
import CustomerProfile from "../pages/CustomerProfile";
import CustomerAddresses from "../pages/CustomerAddresses";
import CustomerPaymentMethods from "../pages/CustomerPaymentMethods";
import CustomerSecurity from "../pages/CustomerSecurity";

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
                    }
                ]
            },
        ]
    }
])


export default router

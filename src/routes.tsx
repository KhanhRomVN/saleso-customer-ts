import EmailPage from "./pages/RegisterPage";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import ProductPage from "./pages/ProductPage";
import WishlistPage from "./pages/WishlistPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import SettingPage from "./pages/SettingPage";

// Layout Component
import DefaultLayout from "@/layout/defaultLayout";

const publicRoutes = [
  {
    path: "/register",
    element: <EmailPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <DefaultLayout>
        <HomePage />
      </DefaultLayout>
    ),
  },
  {
    path: "/product/:product_id",
    element: (
      <DefaultLayout>
        <ProductPage />
      </DefaultLayout>
    ),
  },
  {
    path: "/wishlist",
    element: (
      <DefaultLayout>
        <WishlistPage />
      </DefaultLayout>
    ),
  },
  {
    path: "/cart",
    element: (
      <DefaultLayout>
        <CartPage />
      </DefaultLayout>
    ),
  },
  {
    path: "/checkout",
    element: (
      <DefaultLayout>
        <CheckoutPage />
      </DefaultLayout>
    ),
  },
  {
    path: "/order-success",
    element: (
      <DefaultLayout>
        <OrderSuccessPage />
      </DefaultLayout>
    ),
  },
  {
    path: "/setting",
    element: (
      <DefaultLayout>
        <SettingPage />
      </DefaultLayout>
    ),
  },
];

export { publicRoutes };

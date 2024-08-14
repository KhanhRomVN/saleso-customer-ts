// Public Page
import HomePage from "@/pages/HomePage";

// Auth Page
import EmailPage from "./pages/RegisterPage";
import LoginPage from "@/pages/LoginPage";

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
];

export { publicRoutes };

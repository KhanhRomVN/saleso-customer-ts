import { Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  BarChart,
  Store,
  DollarSign,
  CreditCard,
  RefreshCcw,
  Receipt,
  RotateCcw,
  Bell,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    category: "Main Menu",
    items: [
      {
        text: "Overview",
        path: "/",
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
      {
        text: "Analytics",
        path: "/analytics",
        icon: <BarChart className="h-4 w-4" />,
      },
      {
        text: "Product",
        path: "/product/management",
        icon: <Store className="h-4 w-4" />,
      },
      {
        text: "Discount",
        path: "/discount",
        icon: <DollarSign className="h-4 w-4" />,
      },
    ],
  },
  {
    category: "Transaction",
    items: [
      {
        text: "Payment",
        path: "/payment",
        icon: <CreditCard className="h-4 w-4" />,
      },
      {
        text: "Refunds",
        path: "/refunds",
        icon: <RefreshCcw className="h-4 w-4" />,
      },
      {
        text: "Invoices",
        path: "/invoices",
        icon: <Receipt className="h-4 w-4" />,
      },
      {
        text: "Returns",
        path: "/returns",
        icon: <RotateCcw className="h-4 w-4" />,
      },
    ],
  },
  {
    category: "General",
    items: [
      {
        text: "Notification",
        path: "/notification",
        icon: <Bell className="h-4 w-4" />,
      },
      {
        text: "Feedback",
        path: "/feedback",
        icon: <MessageSquare className="h-4 w-4" />,
      },
      {
        text: "Setting",
        path: "/setting",
        icon: <Settings className="h-4 w-4" />,
      },
    ],
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div className="box-border bg-background_secondary flex flex-col fixed inset-y-0 left-0 z-50 w-[230px]">
      <div className="h-[61px] flex items-center pl-4">
        <img
          src="https://i.ibb.co/CMSJMK3/Brandmark-make-your-logo-in-minutes-removebg-preview.png"
          alt="logo"
          className="object-cover h-3/5"
        />
      </div>

      <Separator />
      <div className="flex h-[calc(100%-61px)]">
        <ScrollArea className="flex flex-col justify-between h-full relative box-border p-3.5 flex-grow">
          <div>
            {menuItems.map((menuItem, index) => (
              <div key={index}>
                <h6 className={`text-xs ${index !== 0 ? "mt-2.5" : "mt-0"}`}>
                  {menuItem.category}
                </h6>
                {menuItem.items.map((item, subIndex) => (
                  <Button
                    key={subIndex}
                    variant="ghost"
                    className={`w-full justify-start px-4 py-1 my-0.5 ${
                      location.pathname === item.path
                        ? "bg-primary text-primary-foreground"
                        : ""
                    }`}
                    asChild
                  >
                    <Link to={item.path}>
                      {item.icon}
                      <span className="ml-2 text-sm">{item.text}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            ))}
          </div>
          <div>
            <Separator className="my-2" />
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-1"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="text-sm">Logout</span>
            </Button>
          </div>
        </ScrollArea>
        <Separator orientation="vertical" />
      </div>
    </div>
  );
};

export default Sidebar;

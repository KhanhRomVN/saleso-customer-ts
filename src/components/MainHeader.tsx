import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Bell,
  Heart,
  ShoppingCart,
  User,
  Settings,
  Moon,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";

interface User {
  user_id: string;
  username: string;
  role: string;
}

const MainHeader: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-background_secondary shadow-md h-16"
    >
      <div className="mx-auto h-full">
        <div className="flex justify-between items-center h-full px-8">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            onClick={() => handleNavigation("/")}
            style={{ cursor: "pointer" }}
          >
            <img
              src="https://i.ibb.co/CMSJMK3/Brandmark-make-your-logo-in-minutes-removebg-preview.png"
              alt="Logo"
              className="h-8 w-auto"
            />
          </motion.div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                placeholder="Search..."
                className="pl-10 w-full max-w-md transition-all duration-300 focus:ring-2 focus:ring-primary"
                value={searchText}
                onChange={handleSearchChange}
              />
            </div>
            <NotificationDropdown />
            <AnimatedIconButton
              icon={<Heart size={20} />}
              onClick={() => handleNavigation("/wishlist")}
            />
            <AnimatedIconButton
              icon={<ShoppingCart size={20} />}
              onClick={() => handleNavigation("/cart")}
            />
            {currentUser && <UserDropdown currentUser={currentUser} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AnimatedIconButton: React.FC<{
  icon: React.ReactNode;
  onClick?: () => void;
}> = ({ icon, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.2 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
  >
    <Button
      variant="ghost"
      size="icon"
      className="text-gray-600 hover:text-primary"
    >
      {icon}
    </Button>
  </motion.div>
);

const NotificationDropdown: React.FC = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-primary"
        >
          <Bell size={20} />
        </Button>
      </motion.div>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-64">
      <DropdownMenuItem>New message 1</DropdownMenuItem>
      <DropdownMenuItem>New message 2</DropdownMenuItem>
      <DropdownMenuItem>New message 3</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const UserDropdown: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Implement logout logic here
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.1 }}>
          <Button
            variant="ghost"
            className="relative h-8 w-8 rounded-full overflow-hidden"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src="/api/placeholder/40/40"
                alt={currentUser.username}
              />
              <AvatarFallback>{currentUser.username[0]}</AvatarFallback>
            </Avatar>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background_secondary">
        <DropdownMenuItem onClick={() => navigate("/setting")}>
          <User className="mr-2 h-4 w-4" />
          <span>My Account</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/setting")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Moon className="mr-2 h-4 w-4" />
          <span>Change Theme</span>
        </DropdownMenuItem>
        <Separator />
        <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MainHeader;

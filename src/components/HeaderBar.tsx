import React, { useState, useEffect } from "react";
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

const HeaderBar: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full fixed top-0 z-50 bg-background_secondary shadow-md"
    >
      <div className="mx-auto">
        <div className="flex justify-between items-center h-16 px-8">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
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
            <AnimatedIconButton icon={<Bell size={20} />} />
            <AnimatedIconButton icon={<Heart size={20} />} />
            <AnimatedIconButton icon={<ShoppingCart size={20} />} />
            {currentUser && (
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
                        <AvatarFallback>
                          {currentUser.username[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>My Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Change Theme</span>
                  </DropdownMenuItem>
                  <Separator />
                  <DropdownMenuItem className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AnimatedIconButton: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
  <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
    <Button
      variant="ghost"
      size="icon"
      className="text-gray-600 hover:text-primary"
    >
      {icon}
    </Button>
  </motion.div>
);

export default HeaderBar;

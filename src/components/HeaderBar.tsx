import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Search, Keyboard } from "lucide-react";

interface User {
  username: string;
  role: string;
}

const HeaderBar: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState<string>("");

  useEffect(() => {
    const userString = localStorage.getItem("currentUser");
    if (userString) {
      const user: User = JSON.parse(userString);
      setCurrentUser(user);
    }
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  return (
    <div className="w-full fixed top-0 pl-[230px] z-50 flex">
      <Separator orientation="vertical" className="h-full" />
      <div className="flex-grow">
        <div className="bg-[#1a1d1f] flex justify-between h-[61px] items-center px-5">
          <div className="flex items-center bg-background p-1 rounded-lg w-[400px] max-w-[50%]">
            <Search className="text-muted-foreground mr-2" size={20} />
            <Input
              placeholder="Search info for you..."
              className="border-none bg-transparent text-white text-sm placeholder:text-muted-foreground flex-grow"
              value={searchText}
              onChange={handleSearchChange}
            />
            {searchText === "" && (
              <div className="flex items-center text-gray-500 gap-1 ml-5">
                <Keyboard size={16} />
                <span className="text-xs text-center">+ F</span>
              </div>
            )}
          </div>
          {currentUser && (
            <div className="flex items-center">
              <Avatar className="w-8 h-8 mr-2 rounded-lg">
                <AvatarImage
                  src="/api/placeholder/40/40"
                  alt={currentUser.username}
                />
                <AvatarFallback>{currentUser.username[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-white text-sm">
                  {currentUser.username}
                </span>
                <span className="text-gray-500 text-xs">
                  {currentUser.role}
                </span>
              </div>
            </div>
          )}
        </div>
        <Separator />
        <div></div>
      </div>
    </div>
  );
};

export default HeaderBar;

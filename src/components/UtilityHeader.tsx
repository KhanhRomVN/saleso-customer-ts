import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const UtilityHeader: React.FC = () => {
  return (
    <div className="bg-primary text-primary-foreground h-4 px-2 w-full">
      <div className="container mx-auto flex justify-between items-center h-full">
        <div className="text-xs">Free Shipping On All Orders Over $250</div>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground h-4 px-2 py-0 text-xs"
              >
                Eng <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>English</DropdownMenuItem>
              <DropdownMenuItem>Español</DropdownMenuItem>
              <DropdownMenuItem>Français</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground h-4 px-2 py-0 text-xs"
          >
            FAQs
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground h-4 px-2 py-0 text-xs"
          >
            Need Help
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UtilityHeader;

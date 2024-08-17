import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const SettingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("account");

  const tabs = [
    { id: "account", label: "Account", icon: "👤" },
    { id: "address", label: "Address", icon: "🏠" },
    { id: "orders", label: "Orders", icon: "📦" },
    { id: "payment", label: "Payment", icon: "💳" },
    { id: "message", label: "Message", icon: "✉️" },
    { id: "other", label: "Other", icon: "⚙️" },
  ];

  const contentComponents = {
    account: AccountContent,
    address: AddressContent,
    orders: OrderContent,
    payment: PaymentContent,
    message: MessageContent,
    other: OtherContent,
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-3xl ml-4 font-bold">Setting</p>
      <Tabs
        orientation="horizontal"
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col md:flex-row flex-grow h-screen"
      >
        <div className="w-[15%] pt-[100px]">
          <TabsList className="flex flex-col bg-transparent items-start">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex justify-start"
              >
                <span className="mr-2 text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="w-[85%] bg-background_secondary rounded-lg shadow-lg">
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {React.createElement(contentComponents[tab.id])}
              </motion.div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};
const AccountContent = () => {
  return <div>Account</div>;
};

const AddressContent = () => {
  return <div>Address</div>;
};

const OrderContent = () => {
  return <div>Order</div>;
};

const PaymentContent = () => {
  return <div>PaymentContent</div>;
};

const MessageContent = () => {
  return <div>MessageContent</div>;
};

const OtherContent = () => {
  return <div>OtherContent</div>;
};

export default SettingPage;

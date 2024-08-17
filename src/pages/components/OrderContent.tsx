import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BACKEND_URI } from "@/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  DollarSign,
  ShoppingCart,
} from "lucide-react";

interface Order {
  _id: string;
  product_id: string;
  quantity: number;
  price: number;
  total: string;
  discount_id: string;
  shipping_address: string;
  shipping_fee: number;
  payment_method: "postpaid" | "prepaid";
  payment_status: "paid" | "unpaid";
  customer_id: string;
  seller_id: string;
  order_status: "pending" | "accepted" | "refused";
  return_order?: string;
  name: string;
  image: string;
}

const OrderContent: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("Pending");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get(`${BACKEND_URI}/order`, {
          headers: { accessToken },
        });
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  const filterOrders = (status: string) => {
    return orders.filter((order) => {
      switch (status) {
        case "Pending":
          return order.order_status === "pending";
        case "In delivering":
          return (
            order.order_status === "accepted" &&
            order.payment_status === "unpaid"
          );
        case "Successful":
          return (
            order.order_status === "accepted" && order.payment_status === "paid"
          );
        case "Refuse":
          return order.order_status === "refused" || order.return_order;
        default:
          return false;
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Package className="w-6 h-6 text-yellow-500" />;
      case "In delivering":
        return <Truck className="w-6 h-6 text-blue-500" />;
      case "Successful":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "Refuse":
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return null;
    }
  };

  const renderOrderCard = (order: Order) => (
    <motion.div
      key={order._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-4 hover:shadow-lg transition-shadow duration-300 bg-background">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order ID: {order._id}</span>
            {getStatusIcon(activeTab)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <img
              src={order.image}
              alt={order.name}
              className="w-16 h-16 object-cover rounded-md mr-4"
            />
            <div>
              <h3 className="font-semibold">{order.name}</h3>
              <p className="text-sm text-gray-600">
                Product ID: {order.product_id}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p className="flex items-center">
              <ShoppingCart className="w-4 h-4 mr-2" /> Quantity:{" "}
              {order.quantity}
            </p>
            <p className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2" /> Total: ${order.total}
            </p>
            <p>Status: {order.order_status}</p>
            <p>Payment: {order.payment_status}</p>
          </div>
          {order.return_order && (
            <p className="mt-2 text-red-500">
              Return Reason: {order.return_order}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="Pending" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          {["Pending", "In delivering", "Successful", "Refuse"].map(
            (status) => (
              <TabsTrigger
                key={status}
                value={status}
                className="flex items-center justify-center py-2"
              >
                {getStatusIcon(status)}
                <span className="ml-2">{status}</span>
              </TabsTrigger>
            )
          )}
        </TabsList>
        {["Pending", "In delivering", "Successful", "Refuse"].map((status) => (
          <TabsContent key={status} value={status}>
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              {getStatusIcon(status)}
              <span className="ml-2">{status} Orders</span>
            </h2>
            <AnimatePresence>
              <div className="space-y-4">
                {filterOrders(status).map(renderOrderCard)}
              </div>
            </AnimatePresence>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default OrderContent;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Truck,
  CreditCard,
  Tag,
  ChevronRight,
  Package,
} from "lucide-react";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [checkoutData, setCheckoutData] = useState({ items: [] });
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState("");
  const [discounts, setDiscounts] = useState([]);
  const [appliedDiscounts, setAppliedDiscounts] = useState({});

  const shippingAddresses = [
    "123 Main St, Anytown, USA",
    "456 Elm St, Somewhere, USA",
  ];

  const paymentMethods = ["Pay now", "Pay on delivery"];

  useEffect(() => {
    const storedData = localStorage.getItem("checkoutData");
    if (storedData) {
      setCheckoutData(JSON.parse(storedData));
    }
  }, []);

  const calculateItemTotal = (item) => {
    const shipping_fee = 20;
    let total = item.price * item.quantity + shipping_fee;
    const discount = appliedDiscounts[item.product_id];
    if (discount) {
      if (discount.type === "flash-sale" || discount.type === "percentage") {
        total -= total * (discount.value / 100);
      } else if (discount.type === "fixed") {
        total -= discount.value;
      } else if (discount.type === "buy-x-get-y") {
        const { buyQuantity, getFreeQuantity } = discount.value;
        const sets = Math.floor(item.quantity / buyQuantity);
        const freeItems = Math.min(
          sets * getFreeQuantity,
          item.stock - item.quantity
        );
        total = (item.quantity + freeItems) * item.price;
      }
    }
    return Math.max(total, 0);
  };

  const calculateTotal = () => {
    return (
      checkoutData.items.reduce(
        (acc, item) => acc + calculateItemTotal(item),
        0
      ) +
      checkoutData.items.length * 20
    );
  };

  const handleApplyDiscount = async (productId) => {
    setCurrentProductId(productId);
    try {
      const response = await axios.get(
        `http://localhost:8080/discount/by-product/${productId}`
      );
      setDiscounts(response.data);
      setDiscountDialogOpen(true);
    } catch (error) {
      console.error("Error fetching discounts:", error);
    }
  };

  const handleSelectDiscount = (discount) => {
    setAppliedDiscounts((prev) => ({
      ...prev,
      [currentProductId]: discount,
    }));
    setDiscountDialogOpen(false);
  };

  const handleFinalCheckout = () => {
    const updatedCheckoutData = {
      ...checkoutData,
      shippingAddress,
      paymentMethod,
      appliedDiscounts,
      totalAmount: calculateTotal(),
    };
    console.log(updatedCheckoutData);

    // localStorage.setItem("checkoutData", JSON.stringify(updatedCheckoutData));
    // navigate("/payment");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">
        <ShoppingCart className="inline-block mr-2" /> Checkout
      </h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-grow space-y-6">
          {checkoutData.items.map((item) => (
            <motion.div
              key={item.product_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg bg-background_secondary transition-shadow duration-300">
                <CardHeader className="bg-background">
                  <CardTitle className="text-xl ">
                    <Package className="inline-block mr-2" /> {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center p-6">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-40 h-40 object-cover mb-4 sm:mb-0 sm:mr-6 rounded-lg shadow-md"
                  />
                  <div className="flex-grow space-y-2">
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-gray-600">
                      Price: ${item.price.toFixed(2)}
                    </p>
                    <p className="text-gray-600">Shipping Fee: $20.00</p>
                    <Button
                      onClick={() => handleApplyDiscount(item.product_id)}
                      className="mt-2 bg-green-500 hover:bg-green-600 transition-colors duration-300"
                    >
                      <Tag className="mr-2" /> Apply Discount
                    </Button>
                    {appliedDiscounts[item.product_id] && (
                      <p className="text-green-600 mt-2 font-semibold">
                        Applied Discount:{" "}
                        {appliedDiscounts[item.product_id].code}
                      </p>
                    )}
                    <p className="font-bold text-lg mt-2 text-blue-600">
                      Total: ${calculateItemTotal(item).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="lg:w-1/3">
          <Card className="sticky top-4 bg-background_secondary shadow-lg">
            <CardHeader className="">
              <CardTitle className="text-2xl text-blue-600">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Truck className="inline-block mr-2" /> Shipping Address
                </label>
                <Select onValueChange={setShippingAddress}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select shipping address" />
                  </SelectTrigger>
                  <SelectContent>
                    {shippingAddresses.map((address) => (
                      <SelectItem key={address} value={address}>
                        {address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="inline-block mr-2" /> Payment Method
                </label>
                <Select onValueChange={setPaymentMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <p className="text-2xl font-bold text-blue-600">
                Total: ${calculateTotal().toFixed(2)}
              </p>
              <Button
                onClick={handleFinalCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300 text-lg py-3"
              >
                Proceed to Payment <ChevronRight className="ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-blue-600">
              Available Discounts
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 mt-4">
            {discounts.map((discount) => (
              <motion.div
                key={discount._id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-300 bg-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-bold text-lg text-blue-600">
                  {discount.code}
                </p>
                <p className="text-gray-600">Type: {discount.type}</p>
                <p className="text-gray-600">
                  Value:{" "}
                  {typeof discount.value === "object"
                    ? `Buy ${discount.value.buyQuantity} Get ${discount.value.getFreeQuantity} Free`
                    : `${discount.value}${
                        discount.type === "percentage" ||
                        discount.type === "flash-sale"
                          ? "%"
                          : "$"
                      }`}
                </p>
                <p className="text-gray-600">
                  Valid until: {new Date(discount.endDate).toLocaleDateString()}
                </p>
                <p className="text-gray-600">Uses left: {discount.maxUses}</p>
                <Button
                  onClick={() => handleSelectDiscount(discount)}
                  className="mt-2 bg-green-500 hover:bg-green-600 transition-colors duration-300"
                >
                  Select Discount
                </Button>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckoutPage;

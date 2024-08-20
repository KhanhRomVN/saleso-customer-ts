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
import { BACKEND_URI } from "@/api";

interface CheckoutItem {
  product_id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
  selected_attributes_value?: string;
}

interface Discount {
  _id: string;
  code: string;
  type: string;
  value: number | { buyQuantity: number; getFreeQuantity: number };
  endDate: string;
  maxUses: number;
}

interface CheckoutData {
  items: CheckoutItem[];
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({ items: [] });
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState("");
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [appliedDiscounts, setAppliedDiscounts] = useState<
    Record<string, Discount>
  >({});

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

  const calculateItemTotal = (item: CheckoutItem): number => {
    const shipping_fee = 20;
    let total = item.price * item.quantity + shipping_fee;
    const discount = appliedDiscounts[item.product_id];
    if (discount) {
      if (discount.type === "flash-sale" || discount.type === "percentage") {
        total -= total * ((discount.value as number) / 100);
      } else if (discount.type === "fixed") {
        total -= discount.value as number;
      } else if (discount.type === "buy-x-get-y") {
        const { buyQuantity, getFreeQuantity } = discount.value as {
          buyQuantity: number;
          getFreeQuantity: number;
        };
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

  const calculateTotal = (): number => {
    return checkoutData.items.reduce(
      (acc, item) => acc + calculateItemTotal(item),
      0
    );
  };

  const handleApplyDiscount = async (productId: string) => {
    setCurrentProductId(productId);
    try {
      const response = await axios.get<Discount[]>(
        `${BACKEND_URI}/discount/by-product/${productId}`
      );
      setDiscounts(response.data);
      setDiscountDialogOpen(true);
    } catch (error) {
      console.error("Error fetching discounts:", error);
    }
  };

  const handleSelectDiscount = (discount: Discount) => {
    setAppliedDiscounts((prev) => ({
      ...prev,
      [currentProductId]: discount,
    }));
    setDiscountDialogOpen(false);
  };

  const handleFinalCheckout = async () => {
    const orderItems = checkoutData.items.map((item) => {
      const discount = appliedDiscounts[item.product_id];
      const shipping_fee = 20;
      const total = calculateItemTotal(item).toFixed(2);

      return {
        product_id: item.product_id,
        quantity: item.quantity,
        selected_attributes_value: item.selected_attributes_value,
        total_amount: parseFloat(total),
        discount_id: discount ? discount._id : undefined,
        shipping_address: shippingAddress,
        shipping_fee: shipping_fee,
      };
    });

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("Please log in to complete the checkout");
        return;
      }

      if (paymentMethod === "Pay on delivery") {
        const response = await axios.post(
          `${BACKEND_URI}/order`,
          {
            orderItems,
            payment_method:
              paymentMethod === "Pay on delivery" ? "postpaid" : "prepaid",
            payment_status: "pending",
          },
          {
            headers: {
              accessToken,
            },
          }
        );
        console.log("Order created successfully:", response.data);
        navigate("/order-success");
      } else {
        localStorage.setItem("paymentData", JSON.stringify(transformedData));
        navigate("/payment");
      }
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">
        <ShoppingCart className="inline-block mr-2" /> Checkout
      </h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-grow space-y-6">
          {checkoutData.items.map((item) => (
            <CheckoutItem
              key={item.product_id}
              item={item}
              appliedDiscount={appliedDiscounts[item.product_id]}
              onApplyDiscount={handleApplyDiscount}
              total={calculateItemTotal(item)}
            />
          ))}
        </div>

        <OrderSummary
          total={calculateTotal()}
          shippingAddresses={shippingAddresses}
          paymentMethods={paymentMethods}
          onShippingAddressChange={setShippingAddress}
          onPaymentMethodChange={setPaymentMethod}
          onCheckout={handleFinalCheckout}
        />
      </div>

      <DiscountDialog
        open={discountDialogOpen}
        onOpenChange={setDiscountDialogOpen}
        discounts={discounts}
        onSelectDiscount={handleSelectDiscount}
      />
    </div>
  );
};

interface CheckoutItemProps {
  item: CheckoutItem;
  appliedDiscount?: Discount;
  onApplyDiscount: (productId: string) => void;
  total: number;
}

const CheckoutItem: React.FC<CheckoutItemProps> = ({
  item,
  appliedDiscount,
  onApplyDiscount,
  total,
}) => (
  <motion.div
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
          <p className="text-gray-600">Price: ${item.price.toFixed(2)}</p>
          <p className="text-gray-600">Shipping Fee: $20.00</p>
          <Button
            onClick={() => onApplyDiscount(item.product_id)}
            className="mt-2 bg-green-500 hover:bg-green-600 transition-colors duration-300"
          >
            <Tag className="mr-2" /> Apply Discount
          </Button>
          {appliedDiscount && (
            <p className="text-green-600 mt-2 font-semibold">
              Applied Discount: {appliedDiscount.code}
            </p>
          )}
          <p className="font-bold text-lg mt-2 text-blue-600">
            Total: ${total.toFixed(2)}
          </p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

interface OrderSummaryProps {
  total: number;
  shippingAddresses: string[];
  paymentMethods: string[];
  onShippingAddressChange: (address: string) => void;
  onPaymentMethodChange: (method: string) => void;
  onCheckout: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  total,
  shippingAddresses,
  paymentMethods,
  onShippingAddressChange,
  onPaymentMethodChange,
  onCheckout,
}) => (
  <div className="lg:w-1/3">
    <Card className="sticky top-4 bg-background_secondary shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-blue-600">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Truck className="inline-block mr-2" /> Shipping Address
          </label>
          <Select onValueChange={onShippingAddressChange}>
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
          <Select onValueChange={onPaymentMethodChange}>
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
          Total: ${total.toFixed(2)}
        </p>
        <Button
          onClick={onCheckout}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300 text-lg py-3"
        >
          Proceed to Payment <ChevronRight className="ml-2" />
        </Button>
      </CardContent>
    </Card>
  </div>
);

interface DiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discounts: Discount[];
  onSelectDiscount: (discount: Discount) => void;
}

const DiscountDialog: React.FC<DiscountDialogProps> = ({
  open,
  onOpenChange,
  discounts,
  onSelectDiscount,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
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
            <p className="font-bold text-lg text-blue-600">{discount.code}</p>
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
              onClick={() => onSelectDiscount(discount)}
              className="mt-2 bg-green-500 hover:bg-green-600 transition-colors duration-300"
            >
              Select Discount
            </Button>
          </motion.div>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);

export default CheckoutPage;

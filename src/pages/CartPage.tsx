import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { BACKEND_URI } from "@/api";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CartItem {
  product_id: string;
  name: string;
  image: string;
  quantity: number;
  stock: number;
  price: number;
  selected_attributes_value?: string;
}

interface CartData {
  _id: string;
  customer_id: string;
  items: CartItem[];
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get<CartData>(`${BACKEND_URI}/cart`, {
        headers: { accessToken },
      });
      setCartData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cart data:", error);
      setLoading(false);
    }
  };

  const handleQuantityChange = async (
    productId: string,
    newQuantity: number
  ) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.patch(
        `${BACKEND_URI}/cart`,
        { product_id: productId, quantity: newQuantity },
        { headers: { accessToken } }
      );
      fetchCartData();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleClearCart = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.delete(`${BACKEND_URI}/cart`, {
        headers: { accessToken },
      });
      fetchCartData();
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const toggleItemSelection = (productId: string) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const calculateTotal = (item: CartItem) => item.price * item.quantity;

  const calculateEndTotal = () =>
    cartData?.items.reduce((total, item) => total + calculateTotal(item), 0) ||
    0;

  const calculateSelectedTotal = () =>
    cartData?.items
      .filter((item) => selectedItems.includes(item.product_id))
      .reduce((total, item) => total + calculateTotal(item), 0) || 0;

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to checkout.");
      return;
    }

    const checkoutItems = cartData?.items.filter((item) =>
      selectedItems.includes(item.product_id)
    );

    const checkoutData = {
      items: checkoutItems,
    };

    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    navigate("/checkout");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 space-y-8"
    >
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center h-64"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </motion.div>
      ) : cartData?.items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-xl">Your cart is empty.</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="destructive"
                onClick={handleClearCart}
                className="flex items-center space-x-2 hover:bg-red-600 transition-colors duration-300"
              >
                <Trash2 size={16} />
                <span>Clear All</span>
              </Button>
            </div>
            <div className="w-full flex flex-col md:flex-row justify-between gap-4">
              <div className="w-full md:w-[75%]">
                <Table className="bg-background_secondary rounded-lg shadow-md">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Select</TableHead>
                      <TableHead className="w-[50px]">No.</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartData?.items.map((item, index) => (
                      <TableRow
                        key={item.product_id}
                        className="hover:bg-background transition-colors duration-200"
                      >
                        <TableCell>
                          <Checkbox
                            className="bg-white"
                            checked={selectedItems.includes(item.product_id)}
                            onCheckedChange={() =>
                              toggleItemSelection(item.product_id)
                            }
                          />
                        </TableCell>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="flex items-center space-x-2">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.selected_attributes_value && (
                              <p className="text-sm text-gray-500">
                                {item.selected_attributes_value}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleQuantityChange(
                                  item.product_id,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              max={item.stock}
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.product_id,
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-16 text-center"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleQuantityChange(
                                  item.product_id,
                                  item.quantity + 1
                                )
                              }
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus size={16} />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{item.stock}</TableCell>
                        <TableCell>
                          ${calculateTotal(item).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={6} className="text-right font-bold">
                        End Total:
                      </TableCell>
                      <TableCell className="font-bold">
                        ${calculateEndTotal().toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div className="w-full md:w-[25%] flex flex-col">
                <Card className="bg-background_secondary rounded-lg shadow-md">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Selected Items: {selectedItems.length}</p>
                    <p>Total Amount: ${calculateSelectedTotal().toFixed(2)}</p>

                    <Button
                      className="mt-4 w-full hover:bg-primary-dark transition-colors duration-300"
                      onClick={handleCheckout}
                    >
                      Checkout
                    </Button>
                  </CardContent>
                </Card>
                <p className="text-xs text-gray-600">
                  (This total amount does not include discounts or delivery
                  fees)
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default CartPage;

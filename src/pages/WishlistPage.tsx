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
import { Button } from "@/components/ui/button";
import { BACKEND_URI } from "@/api";
import { motion } from "framer-motion";
import { ShoppingCart, Trash2 } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  stock: number;
}

interface WishlistPageProps {
  openCart: (productId: string) => void;
}

const WishlistPage: React.FC<WishlistPageProps> = ({ openCart }) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const { data } = await axios.get<Product[]>(`${BACKEND_URI}/wishlist`, {
        headers: { accessToken },
      });
      setWishlistItems(data);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (productId: string) => {
    openCart(productId);
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.delete(`${BACKEND_URI}/items/${productId}`, {
        headers: { accessToken },
      });
      setWishlistItems(wishlistItems.filter((item) => item._id !== productId));
    } catch (error) {
      console.error("Error removing item from wishlist:", error);
    }
  };

  const handleClearWishlist = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.delete(`${BACKEND_URI}/wishlist`, {
        headers: { accessToken },
      });
      setWishlistItems([]);
    } catch (error) {
      console.error("Error clearing wishlist:", error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4 sm:px-6 lg:px-8"
    >
      {wishlistItems.length === 0 ? (
        <p className="text-center text-gray-500">Your wishlist is empty.</p>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <p>Wishlist</p>
            <Button
              onClick={handleClearWishlist}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Clear All
            </Button>
          </div>
          <div className="flex justify-center bg-red-400">
            <Table className="w-full bg-background_secondary">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">STT</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wishlistItems.map((item, index) => (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <span className="font-medium">{item.name}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">{item.stock}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-2">
                        <ShoppingCart
                          onClick={() => handleAddToCart(item._id)}
                          className="w-6 h-6 cursor-pointer text-blue-500 hover:text-blue-600"
                        />
                        <Trash2
                          onClick={() => handleRemoveFromWishlist(item._id)}
                          className="w-6 h-6 cursor-pointer text-red-500 hover:text-red-600"
                        />
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default WishlistPage;

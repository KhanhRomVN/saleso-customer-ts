import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Eye, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface ProductCardProps {
  productData: {
    _id: string;
    name: string;
    image: string;
    price: number;
    discount_value: number;
  };
  onHandleAddCart: (productId: string) => void;
  onHandleAddWishlist: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  productData,
  onHandleAddCart,
  onHandleAddWishlist,
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const discountedPrice =
    productData.price * (1 - productData.discount_value / 100);

  const handleCardClick = () => {
    navigate(`/product/${productData._id}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card
        className="relative cursor-pointer overflow-hidden bg-background_secondary h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        <CardContent className="p-0 flex flex-col h-full">
          {/* Product Image */}
          <div className="relative flex-grow">
            <img
              src={productData.image}
              alt={productData.name}
              className="w-full h-60 object-cover rounded-lg transition-all duration-300 transform hover:scale-105"
            />
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="absolute top-2 right-2 space-y-2 "
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onHandleAddWishlist(productData._id);
                    }}
                    className="bg-background shadow-md transition-all duration-200"
                  >
                    <Heart className="h-4 w-4 text-red-500" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-background shadow-md transition-all duration-200"
                      >
                        <Eye className="h-4 w-4 text-blue-500" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <img
                        src={productData.image}
                        alt={productData.name}
                        className="w-full h-auto rounded-lg"
                      />
                    </DialogContent>
                  </Dialog>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Product Detail */}
          <div className="flex-grow px-4 py-2">
            <h3 className="font-semibold truncate text-lg">
              {productData.name}
            </h3>
            <div className="flex justify-between items-end mt-2">
              <div className="flex flex-col">
                <span className="text-gray-500 line-through text-sm">
                  ${productData.price.toFixed(2)}
                </span>
                <span className="font-bold text-primary text-xl">
                  ${discountedPrice.toFixed(2)}
                </span>
              </div>
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onHandleAddCart(productData._id);
                      }}
                      className="hover:bg-background hover:text-white transition-all duration-200 shadow-lg"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import axios from "axios";
import { BACKEND_URI } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
}

interface ProductAttribute {
  attributes_value: string;
  attributes_quantity: number;
  attributes_price: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  countryOfOrigin: string;
  brand: string;
  categories: string[];
  tags: string[];
  images: string[];
  price?: number;
  stock?: number;
  attributes_name?: string;
  attributes?: ProductAttribute[];
  units_sold: number;
  seller_id: string;
  max_discount: number;
  discounts: string[];
}

interface CartData {
  product_id: string;
  attributes_value?: string;
  quantity: number;
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  isOpen,
  onClose,
  productId,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${BACKEND_URI}/product/${productId}`);
        setProduct(response.data);
        if (response.data.attributes && response.data.attributes.length > 0) {
          setSelectedAttribute(response.data.attributes[0].attributes_value);
        }
      } catch (err) {
        setError("Failed to fetch product data: " + err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cart-sidebar" && e.newValue === "closed") {
        onClose();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [onClose]);

  const getPrice = () => {
    if (!product) return null;
    if (product.price) return product.price;
    if (product.attributes && selectedAttribute) {
      const attribute = product.attributes.find(
        (a) => a.attributes_value === selectedAttribute
      );
      return attribute ? attribute.attributes_price : null;
    }
    return null;
  };

  const getStock = () => {
    if (!product) return null;
    if (product.stock !== undefined) return product.stock;
    if (product.attributes && selectedAttribute) {
      const attribute = product.attributes.find(
        (a) => a.attributes_value === selectedAttribute
      );
      return attribute ? attribute.attributes_quantity : null;
    }
    return null;
  };

  const handleQuantityChange = (value: number) => {
    const stock = getStock();
    if (stock !== null) {
      setQuantity(Math.min(Math.max(1, value), stock));
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    const cartData: CartData = {
      product_id: product._id,
      quantity: quantity,
    };

    if (product.attributes && selectedAttribute) {
      cartData.attributes_value = selectedAttribute;
    }

    try {
      console.log(cartData);
      
      // const accessToken = localStorage.getItem("accessToken");
      // const response = await axios.post(`${BACKEND_URI}/cart/add`, cartData, {
      //   headers: { accessToken },
      // });
      // console.log("Product added to cart:", response.data);
      // onClose();
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  const nextImage = () => {
    if (product) {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % product.images.length
      );
    }
  };

  const prevImage = () => {
    if (product) {
      setCurrentImageIndex(
        (prevIndex) =>
          (prevIndex - 1 + product.images.length) % product.images.length
      );
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 0.5, 1));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 right-0 w-2/5 h-screen bg-background shadow-lg z-50 overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <div className="p-4">
              <Button variant="ghost" className="float-right" onClick={onClose}>
                <X size={24} />
              </Button>
              <h2 className="text-xl font-bold mb-4">Add to cart</h2>
              {loading && <p>Loading...</p>}
              {error && <p className="text-red-500">{error}</p>}
              {product && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative mb-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <img
                          src={product.images[currentImageIndex]}
                          alt={product.name}
                          className="w-full h-48 object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                        />
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <div className="relative">
                          <img
                            src={product.images[currentImageIndex]}
                            alt={product.name}
                            className="w-full h-auto"
                            style={{
                              transform: `scale(${zoomLevel})`,
                              transition: "transform 0.3s ease-in-out",
                            }}
                          />
                          <div className="absolute top-2 right-2 space-x-2">
                            <Button onClick={handleZoomIn}>
                              <ZoomIn size={20} />
                            </Button>
                            <Button onClick={handleZoomOut}>
                              <ZoomOut size={20} />
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
                      onClick={prevImage}
                    >
                      <ChevronLeft size={24} />
                    </Button>
                    <Button
                      variant="outline"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
                      onClick={nextImage}
                    >
                      <ChevronRight size={24} />
                    </Button>
                  </div>
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                  <p className="text-sm mb-2">
                    Origin: {product.countryOfOrigin}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2 items-center">
                    <p>Categories:</p>
                    {product.categories.map((category) => (
                      <Button
                        key={category}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>

                  {product.attributes ? (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">
                        {product.attributes_name}
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {product.attributes.map((attr) => (
                          <Button
                            key={attr.attributes_value}
                            variant={
                              selectedAttribute === attr.attributes_value
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              setSelectedAttribute(attr.attributes_value)
                            }
                            className="w-full text-xs"
                          >
                            {attr.attributes_value}
                            <br />${attr.attributes_price}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg font-bold mb-2">
                      Price: ${getPrice()}
                    </p>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity - 1)}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          handleQuantityChange(parseInt(e.target.value))
                        }
                        className="w-16 mx-2 text-center"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;

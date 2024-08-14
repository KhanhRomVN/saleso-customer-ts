import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  seller_id: string;
  discount_value: number;
}

interface ProductGridProps {
  title: string;
  api: string;
  grid: "1x4" | "2x4" | "3x4" | "3x5";
}

const ProductGrid: React.FC<ProductGridProps> = ({ title, api, grid }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const productsPerPage = {
    "1x4": 4,
    "2x4": 8,
    "3x4": 12,
    "3x5": 15,
  }[grid];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.post(api);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [api]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(products.length / productsPerPage);

  const handleAddCart = (productId: string) => {
    // Implement add to cart functionality
    console.log("Add to cart:", productId);
  };

  const handleAddWishlist = (productId: string) => {
    // Implement add to wishlist functionality
    console.log("Add to wishlist:", productId);
  };

  const gridClass = {
    "1x4": "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
    "2x4": "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
    "3x4": "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    "3x5": "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  }[grid];

  return (
    <Card className="w-full bg-background">
      <CardContent>
        <h2 className="text-2xl mb-6 text-primary">{title}</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              className={`grid ${gridClass} gap-6`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {currentProducts.map((product) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard
                    productData={product}
                    onHandleAddCart={handleAddCart}
                    onHandleAddWishlist={handleAddWishlist}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(
            (page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
                className="transition-colors duration-200 hover:bg-primary hover:text-white"
              >
                {page}
              </Button>
            )
          )}
          {totalPages > 5 && (
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage(Math.min(currentPage + 1, totalPages))
              }
              className="transition-colors duration-200 hover:bg-primary hover:text-white"
            >
              ...
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductGrid;

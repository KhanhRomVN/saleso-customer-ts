import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { StarIcon } from "lucide-react";
import { motion } from "framer-motion";

interface Attribute {
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
  attributes?: Attribute[];
  max_discount: number;
  discounts: string[];
  reviews: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { rating: number; count: number }[];
  };
}

const ProductPage: React.FC = () => {
  const { product_id } = useParams<{ product_id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/product/${product_id}`
        );
        setProduct(response.data);
      } catch (err) {
        setError("Failed to fetch product data");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [product_id]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!product)
    return <div className="text-center py-10">Product not found</div>;

  const discountPrice = product.price
    ? product.price * (1 - product.max_discount / 100)
    : product.attributes[0].attributes_price * (1 - product.max_discount / 100);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={product.images[selectedImage]}
              alt={`${product.name} - main`}
              className="w-full h-auto object-cover rounded-lg mb-4"
            />
          </motion.div>
          <Carousel className="w-full max-w-xs mx-auto">
            <CarouselContent>
              {product.images.map((image, index) => (
                <CarouselItem key={index} className="basis-1/4">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    src={image}
                    alt={`${product.name} - ${index + 1}`}
                    className={`w-full h-auto object-cover rounded-lg cursor-pointer ${
                      selectedImage === index ? "border-2 border-blue-500" : ""
                    }`}
                    onClick={() => setSelectedImage(index)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <div className="flex items-center mb-4">
            <div className="flex items-center mr-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`h-5 w-5 ${
                    star <= product.reviews.averageRating
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.reviews.totalReviews} reviews
            </span>
          </div>
          <div className="flex items-center mb-4">
            <p className="text-xl text-gray-500 mr-4 line-through">
              $
              {product.attributes
                ? product.attributes[0].attributes_price
                : product.price}
            </p>
            {discountPrice && (
              <p className="text-2xl text-green-600 font-semibold">
                ${discountPrice.toFixed(2)}
              </p>
            )}
          </div>
          <p className="mb-4">{product.description}</p>
          <motion.div
            className="mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="font-semibold">Brand:</span> {product.brand}
          </motion.div>
          <motion.div
            className="mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="font-semibold">Country of Origin:</span>{" "}
            {product.countryOfOrigin}
          </motion.div>
          {product.attributes && (
            <div className="mb-4">
              <span className="font-semibold">{product.attributes_name}:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {product.attributes.map((attr, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge variant="outline">
                      {attr.attributes_value} - ${attr.attributes_price}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          <div className="mb-4">
            <span className="font-semibold">Categories:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {product.categories.map((category, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge>{category}</Badge>
                </motion.div>
              ))}
            </div>
          </div>
          {product.discounts.length > 0 && (
            <div className="mb-4">
              <span className="font-semibold">Discounts:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {product.discounts.map((discount, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge variant="destructive">{discount}</Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProductPage;

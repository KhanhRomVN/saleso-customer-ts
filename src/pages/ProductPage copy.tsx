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
import { StarIcon, ThumbsUpIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BACKEND_URI } from "@/api";

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

interface Review {
  _id: string;
  product_id: string;
  rating: number;
  comment: string;
  username: string;
  customer_id: string;
  likes: string[];
  reply: string[];
}

const ProductPage: React.FC = () => {
  const { product_id } = useParams<{ product_id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URI}/product/${product_id}`
        );
        setProduct(response.data);

        const reviewsResponse = await axios.get(
          `${BACKEND_URI}/review/by-product/${product_id}`
        );
        setReviews(reviewsResponse.data);
      } catch (err) {
        setError("Failed to fetch product data" + err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [product_id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("Please log in to submit a review");
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URI}/review/create`,
        {
          product_id: product_id,
          rating: newReview.rating,
          comment: newReview.comment,
        },
        {
          headers: { accessToken },
        }
      );
      setReviews([...reviews, response.data]);
      setNewReview({ rating: 0, comment: "" });
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleLikeReview = async (reviewId: string) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("Please log in to like a review");
      return;
    }

    try {
      await axios.post(
        `${BACKEND_URI}/review/like/${reviewId}`,
        {},
        {
          headers: { accessToken },
        }
      );
      setReviews(
        reviews.map((review) =>
          review._id === reviewId
            ? { ...review, likes: [...review.likes, "currentUserId"] }
            : review
        )
      );
    } catch (error) {
      console.error("Error liking review:", error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!product) return <NotFound message="Product not found" />;

  const discountPrice = calculateDiscountPrice(product);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <ProductImages
          product={product}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
        />
        <ProductDetails product={product} discountPrice={discountPrice} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <RatingDistribution product={product} />
        <ReviewForm
          newReview={newReview}
          setNewReview={setNewReview}
          handleSubmitReview={handleSubmitReview}
        />
      </div>

      <ReviewList reviews={reviews} handleLikeReview={handleLikeReview} />
    </motion.div>
  );
};

const ProductImages: React.FC<{
  product: Product;
  selectedImage: number;
  setSelectedImage: (index: number) => void;
}> = ({ product, selectedImage, setSelectedImage }) => (
  <div>
    <motion.div
      key={selectedImage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <img
        src={product.images[selectedImage]}
        alt={`${product.name} - main`}
        className="w-full h-auto object-cover rounded-lg mb-4 shadow-lg"
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
              className={`w-full h-auto object-cover rounded-lg cursor-pointer transition-all duration-300 ${
                selectedImage === index ? "ring-2 ring-blue-500" : ""
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
);

const ProductDetails: React.FC<{ product: Product; discountPrice: number }> = ({
  product,
  discountPrice,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
    <ProductRating
      rating={product.reviews.averageRating}
      totalReviews={product.reviews.totalReviews}
    />
    <PriceDisplay
      originalPrice={product.price || product.attributes[0]?.attributes_price}
      discountPrice={discountPrice}
    />
    <p className="mb-4 text-gray-600">{product.description}</p>
    <ProductMetadata product={product} />
    <ProductAttributes product={product} />
    <ProductCategories categories={product.categories} />
    <ProductDiscounts discounts={product.discounts} />
    <Button className="mt-4 w-full">Add to Cart</Button>
  </motion.div>
);

const ProductRating: React.FC<{ rating: number; totalReviews: number }> = ({
  rating,
  totalReviews,
}) => (
  <div className="flex items-center mb-4">
    <div className="flex items-center mr-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-5 w-5 ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
    <span className="text-sm text-gray-600">{totalReviews} reviews</span>
  </div>
);

const PriceDisplay: React.FC<{
  originalPrice: number;
  discountPrice: number;
}> = ({ originalPrice, discountPrice }) => (
  <div className="flex items-center mb-4">
    <p className="text-xl text-gray-500 mr-4 line-through">
      ${originalPrice.toFixed(2)}
    </p>
    <p className="text-2xl text-green-600 font-semibold">
      ${discountPrice.toFixed(2)}
    </p>
  </div>
);

const ProductMetadata: React.FC<{ product: Product }> = ({ product }) => (
  <>
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
  </>
);

const ProductAttributes: React.FC<{ product: Product }> = ({ product }) =>
  product.attributes && (
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
  );

const ProductCategories: React.FC<{ categories: string[] }> = ({
  categories,
}) => (
  <div className="mb-4">
    <span className="font-semibold">Categories:</span>
    <div className="flex flex-wrap gap-2 mt-2">
      {categories.map((category, index) => (
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
);

const ProductDiscounts: React.FC<{ discounts: string[] }> = ({ discounts }) =>
  discounts.length > 0 && (
    <div className="mb-4">
      <span className="font-semibold">Discounts:</span>
      <div className="flex flex-wrap gap-2 mt-2">
        {discounts.map((discount, index) => (
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
  );

const RatingDistribution: React.FC<{ product: Product }> = ({ product }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-2xl font-bold mb-4">Reviews Rating</h2>
    <div className="flex items-center mb-4">
      <div className="text-4xl font-bold mr-4">
        {product.reviews.averageRating.toFixed(1)}
      </div>
      <div>
        <ProductRating
          rating={product.reviews.averageRating}
          totalReviews={product.reviews.totalReviews}
        />
      </div>
    </div>
    {product.reviews.ratingDistribution.map((dist) => (
      <div key={dist.rating} className="flex items-center mb-2">
        <span className="w-8 text-sm">{dist.rating} ★</span>
        <Progress
          value={(dist.count / product.reviews.totalReviews) * 100}
          className="w-48 mr-4"
        />
        <span className="text-sm text-gray-600">{dist.count}</span>
      </div>
    ))}
  </div>
);

const ReviewForm: React.FC<{
  newReview: { rating: number; comment: string };
  setNewReview: (review: { rating: number; comment: string }) => void;
  handleSubmitReview: (e: React.FormEvent) => void;
}> = ({ newReview, setNewReview, handleSubmitReview }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-bold mb-4">Write a Review</h3>
    <form onSubmit={handleSubmitReview}>
      <div className="mb-4">
        <label className="block mb-2">Rating</label>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              className={`h-6 w-6 cursor-pointer transition-colors duration-200 ${
                star <= newReview.rating ? "text-yellow-400" : "text-gray-300"
              }`}
              onClick={() => setNewReview({ ...newReview, rating: star })}
            />
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Comment</label>
        <Textarea
          value={newReview.comment}
          onChange={(e) =>
            setNewReview({ ...newReview, comment: e.target.value })
          }
          rows={4}
          className="w-full"
        />
      </div>
      <Button type="submit" className="w-full">
        Submit Review
      </Button>
    </form>
  </div>
);

const ReviewList: React.FC<{
  reviews: Review[];
  handleLikeReview: (reviewId: string) => void;
}> = ({ reviews, handleLikeReview }) => (
  <div className="mt-8">
    <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
    <AnimatePresence>
      {reviews.map((review) => (
        <motion.div
          key={review._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-4 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center mb-2">
                <Avatar className="mr-2" />
                <span className="font-semibold">{review.username}</span>
              </div>
              <ProductRating rating={review.rating} />
              <p className="my-2 text-gray-600">{review.comment}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLikeReview(review._id)}
                className="flex items-center"
              >
                <ThumbsUpIcon className="h-4 w-4 mr-1" />
                <span>{review.likes.length}</span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

const ReviewForm: React.FC<{
  newReview: { rating: number; comment: string };
  setNewReview: (review: { rating: number; comment: string }) => void;
  handleSubmitReview: (e: React.FormEvent) => void;
}> = ({ newReview, setNewReview, handleSubmitReview }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-bold mb-4">Write a Review</h3>
    <form onSubmit={handleSubmitReview}>
      <div className="mb-4">
        <label className="block mb-2">Rating</label>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              className={`h-6 w-6 cursor-pointer transition-colors duration-200 ${
                star <= newReview.rating ? "text-yellow-400" : "text-gray-300"
              }`}
              onClick={() => setNewReview({ ...newReview, rating: star })}
            />
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Comment</label>
        <Textarea
          value={newReview.comment}
          onChange={(e) =>
            setNewReview({ ...newReview, comment: e.target.value })
          }
          rows={4}
          className="w-full"
        />
      </div>
      <Button type="submit" className="w-full">
        Submit Review
      </Button>
    </form>
  </div>
);

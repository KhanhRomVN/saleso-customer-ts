import React, { useState, useEffect, useMemo } from "react";
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
import { StarIcon, Star, Send, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BACKEND_URI } from "@/api";
// import { toast } from "react-hot-toast";
import { cropImageFile, handleUploadCroppedImage } from "@/utils/imageUtils";
import Cropper, { Area } from "react-easy-crop";

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

interface Feedback {
  _id: string;
  user_id: string;
  username: string;
  is_owner: boolean;
  product_id: string;
  owner_id: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

type FeedbackState = {
  rating: number;
  comment: string;
  images: string[];
};

const ProductPage: React.FC = () => {
  const { product_id } = useParams<{ product_id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [newFeedback, setNewFeedback] = useState<FeedbackState>({
    rating: 0,
    comment: "",
    images: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productResponse, feedbacksResponse] = await Promise.all([
          axios.get(`${BACKEND_URI}/product/${product_id}`),
          axios.post(`${BACKEND_URI}/feedback/product-feedbacks`, {
            product_id,
          }),
        ]);
        setProduct(productResponse.data);
        console.log(feedbacksResponse.data);
        setFeedbacks(feedbacksResponse.data);
      } catch (err) {
        setError(`Failed to fetch data: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [product_id]);

  const handleSubmitFeedback = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("Please log in to submit feedback");
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URI}/feedback`,
        {
          product_id,
          rating: newFeedback.rating,
          comment: newFeedback.comment,
          images: newFeedback.images,
        },
        { headers: { accessToken } }
      );
      setFeedbacks((prev) => [...prev, response.data]);
      setNewFeedback({ rating: 0, comment: "", images: [] });
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const discountPrice = useMemo(() => {
    if (!product) return null;
    const basePrice =
      product.price || product.attributes?.[0]?.attributes_price;
    return basePrice ? basePrice * (1 - product.max_discount / 100) : null;
  }, [product]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!product) return <NotFound message="Product not found" />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <ProductImages
          images={product.images}
          name={product.name}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
        />
        <ProductDetails product={product} discountPrice={discountPrice} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RatingDistribution reviews={product.reviews} />
        <FeedbackForm
          newFeedback={newFeedback}
          setNewFeedback={setNewFeedback}
          handleSubmitFeedback={handleSubmitFeedback}
        />
      </div>
      <FeedbackList feedbacks={feedbacks} />
    </div>
  );
};

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
  </div>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center py-10 text-red-500">{message}</div>
);

const NotFound: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center py-10">{message}</div>
);

const ProductImages: React.FC<{
  images: string[];
  name: string;
  selectedImage: number;
  setSelectedImage: (index: number) => void;
}> = ({ images, name, selectedImage, setSelectedImage }) => (
  <div>
    <AnimatePresence mode="wait">
      <motion.img
        key={selectedImage}
        src={images[selectedImage]}
        alt={`${name} - main`}
        className="w-full h-auto object-cover rounded-lg mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
    </AnimatePresence>
    <Carousel className="w-full max-w-xs mx-auto">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index} className="basis-1/4">
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={image}
              alt={`${name} - ${index + 1}`}
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
);

const ProductDetails: React.FC<{
  product: Product;
  discountPrice: number | null;
}> = ({ product, discountPrice }) => (
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
      originalPrice={product.price || product.attributes?.[0]?.attributes_price}
      discountPrice={discountPrice}
    />
    <p className="mb-4">{product.description}</p>
    <ProductAttribute label="Brand" value={product.brand} />
    <ProductAttribute
      label="Country of Origin"
      value={product.countryOfOrigin}
    />
    {product.attributes && (
      <ProductAttributes
        attributes={product.attributes}
        attributeName={product.attributes_name}
      />
    )}
    <ProductCategories categories={product.categories} />
    {product.discounts.length > 0 && (
      <ProductDiscounts discounts={product.discounts} />
    )}
  </motion.div>
);

const ProductRating: React.FC<{
  rating: number;
  totalReviews: number | null;
}> = ({ rating, totalReviews }) => (
  <div className="flex items-center">
    <div className="flex items-center mr-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
    {totalReviews && (
      <span className="text-sm text-gray-600">{totalReviews} reviews</span>
    )}
  </div>
);

const PriceDisplay: React.FC<{
  originalPrice?: number;
  discountPrice: number | null;
}> = ({ originalPrice, discountPrice }) => (
  <div className="flex items-center mb-4">
    {originalPrice && (
      <p className="text-xl text-gray-500 mr-4 line-through">
        ${originalPrice}
      </p>
    )}
    {discountPrice && (
      <p className="text-2xl text-green-600 font-semibold">
        ${discountPrice.toFixed(2)}
      </p>
    )}
  </div>
);

const ProductAttribute: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <motion.div
    className="mb-4"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <span className="font-semibold">{label}:</span> {value}
  </motion.div>
);

const ProductAttributes: React.FC<{
  attributes: Attribute[];
  attributeName?: string;
}> = ({ attributes, attributeName }) => (
  <div className="mb-4">
    <span className="font-semibold">{attributeName}:</span>
    <div className="flex flex-wrap gap-2 mt-2">
      {attributes.map((attr, index) => (
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

const ProductDiscounts: React.FC<{ discounts: string[] }> = ({ discounts }) => (
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

const RatingDistribution: React.FC<{ reviews: Product["reviews"] }> = ({
  reviews,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-background_secondary p-6 rounded-lg shadow-md"
  >
    <h2 className="text-2xl font-bold mb-4">Reviews Rating</h2>
    <div className="flex items-center mb-4">
      <div className="text-4xl font-bold mr-4">
        {reviews.averageRating.toFixed(1)}
      </div>
      <div>
        <ProductRating
          rating={reviews.averageRating}
          totalReviews={reviews.totalReviews}
        />
      </div>
    </div>
    {reviews.ratingDistribution.map((dist) => (
      <motion.div
        key={dist.rating}
        className="flex items-center mb-2"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <span className="w-8">
          {dist.rating}{" "}
          <Star className="inline-block h-4 w-4 text-yellow-400" />
        </span>
        <Progress
          value={(dist.count / reviews.totalReviews) * 100}
          className="w-64 mr-4"
        />
        <span>{dist.count}</span>
      </motion.div>
    ))}
  </motion.div>
);

const FeedbackForm: React.FC<{
  newFeedback: FeedbackState;
  setNewFeedback: React.Dispatch<React.SetStateAction<FeedbackState>>;
  handleSubmitFeedback: (e: React.FormEvent) => Promise<void>;
}> = ({ newFeedback, setNewFeedback, handleSubmitFeedback }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files).slice(0, 3);
      setSelectedImages(filesArray);
      setIsModalOpen(true);
    }
  };

  const handleImageCrop = (
    _croppedArea: Area,
    croppedAreaPixels: { x: number; y: number; width: number; height: number }
  ) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSaveCroppedImage = async () => {
    if (croppedAreaPixels && selectedImages.length > 0) {
      const croppedImage = await cropImageFile(
        croppedAreaPixels,
        URL.createObjectURL(selectedImages[0])
      );
      if (croppedImage) {
        const imageUrl = await handleUploadCroppedImage(croppedImage);
        if (imageUrl) {
          setNewFeedback({
            ...newFeedback,
            images: [...newFeedback.images, imageUrl],
          });
        }
      }
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-background_secondary p-6 rounded-lg shadow-md"
      >
        <h3 className="text-xl font-bold mb-4">Write Feedback</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitFeedback(e);
          }}
        >
          <div className="mb-4">
            <label className="block mb-2">Rating</label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.div
                  key={star}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Star
                    className={`h-6 w-6 cursor-pointer ${
                      star <= newFeedback.rating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    onClick={() =>
                      setNewFeedback({ ...newFeedback, rating: star })
                    }
                  />
                </motion.div>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Comment</label>
            <Textarea
              value={newFeedback.comment}
              onChange={(e) =>
                setNewFeedback({ ...newFeedback, comment: e.target.value })
              }
              rows={4}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Images</label>
            <div className="border-2 border-dashed border-gray-400 rounded-lg p-4 flex justify-center items-center cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                id="imageUpload"
                onChange={handleImageSelect}
              />
              <label
                htmlFor="imageUpload"
                className="flex flex-col items-center cursor-pointer"
              >
                <ImageIcon className="h-8 w-8 text-gray-400 mb-2 cursor-pointer" />
                <span className="text-gray-400 cursor-pointer">
                  Drop your images here or click upload image from device
                </span>
              </label>
            </div>
            {newFeedback.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newFeedback.images.map((image, index) => (
                  <motion.img
                    key={index}
                    src={image}
                    alt={`Feedback image ${index + 1}`}
                    className="w-24 h-24 object-cover rounded"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                ))}
              </div>
            )}
          </div>
          <Button type="submit" className="flex items-center w-full">
            <Send className="h-4 w-4 mr-2" />
            Submit Feedback
          </Button>
        </form>
      </motion.div>
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50"
          >
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Crop Image</h3>
              <div className="relative h-64">
                <Cropper
                  image={URL.createObjectURL(selectedImages[0])}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleImageCrop}
                />
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  variant="secondary"
                  className="mr-2"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveCroppedImage}>Save</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FeedbackList: React.FC<{
  feedbacks: Feedback[];
}> = ({ feedbacks }) => {
  if (feedbacks.length === 0) {
    return (
      <div className="mt-4">
        <AnimatePresence>
          {feedbacks.map((feedback) => (
            <motion.div
              key={feedback._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-4 bg-background_secondary hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <Avatar className="mr-2" />
                    <span className="font-semibold mr-2">
                      {feedback.username}
                    </span>
                    <ProductRating rating={feedback.rating} totalReviews={0} />
                  </div>

                  <p className="mb-2">{feedback.comment}</p>
                  {feedback.images && feedback.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {feedback.images.map((image, index) => (
                        <motion.img
                          key={index}
                          src={image}
                          alt={`Feedback image ${index + 1}`}
                          className="w-24 h-24 object-cover rounded"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <AnimatePresence>
        {feedbacks.map((feedback) => (
          <motion.div
            key={feedback._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-4 bg-background_secondary hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <Avatar className="mr-2" />
                  <span className="font-semibold mr-2">
                    {feedback.username}
                  </span>
                  <ProductRating rating={feedback.rating} totalReviews={null} />
                </div>

                <p className="mb-2">{feedback.comment}</p>
                {feedback.images && feedback.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {feedback.images.map((image, index) => (
                      <motion.img
                        key={index}
                        src={image}
                        alt={`Feedback image ${index + 1}`}
                        className="w-24 h-24 object-cover rounded"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ProductPage;

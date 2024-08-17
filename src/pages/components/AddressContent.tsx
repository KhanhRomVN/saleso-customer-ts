import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Trash, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BACKEND_URI } from "@/api";

const AddressContent: React.FC = () => {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(`${BACKEND_URI}/user/user-data`, {
        headers: { accessToken },
      });
      setAddresses(response.data.address || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to fetch addresses. Please try again.");
      setIsLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (newAddress) {
      const updatedAddresses = [...addresses, newAddress];
      try {
        const accessToken = localStorage.getItem("accessToken");
        await axios.post(
          `${BACKEND_URI}/user/update/detail`,
          { field: ["address"], value: [updatedAddresses] },
          { headers: { accessToken } }
        );
        setAddresses(updatedAddresses);
        setNewAddress("");
        setIsDialogOpen(false);
        toast.success("New address added successfully.");
      } catch (error) {
        console.error("Error adding address:", error);
        toast.error("Failed to add new address. Please try again.");
      }
    }
  };

  const handleRemoveAddress = async (index: number) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        `${BACKEND_URI}/user/update/detail`,
        { field: ["address"], value: [updatedAddresses] },
        { headers: { accessToken } }
      );
      setAddresses(updatedAddresses);
      toast.success("Address removed successfully.");
    } catch (error) {
      console.error("Error removing address:", error);
      toast.error("Failed to remove address. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-4 pt-2 pb-6">
      <ToastContainer position="top-right" autoClose={1000} />
      <div className="">
        <h2 className="text-2xl font-bold">Delivery Addresses</h2>
        <p className="text-gray-600">
          Manage your delivery addresses for convenient shipping.
        </p>
      </div>
      <AnimatePresence>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ul className="py-4">
            <AnimatePresence>
              {addresses.map((address, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-background rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-4 my-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold flex items-center">
                        <MapPin className="mr-2 text-blue-500" size={18} />
                        Address {index + 1}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAddress(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash size={18} />
                      </Button>
                    </div>
                    <p className="text-gray-700">{address}</p>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </motion.div>
      </AnimatePresence>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center">
            <Plus className="mr-2" />
            Add New Address
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogDescription>
              Enter your new delivery address below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="newAddress">New Address</Label>
              <Input
                id="newAddress"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Enter your new address"
                className="mt-1"
              />
            </div>
            <Button onClick={handleAddAddress} className="w-full">
              Add Address
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddressContent;

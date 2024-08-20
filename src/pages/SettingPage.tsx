import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  // CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import Cropper, { Area } from "react-easy-crop";
import {
  handleImageSelect,
  cropImageFile,
  handleUploadCroppedImage,
} from "@/utils/imageUtils";
import { BACKEND_URI } from "@/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import {
  User,
  Mail,
  Lock,
  Camera,
  Info,
  Loader2,
  Plus,
  Trash,
  MapPin,
  Package,
  // Truck,
  CheckCircle,
  XCircle,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import NotImplementedNotice from "@/components/NotImplementedNotice";

type TabId = "account" | "address" | "orders" | "payment" | "message" | "other";

const SettingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("account");

  const tabs = [
    { id: "account" as const, label: "Account", icon: "👤" },
    { id: "address" as const, label: "Address", icon: "🏠" },
    { id: "orders" as const, label: "Orders", icon: "📦" },
    { id: "payment" as const, label: "Payment", icon: "💳" },
    { id: "message" as const, label: "Message", icon: "✉️" },
    { id: "other" as const, label: "Other", icon: "⚙️" },
  ];

  const contentComponents: Record<TabId, React.FC> = {
    account: AccountContent,
    address: AddressContent,
    orders: OrderContent,
    payment: PaymentContent,
    message: MessageContent,
    other: OtherContent,
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabId);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-3xl ml-4 font-bold">Setting</p>
      <Tabs
        orientation="horizontal"
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex flex-col md:flex-row flex-grow"
      >
        <div className="w-[15%] pt-[100px]">
          <TabsList className="flex flex-col bg-transparent items-start">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex justify-start"
              >
                <span className="mr-2 text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="w-[85%] bg-background_secondary rounded-lg shadow-lg">
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {React.createElement(contentComponents[tab.id])}
              </motion.div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

const AccountContent: React.FC = () => {
  const [user, setUser] = useState({
    user_id: "",
    username: "",
    email: "",
    name: "",
    role: "",
    avatar_uri: "",
    age: 0,
    gender: "",
    birthday: "",
    about: "",
  });

  const [dialogState, setDialogState] = useState({
    verify: false,
    email: false,
    password: false,
    avatar: false,
    otp: false,
    forgetPassword: false,
    newPassword: false,
  });

  const [formState, setFormState] = useState({
    newEmail: "",
    currentPassword: "",
    newPassword: "",
    verifyEmail: "",
    verifyPassword: "",
    forgetPasswordEmail: "",
    newPasswordForReset: "",
    otp: "",
    emailOtp: "",
  });

  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [verifyPurpose, setVerifyPurpose] = useState<
    "email" | "password" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(`${BACKEND_URI}/user/user-data`, {
        headers: { accessToken },
      });

      setUser((prevUser) => ({
        ...prevUser,
        ...response.data,
        name: response.data.name || "",
        avatar_uri: response.data.avatar_uri || "",
        age: response.data.age || 0,
        gender: response.data.gender || "",
        birthday: response.data.birthday || "",
        about: response.data.about || "",
      }));
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to fetch user data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setUser((prevUser) => ({ ...prevUser, [field]: value }));
  };

  const handleFormChange = (field: string, value: string) => {
    setFormState((prevState) => ({ ...prevState, [field]: value }));
  };

  const calculateAge = (birthday: string): number => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleUpdate = async (fields: string[]) => {
    try {
      setIsLoading(true);
      const values = fields
        .map((field) => {
          if (field === "age" && user.birthday) {
            return calculateAge(user.birthday);
          }
          return user[field as keyof typeof user] || null;
        })
        .filter((value) => value !== null);

      const fieldsToUpdate = fields.filter(
        (_field, index) => values[index] !== null
      );

      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        `${BACKEND_URI}/user/update/detail`,
        { field: fieldsToUpdate, value: values.filter((v) => v !== null) },
        { headers: { accessToken } }
      );
      toast.success("Update successful!");
      fetchUserData();
    } catch (error) {
      console.error("Error updating user details:", error);
      toast.error("Failed to update user details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAccount = async () => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        `${BACKEND_URI}/user/verify`,
        {
          email: formState.verifyEmail,
          password: formState.verifyPassword,
        },
        { headers: { accessToken } }
      );
      setDialogState((prev) => ({
        ...prev,
        verify: false,
        ...(verifyPurpose ? { [verifyPurpose]: true } : {}),
      }));
    } catch (error) {
      console.error("Error verifying account:", error);
      toast.error("Failed to verify account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = async () => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        `${BACKEND_URI}/user/verify/new-email`,
        { newEmail: formState.newEmail },
        { headers: { accessToken } }
      );
      setDialogState((prev) => ({ ...prev, email: false, otp: true }));
      toast.success("OTP sent to your new email. Please check your inbox.");
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmEmailChange = async () => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        `${BACKEND_URI}/user/update-email`,
        { newEmail: formState.newEmail, otp: formState.emailOtp },
        { headers: { accessToken } }
      );
      setDialogState((prev) => ({ ...prev, otp: false }));
      fetchUserData();
      toast.success("Email updated successfully!");
    } catch (error) {
      console.error("Error updating email:", error);
      toast.error("Failed to update email");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        `${BACKEND_URI}/user/update/password`,
        { newPassword: formState.newPassword },
        { headers: { accessToken } }
      );
      setDialogState((prev) => ({ ...prev, password: false }));
      toast.success("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendForgetPasswordEmail = async () => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        `${BACKEND_URI}/user/forget-password`,
        { email: formState.forgetPasswordEmail },
        { headers: { accessToken } }
      );
      toast.success(
        "Password reset email sent. Please check your inbox for the OTP."
      );
      setDialogState((prev) => ({
        ...prev,
        forgetPassword: false,
        newPassword: true,
      }));
    } catch (error) {
      console.error("Error sending forget password email:", error);
      toast.error("Failed to send forget password email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        `${BACKEND_URI}/user/update/forget-password`,
        {
          otp: formState.otp,
          newPassword: formState.newPasswordForReset,
        },
        { headers: { accessToken } }
      );
      toast.success("Password has been successfully reset.");
      setDialogState((prev) => ({ ...prev, newPassword: false }));
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) =>
      setCroppedAreaPixels(
        croppedAreaPixels as unknown as React.SetStateAction<null>
      ),
    []
  );

  const handleOpenVerifyDialog = (purpose: "email" | "password") => {
    setVerifyPurpose(purpose);
    setDialogState((prev) => ({ ...prev, verify: true }));
  };

  const handleAvatarUpload = async () => {
    if (selectedImage && croppedAreaPixels) {
      try {
        setIsLoading(true);
        const croppedImage = await cropImageFile(
          croppedAreaPixels,
          selectedImage
        );
        if (croppedImage) {
          const imageUrl = await handleUploadCroppedImage(croppedImage);
          if (imageUrl) {
            await handleUpdate(["avatar_uri"]);
            setDialogState((prev) => ({ ...prev, avatar: false }));
            toast.success("Avatar updated successfully!");
          }
        }
      } catch (error) {
        console.error("Error uploading avatar:", error);
        toast.error("Failed to update avatar");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderDialog = (
    key: keyof typeof dialogState,
    title: string,
    description: string,
    content: React.ReactNode
  ) => (
    <Dialog
      open={dialogState[key]}
      onOpenChange={(open) =>
        setDialogState((prev) => ({ ...prev, [key]: open }))
      }
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <ToastContainer />
      <Card className="bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-6 h-6" />
            <span>Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div
            className="flex items-center space-x-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar_uri} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button
              onClick={() =>
                setDialogState((prev) => ({ ...prev, avatar: true }))
              }
              variant="outline"
            >
              <Camera className="w-4 h-4 mr-2" /> Change Avatar
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["username", "name", "gender", "birthday"].map((field) => (
              <motion.div
                key={field}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Label htmlFor={field}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </Label>
                {field === "gender" ? (
                  <Select
                    onValueChange={(value) => handleInputChange(field, value)}
                    value={user[field] || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field}
                    type={field === "birthday" ? "date" : "text"}
                    value={user[field as keyof typeof user] || ""}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                  />
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Label htmlFor="about">About</Label>
            <Textarea
              id="about"
              value={user.about}
              onChange={(e) => handleInputChange("about", e.target.value)}
              className="h-24"
            />
          </motion.div>

          <Button
            onClick={() =>
              handleUpdate(["name", "age", "gender", "birthday", "about"])
            }
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Update Personal Information
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-6 h-6" />
            <span>Account Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {["email", "password"].map((field) => (
            <motion.div
              key={field}
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Label htmlFor={field}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </Label>
              <Input
                id={field}
                type={field === "password" ? "password" : "text"}
                value={
                  field === "password"
                    ? "********"
                    : user[field as keyof typeof user]
                }
                readOnly
                className="flex-grow"
              />
              <Button
                onClick={() =>
                  handleOpenVerifyDialog(field as "email" | "password")
                }
                variant="outline"
              >
                {field === "email" ? (
                  <Mail className="w-4 h-4 mr-2" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}{" "}
                Change
              </Button>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <AnimatePresence>
        {renderDialog(
          "avatar",
          "Change Avatar",
          "Upload and crop your new avatar image.",
          <>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleImageSelect(
                  e as React.ChangeEvent<HTMLInputElement>,
                  setSelectedImage as unknown as React.Dispatch<
                    React.SetStateAction<File[]>
                  >,
                  () => setDialogState((prev) => ({ ...prev, avatar: true }))
                )
              }
            />
            {selectedImage && (
              <div className="relative h-64">
                <Cropper
                  image={selectedImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
            )}
            <Button onClick={handleAvatarUpload} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Upload New Avatar
            </Button>
          </>
        )}

        {renderDialog(
          "verify",
          "Verify Account",
          "Please enter your email and password to verify your account.",
          <>
            <Input
              placeholder="Email"
              value={formState.verifyEmail}
              onChange={(e) => handleFormChange("verifyEmail", e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={formState.verifyPassword}
              onChange={(e) =>
                handleFormChange("verifyPassword", e.target.value)
              }
            />
            <Button onClick={handleVerifyAccount} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Verify Account
            </Button>
            <Button
              onClick={() =>
                setDialogState((prev) => ({
                  ...prev,
                  verify: false,
                  forgetPassword: true,
                }))
              }
            >
              Forgot Password
            </Button>
          </>
        )}

        {renderDialog(
          "email",
          "Change Email",
          "Enter your new email address.",
          <>
            <Input
              placeholder="New Email"
              value={formState.newEmail}
              onChange={(e) => handleFormChange("newEmail", e.target.value)}
            />
            <Button onClick={handleEmailChange} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Update Email
            </Button>
          </>
        )}

        {renderDialog(
          "otp",
          "Confirm Email Change",
          "Enter the OTP sent to your new email address.",
          <>
            <Input
              placeholder="New Email"
              value={formState.newEmail}
              readOnly
            />
            <Input
              placeholder="OTP"
              value={formState.emailOtp}
              onChange={(e) => handleFormChange("emailOtp", e.target.value)}
            />
            <Button onClick={handleConfirmEmailChange} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Change Email
            </Button>
          </>
        )}

        {renderDialog(
          "password",
          "Change Password",
          "Enter your new password.",
          <>
            <Input
              type="password"
              placeholder="New Password"
              value={formState.newPassword}
              onChange={(e) => handleFormChange("newPassword", e.target.value)}
            />
            <Button onClick={handlePasswordChange} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Update Password
            </Button>
          </>
        )}

        {renderDialog(
          "forgetPassword",
          "Forgot Password",
          "Enter your email to receive a password reset link.",
          <>
            <Input
              placeholder="Email"
              value={formState.forgetPasswordEmail}
              onChange={(e) =>
                handleFormChange("forgetPasswordEmail", e.target.value)
              }
            />
            <Button
              onClick={handleSendForgetPasswordEmail}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Send Reset Email
            </Button>
          </>
        )}

        {renderDialog(
          "newPassword",
          "Reset Password",
          "Enter your new password and the OTP sent to your email.",
          <>
            <Input
              type="password"
              placeholder="New Password"
              value={formState.newPasswordForReset}
              onChange={(e) =>
                handleFormChange("newPasswordForReset", e.target.value)
              }
            />
            <Input
              placeholder="OTP"
              value={formState.otp}
              onChange={(e) => handleFormChange("otp", e.target.value)}
            />
            <Button onClick={handleChangePassword} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Change Password
            </Button>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

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

interface Order {
  _id: string;
  product_image: string;
  product_name: string;
  product_id: string;
  quantity: number;
  total_amount: number;
  order_status: string;
}

const OrderContent: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("Pending");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get(
          `${BACKEND_URI}/order/${activeTab.toLowerCase()}`,
          {
            headers: { accessToken },
          }
        );
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [activeTab]);

  const statusIcons = useMemo(
    () => ({
      Pending: <Package className="w-6 h-6 text-yellow-500" />,
      Accepted: <CheckCircle className="w-6 h-6 text-green-500" />,
      Refused: <XCircle className="w-6 h-6 text-red-500" />,
    }),
    []
  );

  const renderOrderCard = (order: Order) => (
    <motion.div
      key={order._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-4 hover:shadow-lg transition-shadow duration-300 bg-background">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-sm md:text-base">Order ID: {order._id}</span>
            {statusIcons[order.order_status as keyof typeof statusIcons]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <img
              src={order.product_image}
              alt={order.product_name}
              className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-md mr-4"
            />
            <div>
              <h3 className="font-semibold text-sm md:text-base">
                {order.product_name}
              </h3>
              <p className="text-xs md:text-sm text-gray-500">
                Product ID: {order.product_id}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
            <p className="flex items-center">
              <ShoppingCart className="w-4 h-4 mr-2" /> Quantity:{" "}
              {order.quantity}
            </p>
            <p className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2" /> Total: $
              {order.total_amount}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="Pending" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          {Object.keys(statusIcons).map((status) => (
            <TabsTrigger
              key={status}
              value={status}
              className="flex items-center justify-center py-2"
            >
              {statusIcons[status as keyof typeof statusIcons]}
              <span className="ml-2 text-xs md:text-sm">{status}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {Object.keys(statusIcons).map((status) => (
          <TabsContent key={status} value={status}>
            <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center">
              {statusIcons[status as keyof typeof statusIcons]}
              <span className="ml-2">{status} Orders</span>
            </h2>
            {isLoading ? (
              <p className="text-center">Loading orders...</p>
            ) : (
              <AnimatePresence>
                <div className="space-y-4">
                  {orders.length > 0 ? (
                    orders.map(renderOrderCard)
                  ) : (
                    <p className="text-center">
                      No {status.toLowerCase()} orders found.
                    </p>
                  )}
                </div>
              </AnimatePresence>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

interface Order {
  _id: string;
  product_id: string;
  quantity: number;
  total_amount: number;
  discount_id: string;
  shipping_address: string;
  shipping_fee: number;
  customer_id: string;
  seller_id: string;
  order_status: string;
  product_name: string;
  product_image: string;
}

const PaymentContent = () => {
  return <NotImplementedNotice title="Payment" />;
};

const MessageContent = () => {
  return <NotImplementedNotice title="Message" />;
};

const OtherContent = () => {
  return <NotImplementedNotice title="Other" />;
};

export default SettingPage;

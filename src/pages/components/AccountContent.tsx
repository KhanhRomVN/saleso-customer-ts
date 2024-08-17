import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Lock, Camera, Info } from "lucide-react";
import Cropper from "react-easy-crop";
import axios from "axios";
import {
  handleImageSelect,
  cropImageFile,
  handleUploadCroppedImage,
} from "@/utils/imageUtils";

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

  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [isForgetPasswordDialogOpen, setIsForgetPasswordDialogOpen] =
    useState(false);
  const [verifyPurpose, setVerifyPurpose] = useState<
    "email" | "password" | null
  >(null);
  const [forgetPasswordEmail, setForgetPasswordEmail] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get("http://localhost:8080/user/user-data", {
        headers: { accessToken },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setUser({ ...user, [field]: value });
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
      const values = fields.map((field) => {
        if (field === "age") {
          return calculateAge(user.birthday);
        }
        return user[field];
      });

      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        "http://localhost:8080/user/update/detail",
        {
          field: fields,
          value: values,
        },
        {
          headers: { accessToken },
        }
      );

      alert("Update successful!");
      fetchUserData();
    } catch (error) {
      console.error("Error updating user details:", error);
      alert("Failed to update user details.");
    }
  };

  const handleVerifyAccount = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        "http://localhost:8080/user/verify",
        {
          email: verifyEmail,
          password: verifyPassword,
        },
        {
          headers: { accessToken },
        }
      );
      setIsVerifyDialogOpen(false);
      if (verifyPurpose === "email") {
        setIsEmailDialogOpen(true);
      } else if (verifyPurpose === "password") {
        setIsPasswordDialogOpen(true);
      }
    } catch (error) {
      console.error("Error verifying account:", error);
      alert("Failed to verify account.");
    }
  };

  const handleEmailChange = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        "http://localhost:8080/user/update-email",
        { newEmail },
        {
          headers: { accessToken },
        }
      );
      setIsEmailDialogOpen(false);
      fetchUserData();
      alert("Email updated successfully!");
    } catch (error) {
      console.error("Error updating email:", error);
      alert("Failed to update email.");
    }
  };

  const handlePasswordChange = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        "http://localhost:8080/user/update-password",
        {
          newPassword,
        },
        {
          headers: { accessToken },
        }
      );
      setIsPasswordDialogOpen(false);
      alert("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password.");
    }
  };

  const handleForgetPassword = async () => {
    setIsVerifyDialogOpen(false);
    setIsForgetPasswordDialogOpen(true);
  };

  const handleSendForgetPasswordEmail = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        "http://localhost:8080/user/forget-password",
        { email: forgetPasswordEmail },
        {
          headers: { accessToken },
        }
      );
      alert("Password reset email sent. Please check your inbox.");
      setIsForgetPasswordDialogOpen(false);
    } catch (error) {
      console.error("Error sending forget password email:", error);
      alert("Failed to send forget password email.");
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleOpenVerifyDialog = (purpose: "email" | "password") => {
    setVerifyPurpose(purpose);
    setIsVerifyDialogOpen(true);
  };

  const handleAvatarUpload = async () => {
    if (selectedImage && croppedAreaPixels) {
      const croppedImage = await cropImageFile(
        croppedAreaPixels,
        selectedImage
      );
      if (croppedImage) {
        const imageUrl = await handleUploadCroppedImage(croppedImage);
        if (imageUrl) {
          handleUpdate(["avatar_uri"]);
          setIsAvatarDialogOpen(false);
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6 space-y-8"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-6 h-6" />
            <span>Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatar_uri} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button
              onClick={() => setIsAvatarDialogOpen(true)}
              variant="outline"
            >
              <Camera className="w-4 h-4 mr-2" /> Change Avatar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={user.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={user.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                onValueChange={(value) => handleInputChange("gender", value)}
                value={user.gender}
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
            </div>
            <div>
              <Label htmlFor="birthday">Birthday</Label>
              <Input
                id="birthday"
                type="date"
                value={user.birthday}
                onChange={(e) => handleInputChange("birthday", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="about">About</Label>
            <Textarea
              id="about"
              value={user.about}
              onChange={(e) => handleInputChange("about", e.target.value)}
              className="h-24"
            />
          </div>

          <Button
            onClick={() =>
              handleUpdate(["name", "age", "gender", "birthday", "about"])
            }
          >
            Update Personal Information
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-6 h-6" />
            <span>Account Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="email"
                value={user.email}
                readOnly
                className="flex-grow"
              />
              <Button
                onClick={() => handleOpenVerifyDialog("email")}
                variant="outline"
              >
                <Mail className="w-4 h-4 mr-2" /> Change
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="password"
                type="password"
                value="********"
                readOnly
                className="flex-grow"
              />
              <Button
                onClick={() => handleOpenVerifyDialog("password")}
                variant="outline"
              >
                <Lock className="w-4 h-4 mr-2" /> Change
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {/* Avatar Dialog */}
        {isAvatarDialogOpen && (
          <Dialog
            open={isAvatarDialogOpen}
            onOpenChange={setIsAvatarDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Avatar</DialogTitle>
                <DialogDescription>
                  Upload and crop your new avatar image.
                </DialogDescription>
              </DialogHeader>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleImageSelect(e, setSelectedImage, setIsAvatarDialogOpen)
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
              <Button onClick={handleAvatarUpload}>Upload New Avatar</Button>
            </DialogContent>
          </Dialog>
        )}

        {/* Verify Account Dialog */}
        {isVerifyDialogOpen && (
          <Dialog
            open={isVerifyDialogOpen}
            onOpenChange={setIsVerifyDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Verify Account</DialogTitle>
                <DialogDescription>
                  Please enter your email and password to verify your account.
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder="Email"
                value={verifyEmail}
                onChange={(e) => setVerifyEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
              />
              <Button onClick={handleVerifyAccount}>Verify Account</Button>
              <Button onClick={handleForgetPassword}>Forgot Password</Button>
            </DialogContent>
          </Dialog>
        )}

        {/* Email Change Dialog */}
        {isEmailDialogOpen && (
          <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Email</DialogTitle>
                <DialogDescription>
                  Enter your new email address.
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder="New Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <Button onClick={handleEmailChange}>Update Email</Button>
            </DialogContent>
          </Dialog>
        )}

        {/* Password Change Dialog */}
        {isPasswordDialogOpen && (
          <Dialog
            open={isPasswordDialogOpen}
            onOpenChange={setIsPasswordDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>Enter your new password.</DialogDescription>
              </DialogHeader>
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button onClick={handlePasswordChange}>Update Password</Button>
            </DialogContent>
          </Dialog>
        )}

        {/* Forget Password Dialog */}
        {isForgetPasswordDialogOpen && (
          <Dialog
            open={isForgetPasswordDialogOpen}
            onOpenChange={setIsForgetPasswordDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Forgot Password</DialogTitle>
                <DialogDescription>
                  Enter your email to receive a password reset link.
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder="Email"
                value={forgetPasswordEmail}
                onChange={(e) => setForgetPasswordEmail(e.target.value)}
              />
              <Button onClick={handleSendForgetPasswordEmail}>
                Send Reset Email
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AccountContent;

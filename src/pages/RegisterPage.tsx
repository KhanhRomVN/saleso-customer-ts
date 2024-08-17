import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { BACKEND_URI } from "@/api";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showOTPInput, setShowOTPInput] = useState(false);

  const handleEmailSubmit = async () => {
    try {
      await axios.post(`${BACKEND_URI}/auth/email-verify`, {
        email,
        role: "customer",
      });
      setShowOTPInput(true);
      toast.success("OTP sent successfully!");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        toast.error("Email already registered");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        toast.error("Error sending email verification");
      }
    }
  };

  const handleOTPSubmit = async () => {
    try {
      await axios.post(`${BACKEND_URI}/auth/register-otp`, {
        email,
        otp,
        username,
        password,
        role: "customer",
      });
      toast.success("Registration successful!");
      navigate("/login");
    } catch (error) {
      toast.error("Error verifying OTP" + error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center items-center min-h-screen bg-background"
    >
      <Card className="w-full max-w-md shadow-lg bg-background_secondary rounded-lg">
        <CardHeader className="space-y-1 text-center">
          <motion.img
            src="https://i.ibb.co/CMSJMK3/Brandmark-make-your-logo-in-minutes-removebg-preview.png"
            alt="logo"
            className="h-12 mx-auto"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <h2 className="text-2xl font-bold text-gray-800">
            Create an account
          </h2>
          <p className="text-sm text-gray-600">Experience many new things</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
          {showOTPInput && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Input
                type="password"
                placeholder="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 mt-4"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 mt-4"
              />
            </motion.div>
          )}
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300"
            onClick={showOTPInput ? handleOTPSubmit : handleEmailSubmit}
          >
            {showOTPInput ? "Verify OTP" : "Register"}
          </Button>
        </CardContent>
        <div className="text-center pb-4">
          <p className="text-sm text-gray-600">Already have an account?</p>
          <motion.p
            className="text-sm text-blue-600 cursor-pointer font-semibold"
            onClick={() => navigate("/login")}
            whileHover={{ scale: 1.05 }}
          >
            Login here
          </motion.p>
        </div>
      </Card>
      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
};

export default EmailPage;

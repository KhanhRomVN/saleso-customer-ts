import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BACKEND_URI } from "@/api";
import { toast, Toaster } from "react-hot-toast";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    try {
      const { data } = await axios.post(`${BACKEND_URI}/auth/login`, {
        ...credentials,
        role: "customer",
      });

      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(
          key,
          typeof value === "object" ? JSON.stringify(value) : (value as string)
        );
      });

      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center items-center flex-col w-screen h-screen bg-background"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
        className="bg-background_secondary rounded-lg p-4 w-full max-w-md mb-5 shadow-lg"
      >
        <div className="flex flex-col gap-3 mb-5">
          <motion.img
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            src="https://i.ibb.co/CMSJMK3/Brandmark-make-your-logo-in-minutes-removebg-preview.png"
            alt="logo"
            className="h-10 mx-auto object-contain"
          />
          <h2 className="text-2xl text-center font-bold">Welcome to Saleso!</h2>
          <p className="text-sm text-center text-gray-600">
            Please enter your email and password to login
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="flex flex-col p-4 rounded-md"
        >
          <Input
            placeholder="Email"
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleInputChange}
            className="mb-3"
            required
          />
          <Input
            placeholder="Password"
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleInputChange}
            className="mb-3"
            required
          />
          <Button
            type="submit"
            className="mt-3 bg-primary hover:bg-primary-dark transition-colors"
          >
            Login
          </Button>
        </form>
        <div className="flex flex-col items-center mt-4">
          <p className="text-primary_color">Don't have an account?</p>
          <motion.p
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-primary cursor-pointer font-semibold"
            onClick={() => navigate("/register")}
          >
            Register here
          </motion.p>
        </div>
      </motion.div>
      <Toaster position="top-center" reverseOrder={false} />
    </motion.div>
  );
};

export default LoginPage;

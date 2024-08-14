import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BACKEND_URI } from "@/api";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${BACKEND_URI}/auth/login`, {
        email,
        password,
        role: "seller",
      });
      const { currentUser, accessToken, refreshToken } = response.data;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      navigate("/");
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const navigateToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="flex justify-center items-center flex-col w-screen h-screen bg-background">
      <div className="bg-background_secondary rounded-lg p-4 w-full max-w-md mb-5">
        <div className="flex flex-col gap-3 mb-5">
          <div className="w-full h-10 text-center">
            <img
              src="https://i.ibb.co/CMSJMK3/Brandmark-make-your-logo-in-minutes-removebg-preview.png"
              alt="logo"
              className="object-cover h-full mx-auto"
            />
          </div>
          <h2 className="text-2xl text-center">Welcome to Saleso!</h2>
          <p className="text-sm text-center">
            Please enter your email and password to login
          </p>
        </div>
        <div className="flex flex-col p-4 rounded-md">
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-3"
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-3"
          />
          <Button onClick={handleLogin} className="mt-3 bg-primary">
            Login
          </Button>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-primary_color">Don't have an account?</p>
          <p
            className="text-primary cursor-pointer"
            onClick={navigateToRegister}
          >
            Register here
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

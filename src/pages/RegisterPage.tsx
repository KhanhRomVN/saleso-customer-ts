import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { BACKEND_URI } from "@/api";

const EmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showOTPInput, setShowOTPInput] = useState(false);

  const handleEmailSubmit = async () => {
    try {
      await axios.post(`${BACKEND_URI}/auth/email-verify`, { email });
      setShowOTPInput(true);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        console.error("Email already registered");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        console.error("Error sending email verification:", error);
      }
    }
  };

  const handleOTPSubmit = async () => {
    try {
      const response = await axios.post(`${BACKEND_URI}/auth/register-otp`, {
        email,
        otp,
        username,
        password,
      });
      console.log(response.data);
      navigate("/login");
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
  };

  const navigateToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="flex justify-center items-center flex-col w-screen h-screen bg-background">
      <Card className="bg-background_secondary rounded-lg w-full max-w-md mb-5">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-full h-9 flex justify-center">
            <img
              src="https://i.ibb.co/CMSJMK3/Brandmark-make-your-logo-in-minutes-removebg-preview.png"
              alt="logo"
              className="object-cover h-full"
            />
          </div>
          <p>Create an account to experience many new things</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {showOTPInput && (
            <>
              <Input
                type="password"
                placeholder="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </>
          )}
          <Button
            className="w-full"
            onClick={showOTPInput ? handleOTPSubmit : handleEmailSubmit}
          >
            {showOTPInput ? "Verify OTP" : "Register"}
          </Button>
        </CardContent>
        <div className="flex mb-2 items-center flex-col">
          <p className="text-primary_color">Already have an account?</p>
          <p className="text-primary cursor-pointer" onClick={navigateToLogin}>
            Login here
          </p>
        </div>
      </Card>
    </div>
  );
};

export default EmailPage;

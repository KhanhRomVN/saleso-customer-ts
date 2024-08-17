import React, { useState, useEffect, useCallback } from "react";
// ... (các import khác giữ nguyên)

const AccountContent: React.FC = () => {
  // ... (các state khác giữ nguyên)
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isForgetPasswordDialogOpen, setIsForgetPasswordDialogOpen] =
    useState(false);
  const [verifyPurpose, setVerifyPurpose] = useState<
    "email" | "password" | null
  >(null);
  const [forgetPasswordEmail, setForgetPasswordEmail] = useState("");

  // ... (các hàm khác giữ nguyên)

  const handleOpenVerifyDialog = (purpose: "email" | "password") => {
    setVerifyPurpose(purpose);
    setIsVerifyDialogOpen(true);
  };

  const handleVerifyAccount = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        "http://localhost:8080/user/verify",
        {
          email: verifyEmail,
          password: verifyPassword,
          role: "customer",
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

  return (
    <div className="flex flex-col space-y-8 p-4">
      {/* ... (các phần khác giữ nguyên) */}

      {/* Email & Password Section */}
      <div className="flex">
        <div className="w-1/3">
          <h2 className="text-2xl font-bold">Email & Password</h2>
          <p className="text-gray-600">
            Manage your email address and password settings.
          </p>
        </div>
        <div className="w-2/3 space-y-4">
          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} readOnly />
            <Button onClick={() => handleOpenVerifyDialog("email")}>
              Change Email
            </Button>
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value="********" readOnly />
            <Button onClick={() => handleOpenVerifyDialog("password")}>
              Change Password
            </Button>
          </div>
        </div>
      </div>

      {/* Verify Account Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
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

      {/* Email Change Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Email</DialogTitle>
            <DialogDescription>Enter your new email address.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="New Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <Button onClick={handleEmailChange}>Update Email</Button>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
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

      {/* Forget Password Dialog */}
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
    </div>
  );
};

export default AccountContent;

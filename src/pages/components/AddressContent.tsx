import React, { useState } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AddressContent: React.FC = () => {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState("");

  const handleAddAddress = () => {
    if (newAddress) {
      setAddresses([...addresses, newAddress]);
      setNewAddress("");
      // API call to update addresses
      // Use /user/update/detail with field: 'address' and value: [...addresses, newAddress]
    }
  };

  const handleRemoveAddress = (index: number) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);
    // API call to update addresses
    // Use /user/update/detail with field: 'address' and value: updatedAddresses
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Delivery Addresses</h2>
        <p className="text-gray-600">
          Manage your delivery addresses for convenient shipping.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addresses.map((address, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>Address {index + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{address}</p>
            </CardContent>
            <CardFooter>
              <Button
                variant="destructive"
                onClick={() => handleRemoveAddress(index)}
              >
                Remove
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button>Add New Address</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogDescription>
              Enter your new delivery address below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newAddress">New Address</Label>
              <Input
                id="newAddress"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Enter your new address"
              />
            </div>
            <Button onClick={handleAddAddress}>Add Address</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddressContent;

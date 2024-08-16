import React, { useState, useEffect } from "react";
import MainHeader from "@/components/MainHeader";
import UtilityHeader from "@/components/UtilityHeader";
import MenuHeader from "@/components/MenuHeader";
import CartSidebar from "@/components/CartSidebar";
import { motion } from "framer-motion";

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(() => {
    // Initialize from localStorage, default to false if not set
    return localStorage.getItem("cart-sidebar") === "open";
  });
  const [cartProductId, setCartProductId] = useState<string | null>(null);

  useEffect(() => {
    // Update localStorage whenever isCartOpen changes
    localStorage.setItem("cart-sidebar", isCartOpen ? "open" : "closed");
  }, [isCartOpen]);

  const openCart = (productId: string) => {
    setCartProductId(productId);
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
    setCartProductId(null);
  };

  return (
    <div className="flex h-screen flex-col">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full fixed top-0 z-50 bg-background_secondary shadow-md"
      >
        <UtilityHeader />
        <MainHeader />
        <MenuHeader />
      </motion.div>
      <div className="flex flex-1">
        <main className="flex-1 overflow-y-auto pt-[128px] px-8">
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                React.cloneElement(child as React.ReactElement<any>, {
                  openCart,
                })
              : child
          )}
        </main>
      </div>
      <CartSidebar
        isOpen={isCartOpen}
        onClose={closeCart}
        productId={cartProductId}
      />
    </div>
  );
};

export default DefaultLayout;

"use client";

import "@/flow/config";
import React, { createContext, useContext, useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";


// Create the context
const UserContext = createContext();

// UserProvider component
export function UserProvider({ children }) {
  const [user, setUser] = useState({ loggedIn: false, addr: null });
  const [loading, setLoading] = useState(true);

  // Subscribe to FCL's currentUser
  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Authentication functions
  const logIn = () => {
    fcl.authenticate();
  };

  const logOut = () => {
    fcl.unauthenticate();
  };

  const signUp = () => {
    fcl.signUp();
  };

  const value = {
    user,
    loading,
    logIn,
    logOut,
    signUp,
    isLoggedIn: user?.loggedIn || false,
    address: user?.addr || null,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Custom hook to use the UserContext
export function useUser() {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}

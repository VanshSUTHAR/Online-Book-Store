import React, { createContext, useState, useContext, useEffect } from "react";
import { api } from "../services/api";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const login = (userData) => setUser(userData);
  const logout = () => {
    setUser(null);
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setIsAuthLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await api.get(`/auth/user/${userId}`);
        if (res.data) {
          setUser(res.data);
        } else {
          localStorage.removeItem("userId");
          localStorage.removeItem("token");
        }
      } catch (err) {
        localStorage.removeItem("userId");
        localStorage.removeItem("token");
      } finally {
        setIsAuthLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout, isAuthLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

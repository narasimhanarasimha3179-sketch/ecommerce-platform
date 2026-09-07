import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserInfo(parsedUser);
      } catch (error) {
        console.error("Failed to load user information:", error);
        localStorage.removeItem("userInfo");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = (user) => {
    // Save complete login response
    localStorage.setItem("userInfo", JSON.stringify(user));

    // Save JWT token separately
    if (user?.token) {
      localStorage.setItem("token", user.token);
    }

    setUserInfo(user);
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");

    setUserInfo(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userInfo,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
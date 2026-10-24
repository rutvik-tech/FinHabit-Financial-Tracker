import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("finhabitToken");
    const storedUser = localStorage.getItem("finhabitUser");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem("finhabitToken");
        localStorage.removeItem("finhabitUser");
      }
    } else {
      localStorage.removeItem("finhabitToken");
      localStorage.removeItem("finhabitUser");
    }

    setLoading(false);
  }, []);

  const login = (userData, userToken) => {
    const normalizedUser = {
      ...userData,
      role: userData?.role || "user"
    };

    localStorage.setItem("finhabitToken", userToken);
    localStorage.setItem("finhabitUser", JSON.stringify(normalizedUser));

    setToken(userToken);
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem("finhabitToken");
    localStorage.removeItem("finhabitUser");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
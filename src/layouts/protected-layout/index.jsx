import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext";

export default function ProtectedLayout({ children }) {
  const navigate = useNavigate();
  
  const userData = JSON.parse(window.sessionStorage.getItem("userData") || "{}");
  const token = userData?.accessToken;

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]); 

  return (
    <AuthProvider> 
      {children}
    </AuthProvider>
  );
}
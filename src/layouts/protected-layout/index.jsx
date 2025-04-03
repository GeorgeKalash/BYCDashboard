import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectedLayout({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if(!token){
        navigate("/login")
    }
  }, []);

  return <>{children}</>
}

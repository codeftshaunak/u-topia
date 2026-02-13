export const dynamic = "force-dynamic";


import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth page for simple email/password signup
    navigate("/auth");
  }, [navigate]);

  return null;
}

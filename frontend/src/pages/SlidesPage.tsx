import { useLocation, useNavigate } from "react-router-dom";
import SlideShow from "../components/slides/SlideShow";
import { useEffect } from "react";

const SlidesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stats = location.state?.stats;

  useEffect(() => {
    // If a user tries to access /wrapped directly without uploading, send them back
    if (!stats) {
      navigate("/upload");
    }
  }, [stats, navigate]);

  if (!stats) return null;

  return <SlideShow stats={stats} />;
};

export default SlidesPage;

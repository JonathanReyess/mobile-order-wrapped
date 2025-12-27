import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import IntroPage from "./pages/IntroPage";
import UploadPage from "./pages/UploadPage";
import SlidesPage from "./pages/SlidesPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/wrapped" element={<SlidesPage />} />
      </Routes>
    </Router>
  );
}

export default App;

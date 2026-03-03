import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Upload from "./components/Upload";
import Download from "./components/Download";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Upload />} />
        <Route path="/download" element={<Download />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

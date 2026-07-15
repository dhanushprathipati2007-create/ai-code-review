import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NewReview from "./pages/NewReview";
import UploadFile from "./pages/UploadFile";
import ReviewHistory from "./pages/ReviewHistory";
import ReviewResults from "./pages/ReviewResults";

import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";

import "./App.css";

const savedTheme =
  localStorage.getItem("theme") || "light";

document.body.classList.toggle(
  "dark-theme",
  savedTheme === "dark"
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/review/new" element={<NewReview />} />
          <Route path="/upload" element={<UploadFile />} />
          <Route path="/history" element={<ReviewHistory />} />
          <Route path="/reviews/:id" element={<ReviewResults />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
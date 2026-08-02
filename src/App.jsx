import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import SurveyPage from "./pages/SurveyPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminPage />} />
      <Route path="/survey/:storeId" element={<SurveyPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

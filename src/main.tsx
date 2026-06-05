import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Toaster } from "react-hot-toast";
import App from "./App.tsx";
import Navbar from "./components/Navbar.tsx";
import { Route, Router } from "wouter";
import CarRentals from "./components/CarRentals.tsx";
import CarFleet from "./components/CarFleet.tsx";
import CarDetail from "./components/CarDetail.tsx";

import CreateRental from "./components/Rentals/CreateRental.tsx";


import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/i18n";
import AboutUs from "./components/AboutUs.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: "#111827",
            color: "#F9FAFB",
            border: "1px solid #F97316",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.35)",
            fontWeight: 600,
          },
          error: {
            style: {
              background: "#1F2937",
              color: "#FFFFFF",
              border: "2px solid #F87171",
            },
            iconTheme: {
              primary: "#F87171",
              secondary: "#111827",
            },
          },
          success: {
            style: {
              background: "#052E16",
              color: "#ECFDF5",
              border: "2px solid #34D399",
            },
            iconTheme: {
              primary: "#34D399",
              secondary: "#052E16",
            },
          },
        }}
      />
      <Navbar />
      <Router>
        <Route path="/" component={App} />
        <Route path="/car-rentals" component={CarRentals} />
        <Route path="/car-fleet" component={CarFleet} />{" "}
        <Route path="/car-detail/:id" component={CarDetail} />{" "}
        <Route path="/add-rental" component={CreateRental} />
        <Route path="/about-us" component={AboutUs} />
      </Router>
    </I18nextProvider>
  </StrictMode>,
);

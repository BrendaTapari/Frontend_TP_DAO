import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Navbar from "./components/Navbar.tsx";
import ClientEmployeeCars from "./components/ClientEmployeeCars.tsx";
import { Route, Router } from "wouter";
import CarRentals from "./components/CarRentals.tsx";
import CarFleet from "./components/CarFleet.tsx";
import CarDetail from "./components/CarDetail.tsx";
import Stadistic from "./components/Stadistic/Stadistic.tsx";
import CreateRental from "./components/Rentals/CreateRental.tsx";
import AddSancion from "./components/Rentals/Sancion.tsx";
import TiposDanos from "./components/Rentals/TiposDanos.tsx";
import SancionDetail from "./components/Rentals/SancionDetail.tsx";
import MaintenanceOrders from "./components/Maintenance/MaintenanceOrders.tsx";
import MaintenanceOrderDetail from "./components/Maintenance/MaintenanceOrderDetail.tsx";
import Seguros from "./components/Seguros.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Navbar />
    <Router>
      <Route path="/" component={App} />
      <Route path="/clients-employees-cars" component={ClientEmployeeCars} />
      <Route path="/car-rentals" component={CarRentals} />
      <Route path="/car-fleet" component={CarFleet} />{" "}
      <Route path="/car-detail/:id" component={CarDetail} />{" "}
      <Route path="/stadistic" component={Stadistic} />
      <Route path="/add-rental" component={CreateRental} />
      <Route path="/sanciones" component={AddSancion} />
      <Route path="/sanciones/:id" component={SancionDetail} />
      <Route path="/tipos-danos" component={TiposDanos} />
      <Route path="/car-maintenance" component={MaintenanceOrders} />
      <Route path="/car-maintenance/:id" component={MaintenanceOrderDetail} />
      <Route path="/car-insurance" component={Seguros} />
    </Router>
  </StrictMode>,
);

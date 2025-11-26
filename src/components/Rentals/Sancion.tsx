import { getActiveRentals } from "../../services/rentalService";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { ArrowLeft, HandCoins } from "lucide-react";
import AddSancion from "../Modals/AddSancion";
import CreateSancionModal from "../Modals/CreateSancion";

export default function AddSanc1ion() {
  const [locations, setLocations] = useLocation();
  const [rentals, setRentals] = useState([]);

  useEffect(() => {
    const fetchRentals = async () => {
      const activeRentals = await getActiveRentals();

      console.log(activeRentals);

      setRentals(activeRentals);
    };

    fetchRentals();
  }, []);

  const handleVolver = () => {
    setLocations("/car-rentals");
  };

  //TODO: agregar pago de sancion

  return (
    <>
      <div className="font-bold text-3xl ml-2 gap-2">
        <button className="btn btn-neutral mr-2" onClick={handleVolver}>
          <ArrowLeft />
        </button>

        <span>Sanciones</span>
      </div>
      <div className="p-2 flex gap-2">
        {/* <AddSancion /> */}
        <CreateSancionModal/>
        <button className="btn btn-accent"><HandCoins /> Pagar Sanción</button>
      </div>
      <div>
      </div>
      <p className="ml-2 mt-2">Vehículos con sanciones.</p>
      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <table className="table">
          <thead>
            <tr>
              <th>ID Alquiler</th>
              <th>Cliente</th>
              <th>Auto</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => (
              <tr key={rental.id}>
                <td>{rental.id}</td>
                <td>{rental.cliente.dni_cliente}</td>
                <td>{rental.vehiculo.patente}</td>
                <td>{rental.fechaInicio}</td>
                <td>{rental.fechaFin}</td>
                <td>
                  <button
                    onClick={() => {
                      setLocations(`/sanciones/${rental.id}`);
                    }}
                  >
                    Agregar Sanción
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

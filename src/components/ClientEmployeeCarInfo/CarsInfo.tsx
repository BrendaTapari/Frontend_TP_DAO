import { Search } from "lucide-react";
import { getAutos } from "../../services/autosService";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import SpecificCar from "../Modals/SpecificCar";

export interface CarsInfoRef {
  fetchAutos: () => void;
}

const CarsInfo = forwardRef<CarsInfoRef>((_props, ref) => {
  const [autos, setAutos] = useState([]);
  const [filteredAutos, setFilteredAutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCarPatente, setSelectedCarPatente] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAutos = async () => {
    try {
      const autos = await getAutos();
      setAutos(autos);
      setFilteredAutos(autos); 
    } catch (error) {
      console.error("Error fetching autos:", error);
    }
  };

  console.log("Autos cargados:", autos);

  const filterAutos = (searchValue: string) => {
    if (!searchValue.trim()) {
      setFilteredAutos(autos);
      return;
    }

    const filtered = autos.filter((auto: any) => {
      const searchLower = searchValue.toLowerCase().trim();
      return (
        auto.patente?.toLowerCase().includes(searchLower) ||
        auto.marca?.toLowerCase().includes(searchLower) ||
        auto.modelo?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredAutos(filtered);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    filterAutos(value);
  };

  useImperativeHandle(ref, () => ({
    fetchAutos,
  }));

  useEffect(() => {
    fetchAutos();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      filterAutos(searchTerm);
    } else {
      setFilteredAutos(autos);
    }
  }, [autos]);

  const handleRowDoubleClick = (carPatente: string) => {
    setSelectedCarPatente(carPatente);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCarPatente(null);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredAutos(autos);
  };

  return (
    <>
      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <div className="flex justify-between p-2">
          <div>
            <h3 className="text-xl font-bold">Información de Autos</h3>
            <p className="text-sm text-base-content/70">
              {searchTerm
                ? `${filteredAutos.length} resultado(s) de ${autos.length} total(es)`
                : `${autos.length} auto(s) en total`}
            </p>
          </div>
          <div className="join">
            <div>
              <label className="input validator join-item">
                <Search className="mx-2" />
                <input
                  type="text"
                  placeholder="Buscar por patente, marca o modelo"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </label>
              <div className="validator-hint hidden">
                Ingrese parametro de búsqueda
              </div>
            </div>
            {searchTerm && (
              <button
                type="button"
                className="btn btn-ghost join-item"
                onClick={clearSearch}
                title="Limpiar búsqueda"
              >
                ×
              </button>
            )}
            <button
              className="btn btn-neutral join-item"
              onClick={handleSearch}
              disabled={!searchTerm.trim()}
            >
              Buscar
            </button>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr className="bg-accent/50">
              <th>#</th>
              <th>Patente</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Año</th>
              <th>Color</th>
              <th>Estado</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {filteredAutos && filteredAutos.length > 0 ? (
              filteredAutos.map((auto: any, index: number) => (
                <tr
                  key={auto.patente}
                  onDoubleClick={() => handleRowDoubleClick(auto.patente)}
                  className="hover:bg-base-200 cursor-pointer transition-colors duration-200"
                  title="Doble clic para ver detalles"
                >
                  <th>{index + 1}</th>
                  <td className="font-mono font-semibold">{auto.patente}</td>
                  <td>{auto.marca}</td>
                  <td>{auto.modelo}</td>
                  <td>{auto.anio}</td>
                  <td>
                    <span className="badge badge-outline badge-sm">
                      {auto.color}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge badge-sm ${
                        auto.estado?.toLowerCase() === "disponible"
                          ? "badge-success"
                          : auto.estado?.toLowerCase() === "alquilado"
                          ? "badge-warning"
                          : auto.estado?.toLowerCase() === "mantenimiento"
                          ? "badge-error"
                          : "badge-neutral"
                      }`}
                    >
                      {auto.estado || "N/A"}
                    </span>
                  </td>
                  <td className="font-semibold">
                    ${auto.costo?.toLocaleString("es-AR") || "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-8 text-base-content/50"
                >
                  {searchTerm
                    ? "No se encontraron autos que coincidan con la búsqueda"
                    : "No hay autos disponibles"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SpecificCar
        carId={selectedCarPatente}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={fetchAutos}
      />
    </>
  );
});

export default CarsInfo;

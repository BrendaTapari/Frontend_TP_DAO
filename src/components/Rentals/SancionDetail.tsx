import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft } from "lucide-react";

interface Dano {
  id_daño: number;
  fecha: string;
  gravedad: number;
  tipoDaño: {
    id_tipo_daño: number;
    nombre: string;
    costoBase: number;
  };
  estado: {
    id_estado: number;
    nombre: string;
  };
}

interface Sancion {
  id_sancion: number;
  fecha: string;
  descripcion: string;
  costo_total: number;
  tipo_sancion: {
    id_tipo_sancion: number;
    descripcion: string;
  };
  estado: {
    id_estado: number;
    nombre: string;
  };
}

export default function SancionDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/sanciones/:id");
  const [sanciones, setSanciones] = useState<Sancion[]>([]);
  const [danosMap, setDanosMap] = useState<Record<number, Dano[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!params?.id) {
        console.log("No params.id found");
        setLoading(false);
        return;
      }
      
      console.log("Fetching sanciones for alquiler:", params.id);
      
      try {
        // Fetch sanciones
        const sancionesResponse = await fetch(`http://localhost:3000/api/sanciones/alquiler/${params.id}`);
        
        if (!sancionesResponse.ok) {
          console.error("Error fetching sanciones:", sancionesResponse.status);
          setLoading(false);
          return;
        }
        
        const sancionesData = await sancionesResponse.json();
        console.log("Sanciones data:", sancionesData);
        setSanciones(sancionesData);

        // Fetch daños for each sancion
        const danosPromises = sancionesData.map(async (sancion: Sancion) => {
          const danosResponse = await fetch(`http://localhost:3000/api/danos/sancion/${sancion.id_sancion}`);
          const danosData = await danosResponse.json();
          return { id_sancion: sancion.id_sancion, danos: danosData };
        });

        const danosResults = await Promise.all(danosPromises);
        const danosMapData: Record<number, Dano[]> = {};
        danosResults.forEach(result => {
          danosMapData[result.id_sancion] = result.danos;
        });
        setDanosMap(danosMapData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params?.id]);

  const handleVolver = () => {
    setLocation("/sanciones");
  };

  const calcularCostoDano = (dano: Dano) => {
    return dano.tipoDaño.costoBase * dano.gravedad;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <>
      <div className="font-bold text-3xl ml-2 gap-2 flex items-center mb-4">
        <button className="btn btn-neutral mr-2" onClick={handleVolver}>
          <ArrowLeft />
        </button>
        <span>Detalle de Sanciones - Alquiler #{params?.id}</span>
      </div>

      {sanciones.length === 0 ? (
        <div className="alert alert-info m-2">
          <span>No hay sanciones registradas para este alquiler.</span>
        </div>
      ) : (
        <div className="m-2 space-y-4">
          {sanciones.map((sancion) => {
            const danos = danosMap[sancion.id_sancion] || [];
            const isDanoType = sancion.tipo_sancion.descripcion.toLowerCase() === 'daño';

            return (
              <div key={sancion.id_sancion} className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <h2 className="card-title">
                      Sanción #{sancion.id_sancion} - {sancion.tipo_sancion.descripcion}
                    </h2>
                    <div className={`badge ${sancion.estado.nombre === 'Pagada' ? 'badge-success' : 'badge-warning'}`}>
                      {sancion.estado.nombre}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm opacity-70">Fecha</p>
                      <p className="font-semibold">{sancion.fecha}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-70">Costo Total</p>
                      <p className="font-semibold text-lg">${sancion.costo_total.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm opacity-70">Descripción</p>
                    <p>{sancion.descripcion}</p>
                  </div>

                  {isDanoType && danos.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm opacity-70 mb-2 font-semibold">Daños Asociados ({danos.length})</p>
                      <div className="overflow-x-auto">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Tipo de Daño</th>
                              <th>Gravedad</th>
                              <th>Costo Base</th>
                              <th>Costo Total</th>
                              <th>Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {danos.filter(d => d.tipoDaño !== null).map((dano) => (
                              <tr key={dano.id_daño}>
                                <td>{dano.tipoDaño.nombre}</td>
                                <td>
                                  <div className="badge badge-primary">{dano.gravedad}</div>
                                </td>
                                <td>${dano.tipoDaño.costoBase.toFixed(2)}</td>
                                <td className="font-semibold">${calcularCostoDano(dano).toFixed(2)}</td>
                                <td>
                                  {dano.estado ? (
                                    <div className={`badge ${dano.estado.nombre === 'Reparado' ? 'badge-success' : 'badge-warning'} badge-sm`}>
                                      {dano.estado.nombre}
                                    </div>
                                  ) : (
                                    <div className="badge badge-ghost badge-sm">Sin estado</div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {isDanoType && danos.length === 0 && (
                    <div className="mt-4">
                      <div className="alert alert-warning">
                        <span>Esta sanción de tipo "Daño" no tiene daños asociados registrados.</span>
                      </div>
                    </div>
                  )}

                  <div className="card-actions justify-end mt-4">
                    {sancion.estado.nombre !== 'Pagada' && (
                      <button className="btn btn-primary">
                        Pagar Sanción
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

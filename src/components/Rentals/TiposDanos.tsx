import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { getTiposDaños, deleteTipoDaño } from "../../services/dañosService";
import CreateTipoDanoModal from "../Modals/CreateTipoDanoModal";

export default function TiposDanos() {
  const [, setLocation] = useLocation();
  const [tiposDanos, setTiposDanos] = useState<any[]>([]);
  const [editingTipo, setEditingTipo] = useState<any>(null);

  const fetchTiposDanos = async () => {
    try {
      const data = await getTiposDaños();
      setTiposDanos(data);
    } catch (error) {
      console.error("Error fetching tipos de daños:", error);
    }
  };

  useEffect(() => {
    fetchTiposDanos();
  }, []);

  const handleVolver = () => {
    setLocation("/sanciones");
  };

  const handleEdit = (tipo: any) => {
    setEditingTipo(tipo);
    const modal = document.getElementById("modal_create_tipo_dano") as HTMLDialogElement;
    modal?.showModal();
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro que desea eliminar este tipo de daño?")) {
      try {
        await deleteTipoDaño(id);
        fetchTiposDanos();
      } catch (error) {
        console.error("Error deleting tipo de daño:", error);
      }
    }
  };

  return (
    <>
      <div className="font-bold text-3xl ml-2 gap-2 flex items-center">
        <button className="btn btn-neutral mr-2" onClick={handleVolver}>
          <ArrowLeft />
        </button>
        <span>Tipos de Daños</span>
      </div>

      <div className="p-2 flex gap-2">
        <CreateTipoDanoModal 
          onSuccess={fetchTiposDanos} 
          editingTipo={editingTipo}
          onClose={() => setEditingTipo(null)}
        />
      </div>

      <p className="ml-2 mt-2">Administre los tipos de daños del sistema.</p>

      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 m-2">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Costo Base</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tiposDanos.map((tipo) => (
              <tr key={tipo.id_tipo_daño}>
                <td>{tipo.id_tipo_daño}</td>
                <td>{tipo.nombre}</td>
                <td>${tipo.costoBase.toFixed(2)}</td>
                <td>
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6h.01M12 12h.01M12 18h.01"></path>
                      </svg>
                    </label>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li>
                        <a onClick={() => handleEdit(tipo)}>
                          Editar
                        </a>
                      </li>
                      <li>
                        <a className="text-error" onClick={() => handleDelete(tipo.id_tipo_daño)}>
                          Eliminar
                        </a>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

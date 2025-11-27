import {
  Briefcase,
  Calendar,
  Clock,
  Mail,
  MapPin,
  Phone,
  Search,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getEmployees } from "../../services/employeeService";
import SpecificEmployee from "../Modals/SpecificEmployee";

interface Employee {
  id: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  DNI: string;
  email: string;
  telefono: string;
  direccion: string;
  puesto: string;
  salario: string;
  fechaInicioActividad: string;
  legajo_empleado: string;
}
export default function EmployeeInfo() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployeeLegajo, setSelectedEmployeeLegajo] = useState<string | null>(
    null
  );
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const employees = await getEmployees();
      setEmployees(employees);
      setFilteredEmployees(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const filterEmployees = (term: string) => {
    if (!term.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const filtered = employees.filter((employee: Employee) => {
      const searchLower = term.toLowerCase();
      return (
        employee.nombre?.toLowerCase().includes(searchLower) ||
        employee.apellido?.toLowerCase().includes(searchLower) ||
        employee.DNI?.toString().includes(term)
      );
    });

    setFilteredEmployees(filtered);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    filterEmployees(searchTerm);
  };

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setSearchTerm(value);
    filterEmployees(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-AR");
    } catch {
      return dateString;
    }
  };

  const formatSalary = (salary: string) => {
    try {
      const numSalary = parseFloat(salary);
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
      }).format(numSalary);
    } catch {
      return salary;
    }
  };

  const getPuestoColor = (puesto: string) => {
    const colors: { [key: string]: string } = {
      Gerente: "badge-primary",
      Manager: "badge-primary",
      Supervisor: "badge-secondary",
      Empleado: "badge-accent",
      Vendedor: "badge-info",
      Recepcionista: "badge-success",
      default: "badge-ghost",
    };
    return colors[puesto] || colors["default"];
  };

  const handleViewEmployee = (employeeLegajo: string) => {
    setSelectedEmployeeLegajo(employeeLegajo);
    setShowEmployeeModal(true);
  };

  const handleCloseEmployeeModal = () => {
    setShowEmployeeModal(false);
    setSelectedEmployeeLegajo(null);
  };

  const handleEmployeeUpdated = () => {
    fetchEmployees();
  };

  return (
    <>
      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <div className="flex justify-between p-2">
          <div>
            <h3 className="text-xl font-bold">Información de Empleados</h3>
          </div>
          <div className="join">
            <div>
              <label className="input validator join-item">
                <Search className="mx-2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, apellido o DNI..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                />
              </label>
              <div className="validator-hint hidden">
                Ingrese parametro de busqueda
              </div>
            </div>
            <button
              className="btn btn-neutral join-item"
              onClick={handleSearch}
            >
              Buscar
            </button>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr className="bg-secondary/25 text-secondary-content">
              <th className="text-center">#</th>
              <th>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-secondary-content" />
                  Empleado
                </div>
              </th>
              <th>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-secondary-content" />
                  Contacto
                </div>
              </th>
              <th>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-secondary-content" />
                  Fechas
                </div>
              </th>
              <th>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-secondary-content" />
                  Dirección
                </div>
              </th>
              <th>
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-secondary-content" />
                  Trabajo
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees && filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee: Employee, index: number) => (
                <tr
                  key={employee.DNI}
                  className="hover:bg-base-200/50 cursor-pointer transition-colors"
                  onDoubleClick={() => handleViewEmployee(employee.legajo_empleado)}
                  title="Doble click para ver detalles"
                >
                  <th className="text-center text-base-content/60">
                    {index + 1}
                  </th>

                  {/* Employee Info */}
                  <td>
                    <div className="flex flex-col">
                      <div className="font-bold text-base">
                        {employee.nombre} {employee.apellido}
                      </div>
                      <div className="text-sm text-base-content/60 flex items-center gap-1">
                        <span>DNI:</span> {employee.DNI}
                      </div>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={14} className="text-info" />
                        <span
                          className="truncate max-w-[200px]"
                          title={employee.email}
                        >
                          {employee.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={14} className="text-success" />
                        <span>{employee.telefono}</span>
                      </div>
                    </div>
                  </td>

                  {/* Dates */}
                  <td>
                    <div className="flex flex-col gap-1">
                      <div className="text-sm">
                        <span className="text-base-content/60">
                          Nacimiento:
                        </span>
                        <div className="font-medium">
                          {formatDate(employee.fechaNacimiento)}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-base-content/60">Inicio:</span>
                        <div className="font-medium flex items-center gap-1">
                          <Clock size={12} className="text-warning" />
                          {formatDate(employee.fechaInicioActividad)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Address */}
                  <td>
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-error mt-0.5" />
                      <span
                        className="text-sm max-w-[200px] truncate"
                        title={employee.direccion}
                      >
                        {employee.direccion}
                      </span>
                    </div>
                  </td>

                  {/* Job Info */}
                  <td>
                    <div className="flex flex-col gap-2">
                      <span
                        className={`badge ${getPuestoColor(
                          employee.puesto
                        )} badge-sm`}
                      >
                        {employee.puesto}
                      </span>
                      <div className="flex items-center gap-1 text-sm font-bold text-success">
                        {formatSalary(employee.salario)}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-8">
                  <div className="flex flex-col items-center gap-2">
                    <User size={48} className="text-base-content/20" />
                    <span className="text-lg">
                      {searchTerm
                        ? "No se encontraron empleados con ese criterio de búsqueda"
                        : "No hay empleados disponibles"}
                    </span>
                    {searchTerm && (
                      <span className="text-sm text-base-content/60">
                        Intenta con otro término de búsqueda
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SpecificEmployee
        employeeLegajo={selectedEmployeeLegajo}
        isOpen={showEmployeeModal}
        onClose={handleCloseEmployeeModal}
        onDelete={handleEmployeeUpdated}
        onEdit={handleEmployeeUpdated}
      />
    </>
  );
}

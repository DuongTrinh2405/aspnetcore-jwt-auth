import { useEffect, useState, useCallback, useRef } from "react";
import {
  getAppointments,
  createAppointment,
  deleteAppointment,
  updateAppointment,
} from "../services/appointmentService";

import { getCustomers } from "../services/customerService";
import { getProperties } from "../services/propertyService";

import AppointmentForm from "../components/Appointment/AppointmentForm";
import AppointmentTable from "../components/Appointment/AppointmentTable";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // ✅ pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // ✅ filter
  const [filters, setFilters] = useState({
    status: "",
    fromDate: "",
    toDate: "",
  });

  const requestRef = useRef(0);

  // ==============================
  // FETCH DATA
  // ==============================
  const fetchAppointments = useCallback(async () => {
    const currentRequest = ++requestRef.current;

    try {
      setLoading(true);

      const result = await getAppointments({
        page,
        pageSize,
        search,
        ...filters,
      });

      if (currentRequest !== requestRef.current) return;

      setAppointments(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error(err);
      alert(JSON.stringify(err));
    } finally {
      if (currentRequest === requestRef.current) {
        setLoading(false);
      }
    }
  }, [page, pageSize, search, filters]);

  // ==============================
  // INIT
  // ==============================
  useEffect(() => {
    fetchAppointments();
    fetchDropdownData();
  }, [fetchAppointments]);

  // ==============================
  // DEBOUNCE SEARCH
  // ==============================
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchAppointments();
    }, 400);

    return () => clearTimeout(timer);
  }, [search, fetchAppointments]);

  // ==============================
  // DROPDOWN
  // ==============================
  const fetchDropdownData = async () => {
    try {
      const cus = await getCustomers();
      const pro = await getProperties();

      setCustomers(Array.isArray(cus) ? cus : cus?.data || []);
      setProperties(Array.isArray(pro) ? pro : pro?.data || []);
    } catch (err) {
      console.error(err);
      setCustomers([]);
      setProperties([]);
    }
  };

  // ==============================
  // SUBMIT
  // ==============================
  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        await updateAppointment(editing.id, payload);
      } else {
        await createAppointment(payload);
      }

      setIsOpen(false);
      setEditing(null);
      fetchAppointments();
    } catch (err) {
      alert(JSON.stringify(err));
    }
  };

  // ==============================
  // EDIT
  // ==============================
  const handleEdit = (a) => {
    const formatForInput = (date) => {
      if (!date) return "";
      const d = new Date(date);
      return d.toISOString().slice(0, 16);
    };

    setEditing({
      ...a,
      customerId: a.customerId || a.customer?.id,
      propertyId: a.propertyId || a.property?.id,
      dateTime: formatForInput(a.dateTime),
    });

    setIsOpen(true);
  };

  // ==============================
  // DELETE
  // ==============================
  const handleDelete = async (id) => {
    if (!window.confirm("Xoá lịch hẹn này?")) return;

    try {
      await deleteAppointment(id);
      fetchAppointments();
    } catch (err) {
      alert(JSON.stringify(err));
    }
  };

  // ==============================
  // PAGINATION (🔥 GIỐNG DEAL)
  // ==============================
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const renderPagination = () => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
      .slice(Math.max(0, page - 3), page + 2);

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          ←
        </button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1 rounded border ${
              p === page
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          →
        </button>
      </div>
    );
  };

  return (
    <div className="app-page space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Lịch hẹn</h2>
          <p className="text-slate-600 mt-1">
            Quản lý lịch hẹn xem bất động sản
          </p>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setIsOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Tạo lịch hẹn
        </button>
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <div className="grid grid-cols-3 gap-4">
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value }))
            }
            className="border p-2 rounded"
          >
            <option value="">All Status</option>
            <option value="0">Pending</option>
            <option value="1">Confirmed</option>
            <option value="2">Completed</option>
          </select>

          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) =>
              setFilters((f) => ({ ...f, fromDate: e.target.value }))
            }
            className="border p-2 rounded"
          />

          <input
            type="date"
            value={filters.toDate}
            onChange={(e) =>
              setFilters((f) => ({ ...f, toDate: e.target.value }))
            }
            className="border p-2 rounded"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <AppointmentTable
          data={appointments}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* ✅ NEW PAGINATION */}
        {renderPagination()}

        <p className="text-sm text-gray-500 text-center mt-2">
          Trang {page} / {totalPages}
        </p>
      </div>

      {/* MODAL */}
      {isOpen && (
        <AppointmentForm
          customers={customers}
          properties={properties}
          initialData={editing}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsOpen(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

export default Appointments;
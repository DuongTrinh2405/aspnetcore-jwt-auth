import { useEffect, useState, useCallback, useRef } from "react";
import {
  getAppointments,
  createAppointment,
  deleteAppointment,
  updateAppointment,
  searchAppointments,
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

  // 🔥 chống race condition
  const requestRef = useRef(0);

  // ==============================
  // FETCH DATA (FIX)
  // ==============================
  const fetchAppointments = useCallback(async (searchTerm = "") => {
    const currentRequest = ++requestRef.current;

    try {
      setLoading(true);

      let data;
      if (searchTerm.trim()) {
        data = await searchAppointments(searchTerm.trim(), 1, 10);
      } else {
        data = await getAppointments({ page: 1, pageSize: 10 });
      }

      // ❗ bỏ request cũ
      if (currentRequest !== requestRef.current) return;

      setAppointments(data);
    } catch (err) {
      console.error(err);
      alert(JSON.stringify(err));
    } finally {
      if (currentRequest === requestRef.current) {
        setLoading(false);
      }
    }
  }, []);

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
      fetchAppointments(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, fetchAppointments]);

  // ==============================
  // DROPDOWN DATA
  // ==============================
  const fetchDropdownData = async () => {
    const cus = await getCustomers();
    const pro = await getProperties();
    setCustomers(cus);
    setProperties(pro);
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
      await fetchAppointments(search);
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

    const mapped = {
      ...a,
      customerId: a.customerId || a.customer?.id,
      propertyId: a.propertyId || a.property?.id,
      date: formatForInput(
        a.date || a.dateTime || a.appointmentDate
      ),
    };

    setEditing(mapped);
    setIsOpen(true);
  };

  // ==============================
  // DELETE
  // ==============================
  const handleDelete = async (id) => {
    if (!window.confirm("Xoá lịch hẹn này?")) return;

    try {
      await deleteAppointment(id);
      await fetchAppointments(search);
    } catch (err) {
      alert(JSON.stringify(err));
    }
  };

  return (
    <div className="space-y-6">
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
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium"
        >
          Tạo lịch hẹn
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <input
          type="text"
          placeholder="Tìm kiếm lịch hẹn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* MODAL */}
      {isOpen && (
        <AppointmentForm
          initialData={editing}
          customers={customers}
          properties={properties}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsOpen(false);
            setEditing(null);
          }}
        />
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <AppointmentTable
          data={appointments}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default Appointments;
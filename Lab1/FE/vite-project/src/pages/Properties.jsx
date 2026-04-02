import { useEffect, useState, useCallback } from "react";
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
} from "../services/propertyService";

import PropertyTable from "../components/Property/PropertyTable";
import PropertyForm from "../components/Property/PropertyForm";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchProperties = useCallback(async (searchTerm = "") => {
    try {
      setLoading(true);
      let data;
      if (searchTerm.trim()) {
        data = await searchProperties(searchTerm.trim());
      } else {
        data = await getProperties();
      }
      setProperties(data);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải properties");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchProperties(search);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search, fetchProperties]);

  const handleSubmit = async (formData) => {
    try {
      if (editing) {
        await updateProperty(editing.id, formData);
      } else {
        await createProperty(formData);
      }

      setIsOpen(false);
      setEditing(null);
      await fetchProperties(search);
    } catch (err) {
      alert("Lỗi khi lưu property");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá?")) return;

    try {
      await deleteProperty(id);
      await fetchProperties(search);
    } catch (err) {
      alert("Lỗi khi xoá");
    }
  };

  const handleCreate = () => {
    setEditing(null);
    setIsOpen(true);
  };

  const handleEdit = (item) => {
    setEditing(item);
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Properties</h2>
          <p className="text-slate-600 mt-1">Quản lý bất động sản</p>
        </div>

        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm property
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder-slate-400"
          />
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <PropertyTable
          data={properties}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* MODAL */}
      {isOpen && (
        <PropertyForm
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

export default Properties;
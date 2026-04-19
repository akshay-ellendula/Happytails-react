import React, { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Loader from "./Components/Loader";
import { axiosInstance } from "../../utils/axios";
import "./admin-styles.css";

export default function Reviews() {
  const [mode, setMode] = useState("product");
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [minRating, setMinRating] = useState("0");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [suppressAutoSelect, setSuppressAutoSelect] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editRating, setEditRating] = useState("5");
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ visible: false, type: "success", message: "" });

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
  };

  useEffect(() => {
    if (!toast.visible) return undefined;
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2600);

    return () => clearTimeout(timer);
  }, [toast.visible]);

  const options = useMemo(() => {
    if (mode === "product") {
      return products.map((p) => ({ id: p.id || p._id, name: p.product_name || "Unnamed Product" }));
    }
    return events.map((e) => ({
      id: e._id || e.id || e.event_id,
      name: e.title || e.event_name || "Unnamed Event",
    }));
  }, [mode, products, events]);

  useEffect(() => {
    const loadLists = async () => {
      setLoadingLists(true);
      try {
        const [productRes, eventRes] = await Promise.all([
          axiosInstance.get("/admin/products"),
          axiosInstance.get("/admin/events"),
        ]);

        setProducts(productRes.data?.products || []);
        setEvents(eventRes.data?.data?.events || []);
      } catch (err) {
        console.error("Error loading review lists:", err);
      } finally {
        setLoadingLists(false);
      }
    };

    loadLists();
  }, []);

  useEffect(() => {
    setSuppressAutoSelect(false);
    if (!options.length) {
      setSelectedId("");
      return;
    }

    const exists = options.some((o) => String(o.id) === String(selectedId));
    if (!selectedId && !suppressAutoSelect) {
      setSelectedId(String(options[0].id));
      return;
    }

    if (!exists && selectedId) {
      setSelectedId(String(options[0].id));
    }
  }, [mode, options, selectedId, suppressAutoSelect]);

  const loadEntries = useCallback(async () => {
    if (!selectedId) {
      setEntries([]);
      setAvgRating(0);
      setTotalRatings(0);
      return;
    }

    setLoadingEntries(true);
    try {
      if (mode === "product") {
        const res = await axiosInstance.get(`/admin/products/${selectedId}/ratings`);
        setEntries(res.data?.ratings || []);
        setAvgRating(res.data?.avgRating || 0);
        setTotalRatings(res.data?.totalRatings || 0);
      } else {
        const res = await axiosInstance.get(`/admin/events/${selectedId}/reviews`);
        setEntries(res.data?.reviews || []);
        setAvgRating(res.data?.avgRating || 0);
        setTotalRatings(res.data?.totalRatings || 0);
      }
    } catch (err) {
      console.error("Error loading reviews/ratings:", err);
      setEntries([]);
      setAvgRating(0);
      setTotalRatings(0);
    } finally {
      setLoadingEntries(false);
    }
  }, [mode, selectedId]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const openEditModal = (entry) => {
    setEditTarget(entry);
    setEditRating(String(entry.rating || 5));
    setEditText(mode === "product" ? (entry.review || entry.title || "") : (entry.comment || ""));
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editTarget || !selectedId) return;
    setSavingEdit(true);
    try {
      const numericRating = Number(editRating);
      if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
        showToast("error", "Rating must be between 1 and 5");
        return;
      }

      if (mode === "product") {
        await axiosInstance.patch(`/admin/products/${selectedId}/ratings/${editTarget.id}`, {
          rating: numericRating,
          review: editText,
        });
      } else {
        await axiosInstance.patch(`/admin/events/${selectedId}/reviews/${editTarget.id}`, {
          rating: numericRating,
          comment: editText,
        });
      }

      setEditOpen(false);
      setEditTarget(null);
      await loadEntries();
      showToast("success", mode === "product" ? "Rating updated successfully" : "Review updated successfully");
    } catch (err) {
      console.error("Failed to update entry:", err);
      showToast("error", "Failed to update entry");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteEntry = async (entry) => {
    if (!selectedId) return;
    const confirmed = window.confirm("Are you sure you want to delete this feedback entry?");
    if (!confirmed) return;

    setDeletingId(entry.id);
    try {
      if (mode === "product") {
        await axiosInstance.delete(`/admin/products/${selectedId}/ratings/${entry.id}`);
      } else {
        await axiosInstance.delete(`/admin/events/${selectedId}/reviews/${entry.id}`);
      }
      await loadEntries();
      showToast("success", mode === "product" ? "Rating deleted successfully" : "Review deleted successfully");
    } catch (err) {
      console.error("Failed to delete entry:", err);
      showToast("error", "Failed to delete entry");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEntries = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const min = Number(minRating || 0);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    return entries.filter((entry) => {
      const content = mode === "product"
        ? `${entry.review || ""} ${entry.title || ""}`.toLowerCase()
        : `${entry.comment || ""}`.toLowerCase();
      const customer = (entry.customer || "").toLowerCase();

      const matchesKeyword = !keyword || content.includes(keyword) || customer.includes(keyword);
      const matchesRating = Number(entry.rating || 0) >= min;

      const entryDate = entry.date ? new Date(entry.date) : null;
      const matchesStart = !start || (entryDate && entryDate >= start);
      const matchesEnd = !end || (entryDate && entryDate <= end);

      return matchesKeyword && matchesRating && matchesStart && matchesEnd;
    });
  }, [entries, mode, searchTerm, minRating, startDate, endDate]);

  const selectedName = options.find((o) => String(o.id) === String(selectedId))?.name || "-";
  const hasActiveFilters = Boolean(searchTerm || Number(minRating) > 0 || startDate || endDate);

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen admin-shell">
      <Sidebar />

      <div className="ml-64 w-full admin-content">
        <Header title="Reviews & Ratings" />

        <div className="p-6">
          {toast.visible && (
            <div className="fixed top-20 right-6 z-[60]">
              <div
                className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold ${
                  toast.type === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                {toast.message}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 premium-hover-card">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
              <div className="w-full lg:w-52">
                <label className="block text-sm text-gray-600 mb-2 font-medium">🧭 Type</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-yellow-500"
                >
                  <option value="product">Product Ratings</option>
                  <option value="event">Event Reviews</option>
                </select>
              </div>

              <div className="w-full lg:flex-1">
                <label className="block text-sm text-gray-600 mb-2 font-medium">
                  {mode === "product" ? "🛍️ Select Product" : "🎟️ Select Event"}
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => {
                    setSelectedId(e.target.value);
                    setSuppressAutoSelect(false);
                  }}
                  disabled={loadingLists || !options.length}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-yellow-500 disabled:opacity-60"
                >
                  <option value="">
                    {mode === "product" ? "Select a product" : "Select an event"}
                  </option>
                  {options.length === 0 ? (
                    <option value="__none" disabled>No items available</option>
                  ) : (
                    options.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {loadingLists ? (
            <Loader />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-yellow-500 premium-hover-card">
                  <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl mb-3">📌</div>
                  <h3 className="text-sm text-gray-500 uppercase tracking-wider">Selected</h3>
                  <p className="text-xl font-bold text-gray-800 mt-2 truncate">{selectedName}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500 premium-hover-card">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xl mb-3">⭐</div>
                  <h3 className="text-sm text-gray-500 uppercase tracking-wider">Average Rating</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{Number(avgRating || 0).toFixed(1)}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500 premium-hover-card">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-xl mb-3">🧾</div>
                  <h3 className="text-sm text-gray-500 uppercase tracking-wider">Total {mode === "product" ? "Ratings" : "Reviews"}</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{totalRatings || 0}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-purple-500 premium-hover-card">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-xl mb-3">🔎</div>
                  <h3 className="text-sm text-gray-500 uppercase tracking-wider">Active Filters</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{hasActiveFilters ? 1 : 0}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 premium-hover-card">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  {mode === "product" ? "Product Ratings" : "Event Reviews"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 font-medium">🔎 Search</label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Customer or text"
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 font-medium">⭐ Min Rating</label>
                    <select
                      value={minRating}
                      onChange={(e) => setMinRating(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-yellow-500"
                    >
                      <option value="0">All</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5 only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 font-medium">📅 From</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 font-medium">📅 To</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="mb-6 flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                    <p className="text-sm text-yellow-800 font-medium">Filters are active. Showing refined feedback results.</p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setMinRating("0");
                        setStartDate("");
                        setEndDate("");
                        setSelectedId("");
                        setAvgRating(0);
                        setTotalRatings(0);
                        setEntries([]);
                        setSuppressAutoSelect(true);
                      }}
                      className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-white border border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}

                {loadingEntries ? (
                  <Loader />
                ) : filteredEntries.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                    <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center text-2xl">🗂️</div>
                    <p className="text-gray-700 font-semibold text-lg">
                      {selectedId ? "No entries found for this selection" : "Choose a product or event to view feedback"}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {selectedId
                        ? hasActiveFilters
                          ? "Try broadening filters or clearing them to view more feedback."
                          : "Select another item or wait for customer reviews to arrive."
                        : "Use the dropdown above to load a product rating list or event review list."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 text-left font-semibold text-gray-700">Customer</th>
                          <th className="p-3 text-left font-semibold text-gray-700">Rating</th>
                          {mode === "product" ? (
                            <th className="p-3 text-left font-semibold text-gray-700">Review</th>
                          ) : (
                            <th className="p-3 text-left font-semibold text-gray-700">Comment</th>
                          )}
                          <th className="p-3 text-left font-semibold text-gray-700">Date</th>
                          <th className="p-3 text-left font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEntries.map((entry) => (
                          <tr key={entry.id} className="border-b hover:bg-gray-50 premium-hover-row">
                            <td className="p-3 font-medium text-gray-800">{entry.customer || "Anonymous"}</td>
                            <td className="p-3">
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                                {entry.rating || 0} / 5
                              </span>
                            </td>
                            <td className="p-3 text-gray-700 text-sm max-w-xl">
                              {mode === "product"
                                ? entry.review || entry.title || "-"
                                : entry.comment || "-"}
                            </td>
                            <td className="p-3 text-gray-500 text-sm">
                              {entry.date ? new Date(entry.date).toLocaleDateString() : "-"}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openEditModal(entry)}
                                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteEntry(entry)}
                                  disabled={deletingId === entry.id}
                                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-60"
                                >
                                  {deletingId === entry.id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {editOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 admin-modal-backdrop">
                  <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl admin-modal-panel">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      {mode === "product" ? "Edit Product Rating" : "Edit Event Review"}
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Rating</label>
                        <select
                          value={editRating}
                          onChange={(e) => setEditRating(e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-xl p-3"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          {mode === "product" ? "Review" : "Comment"}
                        </label>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={4}
                          className="w-full border-2 border-gray-200 rounded-xl p-3"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => {
                          setEditOpen(false);
                          setEditTarget(null);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={savingEdit}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-60"
                      >
                        {savingEdit ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


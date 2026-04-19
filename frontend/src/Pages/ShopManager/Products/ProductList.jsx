import React, { useEffect, useState, useCallback, useMemo } from "react";
import { axiosInstance } from "../../../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Eye,
  Package,
  TrendingUp,
  ChevronDown,
  IndianRupee,
  AlertCircle,
  ArrowRight,
  Trash2,
  Check,
  X,
  Upload,
  Download,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: "All Categories",
    sort: "newest",
    petType: "all",
  });
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [topLoading, setTopLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editingStock, setEditingStock] = useState(null);
  const [stockValue, setStockValue] = useState("");
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvPreview, setCsvPreview] = useState([]);
  const [csvRawText, setCsvRawText] = useState("");
  const [csvUploading, setCsvUploading] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState("");
  const [showFilters, setShowFilters] = useState(() => {
    try {
      const saved = localStorage.getItem("shopProductFiltersVisible");
      return saved === null ? true : saved === "true";
    } catch {
      return true;
    }
  });
  const [previewProduct, setPreviewProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [hoveredProductImageIndex, setHoveredProductImageIndex] = useState({});
  const navigate = useNavigate();

  // Read low stock threshold from settings (defaults to 15 if not set)
  const getLowStockThreshold = useCallback(() => {
    try {
      const s = JSON.parse(localStorage.getItem("shopSettings") || "{}");
      return parseInt(s.lowStockThreshold) || 15;
    } catch {
      return 15;
    }
  }, []);
  const LOW_STOCK = getLowStockThreshold();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch products when filters change (not on every search keystroke)
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Fetch top products only once
  useEffect(() => {
    fetchTopProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/vendors/products", {
        params: {
          category: filters.category,
          sort: filters.sort,
          petType: filters.petType,
        },
      });
      if (res.data.success) setProducts(res.data.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
    setLoading(false);
  }, [filters]);

  const fetchTopProducts = useCallback(async () => {
    setTopLoading(true);
    try {
      const res = await axiosInstance.get("/vendors/products/top3");
      if (res.data.success) {
        setTopProducts(res.data.topProducts || []);
      }
    } catch (err) {
      console.error("Error fetching top 3:", err);
    }
    setTopLoading(false);
  }, []);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: name === "petType" ? value.toLowerCase() : value,
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      category: "All Categories",
      sort: "newest",
      petType: "all",
    });
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("shopProductFiltersVisible", String(next));
      } catch {
        // ignore storage write failures
      }
      return next;
    });
  }, []);

  const getCategoryColor = useCallback((category) => {
    const colors = {
      food: "bg-orange-100 text-orange-800",
      toys: "bg-blue-100 text-blue-800",
      grooming: "bg-purple-100 text-purple-800",
      beds: "bg-emerald-100 text-emerald-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category?.toLowerCase()] || colors.other;
  }, []);

  const getStockBadge = useCallback((quantity) => {
    if (quantity > 15)
      return { text: "In Stock", color: "bg-emerald-100 text-emerald-800" };
    if (quantity > 0)
      return { text: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Out of Stock", color: "bg-red-100 text-red-800" };
  }, []);

  const normalizePreviewProduct = useCallback(
    (rawProduct = {}, fallback = {}) => {
      const variants = Array.isArray(rawProduct.variants)
        ? rawProduct.variants
        : [];

      const regularFromVariant = variants.find(
        (v) => v?.regular_price !== undefined && v?.regular_price !== null,
      )?.regular_price;
      const saleFromVariant = variants.find(
        (v) => v?.sale_price !== undefined && v?.sale_price !== null,
      )?.sale_price;
      const stockFromVariants = variants.reduce(
        (sum, v) => sum + (Number(v?.stock_quantity) || 0),
        0,
      );

      const regularPrice = Number(
        rawProduct.regular_price ??
          fallback.regular_price ??
          regularFromVariant ??
          0,
      );

      const saleCandidate =
        rawProduct.sale_price ?? fallback.sale_price ?? saleFromVariant;
      const salePrice =
        saleCandidate === undefined ||
        saleCandidate === null ||
        saleCandidate === ""
          ? null
          : Number(saleCandidate);

      const stockQuantity = Number(
        rawProduct.stock_quantity ??
          fallback.stock_quantity ??
          (variants.length > 0 ? stockFromVariants : 0),
      );

      const images =
        Array.isArray(rawProduct.images) && rawProduct.images.length > 0
          ? rawProduct.images
          : Array.isArray(fallback.images) && fallback.images.length > 0
            ? fallback.images
            : rawProduct.image_data
              ? [{ image_data: rawProduct.image_data, is_primary: true }]
              : fallback.image_data
                ? [{ image_data: fallback.image_data, is_primary: true }]
                : [];

      return {
        ...fallback,
        ...rawProduct,
        regular_price: Number.isFinite(regularPrice) ? regularPrice : 0,
        sale_price: Number.isFinite(salePrice) ? salePrice : null,
        stock_quantity: Number.isFinite(stockQuantity) ? stockQuantity : 0,
        description:
          rawProduct.description ||
          rawProduct.product_description ||
          fallback.description ||
          fallback.product_description ||
          "",
        pet_type:
          rawProduct.pet_type ||
          rawProduct.product_type ||
          fallback.pet_type ||
          fallback.product_type ||
          "",
        images,
      };
    },
    [],
  );

  const openProductPreview = useCallback(
    async (product) => {
      if (!product) return;

      const productId = product._id || product.id;
      if (!productId) {
        toast.error("Invalid product id");
        return;
      }

      try {
        const res = await axiosInstance.get(`/vendors/products/${productId}`);
        const apiProduct = res?.data?.product;

        setPreviewProduct(
          normalizePreviewProduct(apiProduct || product, product),
        );
        setCurrentImageIndex(0);

        if (!apiProduct) {
          toast("Showing available product data");
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setPreviewProduct(normalizePreviewProduct(product, product));
        setCurrentImageIndex(0);
        toast.error("Could not load full details. Showing available data.");
      }
    },
    [normalizePreviewProduct],
  );

  // Memoize filtered products
  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          (searchDebounce === "" ||
            p.product_name
              ?.toLowerCase()
              .includes(searchDebounce.toLowerCase()) ||
            p.product_category
              ?.toLowerCase()
              .includes(searchDebounce.toLowerCase())) &&
          (filters.petType === "all" ||
            (p.product_type || "").toLowerCase() === filters.petType ||
            (p.product_type || "").toLowerCase() === "both"),
      ),
    [products, searchDebounce, filters.petType],
  );

  // Memoize low stock calculation
  const lowStockProducts = useMemo(
    () => products.filter((p) => (p.stock_quantity || 0) <= LOW_STOCK),
    [products, LOW_STOCK],
  );

  // Memoize stock summary
  const stockSummary = useMemo(
    () => ({
      totalValue: products.reduce(
        (sum, p) => sum + (p.regular_price || 0) * (p.stock_quantity || 0),
        0,
      ),
      inStock: products.filter((p) => (p.stock_quantity || 0) > 15).length,
      lowStock: products.filter(
        (p) =>
          (p.stock_quantity || 0) > 0 && (p.stock_quantity || 0) <= LOW_STOCK,
      ).length,
      outOfStock: products.filter((p) => (p.stock_quantity || 0) === 0).length,
    }),
    [products, LOW_STOCK],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "All Categories") count += 1;
    if (filters.sort !== "newest") count += 1;
    if (filters.petType !== "all") count += 1;
    return count;
  }, [filters]);

  // Bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (selectedProducts.length === 0) return;
    if (
      !window.confirm(
        `Delete ${selectedProducts.length} product(s)? This cannot be undone.`,
      )
    )
      return;
    try {
      let deleted = 0;
      for (const id of selectedProducts) {
        await axiosInstance.delete(`/vendors/products/${id}`);
        deleted++;
      }
      setProducts(
        products.filter((p) => !selectedProducts.includes(p._id || p.id)),
      );
      setSelectedProducts([]);
      toast.success(`${deleted} product(s) deleted`);
    } catch {
      toast.error("Some products failed to delete");
    }
  }, [selectedProducts, products]);

  // Toggle product selection
  const toggleProductSelect = useCallback((id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const _toggleSelectAll = useCallback(() => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p._id || p.id));
    }
  }, [selectedProducts.length, filteredProducts]);

  // Quick stock update
  const handleQuickStock = useCallback(
    async (productId) => {
      const qty = parseInt(stockValue);
      if (isNaN(qty) || qty < 0) {
        toast.error("Enter a valid stock quantity");
        return;
      }
      try {
        await axiosInstance.put(`/vendors/products/${productId}/stock`, {
          stock_quantity: qty,
        });
        setProducts(
          products.map((p) => {
            if ((p._id || p.id) === productId) {
              return { ...p, stock_quantity: qty };
            }
            return p;
          }),
        );
        setEditingStock(null);
        setStockValue("");
        toast.success("Stock updated!");
      } catch {
        toast.error("Failed to update stock");
      }
    },
    [stockValue, products],
  );

  // --- CSV Bulk Upload Helpers ---
  const CSV_TEMPLATE =
    "product_name,product_category,product_type,product_description,regular_price,sale_price,stock_quantity,size,color,sku,image_url\n";

  const downloadTemplate = () => {
    const exampleRows = [
      '"Royal Canin Adult Dog Food",food,dog,"Complete dry nutrition for adult dogs",1299,999,50,3kg,,SKU-001,https://example.com/dog-food-1.jpg',
      '"Catit Petal Fountain",accessories,cat,"Automatic water fountain for cats",2499,,30,2L,White,SKU-002,https://example.com/cat-fountain-1.jpg',
      '"Kong Classic Chew Toy",toys,both,"Durable rubber chew toy for dogs and cats",599,499,100,Medium,Red,SKU-003,https://example.com/toy-1.jpg;https://example.com/toy-2.jpg',
      '"Wahl Pet Clipper Kit",grooming,both,"Professional grooming kit for dogs and cats",1899,1599,20,,,SKU-004,https://example.com/clipper-1.jpg;https://example.com/clipper-2.jpg;https://example.com/clipper-3.jpg',
      '"Beaphar Vitamin Capsules",healthcare,dog,"Daily health supplement for dogs",349,,75,30 caps,,SKU-005,',
    ].join("\n");
    const blob = new Blob([CSV_TEMPLATE + exampleRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "happytails_products_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCsvFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      setCsvRawText(text);
      // Parse for preview
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l);
      if (lines.length < 2) {
        setCsvPreview([]);
        return;
      }
      const headers = lines[0]
        .split(",")
        .map((h) => h.trim().replace(/^"|"$/g, ""));
      const rows = [];
      for (let i = 1; i < lines.length && i <= 10; i++) {
        const vals = [];
        let cur = "",
          inQ = false;
        for (const ch of lines[i]) {
          if (ch === '"') inQ = !inQ;
          else if (ch === "," && !inQ) {
            vals.push(cur.trim());
            cur = "";
          } else cur += ch;
        }
        vals.push(cur.trim());
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = vals[idx] || "";
        });
        rows.push(obj);
      }
      setCsvPreview(rows);
    };
    reader.readAsText(file);
  };

  const handleCsvUpload = async () => {
    if (!csvRawText) {
      toast.error("Please select a CSV file first");
      return;
    }
    setCsvUploading(true);
    try {
      const res = await axiosInstance.post("/vendors/products/bulk-upload", {
        csvData: csvRawText,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        if (res.data.errors?.length > 0) {
          res.data.errors
            .slice(0, 3)
            .forEach((e) => toast.error(`Row ${e.row}: ${e.error}`));
        }
        setCsvModalOpen(false);
        setCsvPreview([]);
        setCsvRawText("");
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Bulk upload failed");
    } finally {
      setCsvUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-gray-500 mt-1">Manage your store's products</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">
              {products.length}
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Package className="text-emerald-600" size={24} />
          </div>
        </div>
      </div>
      {/* Low Stock Alert Banner */}
      {(() => {
        if (lowStockProducts.length === 0) return null;
        return (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                <AlertCircle className="text-red-600" size={20} />
              </div>
              <div>
                <p className="font-semibold text-red-800">
                  {lowStockProducts.length} product
                  {lowStockProducts.length > 1 ? "s" : ""} need
                  {lowStockProducts.length === 1 ? "s" : ""} restocking
                </p>
                <p className="text-sm text-red-600 mt-0.5">
                  {lowStockProducts.map((p) => (
                    <span
                      key={p._id || p.id}
                      className="inline-flex items-center gap-1 mr-2 mt-1 px-2 py-0.5 bg-red-100 rounded-full text-xs font-medium text-red-700"
                    >
                      {p.product_name}
                      <span className="text-red-500">
                        ({p.stock_quantity || 0} left)
                      </span>
                    </span>
                  ))}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/shop/products/view-all")}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Eye size={16} />
              View All
            </button>
          </div>
        );
      })()}
      <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Top 3 Best Sellers
              </h2>
              <p className="text-sm text-gray-600">
                By total revenue – all time
              </p>
            </div>
          </div>
          <Link
            to="/shop/products/view-all"
            className="hidden sm:flex items-center gap-1.5 text-emerald-600 hover:text-emerald-800 text-sm font-medium"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {topLoading ? (
          <div className="py-16 flex justify-center">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : topProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
            {topProducts.map((prod, idx) => (
              <div
                key={prod.product_id}
                className="p-5 lg:p-6 group hover:bg-gray-50/70 transition-colors relative"
              >
                {/* Rank badge */}
                <div className="absolute top-4 right-4 lg:top-5 lg:right-5 bg-gradient-to-br from-emerald-500 to-green-600 text-white text-xs lg:text-sm font-bold w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center shadow-md ring-4 ring-white z-10">
                  #{idx + 1}
                </div>

                <div className="flex items-start gap-4 lg:gap-5">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.product_name}
                        className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-xl border border-gray-200 shadow-sm group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                        <Package className="text-gray-400" size={32} />
                      </div>
                    )}
                  </div>

                  {/* Content – no link */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base lg:text-lg text-gray-900 truncate mb-1.5 lg:mb-2">
                      {prod.product_name}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 lg:gap-6 text-sm mt-2 lg:mt-3">
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">
                          Sold
                        </p>
                        <p className="font-bold text-gray-800 text-base lg:text-lg">
                          {prod.quantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">
                          Revenue
                        </p>
                        <p className="font-bold text-gray-800 text-base lg:text-lg">
                          ₹{prod.revenue}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 lg:py-16 px-6 text-center text-gray-500">
            <div className="w-16 h-16 lg:w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-gray-400" size={32} />
            </div>
            <h3 className="text-base lg:text-lg font-medium text-gray-700 mb-2">
              No sales yet
            </h3>
            <p className="text-sm mb-5 lg:mb-6">
              Your top selling products will appear here once orders start
              coming in.
            </p>
            <Link
              to="/shop/products/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition shadow-sm"
            >
              <Plus size={18} /> Add Product
            </Link>
          </div>
        )}
      </div>
      {/* Search + Filters */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex items-center gap-3">
              <Search className="text-gray-400 ml-2" size={20} />
              <input
                type="text"
                placeholder="Search products by name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={toggleFilters}
                  className={`relative p-2 rounded-lg transition-colors ${
                    showFilters
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                  title={showFilters ? "Hide filters" : "Show filters"}
                  aria-label={showFilters ? "Hide filters" : "Show filters"}
                  aria-pressed={showFilters}
                >
                  <Filter className="text-gray-400" size={20} />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] leading-5 font-bold text-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <div className="flex border-l border-gray-200 pl-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg ${
                      viewMode === "grid"
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg ${
                      viewMode === "list"
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showFilters && (
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="All Categories">All Categories</option>
              <option value="food">🍖 Food & Treats</option>
              <option value="toys">🎾 Toys & Play</option>
              <option value="grooming">✂️ Grooming</option>
              <option value="beds">🛏️ Beds & Furniture</option>
              <option value="accessories">🎀 Accessories</option>
              <option value="healthcare">💊 Healthcare</option>
              <option value="training">🏅 Training</option>
              <option value="carriers">🧳 Carriers & Travel</option>
            </select>
          )}
        </div>

        {!showFilters && (
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>Filters are hidden</span>
            <button
              type="button"
              onClick={toggleFilters}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
            >
              Show Filters
            </button>
          </div>
        )}

        {showFilters && (
          <div className="flex flex-wrap items-center gap-3">
            <select
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white min-w-[180px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <select
              name="petType"
              value={filters.petType}
              onChange={handleFilterChange}
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white min-w-[160px]"
            >
              <option value="all">🐾 All Pets</option>
              <option value="dog">🐶 Dog</option>
              <option value="cat">🐱 Cat</option>
              <option value="both">🐶🐱 Both</option>
            </select>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-4 py-2.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
      {/* Bulk Action Bar */}
      {selectedProducts.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-sm font-semibold text-red-700">
            {selectedProducts.length} product
            {selectedProducts.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Trash2 size={16} />
              Delete Selected
            </button>
          </div>
          <button
            onClick={() => setSelectedProducts([])}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear selection
          </button>
        </div>
      )}
      {/* Stock Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Total Value</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            ₹{stockSummary.totalValue.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-700 font-medium">In Stock</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {stockSummary.inStock}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <p className="text-sm text-yellow-700 font-medium">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">
            {stockSummary.lowStock}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
          <p className="text-sm text-red-700 font-medium">Out of Stock</p>
          <p className="text-2xl font-bold text-red-900 mt-1">
            {stockSummary.outOfStock}
          </p>
        </div>
      </div>
      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
            {filteredProducts.map((product) => {
              const stockBadge = getStockBadge(product.stock_quantity || 0);

              return (
                <div
                  key={product._id || product.id}
                  className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-all group ${selectedProducts.includes(product._id || product.id) ? "border-blue-400 ring-2 ring-blue-200" : "border-gray-200"}`}
                >
                  <div
                    className="relative h-44 sm:h-48 bg-gray-50 group/image"
                    onMouseEnter={() =>
                      setHoveredProductId(product._id || product.id)
                    }
                    onMouseLeave={() => {
                      setHoveredProductId(null);
                      setHoveredProductImageIndex({});
                    }}
                  >
                    {/* Selection checkbox */}
                    <div className="absolute top-3 right-3 z-10">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(
                          product._id || product.id,
                        )}
                        onChange={() =>
                          toggleProductSelect(product._id || product.id)
                        }
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    {/* Multi-image support */}
                    {product.images && product.images.length > 0 ? (
                      <div className="w-full h-full relative">
                        <img
                          src={
                            product.images[
                              hoveredProductImageIndex[
                                product._id || product.id
                              ] || 0
                            ]?.image_data || product.image_data
                          }
                          alt={product.product_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Image carousel navigation */}
                        {product.images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentIdx =
                                  hoveredProductImageIndex[
                                    product._id || product.id
                                  ] || 0;
                                setHoveredProductImageIndex({
                                  ...hoveredProductImageIndex,
                                  [product._id || product.id]:
                                    currentIdx === 0
                                      ? product.images.length - 1
                                      : currentIdx - 1,
                                });
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full opacity-90 hover:opacity-100 transition"
                              title="Previous image"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentIdx =
                                  hoveredProductImageIndex[
                                    product._id || product.id
                                  ] || 0;
                                setHoveredProductImageIndex({
                                  ...hoveredProductImageIndex,
                                  [product._id || product.id]:
                                    currentIdx === product.images.length - 1
                                      ? 0
                                      : currentIdx + 1,
                                });
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full opacity-90 hover:opacity-100 transition"
                              title="Next image"
                            >
                              <ChevronRight size={16} />
                            </button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                              {(hoveredProductImageIndex[
                                product._id || product.id
                              ] || 0) + 1}{" "}
                              / {product.images.length}
                            </div>
                          </>
                        )}
                      </div>
                    ) : product.image_data ? (
                      <img
                        src={product.image_data}
                        alt={product.product_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="text-gray-300" size={64} />
                      </div>
                    )}
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        product.product_category,
                      )}`}
                    >
                      {product.product_category || "other"}
                    </span>

                    {/* Image count badge */}
                    {product.images && product.images.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                        <Grid size={12} />
                        {product.images.length}
                      </div>
                    )}
                  </div>

                  <div className="p-4 sm:p-5">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
                      {product.product_name}
                    </h3>

                    <div className="flex justify-between items-center mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="font-bold text-gray-900">
                          ₹
                          {(
                            product.sale_price ||
                            product.regular_price ||
                            0
                          ).toFixed(2)}
                        </p>
                      </div>
                      {editingStock === (product._id || product.id) ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={stockValue}
                            onChange={(e) => setStockValue(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              handleQuickStock(product._id || product.id)
                            }
                            className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-xs text-center focus:ring-2 focus:ring-blue-400 outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() =>
                              handleQuickStock(product._id || product.id)
                            }
                            className="p-1 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingStock(null);
                              setStockValue("");
                            }}
                            className="p-1 bg-gray-300 text-gray-600 rounded-md hover:bg-gray-400"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 ${stockBadge.color}`}
                          onClick={() => {
                            setEditingStock(product._id || product.id);
                            setStockValue(String(product.stock_quantity || 0));
                          }}
                          title="Click to edit stock"
                        >
                          {stockBadge.text}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() =>
                          navigate(
                            `/shop/products/edit/${product._id || product.id}`,
                          )
                        }
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openProductPreview(product)}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        title="Quick preview"
                      >
                        <Eye size={18} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const stockBadge = getStockBadge(product.stock_quantity || 0);
                  return (
                    <tr
                      key={product._id || product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {product.image_data ? (
                            <img
                              src={product.image_data}
                              alt={product.product_name}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Package className="text-gray-400" size={18} />
                            </div>
                          )}
                          <span className="font-medium text-gray-900 text-sm">
                            {product.product_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(product.product_category)}`}
                        >
                          {product.product_category || "other"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800 text-sm">
                        ₹
                        {(
                          product.sale_price ||
                          product.regular_price ||
                          0
                        ).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${stockBadge.color}`}
                        >
                          {stockBadge.text} ({product.stock_quantity || 0})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/shop/products/edit/${product._id || product.id}`,
                              )
                            }
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openProductPreview(product)}
                            className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                            title="Quick preview"
                          >
                            <Eye size={16} className="text-gray-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No products found
          </h3>
          <p className="text-gray-500 mb-6">
            {search
              ? "Try different keywords"
              : "Add your first product to get started"}
          </p>
          <Link
            to="/shop/products/add"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            Add New Product
          </Link>
        </div>
      )}
      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <button
          onClick={() => setCsvModalOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300"
          title="Bulk Upload CSV"
        >
          <Upload size={22} />
        </button>
        <Link
          to="/shop/products/add"
          className="w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300"
        >
          <Plus size={24} />
        </Link>
      </div>
      {/* CSV Upload Modal */}
      {csvModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setCsvModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <FileSpreadsheet className="text-emerald-600" size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Bulk Upload Products
                  </h2>
                  <p className="text-sm text-gray-500">
                    Upload a CSV file to add multiple products at once
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCsvModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Step 1: Download Template */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg mt-0.5">
                    <Download className="text-blue-600" size={16} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 text-sm">
                      Step 1: Download CSV Template
                    </h3>
                    <p className="text-xs text-blue-700 mt-1">
                      Get the template with correct column headers, sample
                      values, and image URL format
                    </p>
                    <button
                      onClick={downloadTemplate}
                      className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download size={14} /> Download Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2: Upload */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-emerald-100 rounded-lg mt-0.5">
                    <Upload className="text-emerald-600" size={16} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-emerald-900 text-sm">
                      Step 2: Upload Your CSV File
                    </h3>
                    <p className="text-xs text-emerald-700 mt-1">
                      Fill in the template and upload it here
                    </p>
                    <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
                      <Upload size={14} /> Choose CSV File
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCsvFile}
                        className="hidden"
                      />
                    </label>
                    {csvRawText && (
                      <span className="ml-3 text-sm text-emerald-700 font-medium">
                        ✅ File loaded ({csvPreview.length} products found)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              {csvPreview.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Preview (first {csvPreview.length} rows)
                  </h3>
                  <div className="border border-gray-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500">
                            #
                          </th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500">
                            Name
                          </th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500">
                            Category
                          </th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500">
                            Price
                          </th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500">
                            Stock
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {csvPreview.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="py-2 px-3 text-gray-400">{i + 1}</td>
                            <td className="py-2 px-3 font-medium text-gray-800">
                              {row.product_name || row.name || "-"}
                            </td>
                            <td className="py-2 px-3 text-gray-600">
                              {row.product_category || row.category || "-"}
                            </td>
                            <td className="py-2 px-3 text-gray-600">
                              ₹{row.regular_price || row.price || 0}
                            </td>
                            <td className="py-2 px-3 text-gray-600">
                              {row.stock_quantity || row.stock || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Required columns info */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Required Columns
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "product_name",
                    "product_category",
                    "product_type",
                    "regular_price",
                    "stock_quantity",
                  ].map((col) => (
                    <span
                      key={col}
                      className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-mono text-gray-700"
                    >
                      {col}
                    </span>
                  ))}
                </div>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mt-3 mb-2">
                  Optional Columns
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "product_description",
                    "sale_price",
                    "size",
                    "color",
                    "sku",
                    "image_url",
                  ].map((col) => (
                    <span
                      key={col}
                      className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-mono text-gray-500"
                    >
                      {col}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  📸 <strong>image_url</strong>: Paste one public image link, or
                  multiple links separated by semicolons (example:{" "}
                  <code>https://img1.jpg;https://img2.jpg</code>). The first
                  image becomes the primary image. Leave blank to add images
                  later via Edit Product.
                </p>
                <p className="text-xs text-gray-500 mt-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  ✅ <strong>Tip:</strong> Keep each URL public and direct.
                  Accepted values are plain URLs only, not file names or local
                  paths.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Categories:</strong> food · toys · grooming · beds ·
                  accessories · healthcare · training · carriers
                  <br />
                  <strong>Pet Types:</strong> dog · cat · both
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setCsvModalOpen(false);
                  setCsvPreview([]);
                  setCsvRawText("");
                }}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCsvUpload}
                disabled={!csvRawText || csvUploading}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                  !csvRawText || csvUploading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg"
                }`}
              >
                {csvUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} /> Upload{" "}
                    {csvPreview.length > 0
                      ? `${csvPreview.length} Products`
                      : "Products"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Product Preview Modal */}
      {previewProduct && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setPreviewProduct(null);
            setCurrentImageIndex(0);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="sticky top-0 flex justify-between items-center p-6 bg-white border-b border-gray-200 z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Product Preview
              </h2>
              <button
                onClick={() => {
                  setPreviewProduct(null);
                  setCurrentImageIndex(0);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Product Content */}
            <div className="p-6 space-y-6">
              {/* Product Image Gallery */}
              <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200 relative">
                {previewProduct.images &&
                Array.isArray(previewProduct.images) &&
                previewProduct.images.length > 0 ? (
                  <div className="relative group">
                    <img
                      src={
                        previewProduct.images[currentImageIndex]?.image_data ||
                        previewProduct.images[currentImageIndex]?.url
                      }
                      alt={`${previewProduct.product_name} - ${currentImageIndex + 1}`}
                      className="w-full h-80 object-cover"
                      onError={(e) => {}}
                    />

                    {/* Image Navigation */}
                    {previewProduct.images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setCurrentImageIndex(
                              currentImageIndex === 0
                                ? previewProduct.images.length - 1
                                : currentImageIndex - 1,
                            )
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentImageIndex(
                              currentImageIndex ===
                                previewProduct.images.length - 1
                                ? 0
                                : currentImageIndex + 1,
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight size={20} />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
                          {currentImageIndex + 1} /{" "}
                          {previewProduct.images.length}
                        </div>
                      </>
                    )}
                  </div>
                ) : previewProduct.image_data ? (
                  <img
                    src={previewProduct.image_data}
                    alt={previewProduct.product_name}
                    className="w-full h-80 object-cover"
                  />
                ) : (
                  <div className="w-full h-80 flex items-center justify-center bg-gray-200">
                    <Package size={48} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {previewProduct.images &&
                Array.isArray(previewProduct.images) &&
                previewProduct.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {previewProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition ${
                          currentImageIndex === idx
                            ? "border-blue-600"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <img
                          src={img.image_data || img.url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

              {/* Product Name & Category */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {previewProduct.product_name}
                </h3>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(previewProduct.product_category)}`}
                >
                  {previewProduct.product_category || "Uncategorized"}
                </span>
              </div>

              {/* Description */}
              {previewProduct.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Description
                  </h4>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {previewProduct.description}
                  </p>
                </div>
              )}

              {/* Pricing */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                      Regular Price
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{(previewProduct.regular_price || 0).toFixed(2)}
                    </p>
                  </div>
                  {previewProduct.sale_price &&
                    previewProduct.sale_price <
                      previewProduct.regular_price && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                          Sale Price
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          ₹{previewProduct.sale_price.toFixed(2)}
                        </p>
                      </div>
                    )}
                </div>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                    Stock Available
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {previewProduct.stock_quantity || 0} units
                  </p>
                </div>
                <div
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    (previewProduct.stock_quantity || 0) > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {(previewProduct.stock_quantity || 0) > 0
                    ? "In Stock"
                    : "Out of Stock"}
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                {previewProduct.pet_type && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                      Pet Type
                    </p>
                    <p className="text-gray-900 font-medium">
                      {previewProduct.pet_type}
                    </p>
                  </div>
                )}
                {previewProduct.brand && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                      Brand
                    </p>
                    <p className="text-gray-900 font-medium">
                      {previewProduct.brand}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setPreviewProduct(null);
                    navigate(
                      `/shop/products/edit/${previewProduct._id || previewProduct.id}`,
                    );
                  }}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Edit Product
                </button>
                <button
                  onClick={() => {
                    setPreviewProduct(null);
                    setCurrentImageIndex(0);
                  }}
                  className="flex-1 bg-gray-200 text-gray-900 py-2.5 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;

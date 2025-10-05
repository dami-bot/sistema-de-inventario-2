"use client";
import { useEffect, useState } from "react";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [stock, setStock] = useState("");
  const [precio, setPrecio] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("");
  const [file, setFile] = useState(null);
  const [productoEditando, setProductoEditando] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editPrecio, setEditPrecio] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [vencimiento, setVencimiento] = useState("");
  const [ofertaDiaria, setOfertaDiaria] = useState(false);
  const [editVencimiento, setEditVencimiento] = useState("");
  const [editOfertaDiaria, setEditOfertaDiaria] = useState(false);



  // 🌐 Configuración de variables de entorno
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // 📦 Cargar productos desde el backend
  const cargarProductos = async () => {
    try {
      console.log("🌐 API_URL:", API_URL);
      const res = await fetch(`${API_URL}/api/productos`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      console.error("❌ Error cargando productos:", err);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // 🔍 Filtrado de productos
  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      p.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  // ☁️ Subida de imagen a Cloudinary
  const subirImagen = async (file) => {
    if (!file) return "";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("❌ Error subiendo imagen a Cloudinary");
    const data = await res.json();
    return data.secure_url;
  };

  // ➕ Agregar producto
  const agregarProducto = async (e) => {
    e.preventDefault();
    alert("📝 Agregando producto:", nombre);

    let imagenUrl = "";
    try {
      if (file) imagenUrl = await subirImagen(file);
    } catch (err) {
      console.error(err);
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("stock", stock);
    formData.append("precio", precio);
    if (file) formData.append("imagen", imagenUrl);

    try {
      const res = await fetch(`${API_URL}/api/productos`, {
        method: "POST",
        body: formData, // ⚠️ No agregar headers
      });

      const text = await res.text();
      console.log("📡 Respuesta del backend:", res.status, text);

      if (!res.ok) throw new Error(`❌ Error al crear producto: ${res.status}`);

      // ✅ Limpiar estados
      setNombre("");
      setStock("");
      setPrecio("");
      setFile(null);
      cargarProductos();
      setVencimiento("");
      setOfertaDiaria(false);

      alert("✅ Producto agregado correctamente");
      console.log("✅ Producto agregado correctamente");
    } catch (err) {
      console.error("❌ Error en fetch POST:", err);
    }
  };

  // 🗑️ Eliminar producto
  const eliminarProducto = async (id) => {
    try {
      await fetch(`${API_URL}/api/productos/${id}`, { method: "DELETE" });
      cargarProductos();
      console.log(`🗑️ Producto ${id} eliminado`);
    } catch (err) {
      console.error("❌ Error al eliminar producto:", err);
    }
  };

  // ✏️ Abrir edición
  const abrirEdicion = (producto) => {
    setProductoEditando(producto);
    setEditNombre(producto.nombre);
    setEditStock(producto.stock);
    setEditPrecio(producto.precio);
    setEditFile(null);
    setEditVencimiento(producto.vencimiento || "");
    setEditOfertaDiaria(producto.ofertaDiaria || false);

  };

  // 💾 Guardar edición
  const guardarEdicion = async (e) => {
    e.preventDefault();
    if (!productoEditando) return;

    console.log("📝 Editando producto ID:", productoEditando.id);

    let imagenUrl = productoEditando.imagenUrl || "";
    try {
      if (editFile) imagenUrl = await subirImagen(editFile);
    } catch (err) {
      console.error(err);
      return;
    }

    const formData = new FormData();
    formData.append("nombre", editNombre);
    formData.append("stock", editStock);
    formData.append("precio", editPrecio);
    formData.append("vencimiento", editVencimiento);
    formData.append("ofertaDiaria", editOfertaDiaria);

    if (editFile) formData.append("imagen", imagenUrl);

    try {
      const res = await fetch(`${API_URL}/api/productos/${productoEditando.id}`, {
        method: "PUT", // ⚠️ PUT para actualizar
        body: formData, // ⚠️ Sin headers
      });

      const text = await res.text();
      console.log("📡 Respuesta del backend:", res.status, text);

      if (!res.ok) throw new Error(`❌ Error al actualizar producto: ${res.status}`);

      // ✅ Limpiar estados
      setProductoEditando(null);
      setEditFile(null);
      cargarProductos();
      console.log("✅ Producto actualizado correctamente");
    } catch (err) {
      console.error("❌ Error en fetch PUT:", err);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Inventario de Productos</h1>

      <input
        type="text"
        placeholder="Buscar producto..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-2 p-2 border rounded w-full max-w-md"
      />
      <input
        type="text"
        placeholder="Filtrar..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="mb-4 p-2 border rounded w-full max-w-md"
      />

      <form
        onSubmit={agregarProducto}
        className="flex flex-col lg:flex-row gap-2 mb-2 "
      >
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          required
          className="p-2 border rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="p-2 border rounded"
        />
        <input
          type="date"
          value={vencimiento}
          onChange={(e) => setVencimiento(e.target.value)}
          required
          className="p-2 border rounded"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ofertaDiaria}
            onChange={(e) => setOfertaDiaria(e.target.checked)}
          />
          Oferta del día
        </label>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Agregar
        </button>
      </form>

      {/* Edición */}
      {productoEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">

          <form
            onSubmit={guardarEdicion}
            className="bg-white p-6 rounded shadow-md flex flex-col gap-2 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-2">Editar Producto</h2>
            <input
              type="text"
              value={editNombre}
              onChange={(e) => setEditNombre(e.target.value)}
              placeholder="Nombre"
              className="p-2 border rounded"
            />
            <input
              type="number"
              value={editStock}
              onChange={(e) => setEditStock(e.target.value)}
              placeholder="Stock"
              className="p-2 border rounded"
            />
            <input
              type="number"
              value={editPrecio}
              onChange={(e) => setEditPrecio(e.target.value)}
              placeholder="Precio"
              className="p-2 border rounded"
            />
            <input
              type="file"
              onChange={(e) => setEditFile(e.target.files[0])}
              className="p-2 border rounded"
            />
            <input
              type="date"
              value={editVencimiento}
              onChange={(e) => setEditVencimiento(e.target.value)}
              className="p-2 border rounded"
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editOfertaDiaria}
                onChange={(e) => setEditOfertaDiaria(e.target.checked)}
              />
              Oferta del día
            </label>

            <div className="flex justify-between mt-2">
              <button
                type="button"
                onClick={() => setProductoEditando(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de productos */}
      <ul className="grid grid-cols-2 sm:grid-cols-5 gap-6 w-full max-w-8xl">
        {productosFiltrados.map((p) => {
          // Calcular si el producto está por vencer (menos de 7 días)
          const estaPorVencer =
            p.vencimiento &&
            new Date(p.vencimiento) - new Date() < 7 * 24 * 60 * 60 * 1000;

          return (
            <li
              key={p.id}
              className="bg-white p-4 rounded shadow flex flex-col relative"
            >
              {/* Imagen del producto */}
              <img
                src={p.imagenUrl || "https://via.placeholder.com/150"}
                alt={p.nombre}
                className="h-40 w-full object-cover mb-2 rounded"
              />

              {/* Nombre y precio */}
              <h3 className="font-bold">{p.nombre}</h3>
              <p>Stock: {p.stock}</p>
              <p>Precio: ${p.precio}</p>

              {/* Fecha de vencimiento */}
              <p>
                Vence:{" "}
                {p.vencimiento
                  ? new Date(p.vencimiento).toLocaleDateString()
                  : "—"}
              </p>

              {/* Alerta si está por vencer */}
              {estaPorVencer && (
                <p className="text-red-600 font-semibold">⚠️ Próximo a vencer</p>
              )}

              {/* Oferta del día */}
              {p.ofertaDiaria && (
                <p className="text-green-600 font-bold mt-1">🔥 En oferta del día</p>
              )}

              {/* Botones de acciones */}
              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => abrirEdicion(p)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarProducto(p.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Eliminar
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {productosFiltrados.length === 0 && (
        <p className="mt-4 text-gray-500">No hay productos para mostrar.</p>
      )}

    </div>
  );
}


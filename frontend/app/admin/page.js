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

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // Cargar productos desde el backend
  const cargarProductos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/productos`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      console.error("Error cargando productos:", err);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // Filtrado
  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      p.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  // Subida a Cloudinary
  const subirImagen = async (file) => {
    if (!file) return "";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.secure_url;
  };

  // Agregar producto
 const agregarProducto = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("nombre", nombre);
  formData.append("stock", stock);
  formData.append("precio", precio);

  if (file) {
    formData.append("imagen", file); // 👈 debe llamarse igual que en @FileInterceptor('imagen')
  }

  const res = await fetch(`${API_URL}/api/productos`, {
    method: "POST",
    body: formData, // 👈 NO poner headers
  });

  if (!res.ok) {
    console.error("❌ Error al crear producto:", res.status);
    return;
  }

  setNombre("");
  setStock("");
  setPrecio("");
  setFile(null);
  cargarProductos();
};


  // Eliminar producto
  const eliminarProducto = async (id) => {
    await fetch(`${API_URL}/productos/${id}`, { method: "DELETE" });
    cargarProductos();
  };

  // Abrir edición
  const abrirEdicion = (producto) => {
    setProductoEditando(producto);
    setEditNombre(producto.nombre);
    setEditStock(producto.stock);
    setEditPrecio(producto.precio);
    setEditFile(null);
  };

  // Guardar edición
  const guardarEdicion = async (e) => {
    e.preventDefault();
    let imagenUrl = productoEditando.imagenUrl;
    if (editFile) {
      imagenUrl = await subirImagen(editFile);
    }

    const guardarEdicion = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("nombre", editNombre);
  formData.append("stock", editStock);
  formData.append("precio", editPrecio);

  // 📸 Si se seleccionó una nueva imagen, la agregamos al formData
  if (editFile) {
    formData.append("imagen", editFile);
  }

  const res = await fetch(`${API_URL}/api/productos/${productoEditando.id}`, {
    method: "PUT",
    body: formData, // 👈 Importante: NO pongas headers aquí
  });

  if (!res.ok) {
    console.error("❌ Error al actualizar producto:", res.status);
    return;
  }

  setProductoEditando(null);
  cargarProductos();
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
        className="flex flex-col sm:flex-row gap-2 mb-6 items-center"
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
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Agregar
        </button>
      </form>

      {/* Edición */}
      {productoEditando && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
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
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-4xl">
        {productosFiltrados.map((p) => (
          <li key={p.id} className="bg-white p-4 rounded shadow flex flex-col">
            <img
              src={p.imagenUrl || "https://via.placeholder.com/150"}
              alt={p.nombre}
              className="h-40 w-full object-cover mb-2 rounded"
            />
            <h3 className="font-bold">{p.nombre}</h3>
            <p>Stock: {p.stock}</p>
            <p>Precio: ${p.precio}</p>
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
        ))}
      </ul>

      {productosFiltrados.length === 0 && (
        <p className="mt-4 text-gray-500">No hay productos para mostrar.</p>
      )}
    </div>
  );
  }
}

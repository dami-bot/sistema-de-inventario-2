"use client";
import { FaShoppingCart } from "react-icons/fa";
import { useRef, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { FaBoxes, FaFacebookF, FaInstagram, FaEnvelope } from "react-icons/fa";

export default function DistribuidoraUI() {
  const { data: session } = useSession();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [busqueda, setBusqueda] = useState("");
  const [openCart, setOpenCart] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20; // productos por página



  const [nombreCliente, setNombreCliente] = useState("");
  const [direccionCliente, setDireccionCliente] = useState("");
  const carruselRef = useRef(null);

  useEffect(() => {
    if (!API_URL) return console.error("NEXT_PUBLIC_API_URL no está definido");

    const fetchProductos = async (pagina) => {
      try {
        const res = await fetch(`${API_URL}/api/productos?page=${pagina}&limit=${limit}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data.length < limit) setHasMore(false);
        setProductos((prev) => [...prev, ...data]);
      } catch (err) {
        console.error("❌ Error cargando productos:", err);
      }
    };

    fetchProductos(1);
  }, [API_URL]);

  // Scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore) return;
      const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (bottom) {
        const nextPage = page + 1;
        setPage(nextPage);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore]);

  // Traer productos cuando cambia la página
  useEffect(() => {
    const fetchProductos = async (pagina) => {
      try {
        const res = await fetch(`${API_URL}/api/productos?page=${pagina}&limit=${limit}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data.length < limit) setHasMore(false);
        setProductos((prev) => [...prev, ...data]);
      } catch (err) {
        console.error("❌ Error cargando productos:", err);
      }
    };

    fetchProductos(page);
  }, [page, API_URL]);

  // const ofertasDiarias = productos.slice(0, 10); // los primeros 5 productos como prueba
  const ofertasDiarias = productos.filter((p) => p.ofertaDiaria);
  // 🔹 Filtrar duplicados por id
  const ofertasUnicas = Array.from(
    new Map(ofertasDiarias.map(item => [item.id, item])).values()
  );
  // Filtrar duplicados por id antes del render
  const productosUnicos = Array.from(
    new Map(productos.map(item => [item.id, item])).values()
  );


  // 🔹 Auto-scroll del carrusel cada 2 segundos
  useEffect(() => {
    if (!carruselRef.current) return;
    const carrusel = carruselRef.current;
    let scrollIndex = 0;
    const totalItems = ofertasDiarias.length;
    const itemWidth = carrusel.firstChild?.offsetWidth + 24; // 24 = gap-6

    const interval = setInterval(() => {
      if (!itemWidth) return;
      scrollIndex = (scrollIndex + 1) % totalItems;
      carrusel.scrollTo({
        left: scrollIndex * itemWidth,
        behavior: "smooth",
      });
    }, 2000); // cada 2 segundos

    return () => clearInterval(interval);
  }, [ofertasDiarias]);

  // ✅ Agregar producto al carrito (con validación de stock)
  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id === producto.id);

      if (existe) {
        if (existe.cantidad < producto.stock) {
          return prev.map((p) =>
            p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
          );
        } else {
          alert(`⚠️ No hay más stock disponible de "${producto.nombre}"`);
          return prev;
        }
      }

      return [...prev, { ...producto, cantidad: 1 }];
    });
  };




  // Quitar producto del carrito
  const quitarDelCarrito = (id) => setCarrito((prev) => prev.filter((p) => p.id !== id));

  // ➕ Aumentar cantidad desde el carrito
  const sumarCantidad = (id) => {
    setCarrito((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.cantidad < item.stock) {
            return { ...item, cantidad: item.cantidad + 1 };
          } else {
            alert(`⚠️ No hay más stock disponible de "${item.nombre}"`);
          }
        }
        return item;
      })
    );
  };

  // ➖ Disminuir cantidad desde el carrito
  const restarCantidad = (id) => {
    setCarrito((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, cantidad: item.cantidad > 1 ? item.cantidad - 1 : 1 }
          : item
      )
    );
  };

  // Total del carrito
  const totalCarrito = carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);

  // Confirmar compra
  // Confirmar compra y enviar por WhatsApp
  const comprar = async () => {
    if (carrito.length === 0) return alert("Tu carrito está vacío.");
    if (!nombreCliente || !direccionCliente)
      return alert("Por favor ingresa tu nombre y dirección.");

    try {
      // Restar stock en el backend
      for (const item of carrito) {
        const res = await fetch(`${API_URL}/api/productos/${item.id}/restar-stock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cantidad: item.cantidad }),
        });
        if (!res.ok) {
          const error = await res.json();
          alert(`Error con el producto "${item.nombre}": ${error.error}`);
          return;
        }
      }

      // Crear número de pedido (simple)
      const numeroPedido = `PED-${Date.now().toString().slice(-6)}`;

      // Armar mensaje detallado de WhatsApp
      let whatsappMessage = `🧾 *Nuevo pedido* #${numeroPedido}\n\n👤 Cliente: ${nombreCliente}\n🏠 Dirección: ${direccionCliente}\n\n📦 *Detalle del pedido:*\n`;
      carrito.forEach((item) => {
        whatsappMessage += `- ${item.nombre}\n   ${item.cantidad} x $${item.precio} = $${item.precio * item.cantidad}\n`;
      });
      whatsappMessage += `\n💰 *Total:* $${totalCarrito.toFixed(2)}\n\n✅ Gracias por tu compra.`;

      // Abrir WhatsApp
      const whatsappUrl = `https://api.whatsapp.com/send?phone=5491121676940&text=${encodeURIComponent(
        whatsappMessage
      )}`;
      window.open(whatsappUrl, "_blank");

      // Registrar compra (opcional)
      await fetch(`${API_URL}/api/compras`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numeroPedido,
          cliente: nombreCliente,
          direccion: direccionCliente,
          items: carrito,
          total: totalCarrito,
        }),
      });

      // Limpiar carrito y campos
      setCarrito([]);
      setNombreCliente("");
      setDireccionCliente("");
      setOpenCart(false);

      alert("✅ Pedido realizado con éxito.");
    } catch (err) {
      console.error("Error en la compra:", err);
      alert("❌ Hubo un error al procesar tu compra.");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-700 to-stone-300 flex flex-col ">
      {/* NAVBAR */}
      <nav className="bg-[url('/fondo-nav.jpg')] shadow-sm fixed top-0 w-full z-50 h-42 flex items-center px-4 md:px-8">
        {/* Logo + Título centrado */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center   ">
          <img
            src="/logo.jpg"
            alt="Logo"
            className="w-62 sm:w-52 md:w-76 lg:w-88 h-auto mb-5 rounded-br-full rounded-bl-full  rounded-full  "
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center">
            
          </h1>
        </div>

        {/* Iconos a la derecha */}
        <div className="ml-auto flex items-center gap-4 sm:gap-6">
          {/* Carrito */}
          <button onClick={() => setOpenCart(true)} className="relative">
            <FaShoppingCart className="text-xl sm:text-4xl md:text-6xl lg:text-8xl text-black-900 hover:text-blue-600 transition" />
            {carrito.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
                {carrito.reduce((total, item) => total + item.cantidad, 0)}
              </span>
            )}
          </button>

          {/* Aquí puedes agregar más iconos o botones */}
        </div>
      </nav>

      {/* 🏷️ Carrusel de ofertas diarias */}
      <div className="relative w-full overflow-hidden py-6 mb-8 mt-50 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-100 rounded-xl shadow-lg">

        <h2 className="text-4xl text-black font-bold text-center mb-6">🔥 Ofertas del día 🔥</h2>
        <div
          ref={carruselRef}
          className="flex gap-6 overflow-x-auto px-4 snap-x snap-mandatory scroll-smooth">
          {ofertasUnicas.map((item) => {
            const enCarrito = carrito.find((p) => p.id === item.id);
            return (
              <div
                key={item.id}
                className="min-w-[250px] snap-center bg-white rounded-xl p-4 flex flex-col items-center transform transition-transform duration-500 hover:scale-105 hover:shadow-2xl"
              >
                <img
                  src={item.imagenUrl || "https://via.placeholder.com/150"}
                  alt={item.nombre}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <h3 className="text-lg font-bold text-gray-700">{item.nombre}</h3>
                <p className="text-green-600 font-semibold">${item.precio}</p>

                {/* Botón para agregar o quitar */}
                {enCarrito ? (
                  <button
                    onClick={() => quitarDelCarrito(item.id)}
                    className="mt-2 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
                  >
                    Quitar del carrito
                  </button>
                ) : (
                  <button
                    onClick={() => agregarAlCarrito(item)}
                    className="mt-2 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                  >
                    Agregar al carrito
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PANEL DEL CARRITO */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${openCart ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-lg font-semibold">🛒 Tu carrito</h2>
          <button onClick={() => setOpenCart(false)} className="text-2xl">
            &times;
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-4rem)]">
          {carrito.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">
              Tu carrito está vacío 🛍️
            </p>
          ) : (
            <>
              {/* Lista de productos en carrito */}
              {carrito.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b pb-2 mb-2"
                >
                  <div>
                    <h3 className="font-medium">{item.nombre}</h3>
                    <p className="text-sm text-gray-500">
                      {item.cantidad} x ${item.precio} ={" "}
                      <span className="font-semibold">
                        ${item.precio * item.cantidad}
                      </span>
                    </p>
                  </div>

                  {/* 🔢 Controles de cantidad */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => restarCantidad(item.id)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 rounded"
                    >
                      ➖
                    </button>
                    <span className="w-6 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => sumarCantidad(item.id)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 rounded"
                    >
                      ➕
                    </button>
                  </div>

                  {/* 🗑️ Botón quitar producto */}
                  <button
                    onClick={() => quitarDelCarrito(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold"
                  >
                    Quitar
                  </button>
                </div>
              ))}


              {/* Total */}
              <div className="mt-4 border-t pt-4 text-right">
                <p className="text-lg font-bold">
                  Total: ${totalCarrito.toFixed(2)}
                </p>
              </div>

              {/* Datos del cliente */}
              <div className="mt-4 space-y-2">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  className="border p-2 w-full rounded"
                />
                <input
                  type="text"
                  placeholder="Dirección de entrega"
                  value={direccionCliente}
                  onChange={(e) => setDireccionCliente(e.target.value)}
                  className="border p-2 w-full rounded"
                />
              </div>

              <button
                onClick={comprar}
                className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
              >
                ✅ Confirmar pedido por WhatsApp
              </button>
            </>
          )}
        </div>
      </div>

      {/* Fondo oscuro al abrir carrito */}
      {openCart && (
        <div
          onClick={() => setOpenCart(false)}
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
        ></div>
      )}






      <main className="container mx-auto p-4 pt-5">
        {/* 🔍 Input de búsqueda */}
        <div className="max-w-md mx-auto my-6">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-3 text-2xl text-amber-50 font-bold rounded-lg border border-gray-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-600"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ">
          {productosUnicos
            .filter((p) =>
              p.nombre.toLowerCase().includes(busqueda.toLowerCase())
            )
            .map((producto) => (
              <div
                key={producto.id}
                className="bg-white rounded-xl shadow-lg p-2 flex flex-col items-center gap-1 group"
              >
                <img
                  src={producto.imagenUrl || "https://via.placeholder.com/150"}
                  alt={producto.nombre}
                  className="w-full h-48 object-cover rounded-lg mb-2 group-hover:scale-105 transition-transform duration-300"
                />
                <h2 className="text-lg font-bold text-gray-700 text-center">{producto.nombre}</h2>
                <p className="text-gray-500 text-center">
                  Stock: <span className="font-semibold">{producto.stock}</span>
                </p>
                <p className="text-gray-500 text-center">
                  Precio: <span className="font-semibold">${producto.precio}</span>
                </p>
                <button
                  onClick={() => agregarAlCarrito(producto)}
                  className="w-2/3 hover:scale-105 transition bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  disabled={producto.stock === 0}
                >
                  {producto.stock === 0 ? "Sin stock" : "Agregar al carrito"}
                </button>
              </div>
            ))}

        </div>
      </main>



      {/* FOOTER */}
      <footer className="text-center text-gray-500 py-6 mt-12">
        Distribuidora &copy; {new Date().getFullYear()} | Todos los derechos reservados - DAMI-WEB
        <div className="justify-center flex gap-4 text-lg mt-2">
          <a href="mailto:contacto@distribuidora.com" className="hover:text-blue-600">
            <FaEnvelope />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
            <FaFacebookF />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
            <FaInstagram />
          </a>
        </div>
      </footer>
    </div>
  );
}

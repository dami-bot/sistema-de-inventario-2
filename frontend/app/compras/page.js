"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function HistorialCompras() {
  const [compras, setCompras] = useState([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    fetch( `${API_URL}/compras`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Respuesta compras:", data); // 👈 agregá esto
        // Si la respuesta tiene .data, extraelo. Si no, usá como viene
        setCompras(Array.isArray(data) ? data : data.data || []);
      })
      .catch((err) => {
        console.error("Error al cargar compras:", err);
        setCompras([]);
      });
  }, []);
  const totalGeneral = Array.isArray(compras)
    ? compras.reduce((acc, compra) => {
        const totalCompra = compra.items.reduce(
          (sum, item) => sum + item.price * item.cantidad,
          0,
        );
        return acc + totalCompra;
      }, 0)
    : 0;
  const limpiarHistorial = async () => {
    if (
      !confirm(
        "¿Estás seguro de que querés borrar todo el historial de compras?",
      )
    )
      return;

    try {
      const res = await fetch( `${API_URL}/compras`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Historial eliminado correctamente");
        // Recargar historial
        const nuevasCompras = await fetch(
          `${API_URL}/compras`,
        ).then((r) => r.json());
        setCompras(nuevasCompras);
      } else {
        alert("Error al limpiar el historial");
      }
    } catch (err) {
      console.log(err);

      console.error(err);
      alert("Ocurrió un error inesperado");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-blue-100 via-cyan-100 to-pink-100 py-10">
      <Link
        href="/"
        className="absolute left-4 top-4 text-blue-600 hover:underline"
      >
        ← Volver al inicio
      </Link>
      <h1 className="mb-2 text-center text-4xl font-extrabold text-gray-800 drop-shadow-lg">
        Historial de Compras
      </h1>
      <div className="mb-8 text-center text-xl font-bold text-blue-700">
        Total general: ${totalGeneral.toFixed(2)}
        <button
          onClick={limpiarHistorial}
          className="mb-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          🗑️ Limpiar historial de compras
        </button>
      </div>
      <div className="w-full max-w-3xl space-y-8">
        {compras.length === 0 && (
          <div className="mt-8 animate-pulse text-center text-gray-500">
            No hay compras registradas.
          </div>
        )}
        {compras.map((compra) => {
          // Calcular el total de la compra
          const total = compra.items.reduce(
            (acc, item) => acc + item.price * item.cantidad,
            0,
          );
          return (
            <div key={compra.id} className="rounded-xl bg-white p-6 shadow-lg">
              <div className="mb-2 text-sm text-gray-600">
                <span className="font-bold">Fecha:</span>{" "}
                {new Date(compra.date).toLocaleString()}
              </div>
              <div>
                <span className="font-bold text-gray-700">Productos:</span>
                <ul className="mt-2 space-y-1">
                  {compra.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <img
                        src={item.imageUrl || "https://via.placeholder.com/40"}
                        alt={item.name}
                        className="h-8 w-8 rounded border object-cover"
                      />
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-gray-500">x{item.cantidad}</span>
                      <span className="ml-auto text-gray-400">
                        ${item.price}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-right font-bold text-blue-700">
                  Total de la compra: ${total.toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <footer className="mt-12 py-6 text-center text-gray-500">
        Historial de compras &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

"use client";
import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";

export default function HistorialCompras() {
  const [compras, setCompras] = useState([]);
  const [periodo, setPeriodo] = useState("diario");
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const cargarCompras = async () => {
      try {
        const res = await fetch(`${API_URL}/api/compras`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        console.log("Compras recibidas del backend:", data);
        setCompras(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar compras:", err);
        setCompras([]);
      }
    };
    cargarCompras();
  }, [API_URL]);


  // 🔹 Procesar datos según período seleccionado
  const ventasProcesadas = useMemo(() => {
    const mapa = {};

    compras.forEach((compra) => {
      const fecha = new Date(compra.date);
      let clave = "";

      switch (periodo) {
        case "diario":
          clave = fecha.toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
          });
          break;
        case "semanal":
          clave = fecha.toLocaleDateString("es-AR", {
            weekday: "short",
          });
          break;
        case "mensual":
          clave = fecha.toLocaleDateString("es-AR", {
            month: "short",
          });
          break;
        case "anual":
          clave = fecha.getFullYear().toString();
          break;
        default:
          clave = fecha.toLocaleDateString("es-AR");
      }

      const total = (Array.isArray(compra.items) ? compra.items : JSON.parse(compra.items || "[]"))
        .reduce((acc, item) => acc + item.precio * item.cantidad, 0);

      mapa[clave] = (mapa[clave] || 0) + total;
    });

    return Object.entries(mapa).map(([fecha, total]) => ({ fecha, total }));
  }, [compras, periodo]);

  const totalGeneral = compras.reduce((acc, compra) => {
    const items = Array.isArray(compra.items) ? compra.items : JSON.parse(compra.items || "[]");
    const totalCompra = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    return acc + totalCompra;
  }, 0);


  const cantidadCompras = compras.length;
  const promedioCompra = cantidadCompras ? totalGeneral / cantidadCompras : 0;

  // 🔹 Generar PDF solo con texto
  const generarPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });

    doc.setFontSize(20);
    doc.text("📄 Reporte de Ventas", 40, 40);

    doc.setFontSize(14);
    doc.text(`Período: ${periodo.toUpperCase()}`, 40, 70);
    doc.text(`Total de ventas: $${totalGeneral.toFixed(2)}`, 40, 90);
    doc.text(`Cantidad de compras: ${cantidadCompras}`, 40, 110);
    doc.text(`Promedio por compra: $${promedioCompra.toFixed(2)}`, 40, 130);

    doc.setFontSize(16);
    doc.text("Ventas por período:", 40, 170);

    let y = 190;
    ventasProcesadas.forEach(({ fecha, total }) => {
      doc.text(`${fecha}: $${total.toFixed(2)}`, 60, y);
      y += 20;
      if (y > 750) {
        doc.addPage();
        y = 40;
      }
    });

    doc.save(`Reporte_Ventas_${new Date().toLocaleDateString()}.pdf`);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">📊 Historial de Ventas</h1>

        <div className="flex items-center gap-4">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
          >
            <option value="diario">Diario</option>
            <option value="semanal">Semanal</option>
            <option value="mensual">Mensual</option>
            <option value="anual">Anual</option>
          </select>

          <button
            onClick={generarPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Generar PDF
          </button>
        </div>
      </div>

      {/* 🔹 Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/70 p-4 rounded-xl shadow-md text-center">
          <p className="text-gray-600 text-sm">Total Vendido</p>
          <h3 className="text-xl font-semibold">${totalGeneral.toFixed(2)}</h3>
        </div>
        <div className="bg-white/70 p-4 rounded-xl shadow-md text-center">
          <p className="text-gray-600 text-sm">Compras Totales</p>
          <h3 className="text-xl font-semibold">{cantidadCompras}</h3>
        </div>
        <div className="bg-white/70 p-4 rounded-xl shadow-md text-center">
          <p className="text-gray-600 text-sm">Promedio por Compra</p>
          <h3 className="text-xl font-semibold">${promedioCompra.toFixed(2)}</h3>
        </div>
      </div>


      {/* 🔹 Gráfico dinámico */}
      <div className="bg-white/70 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          📅 Ventas {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ventasProcesadas}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 Tabla de historial */}
      <div className="bg-white/70 rounded-xl shadow-md p-6 overflow-x-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🧾 Detalle de Compras</h2>
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-200 text-gray-800 uppercase text-xs">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">N° Pedido</th>
              <th className="px-4 py-2">Cliente</th>
              <th className="px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {compras.map((c, i) => (
              <tr key={i} className="border-b border-gray-300 hover:bg-gray-50">
                <td className="px-4 py-2">
                  {new Date(c.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">{c.numeroPedido || `#${i + 1}`}</td>
                <td className="px-4 py-2">{c.cliente || "Cliente genérico"}</td>
                <td className="px-4 py-2">
                  $
                  {c.items
                    .reduce(
                      (sum, item) => sum + item.precio * item.cantidad,
                      0
                    )
                    .toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

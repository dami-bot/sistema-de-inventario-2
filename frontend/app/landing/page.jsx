"use client";
import Link from "next/link";
import { FaBoxes, FaFacebookF, FaInstagram, FaEnvelope } from "react-icons/fa";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-white to-blue-50 text-gray-900">
      {/* Sección principal */}
      <section className="px-4 py-12 text-center">
        <div className="flex justify-center mb-6">
          <FaBoxes className="text-blue-600 text-6xl" />
        </div>
        <h1 className="text-4xl font-bold mb-4">
          Sistema de Gestión de Inventario
        </h1>
        <p className="text-lg mb-8">
          Controlá tu stock de manera simple, rápida y desde cualquier dispositivo.
        </p>
        <Link href="/">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            Ingresar al Panel
          </button>
        </Link>
      </section>
      {/* Formulario de contacto */}
      <section className="max-w-xl mx-auto my-16 bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">¿Querés implementar este sistema?</h2>
        <p className="text-center mb-6">Completá el formulario y te contactamos.</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target;
            const nombre = form.nombre.value.trim();
            const email = form.email.value.trim();
            const mensaje = form.mensaje.value.trim();

            if (!nombre || !email || !mensaje) {
              alert("Por favor completá todos los campos.");
              return;
            }

            // Simulación de envío
            alert("Gracias por tu mensaje. Te responderemos pronto.");
            form.reset();
          }}
          className="grid gap-4"
        >
          <input
            name="nombre"
            type="text"
            placeholder="Tu nombre"
            className="border px-4 py-2 rounded w-full"
          />
          <input
            name="email"
            type="email"
            placeholder="Tu email"
            className="border px-4 py-2 rounded w-full"
          />
          <textarea
            name="mensaje"
            placeholder="Mensaje"
            rows="4"
            className="border px-4 py-2 rounded w-full"
          ></textarea>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Enviar consulta
          </button>
        </form>
      </section>


      {/* Footer */}
      <footer className="bg-white text-gray-700 py-6 border-t">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} Distribuidora XYZ</p>
          <div className="flex gap-4 text-lg">
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
        </div>
      </footer>
    </main>
  );
}

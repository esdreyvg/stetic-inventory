import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-3xl font-bold text-red-600 mb-4">404 - No encontrado</h1>
      <p className="mb-2">La página que buscas no existe.</p>
      <Link to="/" className="text-blue-600 underline">Volver al inicio</Link>
    </div>
  );
}
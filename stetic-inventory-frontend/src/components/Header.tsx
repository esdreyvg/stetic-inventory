export default function Header() {
  return (
    <header className="bg-white shadow px-4 py-2 flex items-center justify-between">
      <span className="text-xl font-bold text-blue-700">Estética & Spa Inventario</span>
      <div>
        {/* Aquí puedes agregar usuario y acciones */}
        <button className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
          Salir
        </button>
      </div>
    </header>
  );
}
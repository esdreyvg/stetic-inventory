import { NavLink } from "react-router-dom";

const linkClass =
  "block py-2 px-4 rounded hover:bg-blue-100 transition font-medium";

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white shadow h-full flex flex-col">
      <nav className="my-6 flex flex-col gap-2">
        <NavLink to="/" end className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/inventory" className={linkClass}>
          Inventario
        </NavLink>
        {/* Agrega más enlaces según necesidad */}
      </nav>
    </aside>
  );
}
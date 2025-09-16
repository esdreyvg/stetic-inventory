import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Inventory from "@/pages/Inventory";
import Products from "@/pages/Products";
import Recipes from "@/pages/Recipes";
import Users from "@/pages/Users";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Assets from "@/pages/Assets";
import Supplies from "@/pages/Supplies";
import Accounts from "@/pages/Accounts";
import Reports from "@/pages/Reports";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Reports />} />
            <Route path="inventory" element={<Inventory />} />
            <Route
              path="products"
              element={
                <ProtectedRoute requiredRoles={["administrador", "gerente"]}>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="recipes"
              element={
                <ProtectedRoute requiredRoles={["administrador", "gerente"]}>
                  <Recipes />
                </ProtectedRoute>
              }
            />
            <Route
              path="assets"
              element={
                <ProtectedRoute requiredRoles={["administrador", "gerente"]}>
                  <Assets />
                </ProtectedRoute>
              }
            />
            <Route
              path="supplies"
              element={
                <ProtectedRoute requiredRoles={["administrador", "gerente"]}>
                  <Supplies />
                </ProtectedRoute>
              }
            />
            <Route
              path="accounts"
              element={
                <ProtectedRoute requiredRoles={["administrador", "gerente"]}>
                  <Accounts />
                </ProtectedRoute>
              }
            />
            <Route
              path="reports"
              element={
                <ProtectedRoute requiredRoles={["administrador", "gerente"]}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute requiredRoles={["administrador"]}>
                  <Users />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
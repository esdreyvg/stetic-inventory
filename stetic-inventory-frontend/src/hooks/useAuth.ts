import { useAuth } from "@/contexts/AuthContext";
import { loginApi } from "@/services/authServices";

export function useLogin() {
  const auth = useAuth();
  const doLogin = async (username: string, password: string) => {
    if (!auth || !auth.login) {
      throw new Error("Auth context is not available or login method is missing.");
    }
    const data = await loginApi(username, password);
    auth.login(data);
  };
  return { doLogin };
}
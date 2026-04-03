import { api } from "./api";

export type AuthResponse = {
  data: { id: number; token: string };
  message: string;
};

export function saveSession(payload: { id: number; token: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", payload.token);
  localStorage.setItem("userId", String(payload.id));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
}

export const SignupApi = async (formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  const { data } = await api.post<AuthResponse>("/auth/signup", {
    name: formData.name,
    email: formData.email,
    password: formData.password,
    confirmPassword: formData.confirmPassword,
  });
  return data;
};

export const SignInAPi = async (formData: {
  email: string;
  password: string;
}) => {
  const { data } = await api.post<AuthResponse>("/auth/signin", {
    email: formData.email,
    password: formData.password,
  });
  return data;
};

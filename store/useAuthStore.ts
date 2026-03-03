import { create } from 'zustand';

// Define the shape of your user based on the API response
interface User {
  id: number;
  username: string;
  fullname: string;
  supplier_code: string;
  supplierName: string;
  department: string;
  role: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
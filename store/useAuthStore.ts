import { create } from 'zustand';
import { persist,createJSONStorage } from 'zustand/middleware';

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
  token: string | null;
  setUser: (user: User) => void;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

// export const useAuthStore = create<AuthState>((set) => ({
//   user: null,
//   setUser: (user) => set({ user }),
//   logout: () => set({ user: null }),
// }));

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:null,
      token:null,
      setUser: (user) => set({user}),
      setAuth: (user: User, token:string) => set({ user, token }),
      logout: () => set({user:null,token: null})
    }),
    {
  name: 'auth-storage',
  storage: createJSONStorage(() => localStorage)
}
  )
);
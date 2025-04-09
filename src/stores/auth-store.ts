import Cookies from 'js-cookie';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (data: { accessToken: string; refreshToken: string; user: User }) => void;
  clearAuth: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: ({ accessToken, refreshToken, user }) => {
        set({ accessToken, refreshToken, user });

        // Lưu vào cookie
        Cookies.set("accessToken", accessToken, { expires: 7 }); // Token hết hạn sau 7 ngày
        Cookies.set("refreshToken", refreshToken, { expires: 30 }); // Refresh token hết hạn sau 30 ngày
        Cookies.set("user", JSON.stringify(user), { expires: 7 });
      },
      clearAuth: () => {
        set({ accessToken: null, refreshToken: null, user: null });

        // Xóa cookie
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        Cookies.remove("user");
      },

      logout: () => {
        // Xóa thông tin xác thực
        set({ accessToken: null, refreshToken: null, user: null });
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        Cookies.remove("user");
      },
    }),
    {
      name: "auth-storage", // Tên key (không cần thiết khi dùng cookie)
      getStorage: () => ({
        getItem: (key) => {
          if (key === "auth-storage") {
            const accessToken = Cookies.get("accessToken");
            const refreshToken = Cookies.get("refreshToken");
            const user = Cookies.get("user");

            if (accessToken && refreshToken && user) {
              return JSON.stringify({
                accessToken,
                refreshToken,
                user: JSON.parse(user),
              });
            }
          }
          return null;
        },
        setItem: (key, value) => {
          const { accessToken, refreshToken, user } = JSON.parse(value);
          Cookies.set("accessToken", accessToken, { expires: 7 });
          Cookies.set("refreshToken", refreshToken, { expires: 30 });
          Cookies.set("user", JSON.stringify(user), { expires: 7 });
        },
        removeItem: () => {
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          Cookies.remove("user");
        },
      }),
    }
  )
);
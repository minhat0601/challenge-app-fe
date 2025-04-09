import envConf from "@/app/config/config";
import { useAuthStore } from "@/stores/auth-store";

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const { accessToken, refreshToken, setAuth, clearAuth, user } = useAuthStore.getState();

  const authHeaders = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : {};

  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...authHeaders,
      "Content-Type": "application/json",
    },
  });

  // Token hết hạn, xử lý refresh token
  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${envConf.NEXT_PUBLIC_API_ENDPOINT}/api/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refreshToken }),
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setAuth({
        user: user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      // Thử lại request với token mới
      res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${data.access_token}`,
          "Content-Type": "application/json",
        },
      });
    } else {
      clearAuth(); // Refresh thất bại, đăng xuất
    }
  }

  return res;
};

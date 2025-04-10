import envConf from "@/app/config/config";
import { useAuthStore } from "@/stores/auth-store";

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const { accessToken, refreshToken, setAuth, clearAuth, user } = useAuthStore.getState();

  const authHeaders = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : {};

  const headers = new Headers(options.headers || {});

  // Add auth header if we have a token
  if (authHeaders.Authorization) {
    headers.append('Authorization', authHeaders.Authorization);
  }

  // Add content type
  headers.append('Content-Type', 'application/json');

  let res = await fetch(url, {
    ...options,
    headers,
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
        user: user || undefined,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      // Thử lại request với token mới
      const newHeaders = new Headers(options.headers || {});
      newHeaders.append('Authorization', `Bearer ${data.access_token}`);
      newHeaders.append('Content-Type', 'application/json');

      res = await fetch(url, {
        ...options,
        headers: newHeaders,
      });
    } else {
      clearAuth(); // Refresh thất bại, đăng xuất
    }
  }

  return res;
};

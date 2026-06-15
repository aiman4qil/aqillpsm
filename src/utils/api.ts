export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const envBase = (import.meta as any).env?.VITE_API_BASE as string | undefined;
  const resolvedEnvBase = envBase ? String(envBase).replace(/\/+$/, "") : "";
  const hostname = window.location.hostname;
  const backendHostBase = `${window.location.protocol}//${hostname}:3002`;
  const candidates = [
    resolvedEnvBase ? resolvedEnvBase + path : "",
    path,
    backendHostBase + path,
  ].filter(Boolean);

  let lastNetworkError: unknown = null;

  for (const url of candidates) {
    try {
      const response = await fetch(url, init);
      if ([404, 502, 503, 504].includes(response.status)) {
        continue;
      }
      return response;
    } catch (error) {
      lastNetworkError = error;
    }
  }

  throw lastNetworkError || new Error(`Request failed for ${path}`);
}

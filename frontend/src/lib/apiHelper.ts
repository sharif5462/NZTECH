/**
 * Safe API response parsing helper
 * Prevents "Unexpected token '<', 'The page c...' is not valid JSON" errors
 * when endpoints return HTML (e.g. 404 pages during deployment transitions).
 */
export async function parseApiResponse<T = any>(res: Response): Promise<{ ok: boolean; data: T; error?: string }> {
  let data: any = {};
  const contentType = res.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = {};
    }
  } else {
    try {
      await res.text();
    } catch {
      // Ignore text read failures
    }

    if (!res.ok) {
      return {
        ok: false,
        data: {} as T,
        error: `Server endpoint returned status ${res.status}. Please make sure you are accessing the latest deployment URL.`,
      };
    }
  }

  if (!res.ok) {
    return {
      ok: false,
      data,
      error: data?.error || `Request failed with status ${res.status}`,
    };
  }

  return { ok: true, data };
}

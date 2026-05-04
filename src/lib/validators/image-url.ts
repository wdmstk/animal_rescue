const ALLOWED_EXACT_HOSTS = new Set(["images.unsplash.com"]);
const ALLOWED_SUFFIX_HOSTS = [".supabase.co", ".supabase.in", ".supabase.net", ".supabase.com"] as const;

export const isAllowedImageUrl = (value: string): boolean => {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") {
    return false;
  }

  const hostname = url.hostname.toLowerCase();
  if (ALLOWED_EXACT_HOSTS.has(hostname)) {
    return true;
  }

  return ALLOWED_SUFFIX_HOSTS.some((suffix) => hostname.endsWith(suffix));
};

export const allowedImageHostMessage =
  "photoUrl は Next.js images 設定で許可されたホスト（images.unsplash.com または *.supabase.co）を指定してください";

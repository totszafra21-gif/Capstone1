export function sanitizeImagePath(path: string | null | undefined) {
  const raw = (path || "").trim();
  if (!raw) return "/classic.png";

  const normalized = raw.toLowerCase().replace(/\\+/g, "/").replace(/\s+/g, "-");

  const aliasMap: Record<string, string> = {
    "/lumpia-with-chicken.png": "/lumpia-with-chicken.png",
    "/lumpia-with-rice.png": "/lumpia-with-chicken.png",
    "/lumpia-with-chicken.jpg": "/lumpia-with-chicken.png",
    "/lumpia-with-chicken.jpeg": "/lumpia-with-chicken.png",
    "/lumpia-with-chicken": "/lumpia-with-chicken.png",
  };

  if (aliasMap[normalized]) {
    return aliasMap[normalized];
  }

  if (normalized === "/lumpia-with-chicken.png") {
    return "/lumpia-with-chicken.png";
  }

  // Handle legacy values such as "/Lumpia with chicken.png"
  if (normalized.includes("lumpia") && normalized.includes("chicken")) {
    return "/lumpia-with-chicken.png";
  }

  return raw.startsWith("/") ? raw : `/${raw}`;
}

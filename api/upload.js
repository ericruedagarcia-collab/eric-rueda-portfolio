// Genera el permiso para que el navegador suba un archivo grande directamente a Vercel Blob.
const { handleUpload } = require("@vercel/blob/client");
const { check } = require("./_auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!check(clientPayload)) throw new Error("Clave de edición incorrecta");
        return {
          allowedContentTypes: ["video/mp4", "video/webm", "video/quicktime", "image/jpeg", "image/png", "image/webp", "image/gif"],
          maximumSizeInBytes: 3 * 1024 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    res.status(200).json(json);
  } catch (e) {
    res.status(400).json({ error: String((e && e.message) || e) });
  }
};

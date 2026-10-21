// GET: devuelve el contenido guardado desde la web. POST: guarda el contenido (requiere clave de edición).
const { put, head } = require("@vercel/blob");
const { check } = require("./_auth");
const PATH = "site/content.json";

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      let meta;
      try { meta = await head(PATH); } catch (_) { return res.status(404).json({ error: "sin contenido guardado" }); }
      const r = await fetch(meta.url + "?t=" + Date.now(), { cache: "no-store" });
      if (!r.ok) return res.status(404).json({ error: "sin contenido guardado" });
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.status(200).send(await r.text());
    }
    if (req.method === "POST") {
      if (!check(req.headers["x-edit-key"])) return res.status(401).json({ error: "Clave de edición incorrecta" });
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      if (body && body.check) return res.status(200).json({ ok: true });
      if (!body || typeof body !== "object" || !body.sections) return res.status(400).json({ error: "Contenido no válido" });
      const text = JSON.stringify(body);
      if (text.length > 3 * 1024 * 1024) return res.status(413).json({ error: "Contenido demasiado grande" });
      await put(PATH, text, { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 60 });
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: "Método no permitido" });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
};

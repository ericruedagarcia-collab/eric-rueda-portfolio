const crypto = require("crypto");
// Hash PBKDF2 de la clave de edición (la clave en sí no está en el código).
const SALT = "15afc3d786db1804dd71667c79805815", HASH = "54b22cddcfbe7c48309e137ae714502365fe3b5e95c6ed741ab2e617a9f7ee2d", ITER = 300000;
function norm(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
function check(pw) {
  try {
    const h = crypto.pbkdf2Sync(norm(pw), Buffer.from(SALT, "hex"), ITER, 32, "sha256");
    return crypto.timingSafeEqual(h, Buffer.from(HASH, "hex"));
  } catch (_) { return false; }
}
module.exports = { check };

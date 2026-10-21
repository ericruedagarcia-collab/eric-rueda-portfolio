const crypto = require("crypto");
// Hash PBKDF2 de la clave de edición (la clave en sí no está en el código).
const SALT = "be1890278603958a7f1d98596585dbe9", HASH = "d9cf17dce7aa6c1b91c53759e06770fde1e56ed95ed7754d046eb98727fe44ab", ITER = 300000;
function norm(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
function check(pw) {
  try {
    const h = crypto.pbkdf2Sync(norm(pw), Buffer.from(SALT, "hex"), ITER, 32, "sha256");
    return crypto.timingSafeEqual(h, Buffer.from(HASH, "hex"));
  } catch (_) { return false; }
}
module.exports = { check };

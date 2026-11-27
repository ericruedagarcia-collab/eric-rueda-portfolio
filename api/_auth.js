const crypto = require("crypto");
// Hash PBKDF2 de la clave de edición (la clave en sí no está en el código).
const SALT = "a98e180f4242ad579532834cc483f376", HASH = "c851c070c3a18025ae3606bb467ab9445ab32346b5f6a9b0241c54f5630b5c78", ITER = 300000;
function norm(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
function check(pw) {
  try {
    const h = crypto.pbkdf2Sync(norm(pw), Buffer.from(SALT, "hex"), ITER, 32, "sha256");
    return crypto.timingSafeEqual(h, Buffer.from(HASH, "hex"));
  } catch (_) { return false; }
}
module.exports = { check };

import assert from "node:assert/strict";
import test from "node:test";
import { generateUnlockKey, md5Crypt } from "../crypto.mjs";

const hashes = [
  ["SH_adb_quectel", "$1$12345678$", "$1$12345678$0jXKXQwSwMxYoegx0S.I.1"],
  ["SH_adb_quectel", "$1$abcdefgh$", "$1$abcdefgh$GUZL0dW1aVoC2q7SnkfRk0"],
  ["SH_adb_quectel", "$1$a$", "$1$a$SUOKJvDmnZKGBd.NEj5l//"],
  ["pässwörd", "$1$salt123$", "$1$salt123$JYajdpIW9OFY0jjUk92Rj/"],
  ["", "$1$$", "$1$$qRPK7m23GJusamGpoGLby/"],
];
const keys = [
  ["12345678", "0jXKXQwSwMxYoeg"],
  ["a", "mnZKGBd.NEj5l//"],
  ["ABC1234567890", "AnravKmhRwK70wH"],
];

test("MD5-crypt matches the original script's glibc vectors", () => {
  for (const [password, setting, expected] of hashes) {
    assert.equal(md5Crypt(password, setting), expected, setting);
  }
});

test("unlock keys match the Python CLI, including short and truncated salts", () => {
  for (const [serial, expected] of keys) {
    assert.equal(generateUnlockKey(serial), expected, serial);
  }
});

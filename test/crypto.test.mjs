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
const forumCases = [
  ["RM520N-GL", "23398943", "BzUqe9JGlQoub.z"],
  ["RM520N-GLAP", "25816482", "MPdpWAU6C.BL9Eq"],
  ["RM521F-GL", "31711264", "SV3LHz1ynUZZmYU"],
  ["RM551E-GL", "47454133", "yWjfOllPZtKId5Z"],
  ["RG500Q-EA", "14966991", "WihtftY7/7SWvEd"],
  ["RG501-EU", "52582990", "QFkS3ewn3KNKaX."],
  ["EC25-AF", "35787336", "zoCLUARzj8zsJIO"],
  ["EC25-EU", "15478726", "n9Qq0s1x4LtgAvt"],
  ["EC25-AFX", "29543536", "MSkivdUEUOuFJmY"],
  ["EG25G", "32382643", "Z1mVbkVsGNRUyQ2"],
  ["EC25E", "29866718", "ArJutRI0gTdus7t"],
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

test("listed forum model challenges match their published answers", () => {
  for (const [model, challenge, expected] of forumCases) {
    assert.equal(generateUnlockKey(challenge), expected, model);
  }
});

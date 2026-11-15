import { generateUnlockKey } from "./crypto.mjs";

const form = document.querySelector("#generator-form");
const challenge = document.querySelector("#challenge");
const result = document.querySelector("#result");
const command = document.querySelector("#command");
const copyButton = document.querySelector("#copy-button");
const status = document.querySelector("#status");

challenge.addEventListener("input", () => {
  result.hidden = true;
  command.value = "";
  status.textContent = "";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const serial = challenge.value.trim();
  if (!serial) {
    result.hidden = true;
    status.textContent = "请输入设备返回的挑战值。";
    challenge.focus();
    return;
  }
  command.value = `AT+QADBKEY="${generateUnlockKey(serial)}"`;
  result.hidden = false;
  status.textContent = "";
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(command.value);
    status.textContent = "命令已复制。";
  } catch {
    command.focus();
    command.select();
    status.textContent = "无法自动复制，请手动复制已选中的命令。";
  }
});

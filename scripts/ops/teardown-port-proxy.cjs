#!/usr/bin/env node

/**
 * Remove the Windows portproxy entry that forwards localhost:3000 into WSL.
 * Safe to run repeatedly; failures are reported but do not throw.
 */

const { spawnSync } = require("node:child_process");

const LISTEN_ADDRESS = "127.0.0.1";
const LISTEN_PORT = 3000;

function runPowerShell(command) {
  const result = spawnSync(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-Command", command],
    { encoding: "utf-8" }
  );

  if (result.stdout) process.stdout.write(result.stdout.trim() + "\n");
  if (result.stderr) process.stderr.write(result.stderr.trim() + "\n");

  return result;
}

function main() {
  const powershellExists = spawnSync("powershell.exe", ["-?"], { stdio: "ignore" });
  if (powershellExists.error) {
    console.warn(
      "⚠️  powershell.exe is not accessible from WSL. Skipping portproxy removal."
    );
    return;
  }

  const deleteCmd = [
    "netsh interface portproxy delete v4tov4",
    `listenaddress=${LISTEN_ADDRESS}`,
    `listenport=${LISTEN_PORT}`,
  ].join(" ");

  const deleteResult = runPowerShell(deleteCmd);
  if (deleteResult.error) {
    console.warn(
      `⚠️  Failed to remove Windows portproxy entry automatically: ${deleteResult.error.message}`
    );
    return;
  }

  if (deleteResult.status === 0) {
    console.log(
      `✅ Windows portproxy removed for http://${LISTEN_ADDRESS}:${LISTEN_PORT}`
    );
    return;
  }

  const stderr = deleteResult.stderr || "";
  const requiresElevation = /access is denied|requires elevation/i.test(stderr);
  if (requiresElevation) {
    console.warn(
      "\n⚠️  Portproxy removal needs an elevated Windows shell. Run the following from an Admin PowerShell:\n" +
        `   netsh interface portproxy delete v4tov4 listenaddress=${LISTEN_ADDRESS} listenport=${LISTEN_PORT}\n`
    );
    return;
  }

  console.warn("⚠️  netsh exit status non-zero; the portproxy entry may already be absent.");
}

main();

#!/usr/bin/env node

/**
 * Configure a Windows portproxy entry so requests from Windows `localhost:3000`
 * are forwarded into the current WSL instance.
 *
 * The script is safe to run repeatedly. It silently falls back if it cannot
 * determine the WSL IPv4 address or if the Windows command requires elevation.
 */

const { networkInterfaces } = require("node:os");
const { spawnSync } = require("node:child_process");

const LISTEN_ADDRESS = "127.0.0.1";
const LISTEN_PORT = 3000;
const CONNECT_PORT = 3000;

function getWslIPv4Address() {
  try {
    const nets = networkInterfaces();
    for (const iface of Object.values(nets)) {
      if (!iface) continue;
      for (const net of iface) {
        if (net.family === "IPv4" && !net.internal && !net.address.startsWith("127.")) {
          return net.address;
        }
      }
    }
  } catch {
    // Ignore and fall back to hostname lookup below.
  }

  const result = spawnSync("hostname", ["-I"], { encoding: "utf-8" });
  if (result.error || result.status !== 0) {
    return null;
  }

  const candidates = result.stdout
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter((ip) => /^\d{1,3}(\.\d{1,3}){3}$/.test(ip) && !ip.startsWith("127."));

  return candidates[0] || null;
}

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

function ensurePortProxy(targetIp) {
  const deleteCmd = [
    "netsh interface portproxy delete v4tov4",
    `listenaddress=${LISTEN_ADDRESS}`,
    `listenport=${LISTEN_PORT}`,
  ].join(" ");

  const addCmd = [
    "netsh interface portproxy add v4tov4",
    `listenaddress=${LISTEN_ADDRESS}`,
    `listenport=${LISTEN_PORT}`,
    `connectaddress=${targetIp}`,
    `connectport=${CONNECT_PORT}`,
  ].join(" ");

  // Delete any existing mapping (ignore errors).
  runPowerShell(deleteCmd);

  const addResult = runPowerShell(addCmd);
  if (addResult.error) {
    throw addResult.error;
  }

  if (addResult.status !== 0) {
    const stderr = addResult.stderr || "";
    const requiresElevation = /access is denied|requires elevation/i.test(stderr);
    if (requiresElevation) {
      console.warn(
        "\n⚠️  Portproxy setup needs an elevated Windows shell. Run the following from an Admin PowerShell:\n" +
          `   netsh interface portproxy add v4tov4 listenaddress=${LISTEN_ADDRESS} listenport=${LISTEN_PORT} connectaddress=${targetIp} connectport=${CONNECT_PORT}\n`
      );
      return false;
    }
    throw new Error(`netsh failed with status ${addResult.status}`);
  }

  return true;
}

function main() {
  const targetIp = getWslIPv4Address();
  if (!targetIp) {
    console.warn(
      "⚠️  Unable to determine WSL IPv4 address; skipping portproxy configuration."
    );
    return;
  }

  const powershellExists = spawnSync("powershell.exe", ["-?"], { stdio: "ignore" });
  if (powershellExists.error) {
    console.warn(
      "⚠️  powershell.exe is not accessible from WSL. Skipping portproxy configuration."
    );
    return;
  }

  const success = ensurePortProxy(targetIp);
  if (success) {
    console.log(
      `✅ Windows portproxy configured: http://${LISTEN_ADDRESS}:${LISTEN_PORT} → ${targetIp}:${CONNECT_PORT}`
    );
  }
}

try {
  main();
} catch (error) {
  console.warn(
    `⚠️  Failed to configure Windows portproxy automatically: ${error.message}`
  );
}

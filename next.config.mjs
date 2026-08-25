import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root so Turbopack does not walk up past this folder.
  turbopack: { root: projectRoot },
  // Do not auto-generate AGENTS.md / CLAUDE.md in the project folder.
  agentRules: false,
  // Keep the dev overlay badge out of documentation screenshots.
  devIndicators: false,
};

export default nextConfig;

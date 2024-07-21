// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

import { AnchorProvider } from "@coral-xyz/anchor";

const anchor = require("@coral-xyz/anchor");

module.exports = async function (provider : AnchorProvider) {
  // Configure client to use the provider.
  anchor.setProvider(provider);

  // Add your deploy script here.
};
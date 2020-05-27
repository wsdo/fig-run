#!/usr/bin/env node
/**
 * Copyright shudong.wang, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

process.on("unhandledRejection", err => {
  throw err;
});
const rawArgv = process.argv.slice(2);

const Cli = require("../lib/Cli");
const service = new Cli(process.cwd());
const args = require("minimist")(rawArgv);
const { e, m } = args;
const command = args._[0];
if (!args.e || !args.m) {
  console.log("please set params -e and -m");
  process.exit(1);
}


service.run(command, args, rawArgv).catch(err => {
  console.error(err);
  process.exit(1);
});

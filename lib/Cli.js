const spawn = require("react-dev-utils/crossSpawn");
const fs = require("fs");
const path = require("path");
const Notice = require("../lib/Notice");
const notices = new Notice(process.cwd());
const chalk = require("chalk");
module.exports = class Service {
  constructor(context) {
    this.mode = "";
    this.env = "";
    this.rawArgv = "";
    this.context = context;
  }

  init(params) {
    this.initialized = true;
    const { e, m } = params;
    this.mode = m;
    this.env = e;
    const config = this.loadConfig();
    this.start(config);
  }

  start(config) {
    if (!["build", "start"].includes(this.mode)) {
      console.log(chalk.red(this.mode, " -m params is not support"));
      console.log();
      process.exit(1);
    }

    const startTime = new Date();
    const contextPath = this.context + `/scripts/${this.mode}`;
    const result = spawn.sync(
      "node",
      // [].concat(require.resolve("../../../scripts/" + this.mode)).concat(this.env),
      [].concat(contextPath).concat(this.env),
      { stdio: "inherit" }
    );
      // process.exit(1);

    if (result.status === 0) {
      notices.run(this.env, startTime, config, "构建成功");
    } else {
      notices.run(this.env, startTime, config, "构建失败");
    }

    if (result.signal) {
      if (result.signal === "SIGKILL") {
        console.log(
          "The build failed because the process exited too early. " +
            "This probably means the system ran out of memory or someone called " +
            "`kill -9` on the process."
        );
      } else if (result.signal === "SIGTERM") {
        console.log(
          "The build failed because the process exited too early. " +
            "Someone might have called `kill` or `killall`, or the system could " +
            "be shutting down."
        );
      }
      process.exit(1);
    }
    process.exit(result.status);
  }

  async run(name, args = {}, rawArgv = []) {
    this.rawArgv = rawArgv;
    this.init(args);
    args._ = args._ || [];
    let command = this.commands[name];
    if (!command && name) {
      // console.error(`command "${name}" does not exist.`);
      process.exit(1);
    }
    if (!command || args.help || args.h) {
      command = this.commands.help;
    } else {
      args._.shift(); // remove command itself
      rawArgv.shift();
    }
    const { fn } = command;
    return fn(args, rawArgv);
  }

  loadConfig() {
    let fileConfig, pkgConfig, resolved, resolvedFrom;
    const configPath =
      process.env.FIG_CLI_SERVICE_CONFIG_PATH ||
      path.resolve(this.context, "fig.config.js");

    if (fs.existsSync(configPath)) {
      try {
        fileConfig = require(configPath);

        if (typeof fileConfig === "function") {
          fileConfig = fileConfig();
        }

        if (!fileConfig || typeof fileConfig !== "object") {
          error(
            `Error loading ${chalk.bold(
              "fig.config.js"
            )}: should export an object or a function that returns object.`
          );
          fileConfig = null;
        }
      } catch (e) {
        error(`Error loading ${chalk.bold("fig.config.js")}:`);
        throw e;
      }
    }

    resolved = fileConfig;

    return resolved;
  }
};

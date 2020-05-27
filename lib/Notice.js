const Notice = require("fig-notice");
const chalk = require("chalk");
const url = "https://apitool.kaikeba.com/v1/buildlog";
const post = new Notice(url);

module.exports = class Service {
  constructor(obj = {}) {}
  run(env, startTime, config, res) {
    const endTime = new Date();
    var totalTime = (endTime - startTime) / 1000;
    console.log(
      ` ${chalk.red(config.name)}项目 ${chalk.cyan(res + "环境总共耗时:")} ${chalk.green(totalTime)} s`
    );
    console.log();
    const obj = {
      project: "cms", // 项目名称
      env: env, // 环境
      message: `${config.name}项目 ${env}环境 构建完成总共耗时: ${totalTime} s`,
      time: totalTime, // 用时
      dingtalk: config.dingdingNoticeId, // 钉钉群组
      start_time: startTime / 1000,
      end_time: endTime / 1000,
      status: 20, // 状态 10 开始， 20 完成
      notice: true // 是否通知
    };
    post.buildNotice(obj); // 抄送所有人
  }
};

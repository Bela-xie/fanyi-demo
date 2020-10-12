#!/usr/bin/env node
import { Command } from "commander";
import { translate } from "./main";
const program = new Command();
program
  .version("0.0.4")
  .name("fy")
  .usage("<english>")
  .arguments("<english>")
  .action((input) => {
    if (program) {
      translate(input);
    } else {
      console.log("你没有输入需要翻译的内容");
    }
  });
program.parse(process.argv);

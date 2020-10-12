const querystring = require("querystring");
const CryptoJS = require("crypto-js");
import { request } from "https";
import { appKey, key } from "./private";
export const translate = (word: string) => {
  type ErrorType = {
    [key: string]: string;
  };
  const errorMap: ErrorType = {
    202: "签名检验失败",
    102: "不支持的语言类型",
    103: "翻译文本过长",
    108: "应用id无效",
    113: "查询参数不能为空",
  };
  let from = "en";
  let to = "zh-CHS";
  if (/[a-zA-Z]/.test(word[0])) {
    from = "zh-CHS";
    to = "en";
  }
  const salt = new Date().getTime();
  const curtime = Math.round(new Date().getTime() / 1000);
  const str1 = appKey + truncate(word) + salt + curtime + key;
  const sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);
  function truncate(q: string) {
    const len = q.length;
    return len <= 20
      ? q
      : q.substring(0, 10) + len + q.substring(len - 10, len);
  }

  const qstring = querystring.stringify({
    q: word,
    appKey,
    salt,
    from,
    to,
    sign,
    signType: "v3",
    curtime,
  });
  const options = {
    hostname: "openapi.youdao.com",
    port: 443,
    path: "/api?" + qstring,
    method: "GET",
  };

  const req = request(options, (response) => {
    let chunks: Buffer[] = [];
    response.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    response.on("end", () => {
      const d = Buffer.concat(chunks).toString();
      const result = JSON.parse(d);
      if (result.errorCode === "0") {
        if (result.basic) {
          console.log(result.basic.explains[0]);
        } else {
          console.log("无查询结果");
        }
      } else {
        console.log(errorMap[result.errorCode]);
      }
    });
  });
  req.on("error", (e) => {
    console.error(e);
  });

  req.end();
};

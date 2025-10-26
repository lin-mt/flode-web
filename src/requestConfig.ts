import { CacheKey, getCached } from "@/util/Utils";
import type { RequestOptions } from "@@/plugin-request/request";
import type { RequestConfig } from "@umijs/max";
import { message, notification } from "antd";

// 错误处理方案：消息类型
enum MessageType {
  SILENT = "SILENT",
  WARN_MESSAGE = "WARN_MESSAGE",
  ERROR_MESSAGE = "ERROR_MESSAGE",
  NOTIFICATION = "NOTIFICATION",
  REDIRECT = "REDIRECT",
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  code?: number;
  message?: string;
  messageType?: MessageType;
}

const loginUrl = "/flodeApi/user/login";
export const PROXY_PREFIX = "/flodeApi/apiDebugProxy";

/**
 * 拦截器
 *
 * @doc https://umijs.org/docs/max/request#配置
 */
export const requestConfig: RequestConfig = {
  requestInterceptors: [
    (config: RequestOptions) => {
      // 拦截请求配置，进行个性化处理。
      let token = getCached(CacheKey.TOKEN);
      if (token && config.url !== loginUrl) {
        const authHeader = { Authorization: `Bearer ${token}` };
        return { ...config, headers: { ...config.headers, ...authHeader } };
      }
      return { ...config };
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      const url: string | undefined = response.config.url;
      if (url && url.startsWith(PROXY_PREFIX)) {
        // const data1 = response.data;
        return response;
      }
      const { data } = response as unknown as ResponseStructure;
      if (!data?.success) {
        const { message: msg, code, messageType } = data;
        switch (messageType) {
          case MessageType.SILENT:
            // do nothing
            break;
          case MessageType.WARN_MESSAGE:
            message.warning(msg);
            throw new Error(msg);
          case MessageType.ERROR_MESSAGE:
            message.error(msg);
            throw new Error(msg);
          case MessageType.NOTIFICATION:
            notification.open({
              description: msg,
              message: code,
            });
            break;
          case MessageType.REDIRECT:
            // TODO: redirect
            break;
          default:
          // message.error(msg);
        }
      }
      if (data?.success) {
        if (data.data?.records && data.data?.totalPage && data.data?.totalRow) {
          response.data = {
            success: true,
            data: data.data.records,
            total: data.data.totalRow,
          } as any;
        } else {
          response.data = data.data;
        }
      }
      return response;
    },
  ],
};

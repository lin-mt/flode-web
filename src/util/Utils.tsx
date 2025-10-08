import { localStorageToken } from "@/pages/User/Login";
import { Tag } from "antd";
import React, { ReactNode } from "react";

export function getOrigin() {
  return `${window.location.protocol}//${window.location.hostname}${
    window.location.port ? ":" + window.location.port : ""
  }`;
}

export enum CacheKey {
  TOKEN = localStorageToken,
  DEBUG_ENVIRONMENT = "DEBUG_ENVIRONMENT",
}

export function cache(key: CacheKey, value: string) {
  if (value === undefined) {
    localStorage.removeItem(key.toString());
  } else {
    localStorage.setItem(key.toString(), value);
  }
}

export function getCached(key: CacheKey): string | undefined {
  return localStorage.getItem(key.toString()) || undefined;
}

export enum ParamKey {
  SEL_PROJECT = "selProject",
  SEL_ITERATION_ID = "selIterationId",
  SEL_DOCS_ID_GROUP_ID = "selDocsIdGroupId",
  PROJECT_PLANNING = "projectPlanning",
  ITERATION_PLANNING = "iterationPlanning",
}

export enum FormType {
  ADD,
  UPDATE,
}

export const updateQueryParam = (key: ParamKey, value?: any) => {
  let searchParams = new URLSearchParams(window.location.search);
  const cacheKey = `${window.location.pathname}_${key.toString()}`;
  if (value) {
    let strVal: string;
    if (typeof value === "string") {
      strVal = value;
    } else {
      strVal = JSON.stringify(value);
    }
    searchParams.set(key.toString(), strVal);
    localStorage.setItem(cacheKey, strVal);
  } else {
    searchParams.delete(key);
    localStorage.removeItem(cacheKey);
  }
  const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
  window.history.pushState({}, "", newUrl);
};

export const getQueryParam = (key: ParamKey) => {
  const searchParams = new URLSearchParams(window.location.search);
  let param = searchParams.get(key.toString());
  if (!param) {
    param = localStorage.getItem(
      `${window.location.pathname}_${key.toString()}`
    );
  }
  if (param) {
    updateQueryParam(key, param);
  }
  return param ? param : undefined;
};

export const getParseQueryParam = (key: ParamKey): any | undefined => {
  let param = getQueryParam(key);
  if (param) {
    try {
      return JSON.parse(param);
    } catch (e) {}
  }
  return undefined;
};

/**
 * 从 HTTP 响应头对象中获取指定键的值（不区分大小写）
 * @param headers - HTTP 响应头对象
 * @param key - 要查找的键
 * @returns 对应的值，如果未找到则返回 undefined
 */
export function getHeader(headers: any, key: string): string | undefined {
  if (!headers || typeof headers !== "object") {
    return undefined;
  }
  // 将键转换为小写，以便不区分大小写查找
  const lowerKey = key.toLowerCase();
  // 遍历 headers 对象的键
  for (const headerKey of Object.keys(headers)) {
    if (headerKey.toLowerCase() === lowerKey) {
      return headers[headerKey];
    }
  }
  return undefined;
}

/**
 * 判断是否可以下载文件，并返回带时间戳的文件名
 * @param contentDisposition - Content-Disposition 响应头
 * @param contentType - Content-Type 响应头
 * @returns 带时间戳的文件名（如果可以下载），否则返回 undefined
 */
export function getDownloadFilename(
  contentDisposition: string | undefined,
  contentType: string | undefined
): string | undefined {
  // 1. 判断是否可以下载文件
  const isDownloadable =
    (contentDisposition && contentDisposition.includes("attachment")) ||
    (contentType &&
      [
        "application/octet-stream", // 二进制文件
        "application/pdf", // PDF 文件
        "application/zip", // ZIP 文件
        "image/jpeg", // JPEG 图片
        "image/png", // PNG 图片
        "text/csv", // CSV 文件
        "application/json", // JSON 文件
        "application/vnd.ms-excel", // Excel 文件
        "application/msword", // Word 文件
      ].some((type) => contentType.includes(type)));

  if (!isDownloadable) {
    return undefined; // 不可下载
  }

  // 2. 提取文件名
  let filename: string | null = null;

  // 从 Content-Disposition 中提取文件名
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    );
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, "");
    }
  }

  // 如果 Content-Disposition 中没有文件名，从 Content-Type 中推断扩展名
  if (!filename && contentType) {
    const extensionMap: { [key: string]: string } = {
      "application/pdf": "pdf",
      "application/zip": "zip",
      "image/jpeg": "jpg",
      "image/png": "png",
      "text/csv": "csv",
      "application/json": "json",
      "application/vnd.ms-excel": "xls",
      "application/msword": "doc",
      "text/plain": "txt",
    };

    // 查找匹配的扩展名
    for (const [type, ext] of Object.entries(extensionMap)) {
      if (contentType.includes(type)) {
        filename = `file.${ext}`;
        break;
      }
    }
  }
  if (!filename) {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\..+/, "")
      .replace("T", "_");
    filename = `${timestamp}_file.bin`;
  }
  return filename;
}

/**
 * 根据 HTTP 状态码获取对应的颜色
 * @param statusCode HTTP 状态码
 * @returns 对应的颜色
 */
function getColorForStatusCode(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) {
    return "green"; // 2xx: 成功
  } else if (statusCode >= 300 && statusCode < 400) {
    return "blue"; // 3xx: 重定向
  } else if (statusCode >= 400 && statusCode < 500) {
    return "orange"; // 4xx: 客户端错误
  } else if (statusCode >= 500) {
    return "red"; // 5xx: 服务器错误
  } else {
    return "gray"; // 其他状态码
  }
}

/**
 * 渲染状态码的 Tag 组件
 * @param statusCode HTTP 状态码
 * @param statusText HTTP 状态信息
 * @returns 渲染的 Tag 组件
 */
export function responseStatusCodeTag(
  statusCode: number,
  statusText: string
): React.ReactNode {
  const color = getColorForStatusCode(statusCode);
  return (
    <Tag bordered={false} color={color}>
      {statusCode}&nbsp;&nbsp;{statusText}
    </Tag>
  );
}

/**
 * 根据 content-type 设置 monaco-editor 的语言模式
 * @param contentType 完整的 content-type 字符串
 * @returns 对应的语言模式
 */
export function getLanguageFromContentType(contentType: string): string {
  // 将 content-type 转换为小写，方便匹配
  const lowerContentType = contentType.toLowerCase();

  // 根据 content-type 返回对应的语言模式
  if (lowerContentType.includes("json")) {
    return "json";
  } else if (lowerContentType.includes("css")) {
    return "css";
  } else if (lowerContentType.includes("javascript")) {
    return "javascript";
  } else if (lowerContentType.includes("html")) {
    return "html";
  } else if (lowerContentType.includes("python")) {
    return "python";
  } else if (lowerContentType.includes("java")) {
    return "java";
  } else if (
    lowerContentType.includes("c++") ||
    lowerContentType.includes("cpp")
  ) {
    return "cpp";
  } else if (lowerContentType.includes("csharp")) {
    return "csharp";
  } else if (lowerContentType.includes("php")) {
    return "php";
  } else if (lowerContentType.includes("ruby")) {
    return "ruby";
  } else if (lowerContentType.includes("go")) {
    return "go";
  } else if (lowerContentType.includes("swift")) {
    return "swift";
  } else if (lowerContentType.includes("typescript")) {
    return "typescript";
  } else if (lowerContentType.includes("yaml")) {
    return "yaml";
  } else if (lowerContentType.includes("markdown")) {
    return "markdown";
  } else if (lowerContentType.includes("sql")) {
    return "sql";
  } else if (lowerContentType.includes("shell")) {
    return "shell";
  } else {
    return "plaintext"; // 默认返回纯文本模式
  }
}

export type PlanningStatusType = "PLANNED" | "ONGOING" | "DONE" | "ARCHIVED";

export function planningStatusLabel(
  state?: PlanningStatusType
): string | undefined {
  switch (state) {
    case "PLANNED":
      return "已规划";
    case "ONGOING":
      return "进行中";
    case "DONE":
      return "已完成";
    case "ARCHIVED":
      return "已归档";
    default:
      return undefined;
  }
}

export function planningStatusColor(
  status?: PlanningStatusType
): "blue" | "green" | "purple" | "default" | undefined {
  switch (status) {
    case "PLANNED":
      return "blue";
    case "ONGOING":
      return "green";
    case "DONE":
      return "purple";
    case "ARCHIVED":
      return "default";
    default:
      return undefined;
  }
}

export function planningStatusTag(
  status?: PlanningStatusType
): React.ReactNode {
  return (
    <Tag color={planningStatusColor(status)}>{planningStatusLabel(status)}</Tag>
  );
}

export type ApiMethodConst =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS";

export type ApiDocsStateConst = "DESIGN" | "DEVELOPING" | "COMPLETED";

export function methodColor(method: ApiMethodConst): string {
  switch (method) {
    case "GET":
      return "green";
    case "HEAD":
      return "cyan";
    case "POST":
      return "orange";
    case "PUT":
      return "purple";
    case "PATCH":
      return "geekblue";
    case "DELETE":
      return "red";
    case "OPTIONS":
      return "default";
  }
}

export function methodTag(method: ApiMethodConst): ReactNode {
  return <Tag color={methodColor(method)}>{method}</Tag>;
}

export function apiDocsStateTag(state: ApiDocsStateConst): ReactNode {
  switch (state) {
    case "DESIGN":
      return <Tag color="processing">设计中</Tag>;
    case "DEVELOPING":
      return <Tag color="orange">开发中</Tag>;
    case "COMPLETED":
      return <Tag color="success">已完成</Tag>;
  }
}

export enum Schema {
  HTTPS = "https://",
  HTTP = "http://",
}

export enum FormDataType {
  TEXT = "Text",
  FILE = "File",
}

export enum RawType {
  TEXT = "Text",
  JSON = "JSON",
  JAVASCRIPT = "JavaScript",
  HTML = "HTML",
  XML = "XML",
  X_WWW_FORM_URLENCODED = "x_www_from_urlencoded",
}

export enum QueryParamType {
  STRING = "string",
  INTEGER = "integer",
  BOOLEAN = "boolean",
  NUMBER = "number",
  ARRAY = "array",
  OBJECT = "object",
}

export function toQueryParamType(value: string): QueryParamType {
  switch (value?.toLowerCase()) {
    case "string":
      return QueryParamType.STRING;
    case "integer":
      return QueryParamType.INTEGER;
    case "boolean":
      return QueryParamType.BOOLEAN;
    case "number":
      return QueryParamType.NUMBER;
    case "array":
      return QueryParamType.ARRAY;
    case "object":
      return QueryParamType.OBJECT;
    default:
      return QueryParamType.STRING;
  }
}

export function queryParamJsonSchema(
  type: QueryParamType | string | undefined
): boolean {
  let queryParamType = typeof type === "string" ? toQueryParamType(type) : type;
  if (!queryParamType) {
    return false;
  }
  return (
    QueryParamType.ARRAY === queryParamType ||
    QueryParamType.OBJECT === queryParamType
  );
}

export enum ApiDocsState {
  DESIGN = "设计中",
  DEVELOPING = "开发中",
  COMPLETED = "已完成",
}

export enum ArrayFormat {
  indices = "indices",
  brackets = "brackets",
  repeat = "repeat",
  comma = "comma",
}

export enum SwaggerSyncStrategy {
  ADD_ONLY = "仅追加",
  FULL_REPLACE = "完全覆盖",
  PARTIAL_UPDATE = "更新",
}

export enum PermissionType {
  MENU = "菜单",
  BUTTON = "按钮",
  API = "接口",
}

export function isEnumKey<T extends Record<string, string | number>>(
  enumObj: T,
  str: string
): boolean {
  return Object.keys(enumObj).includes(str);
}

/**
 * 检查枚举值（value）是否与指定的键（key）对应
 * @param enumObj 枚举对象
 * @param enumValue 枚举值（如 PermissionType.MENU）
 * @param key 要检查的键名（如 "MENU"）
 * @returns 是否匹配
 */
export function isKey<T extends Record<string, string | number>>(
  enumObj: T,
  enumValue: T[keyof T],
  key: string
): boolean {
  // 通过反向映射或遍历检查键名是否存在且匹配
  return Object.keys(enumObj).some(
    (k) => enumObj[k as keyof T] === enumValue && k === key
  );
}

/**
 * 将 TypeScript 枚举转换为 ProTable 的 valueEnum 格式
 * @param enumObj 需要转换的枚举对象
 * @returns 符合 ProTable 要求的 valueEnum 对象
 */
export function toValueEnum<T extends Record<string, string | number>>(
  enumObj: T
) {
  const valueEnum: Record<string, { text: string }> = {};
  Object.keys(enumObj).forEach((key) => {
    const value = enumObj[key];
    valueEnum[key] = {
      text: String(value),
    };
  });

  return valueEnum;
}

export enum PlanningStatus {
  PLANNED = "PLANNED",
  ONGOING = "ONGOING",
  DONE = "DONE",
  ARCHIVED = "ARCHIVED",
}

export const IdName = { value: "id", label: "name" };
export const IdUsername = { value: "id", label: "username" };

export enum ApiMethod {
  POST = "POST",
  GET = "GET",
  DELETE = "DELETE",
  PUT = "PUT",
  HEAD = "HEAD",
  PATCH = "PATCH",
  OPTIONS = "OPTIONS",
}

export function toLabelValue<T extends Record<string, string | number>>(
  enumObj: T,
  disableFunc?: (key: string) => boolean
): { label: string; value: string }[] {
  return Object.entries(enumObj)
    .filter(([, value]) => typeof value === "string") // 过滤掉数字类型的反向映射
    .map(([key, value]) => ({
      label: value as string,
      value: key,
      disabled: disableFunc ? disableFunc(key) : false,
    }));
}

export enum TriggerAction {
  START_ITERATION = "开始迭代",
  END_ITERATION = "结束迭代",
  CREATE_REQUIREMENT = "创建需求",
  UPDATE_REQUIREMENT = "更新需求",
  UPDATE_REQUIREMENT_STATUS = "需求状态变更",
  DELETE_REQUIREMENT = "删除需求",
  CREATE_TASK = "创建任务",
  UPDATE_TASK = "更新任务",
  UPDATE_TASK_STEP = "任务状态变更",
  DELETE_TASK = "删除任务",
}

export enum RequirementStatus {
  TO_BE_PLANNED = "待规划",
  PLANNED = "规划中",
  PROCESSING = "处理中",
  DONE = "完成",
  CLOSED = "关闭",
}

export enum AutomationAction {
  CREATE_BRANCH = "创建分支",
  DELETE_BRANCH = "删除分支",
  CREATE_PR = "创建 PR",
  CLOSE_PR = "关闭 PR",
  DELETE_PR = "删除 PR",
  CREATE_ISSUE = "创建 issue",
  CLOSE_ISSUE = "关闭 issue",
  DELETE_ISSUE = "删除 issue",
  SEND_EMAIL = "发送邮件",
  FEI_SHU_NOTIFY = "发送飞书通知",
  DING_DING_NOTIFY = "发送钉钉通知",
  WORK_WEI_XIN_NOTIFY = "发送企业微信通知",
  INTERNAL_MESSAGE = "发送站内信",
}

// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** 更新接口文档 PUT /apiDocs */
export async function updateApiDocs(
  body: API.UpdateApiDocs,
  options?: { [key: string]: any }
) {
  return request<string>(`/flodeApi/apiDocs`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 新增接口文档 POST /apiDocs */
export async function addApiDocs(
  body: API.SaveApiDocs,
  options?: { [key: string]: any }
) {
  return request<string>(`/flodeApi/apiDocs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除接口文档 DELETE /apiDocs/${param0} */
export async function deleteApiDocs(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteApiDocsParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/flodeApi/apiDocs/${param0}`, {
    method: "DELETE",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 接口文档详情 GET /apiDocs/detail/${param0} */
export async function getApiDocsDetail(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getApiDocsDetailParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ApiDocsDetail>(`/flodeApi/apiDocs/detail/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

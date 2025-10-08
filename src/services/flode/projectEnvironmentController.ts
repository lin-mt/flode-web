// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** 更新项目环境配置 PUT /projectEnvironment */
export async function updateProjectEnvironment(
  body: API.UpdateProjectEnvironment,
  options?: { [key: string]: any }
) {
  return request<string>(`/api/projectEnvironment`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 新增项目环境配置 POST /projectEnvironment */
export async function saveProjectEnvironment(
  body: API.SaveProjectEnvironment,
  options?: { [key: string]: any }
) {
  return request<string>(`/api/projectEnvironment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除项目环境配置 DELETE /projectEnvironment/${param0} */
export async function deleteProjectEnvironment(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteProjectEnvironmentParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/projectEnvironment/${param0}`, {
    method: "DELETE",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 查询项目的所有环境配置 GET /projectEnvironment/list */
export async function listProjectEnvironment(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listProjectEnvironmentParams,
  options?: { [key: string]: any }
) {
  return request<API.ProjectEnvironmentVO[]>(`/api/projectEnvironment/list`, {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

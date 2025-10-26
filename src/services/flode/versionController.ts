// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** 更新项目版本信息 PUT /version */
export async function updateVersion(
  body: API.UpdateVersion,
  options?: { [key: string]: any }
) {
  return request<string>(`/flodeApi/version`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 添加项目版本信息 POST /version */
export async function addVersion(
  body: API.AddVersion,
  options?: { [key: string]: any }
) {
  return request<string>(`/flodeApi/version`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取版本详细信息 GET /version/${param0} */
export async function getVersionDetail(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getVersionDetailParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.VersionDetail>(`/flodeApi/version/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除项目版本信息 DELETE /version/${param0} */
export async function deleteVersion(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteVersionParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/flodeApi/version/${param0}`, {
    method: "DELETE",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取项目所有版本信息（包含迭代信息）并返回树形结构 GET /version/treeVersionDetail */
export async function treeVersionDetail(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.treeVersionDetailParams,
  options?: { [key: string]: any }
) {
  return request<API.TreeVersionDetail[]>(
    `/flodeApi/version/treeVersionDetail`,
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

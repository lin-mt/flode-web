import { LexicalViewer } from "@/components";
import ApiDocsContent from "@/pages/ProjectDevelopment/ApiDocs/ApiDocsContent";
import SchemaTable from "@/pages/ProjectDevelopment/ApiDocs/Docs/SchemaTable";
import SubItemTitle from "@/pages/ProjectDevelopment/ApiDocs/SubItemTitle";
import {
  apiDocsStateTag,
  getOrigin,
  methodTag,
  queryParamJsonSchema,
} from "@/util/Utils";
import {
  Descriptions,
  DescriptionsProps,
  Empty,
  Flex,
  Modal,
  Table,
  TableProps,
  Tabs,
  theme,
  Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";

interface ParamTableProps<T> extends TableProps<T> {
  dataSource?: T[];
  columns: TableProps<T>["columns"];
}

function ViewTable<T>({ dataSource, columns, ...rest }: ParamTableProps<T>) {
  return (
    <Table
      bordered
      pagination={false}
      size="small"
      dataSource={dataSource}
      columns={columns}
      {...rest}
    />
  );
}

function Preview(props: { apiDocsDetail: API.ApiDocsDetail }) {
  const { apiDocsDetail } = props;

  const [request, setRequest] = useState<API.Request>();
  const [responses, setResponses] = useState<API.Response[]>();
  const [isQueryParamOpen, setIsQueryParamOpen] = useState<boolean>(false);
  const [queryParam, setQueryParam] = useState<API.QueryParam>();
  const { token } = theme.useToken();

  useEffect(() => {
    setRequest(apiDocsDetail.apiSpecification?.request);
    setResponses(apiDocsDetail.apiSpecification?.responses);
  }, [apiDocsDetail]);

  const detailDescItems: DescriptionsProps["items"] = useMemo(
    () => [
      { key: "name", label: "接口名称", children: apiDocsDetail.name },
      {
        key: "creator",
        label: "创建人",
        children: apiDocsDetail.creator,
      },
      {
        key: "gmtCreate",
        label: "创建时间",
        children: apiDocsDetail.gmtCreate,
      },
      {
        key: "status",
        label: "状态",
        children: apiDocsStateTag(apiDocsDetail.state),
      },
      {
        key: "updater",
        label: "更新人",
        children: apiDocsDetail.updater,
      },
      {
        key: "gmtUpdate",
        label: "更新时间",
        children: apiDocsDetail.gmtUpdate,
      },
      { key: "author", label: "作者", children: apiDocsDetail.authors },
      {
        key: "path",
        label: "路径",
        span: 2,
        children: (
          <>
            {methodTag(apiDocsDetail.method)}
            <Typography.Text copyable>{apiDocsDetail.path}</Typography.Text>
          </>
        ),
      },
      {
        key: "mock",
        label: "Mock地址",
        span: 3,
        children: (
          <>
            <Typography.Text copyable>{`${getOrigin()}/api/mock/${
              apiDocsDetail.id
            }`}</Typography.Text>
          </>
        ),
      },
    ],
    [apiDocsDetail]
  );

  const pathParamsColumns: TableProps<API.PathParam>["columns"] = useMemo(
    () => [
      { title: "Key", dataIndex: "key" },
      { title: "Example", dataIndex: "value" },
      { title: "描述", dataIndex: "description" },
    ],
    []
  );

  const queryParamsColumns: TableProps<API.QueryParam>["columns"] = useMemo(
    () => [
      { title: "Key", dataIndex: "key" },
      {
        title: "类型",
        dataIndex: "type",
        render: (type, record) => {
          const showJsonSchema = queryParamJsonSchema(type);
          const queryType = type ? type.toLowerCase() : "string";
          return !showJsonSchema ? (
            queryType
          ) : (
            <Typography.Link
              onClick={() => {
                setIsQueryParamOpen(true);
                setQueryParam(record);
              }}
            >
              {queryType}
            </Typography.Link>
          );
        },
      },
      { title: "Example", dataIndex: "value" },
      {
        title: "是否必须",
        dataIndex: "required",
        width: 88,
        render: (required) => (required ? "是" : "否"),
      },
      { title: "描述", dataIndex: "description" },
    ],
    []
  );

  const formDataParamsColumns: TableProps<API.FormDataParam>["columns"] =
    useMemo(
      () => [
        { title: "Key", dataIndex: "key" },
        { title: "Example", dataIndex: "value" },
        { title: "参数类型", dataIndex: "type" },
        { title: "ContentType", dataIndex: "contentType" },
        {
          title: "是否必须",
          dataIndex: "required",
          width: 88,
          render: (required) => (required ? "是" : "否"),
        },
        { title: "描述", dataIndex: "description" },
      ],
      []
    );

  const formUrlencodedParamsColumns: TableProps<API.FormUrlencodedParam>["columns"] =
    useMemo(
      () => [
        { title: "Key", dataIndex: "key" },
        { title: "Example", dataIndex: "value" },
        {
          title: "是否必须",
          dataIndex: "required",
          width: 88,
          render: (required) => (required ? "是" : "否"),
        },
        { title: "描述", dataIndex: "description" },
      ],
      []
    );

  const headerColumns: TableProps<API.HttpHeader>["columns"] = useMemo(
    () => [
      { title: "HeaderKey", dataIndex: "key" },
      { title: "Example", dataIndex: "value" },
      {
        title: "是否必须",
        dataIndex: "required",
        width: 88,
        render: (required) => (required ? "是" : "否"),
      },
      { title: "描述", dataIndex: "description" },
    ],
    []
  );

  if (!apiDocsDetail) {
    return <Empty description="请选择要查看的接口文档" />;
  }

  return (
    <Flex vertical gap="large" style={{ padding: "0 10px 10px" }}>
      <ApiDocsContent title={"基本信息"}>
        <Descriptions bordered size="small" items={detailDescItems} />
      </ApiDocsContent>
      <ApiDocsContent title={"接口描述"}>
        <LexicalViewer
          value={apiDocsDetail.description}
          emptyDescription={"无接口描述信息"}
        />
      </ApiDocsContent>
      <ApiDocsContent title={"请求参数"}>
        {(request?.pathParams?.length || 0) > 0 && (
          <div>
            <SubItemTitle title="Path" />
            <ViewTable
              dataSource={request?.pathParams}
              columns={pathParamsColumns}
            />
          </div>
        )}
        {(request?.headers?.length || 0) > 0 && (
          <div>
            <SubItemTitle title="Headers" />
            <ViewTable dataSource={request?.headers} columns={headerColumns} />
          </div>
        )}
        {(request?.queryParams?.length || 0) > 0 && (
          <div>
            <SubItemTitle title="Query" />
            <ViewTable
              dataSource={request?.queryParams}
              columns={queryParamsColumns}
            />
          </div>
        )}
        <div>
          <SubItemTitle
            title={
              <>
                Body
                {request?.bodyParam?.binary && (
                  <span
                    style={{
                      color: token.colorTextDescription,
                      fontSize: token.fontSizeSM,
                      paddingLeft: 10,
                    }}
                  >
                    二进制
                    {request?.bodyParam?.binary?.type === "FILE"
                      ? "文件"
                      : "文本"}
                  </span>
                )}
              </>
            }
          />
          {(request?.bodyParam?.formDataParams?.length || 0) > 0 && (
            <ViewTable
              dataSource={request?.bodyParam?.formDataParams}
              columns={formDataParamsColumns}
            />
          )}
          {request?.bodyParam?.binary && (
            <>
              {(request.bodyParam.binary.description?.length || 0) > 0 ? (
                request.bodyParam.binary.description
              ) : (
                <Empty description={"无描述信息"} />
              )}
            </>
          )}
          {(request?.bodyParam?.raw?.urlencodedParams?.length || 0) > 0 && (
            <ViewTable
              dataSource={request?.bodyParam?.raw?.urlencodedParams}
              columns={formUrlencodedParamsColumns}
            />
          )}
          {request?.bodyParam?.raw?.jsonSchema && (
            <SchemaTable jsonSchema={request?.bodyParam.raw.jsonSchema} />
          )}
          {request?.bodyParam?.raw?.description && (
            <>{request.bodyParam.raw.description}</>
          )}
          {!(
            (request?.bodyParam?.formDataParams?.length || 0) > 0 ||
            request?.bodyParam?.binary ||
            request?.bodyParam?.raw?.jsonSchema ||
            request?.bodyParam?.raw?.description
          ) && <Empty />}
        </div>
      </ApiDocsContent>
      <ApiDocsContent title={"响应参数"}>
        {responses ? (
          <Tabs
            defaultActiveKey="200"
            items={responses.map((response) => ({
              key: String(response.statusCode),
              label: response.statusCode,
              children: (
                <Flex vertical gap={"middle"}>
                  <div>
                    <SubItemTitle title={"响应数据"} />
                    {(response.headers?.length || 0) > 0 && (
                      <ViewTable
                        dataSource={response.headers}
                        columns={headerColumns}
                      />
                    )}
                    {response.jsonSchema && (
                      <SchemaTable jsonSchema={response.jsonSchema} />
                    )}
                    {(response.headers?.length || 0) === 0 &&
                      !response.jsonSchema && (
                        <Empty description={"暂无响应数据信息"} />
                      )}
                  </div>
                  <div>
                    <SubItemTitle title={"描述"} />
                    {response.description ? (
                      <div>{response.description}</div>
                    ) : (
                      <Empty description={"暂无描述信息"} />
                    )}
                  </div>
                </Flex>
              ),
            }))}
          />
        ) : (
          <Empty />
        )}
      </ApiDocsContent>
      <Modal
        title={queryParam?.key}
        open={queryParam && isQueryParamOpen}
        style={{ width: "100%", minWidth: 900 }}
        footer={[]}
        onCancel={() => {
          setIsQueryParamOpen(false);
          setQueryParam(undefined);
        }}
      >
        {queryParam?.jsonSchema ? (
          <SchemaTable jsonSchema={queryParam.jsonSchema} />
        ) : (
          <Empty description={"无 Schema 信息"} />
        )}
      </Modal>
    </Flex>
  );
}

export default Preview;

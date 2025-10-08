import MonacoEditor from "@/components/MonacoEditor";
import { ApiDocsProjectContext } from "@/pages/ProjectDevelopment/ApiDocs";
import ApiDocsContent from "@/pages/ProjectDevelopment/ApiDocs/ApiDocsContent";
import {
  PATH_PARAMS,
  REQUEST_BODY_FORM_DATA,
  REQUEST_HEADERS,
  REQUEST_QUERY_BODY_BINARY_VALUE,
  REQUEST_QUERY_BODY_RAW_TYPE,
  REQUEST_QUERY_BODY_RAW_VALUE,
  REQUEST_QUERY_PARAMS,
} from "@/pages/ProjectDevelopment/ApiDocs/Docs/index";
import SubItemTitle from "@/pages/ProjectDevelopment/ApiDocs/SubItemTitle";
import { PROXY_PREFIX } from "@/requestConfig";
import {
  cache,
  CacheKey,
  getCached,
  getDownloadFilename,
  getHeader,
  getLanguageFromContentType,
  methodColor,
  queryParamJsonSchema,
  responseStatusCodeTag,
  Schema,
} from "@/util/Utils";
import {
  ClearOutlined,
  DownloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Col,
  Descriptions,
  Empty,
  Flex,
  Form,
  FormInstance,
  FormListFieldData,
  Input,
  message,
  Row,
  Select,
  Space,
  Tabs,
  theme,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import { JSONSchemaFaker } from "json-schema-faker";
import _ from "lodash";
import qs from "qs";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { request } from "umi";

type ApiResponse = {
  status: number;
  statusText: string;
  headers: Record<string, any>;
  data: any;
  language?: string;
};

const ParamItem = ({
  pathName,
  field,
  form,
  showRequired = true,
  allRequired = false,
}: {
  pathName: string[];
  field: FormListFieldData;
  form: FormInstance;
  showRequired?: boolean;
  allRequired?: boolean;
}) => {
  const { token } = theme.useToken();
  const fieldValue = form.getFieldValue(pathName)[field.name];
  const isFile = fieldValue.type === "FILE";
  const { key, name, ...restField } = field;

  const [jsonSchema, setJsonSchema] = useState();

  useEffect(() => {
    handleAutoGenerate(false);
  }, [fieldValue]);

  function handleAutoGenerate(alwaysRegenerate: boolean) {
    const paramJsonSchema =
      queryParamJsonSchema(fieldValue.type) && fieldValue.jsonSchema;
    setJsonSchema(paramJsonSchema);
    const valuePath = [...pathName, name, "value"];
    if (
      paramJsonSchema &&
      (alwaysRegenerate || !form.getFieldValue(valuePath))
    ) {
      form.setFieldValue(
        valuePath,
        JSON.stringify(
          JSONSchemaFaker.generate(JSON.parse(fieldValue.jsonSchema)),
          null,
          2
        )
      );
    }
  }

  return (
    <>
      <Row key={key} gutter={10}>
        <Col flex={"20%"}>
          <Tooltip title={fieldValue.description}>
            <Form.Item {...restField} name={[name, "key"]}>
              <Input
                disabled={true}
                style={{ color: token.colorTextSecondary }}
              />
            </Form.Item>
          </Tooltip>
        </Col>
        {showRequired && (
          <Col flex={"16px"}>
            <Form.Item
              {...restField}
              name={[name, "required"]}
              valuePropName={"checked"}
            >
              <Checkbox disabled={true} />
            </Form.Item>
          </Col>
        )}
        <Col flex={"auto"}>
          {isFile && (
            <Form.Item
              {...restField}
              name={[name, "value"]}
              valuePropName={"fileList"}
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
              rules={[{ required: fieldValue.required, message: "请选择文件" }]}
            >
              <Upload beforeUpload={() => false}>
                <Button icon={<UploadOutlined />}>选择文件</Button>
              </Upload>
            </Form.Item>
          )}
          {jsonSchema && (
            <Button
              color={"default"}
              variant={"filled"}
              onClick={() => handleAutoGenerate(true)}
            >
              自动生成
            </Button>
          )}
          {!isFile && !jsonSchema && (
            <Form.Item
              {...restField}
              name={[name, "value"]}
              rules={[
                {
                  required: allRequired || fieldValue.required,
                  message: `请输入 ${fieldValue.key}`,
                },
              ]}
            >
              <Input placeholder="参数值" />
            </Form.Item>
          )}
        </Col>
      </Row>
      {jsonSchema && (
        <Row>
          <Form.Item
            style={{ width: "100%" }}
            {...restField}
            name={[name, "value"]}
          >
            <MonacoEditor height={300} language={"json"} />
          </Form.Item>
        </Row>
      )}
    </>
  );
};

function Debug({ apiDocsDetail }: { apiDocsDetail: API.ApiDocsDetail }) {
  const DEFAULT_ENV = "0";
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [apiRequest, setApiRequest] = useState<API.Request>();
  const [apiResponse, setApiResponse] = useState<ApiResponse>();
  const [sendReqBtnLoading, setSendReqBtnLoading] = useState<boolean>(false);
  const { projectEnvironment, projectDetail } = useContext(
    ApiDocsProjectContext
  );
  const [debugEnvironment, setDebugEnvironment] = useState<string>();
  const [reqDuration, setReqDuration] = useState<string>();
  const [downloadFile, setDownloadFile] = useState<string>();
  const { token } = theme.useToken();
  const bodyRawEditor = useRef<any>(null);
  const responseEditor = useRef<any>(null);

  useEffect(() => {
    const cachedEnvId = getCached(CacheKey.DEBUG_ENVIRONMENT);
    if (cachedEnvId) {
      const selected = projectEnvironment.find((e) => e.id === cachedEnvId);
      if (selected) {
        setDebugEnvironment(cachedEnvId);
      }
    }
    if (apiDocsDetail) {
      setApiRequest(apiDocsDetail.apiSpecification?.request);
      setApiResponse(undefined);
      setDownloadFile(undefined);
      form.setFieldsValue(apiDocsDetail);
      const raw = apiDocsDetail.apiSpecification?.request.bodyParam?.raw;
      if (raw?.jsonSchema && !raw.value) {
        form.setFieldValue(
          REQUEST_QUERY_BODY_RAW_VALUE,
          JSON.stringify(
            JSONSchemaFaker.generate(JSON.parse(raw.jsonSchema)),
            null,
            2
          )
        );
      }
    }
  }, [apiDocsDetail, form]);

  const handleFormatDocument = useCallback(() => {
    bodyRawEditor.current?.getAction("editor.action.formatDocument")?.run();
  }, []);

  const handleFormatResp = useCallback(() => {
    responseEditor.current?.getAction("editor.action.formatDocument")?.run();
  }, []);

  const handleAutoGenerate = useCallback(() => {
    const jsonSchema = apiRequest?.bodyParam?.raw?.jsonSchema;
    if (jsonSchema) {
      form.setFieldValue(
        REQUEST_QUERY_BODY_RAW_VALUE,
        JSON.stringify(
          JSONSchemaFaker.generate(JSON.parse(jsonSchema)),
          null,
          2
        )
      );
    }
  }, [form, apiRequest]);

  const renderParamList = useCallback(
    (name: string[], showRequired?: boolean, allRequired?: boolean) => (
      <Form.List name={name}>
        {(fields) =>
          fields.map((field) => (
            <ParamItem
              key={field.key}
              showRequired={showRequired}
              allRequired={allRequired}
              pathName={name}
              field={field}
              form={form}
            />
          ))
        }
      </Form.List>
    ),
    [form]
  );

  const showResp = useCallback((resp: any) => {
    let apiResp = resp;
    if (apiResp && apiResp.response) {
      apiResp = apiResp.response;
    }
    const respHeaders = apiResp.headers;
    const contentType = getHeader(respHeaders, "content-type");
    if (contentType) {
      apiResp.language = getLanguageFromContentType(contentType);
    }
    setDownloadFile(
      getDownloadFilename(
        getHeader(respHeaders, "content-disposition"),
        contentType
      )
    );
    if (apiResp.language === "json") {
      apiResp.data = JSON.stringify(apiResp.data, null, 2);
    }
    setApiResponse(apiResp);
    if (apiResp.language !== "json") {
      setTimeout(() => {
        handleFormatResp();
      }, 100);
    }
  }, []);

  const prepareRequestData = (values: API.ApiDocsDetail) => {
    let path = apiDocsDetail.path;
    const requestData = values.apiSpecification?.request;
    requestData?.pathParams?.forEach(({ key, value }) => {
      if (value) {
        path = path.replace(`{${key}}`, value);
      }
    });
    const headers: Record<string, string> = {};
    if (debugEnvironment) {
      projectEnvironment.forEach((projectEnvironment) => {
        if (projectEnvironment.id === debugEnvironment) {
          projectEnvironment.headers?.forEach((header) => {
            if (header.value) {
              headers[header.key] = header.value;
            }
          });
        }
      });
    }
    requestData?.headers?.forEach(({ key, value }) => {
      if (value) {
        headers[key] = value;
      }
    });
    let params: Record<string, any> = {};
    requestData?.queryParams?.forEach(({ key, type, jsonSchema, value }) => {
      if (!value) {
        return;
      }
      if (queryParamJsonSchema(type) && jsonSchema) {
        const paramValue = JSON.parse(value);
        if (_.isArray(paramValue)) {
          params[key] = paramValue;
        } else {
          params = _.merge({}, params, paramValue);
        }
      } else {
        params[key] = value;
      }
    });
    let data: any;
    let contentType;
    const formDataParams = requestData?.bodyParam?.formDataParams;
    if (formDataParams) {
      data = new FormData();
      formDataParams?.forEach(({ key, value }) => {
        if (!value) {
          return;
        }
        data.append(key, value);
      });
      contentType = "multipart/form-data";
    }
    const raw = requestData?.bodyParam?.raw;
    if (raw) {
      data = raw.value;
      switch (raw.type) {
        case "JSON":
          if (data) {
            data = JSON.parse(data);
          }
          contentType = "application/json";
          break;
        case "TEXT":
          contentType = "text/plain";
          break;
        case "XML":
          contentType = "application/xml";
          break;
        case "HTML":
          contentType = "text/html";
          break;
        case "JAVASCRIPT":
          contentType = "application/javascript";
          break;
        case "X_WWW_FORM_URLENCODED":
          data = {};
          raw.urlencodedParams?.forEach(({ key, value }) => {
            if (value) {
              data[key] = value;
            }
          });
          data = qs.stringify(data);
          contentType = "application/x-www-form-urlencoded";
          break;
      }
    }
    const binary = requestData?.bodyParam?.binary;
    if (binary) {
      contentType = "application/octet-stream";
      if (_.isArray(binary.value)) {
        data = binary.value[0].originFileObj;
      }
      if (_.isString(binary.value)) {
        data = new Blob([binary.value], { type: "application/octet-stream" });
      }
    }
    return { path, headers, params, data, contentType };
  };

  const handleDownRequest = async (values: API.ApiDocsDetail) => {
    if (!downloadFile) {
      messageApi.warning("不是文件数据，无法下载！");
      return;
    }
    try {
      const { path, headers, params, data, contentType } =
        prepareRequestData(values);
      if (contentType) {
        headers["Content-Type"] = contentType;
      }
      setSendReqBtnLoading(true);
      const response = await request(
        `${PROXY_PREFIX}/${debugEnvironment || DEFAULT_ENV}/${path}`.replace(
          /([^:]\/)\/+/g,
          "$1"
        ),
        {
          method: values.method,
          headers,
          params,
          data,
          responseType: "blob",
          getResponse: true,
          parseResponse: false,
          paramsSerializer: projectDetail?.qsConfig?.enabled
            ? (params) => qs.stringify(params, projectDetail?.qsConfig)
            : undefined,
        }
      );
      const blob = new Blob([response.data], { type: response.data.type });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", downloadFile);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
    } catch (error) {
      messageApi.error("请求失败！");
    } finally {
      setSendReqBtnLoading(false);
    }
  };

  const handleRequest = async (values: API.ApiDocsDetail) => {
    const { path, headers, params, data, contentType } =
      prepareRequestData(values);
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    setSendReqBtnLoading(true);
    const startTime = performance.now();
    try {
      const resp = await request(
        `${PROXY_PREFIX}/${debugEnvironment || DEFAULT_ENV}/${path}`.replace(
          /([^:]\/)\/+/g,
          "$1"
        ),
        {
          method: values.method,
          headers,
          params,
          data,
          getResponse: true,
          parseResponse: false,
          paramsSerializer: projectDetail?.qsConfig?.enabled
            ? (params) => qs.stringify(params, projectDetail?.qsConfig)
            : undefined,
        }
      );
      showResp(resp);
    } catch (err) {
      showResp(err);
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;
      setReqDuration(`${duration.toFixed(2)}ms`);
      setSendReqBtnLoading(false);
    }
  };

  const buildURL = useCallback(
    (path: string) => {
      const find = projectEnvironment.find((i) => i.id === debugEnvironment);
      if (!find) {
        return path;
      }
      return `${Schema[find.schema as keyof typeof Schema]}${find.host}${
        find.port ? ":" + find.port : ""
      }${find.prefix ? find.prefix : ""}/${path}`.replace(/([^:]\/)\/+/g, "$1");
    },
    [projectEnvironment, debugEnvironment]
  );

  if (!apiDocsDetail) {
    return <Empty description={"请选择要调试的接口"} />;
  }

  return (
    <Form
      form={form}
      style={{ padding: "0 10px 10px" }}
      onFinish={handleRequest}
    >
      {contextHolder}
      <Flex vertical gap={"small"}>
        <ApiDocsContent
          title={
            <Flex justify={"space-between"}>
              <div>接口地址</div>
              <Select
                allowClear
                value={debugEnvironment}
                style={{ width: 200 }}
                placeholder={"调试环境"}
                options={projectEnvironment.map((env) => ({
                  value: env.id,
                  label: env.name,
                }))}
                onChange={(value) => {
                  setDebugEnvironment(value);
                  cache(CacheKey.DEBUG_ENVIRONMENT, value);
                }}
              />
            </Flex>
          }
        >
          <Space.Compact style={{ width: "100%" }}>
            <Form.Item noStyle name={"method"}>
              <Input
                disabled
                style={{
                  flex: "0 0 120px",
                  maxWidth: 120,
                  textAlign: "center",
                  color: methodColor(apiDocsDetail.method),
                }}
              />
            </Form.Item>
            <Form.Item noStyle style={{ flex: 1 }}>
              <Input
                disabled
                value={buildURL(apiDocsDetail.path)}
                style={{
                  color: token.colorTextSecondary,
                  width: "100%",
                }}
              />
            </Form.Item>
            <Button
              type={"primary"}
              loading={sendReqBtnLoading}
              htmlType={"submit"}
              style={{
                flex: "0 0 120px",
                maxWidth: 120,
                marginLeft: 10,
              }}
            >
              发送
            </Button>
          </Space.Compact>
        </ApiDocsContent>
        <ApiDocsContent title={"请求参数"}>
          {(apiRequest?.headers?.length || 0) > 0 && (
            <div>
              <SubItemTitle title="Header" />
              {renderParamList(REQUEST_HEADERS)}
            </div>
          )}
          {(apiRequest?.pathParams?.length || 0) > 0 && (
            <div>
              <SubItemTitle title="Path" />
              {renderParamList(PATH_PARAMS, false, true)}
            </div>
          )}
          {(apiRequest?.queryParams?.length || 0) > 0 && (
            <div>
              <SubItemTitle title="Query" />
              {renderParamList(REQUEST_QUERY_PARAMS)}
            </div>
          )}
          {apiRequest?.bodyParam && (
            <div>
              <SubItemTitle title="Body" />
              {(apiRequest.bodyParam.formDataParams?.length || 0) > 0 &&
                renderParamList(REQUEST_BODY_FORM_DATA)}
              {apiRequest.bodyParam?.binary?.type === "TEXT" && (
                <Form.Item name={REQUEST_QUERY_BODY_BINARY_VALUE}>
                  <Input.TextArea
                    placeholder={apiRequest.bodyParam.binary.description}
                  />
                </Form.Item>
              )}
              {apiRequest.bodyParam?.binary?.type === "FILE" && (
                <Form.Item
                  name={REQUEST_QUERY_BODY_BINARY_VALUE}
                  valuePropName={"fileList"}
                  getValueFromEvent={(e) =>
                    Array.isArray(e) ? e : e?.fileList
                  }
                >
                  <Upload beforeUpload={() => false} maxCount={1}>
                    <Tooltip title={apiRequest.bodyParam.binary.description}>
                      <Button icon={<UploadOutlined />}>选择文件</Button>
                    </Tooltip>
                  </Upload>
                </Form.Item>
              )}
              {apiRequest.bodyParam?.raw && (
                <Flex vertical gap={"small"}>
                  <Row gutter={20}>
                    {apiRequest.bodyParam.raw.type && (
                      <Col flex={"50px"}>
                        <Form.Item hidden name={REQUEST_QUERY_BODY_RAW_TYPE}>
                          <Input />
                        </Form.Item>
                        <Button
                          color={"default"}
                          variant={"filled"}
                          icon={<ClearOutlined />}
                          onClick={handleFormatDocument}
                        >
                          格式化
                        </Button>
                      </Col>
                    )}
                    {apiRequest.bodyParam.raw.jsonSchema && (
                      <Col>
                        <Button
                          color={"default"}
                          variant={"filled"}
                          onClick={handleAutoGenerate}
                        >
                          自动生成
                        </Button>
                      </Col>
                    )}
                  </Row>
                  <Form.Item name={REQUEST_QUERY_BODY_RAW_VALUE}>
                    <MonacoEditor
                      height={300}
                      language={apiRequest.bodyParam.raw.type?.toLowerCase()}
                      handleEditorDidMount={(editor) => {
                        bodyRawEditor.current = editor;
                      }}
                    />
                  </Form.Item>
                </Flex>
              )}
              {(apiRequest.bodyParam.formDataParams?.length || 0) <= 0 &&
                !apiRequest.bodyParam?.binary &&
                !apiRequest.bodyParam?.raw && <Empty />}
            </div>
          )}
          {!(
            (apiRequest?.bodyParam?.formDataParams?.length || 0) > 0 ||
            apiRequest?.bodyParam?.binary ||
            apiRequest?.bodyParam?.raw?.jsonSchema ||
            apiRequest?.bodyParam?.raw?.description
          ) && <Empty />}
        </ApiDocsContent>
        <ApiDocsContent title={"响应数据"}>
          {!apiResponse && <Empty description={"暂无响应数据"} />}
          {apiResponse && (
            <Tabs
              size={"small"}
              tabBarStyle={{ display: "flex", justifyContent: "center" }} // 使 Tab 栏居中
              tabBarGutter={20}
              tabBarExtraContent={
                <Flex gap={"small"}>
                  {responseStatusCodeTag(
                    apiResponse.status,
                    apiResponse.statusText
                  )}
                  <Typography.Text style={{ color: token.colorTextSecondary }}>
                    {reqDuration}
                  </Typography.Text>
                  {downloadFile && (
                    <Tooltip title={"下载文件"}>
                      <Button
                        type={"text"}
                        size={"small"}
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownRequest(form.getFieldsValue())}
                      />
                    </Tooltip>
                  )}
                </Flex>
              }
              items={[
                {
                  key: "body",
                  label: "Body",
                  children: (
                    <MonacoEditor
                      readOnly={true}
                      height={500}
                      language={apiResponse.language}
                      handleEditorDidMount={(editor) =>
                        (responseEditor.current = editor)
                      }
                      value={apiResponse.data}
                    />
                  ),
                },
                {
                  key: "headers",
                  label: "Headers",
                  children: (
                    <Descriptions
                      column={1}
                      size={"small"}
                      items={Object.keys(apiResponse.headers).map((header) => {
                        return {
                          key: header,
                          label: header,
                          children: (
                            <Typography.Text
                              ellipsis={{
                                tooltip: apiResponse.headers[header],
                              }}
                            >
                              {apiResponse.headers[header]}
                            </Typography.Text>
                          ),
                        };
                      })}
                    />
                  ),
                },
              ]}
            />
          )}
        </ApiDocsContent>
      </Flex>
    </Form>
  );
}

export default Debug;

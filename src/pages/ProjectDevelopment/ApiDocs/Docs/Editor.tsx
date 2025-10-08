import { Lexical } from "@/components";
import JsonSchemaEditor from "@/components/JsonSchemaEditor";
import { getDefaultSchema } from "@/components/JsonSchemaEditor/utils";
import MonacoEditor from "@/components/MonacoEditor";
import ApiDocsContent from "@/pages/ProjectDevelopment/ApiDocs/ApiDocsContent";
import {
  PATH_PARAMS,
  REQUEST_BODY_FORM_DATA,
  REQUEST_HEADERS,
  REQUEST_QUERY_BODY_BINARY_TYPE,
  REQUEST_QUERY_BODY_PARAM,
  REQUEST_QUERY_BODY_RAW_TYPE,
  REQUEST_QUERY_BODY_RAW_URLENCODED,
  REQUEST_QUERY_BODY_RAW_VALUE,
  REQUEST_QUERY_PARAMS,
} from "@/pages/ProjectDevelopment/ApiDocs/Docs/index";
import SubItemTitle from "@/pages/ProjectDevelopment/ApiDocs/SubItemTitle";
import { updateApiDocs } from "@/services/flode/apiDocsController";
import {
  ApiDocsState,
  ApiMethod,
  FormDataType,
  IdName,
  queryParamJsonSchema,
  QueryParamType,
  RawType,
  toLabelValue,
} from "@/util/Utils";
import { DeleteOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { ModalForm } from "@ant-design/pro-components";
import {
  Affix,
  Button,
  Checkbox,
  Col,
  Flex,
  Form,
  FormItemProps,
  Input,
  InputNumber,
  message,
  Radio,
  Row,
  Select,
  Space,
  Tabs,
  theme,
  Tooltip,
  TreeSelect,
} from "antd";
import _ from "lodash";
import React, {
  ChangeEvent,
  CSSProperties,
  FC,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

const EditorFormItem: FC<FormItemProps> = ({ style, ...restProps }) => {
  const defaultStyle = {
    marginBottom: "16px",
    ...style,
  };
  return <Form.Item style={defaultStyle} {...restProps} />;
};

const ResponseTypes = {
  JSON: "JSON",
  RAW: "RAW",
} as const;
type ResponseType = keyof typeof ResponseTypes;

const RequestTypes = {
  Body: "Body",
  Query: "Query",
  Headers: "Headers",
} as const;
type RequestType = keyof typeof RequestTypes;
type ParamListType = "Form" | "Query" | "Headers" | "X_WWW_FORM_URLENCODED";
const BodyTypes = {
  None: "None",
  Form: "Form",
  Binary: "Binary",
  Raw: "Raw",
} as const;
type BodyType = keyof typeof BodyTypes;

const ResponseContent = (props: {
  response: API.Response;
  json: ReactNode;
  description: ReactNode;
  style?: CSSProperties;
}) => {
  const [responseEdit, setResponseEdit] = useState<ResponseType>();

  useEffect(() => {
    setResponseEdit(props.response?.jsonSchema ? "JSON" : "RAW");
  }, [props.response?.jsonSchema]);

  return (
    <Flex vertical gap={"middle"} style={props.style}>
      <Radio.Group
        value={responseEdit}
        options={Object.keys(ResponseTypes)}
        onChange={(event) => setResponseEdit(event.target.value)}
      />
      {responseEdit === "JSON" && props.json}
      <div>
        <SubItemTitle title={"描述"} />
        {props.description}
      </div>
    </Flex>
  );
};

const handlePath = (pathParam: string): string => {
  let path = _.trim(pathParam);
  if (!path || path === "/") {
    return "";
  }
  path = path[0] !== "/" ? `/${path}` : path;
  path = path.endsWith("/") ? path.slice(0, -1) : path;
  return path;
};

const extractPathParams = (path: string): API.PathParam[] => {
  const params: API.PathParam[] = [];
  if (path && path.includes(":")) {
    const paths = path.split("/");
    paths.forEach((segment) => {
      if (segment.startsWith(":")) {
        const key = segment.substring(1);
        params.push({ key });
      }
    });
  }
  return params;
};

const extractBracketParams = (path: string): API.PathParam[] => {
  const params: API.PathParam[] = [];
  if (path && path.length > 3) {
    // noinspection RegExpRedundantEscape
    const matches = path.match(/\{([^}]+)\}/g) || [];
    matches.forEach((match) => {
      const key = match.slice(1, -1);
      params.push({ key });
    });
  }
  return params;
};

const ParamList = ({
  paramType,
  style,
}: {
  paramType: ParamListType;
  style?: CSSProperties;
}) => {
  const { token } = theme.useToken();

  let addButtonText = "";
  let paramName: string[] = [];
  let placeholderKey = "";
  let placeholderValue = "";
  switch (paramType) {
    case "Query":
      addButtonText = "Query";
      paramName = REQUEST_QUERY_PARAMS;
      placeholderKey = "QueryKey";
      placeholderValue = "QueryValue";
      break;
    case "Headers":
      addButtonText = "Header";
      paramName = REQUEST_HEADERS;
      placeholderKey = "HeaderKey";
      placeholderValue = "HeaderValue";
      break;
    case "Form":
      addButtonText = "FormData";
      paramName = REQUEST_BODY_FORM_DATA;
      placeholderKey = "FormDataKey";
      placeholderValue = "FormDataValue";
      break;
    case "X_WWW_FORM_URLENCODED":
      addButtonText = "Param";
      paramName = REQUEST_QUERY_BODY_RAW_URLENCODED;
      placeholderKey = "ParamKey";
      placeholderValue = "ParamValue";
      break;
  }

  return (
    <Form.List name={paramName}>
      {(fields, { add, remove }) => (
        <div style={style}>
          {fields.map(({ key, name, ...restField }, index) => {
            const typePath = [...paramName, name, "type"];
            const keyPath = [...paramName, name, "key"];
            const jsonSchemaPath = [...paramName, name, "jsonSchema"];
            const content = (
              <Row gutter={10}>
                <Col flex={"auto"}>
                  <EditorFormItem
                    {...restField}
                    name={[name, "key"]}
                    rules={[{ required: true, message: "请输入参数名称" }]}
                  >
                    <Input placeholder={placeholderKey} />
                  </EditorFormItem>
                </Col>
                <Col flex={"16px"}>
                  <Tooltip title={"是否必须"}>
                    <EditorFormItem
                      {...restField}
                      name={[name, "required"]}
                      valuePropName={"checked"}
                    >
                      <Checkbox />
                    </EditorFormItem>
                  </Tooltip>
                </Col>
                {(paramType === "Form" || paramType === "Query") && (
                  <Col flex={"70px"}>
                    <EditorFormItem
                      noStyle
                      {...restField}
                      name={[name, "type"]}
                    >
                      <Select
                        allowClear={false}
                        style={{ width: paramType === "Form" ? 70 : 95 }}
                        options={
                          paramType === "Form"
                            ? toLabelValue(FormDataType)
                            : toLabelValue(QueryParamType)
                        }
                      />
                    </EditorFormItem>
                  </Col>
                )}
                <Col flex={"auto"}>
                  {paramType !== "Form" && (
                    <EditorFormItem {...restField} name={[name, "value"]}>
                      <Input placeholder={placeholderValue} />
                    </EditorFormItem>
                  )}
                  {paramType === "Form" && (
                    <EditorFormItem
                      noStyle
                      shouldUpdate={(prevValues, nextValues) => {
                        return (
                          _.get(prevValues, typePath) !==
                          _.get(nextValues, typePath)
                        );
                      }}
                    >
                      {({ getFieldValue, setFieldValue }) => {
                        const newType = getFieldValue(typePath);
                        if (newType === "FILE") {
                          setFieldValue(
                            [...paramName, name, "value"],
                            undefined
                          );
                        }
                        return (
                          <EditorFormItem name={[name, "value"]}>
                            <Input
                              placeholder={placeholderValue}
                              disabled={newType === "FILE"}
                            />
                          </EditorFormItem>
                        );
                      }}
                    </EditorFormItem>
                  )}
                </Col>
                <Col flex={"auto"}>
                  <EditorFormItem {...restField} name={[name, "description"]}>
                    <Input style={{ width: "100%" }} placeholder="参数描述" />
                  </EditorFormItem>
                </Col>
                <Col flex={"24px"}>
                  <Button
                    color={"danger"}
                    variant={"filled"}
                    icon={<DeleteOutlined />}
                    onClick={() => remove(index)}
                  />
                </Col>
              </Row>
            );
            return (
              <Form.Item
                key={key}
                noStyle
                shouldUpdate={(prevValues, nextValues) => {
                  const nextType: any = _.get(nextValues, typePath);
                  if (!nextType) {
                    return true;
                  }
                  const nextIsNeedJsonSchema = queryParamJsonSchema(nextType);
                  if (!nextIsNeedJsonSchema) {
                    _.set(nextValues, jsonSchemaPath, undefined);
                  } else {
                    const jsonSchema = _.get(prevValues, jsonSchemaPath);
                    if (
                      !jsonSchema ||
                      _.get(prevValues, typePath) !== nextType
                    ) {
                      _.set(
                        nextValues,
                        jsonSchemaPath,
                        JSON.stringify(getDefaultSchema(nextType.toLowerCase()))
                      );
                    }
                  }
                  return true;
                }}
              >
                {({ getFieldValue, setFieldValue }) => {
                  const showJsonSchema = queryParamJsonSchema(
                    getFieldValue(typePath)
                  );
                  return (
                    <>
                      {content}
                      {showJsonSchema && (
                        <EditorFormItem
                          noStyle
                          {...restField}
                          name={[name, "jsonSchema"]}
                        >
                          <JsonSchemaEditor
                            style={{
                              backgroundColor: token.colorFillQuaternary,
                              padding: 16,
                              paddingBottom: 6,
                              marginBottom: 16,
                            }}
                            rootTypeDisable={true}
                            rootName={getFieldValue(keyPath)}
                            rootTypeChange={(newRootType) => {
                              const newType = (
                                newRootType as string
                              ).toUpperCase();
                              setFieldValue(typePath, newType);
                              return true;
                            }}
                          />
                        </EditorFormItem>
                      )}
                    </>
                  );
                }}
              </Form.Item>
            );
          })}
          <Button
            type={"primary"}
            style={{ width: "130px" }}
            icon={<PlusOutlined />}
            onClick={() =>
              add(
                paramType === "Form"
                  ? { type: "TEXT" }
                  : paramType === "Query"
                  ? { type: "STRING" }
                  : {}
              )
            }
          >
            添加 {addButtonText}
          </Button>
        </div>
      )}
    </Form.List>
  );
};

function Editor(props: {
  apiDocsDetail: API.ApiDocsDetail;
  apiDocsGroup: API.ApiDocsGroupDetail[];
  afterEdit: () => void;
}) {
  const [messageApi, contextHolder] = message.useMessage();
  const { apiDocsDetail, apiDocsGroup } = props;
  const { token } = theme.useToken();
  const contentStyle: CSSProperties = {
    padding: 20,
    backgroundColor: token.colorFillTertiary,
    borderRadius: token.borderRadius,
  };

  const [editorForm] = Form.useForm();
  const [addResponseForm] = Form.useForm();
  const [affixed, setAffixed] = useState<boolean>();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [requestEdit, setRequestEdit] = useState<RequestType>("Body");
  const [bodyType, setBodyType] = useState<BodyType>();
  const [responses, setResponses] = useState<API.Response[]>([]);
  const [activeResponse, setActiveResponse] = useState<string>("200");
  const [addResponseFormOpen, setAddResponseFormOpen] =
    useState<boolean>(false);

  const rawType = Form.useWatch(REQUEST_QUERY_BODY_RAW_TYPE, editorForm);

  useEffect(() => {
    editorForm.resetFields();
    const apiSpecification = apiDocsDetail.apiSpecification;
    const request = apiSpecification?.request;
    setResponses(apiSpecification?.responses || [{ statusCode: 200 }]);
    editorForm.setFieldsValue(apiDocsDetail);
    editorForm.setFieldValue(PATH_PARAMS, request?.pathParams || []);
    const queryParams = request?.queryParams || [];
    editorForm.setFieldValue(REQUEST_QUERY_PARAMS, queryParams);
    if (!request) {
      return;
    }
    const bodyParam = request.bodyParam;
    if (!bodyParam) {
      if (queryParams && queryParams.length > 0) {
        setRequestEdit("Query");
      } else if (request.headers) {
        setRequestEdit("Headers");
      }
      return;
    }
    setBodyType(
      bodyParam?.raw
        ? "Raw"
        : bodyParam?.binary
        ? "Binary"
        : bodyParam?.formDataParams
        ? "Form"
        : "None"
    );
  }, [apiDocsDetail]);

  async function handleSubmit() {
    setSubmitting(true);
    editorForm
      .validateFields()
      .then((values: API.UpdateApiDocs) => {
        if (values.apiSpecification) {
          values.apiSpecification.responses = responses;
        }
        updateApiDocs(values).then(() => {
          messageApi.success("保存成功！");
          props.afterEdit();
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  const onPathChange = (event: ChangeEvent<HTMLInputElement>) => {
    let val = event.target.value;
    val = handlePath(val);
    const pathParams = extractPathParams(val);
    const bracketParams = extractBracketParams(val);
    const existingParams = editorForm.getFieldValue(PATH_PARAMS) || [];
    const newParams = _.uniqBy([...pathParams, ...bracketParams], "key");
    const filteredExistingParams = existingParams.filter(
      (param: API.PathParam) =>
        newParams.some((newParam) => newParam.key === param.key)
    );
    const mergedParams = _.unionBy(newParams, filteredExistingParams, "key");
    if (!_.isEqual(mergedParams, existingParams)) {
      editorForm.setFieldValue(PATH_PARAMS, mergedParams);
    }
  };

  const add = (newResponse: API.Response) => {
    const newResponses = [...responses];
    newResponses.push(newResponse);
    setResponses(newResponses);
    setActiveResponse(String(newResponse.statusCode));
  };

  const remove = (targetKey: TargetKey) => {
    let newActiveKey = activeResponse;
    let lastIndex = -1;
    responses.forEach((item, i) => {
      if (item.statusCode === Number(targetKey)) {
        lastIndex = i - 1;
      }
    });
    const newPanes = responses.filter(
      (item) => item.statusCode !== Number(targetKey)
    );
    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = String(newPanes[lastIndex].statusCode);
      } else {
        newActiveKey = String(newPanes[0].statusCode);
      }
    }
    setResponses(newPanes);
    setActiveResponse(newActiveKey);
  };

  const onResponseTabEdit = (
    targetKey: TargetKey,
    action: "add" | "remove"
  ) => {
    if (action === "remove") {
      remove(targetKey);
    } else {
      setAddResponseFormOpen(true);
    }
  };

  const AddResponseForm = () => {
    const [responseEdit, setResponseEdit] = useState<ResponseType>("JSON");
    // noinspection JSUnusedGlobalSymbols
    return (
      <ModalForm<API.Response>
        width={900}
        clearOnDestroy
        open={addResponseFormOpen}
        form={addResponseForm}
        layout={"horizontal"}
        title={"新增响应信息"}
        autoFocusFirstInput
        initialValues={{ statusCode: 500 }}
        onFinish={async () => {
          const values = await addResponseForm.validateFields();
          add(values);
          setAddResponseFormOpen(false);
        }}
        modalProps={{
          onCancel: () => {
            setAddResponseFormOpen(false);
          },
        }}
      >
        <EditorFormItem
          name="statusCode"
          label="响应码"
          rules={[
            { required: true, message: "请输入响应码" },
            {
              min: 100,
              max: 599,
              type: "number",
              message: "响应码应该在 100 ～ 599 之间",
            },
          ]}
        >
          <InputNumber controls={false} min={100} max={599} />
        </EditorFormItem>
        <Flex vertical gap={"middle"} style={contentStyle}>
          <Radio.Group
            value={responseEdit}
            options={Object.keys(ResponseTypes)}
            onChange={(event) => setResponseEdit(event.target.value)}
          />
          {responseEdit === "JSON" && (
            <EditorFormItem noStyle name={"jsonSchema"}>
              <JsonSchemaEditor />
            </EditorFormItem>
          )}
          <div>
            <SubItemTitle title={"描述"} />
            <EditorFormItem noStyle name={"description"}>
              <Input.TextArea
                placeholder={"响应描述信息"}
                autoSize={{ minRows: 3 }}
              />
            </EditorFormItem>
          </div>
        </Flex>
      </ModalForm>
    );
  };

  const tabItems = useMemo(
    () =>
      responses.map((response, index) => ({
        key: String(response.statusCode),
        label: response.statusCode,
        closable: response.statusCode !== 200,
        children: (
          <div style={contentStyle}>
            <ResponseContent
              response={response}
              json={
                <JsonSchemaEditor
                  value={responses[index].jsonSchema}
                  onChange={(jsonSchema) => {
                    setResponses((prevResponses) =>
                      prevResponses.map((response, i) =>
                        i === index
                          ? {
                              ...response,
                              jsonSchema: JSON.stringify(jsonSchema),
                              description: undefined,
                            }
                          : response
                      )
                    );
                  }}
                />
              }
              description={
                <Input.TextArea
                  autoSize={{ minRows: 3 }}
                  placeholder={"请输入响应数据描述信息"}
                  value={responses[index].description}
                  onChange={({ target: { value } }) => {
                    setResponses((prevResponses) =>
                      prevResponses.map((response, i) =>
                        i === index
                          ? {
                              ...response,
                              description: value,
                              jsonSchema: undefined,
                            }
                          : response
                      )
                    );
                  }}
                />
              }
            />
          </div>
        ),
      })),
    [responses, contentStyle]
  );

  return (
    <>
      {contextHolder}
      <Form
        form={editorForm}
        labelCol={{ flex: "90px" }}
        style={{ padding: "0 10px 10px" }}
      >
        <Form.Item hidden name={"id"}>
          <Input />
        </Form.Item>
        <Form.Item hidden name={"projectId"}>
          <Input />
        </Form.Item>
        <Flex vertical gap={"large"}>
          <ApiDocsContent title={"基本信息"}>
            <div style={{ ...contentStyle, paddingLeft: 90, paddingRight: 90 }}>
              <EditorFormItem
                name={"name"}
                label={"接口名称"}
                rules={[
                  { required: true, message: "请输入接口名称" },
                  { max: 30, message: "分组名称不能超过 30 个字符" },
                ]}
              >
                <Input allowClear={false} placeholder={"请输入接口名称"} />
              </EditorFormItem>
              <EditorFormItem label={"请求地址"} required>
                <Space.Compact style={{ width: "100%" }}>
                  <EditorFormItem
                    noStyle
                    name={"method"}
                    rules={[{ required: true, message: "请选择接口请求方法" }]}
                  >
                    <Select
                      allowClear={false}
                      style={{ width: "15%" }}
                      options={Object.values(ApiMethod).map((m) => ({
                        value: ApiMethod[m],
                      }))}
                    />
                  </EditorFormItem>
                  <EditorFormItem
                    noStyle
                    name={"path"}
                    rules={[
                      { required: true, message: "请输入接口路径" },
                      { max: 255, message: "接口路径不能超过 255 个字符" },
                    ]}
                  >
                    <Input
                      style={{ width: "85%" }}
                      allowClear={false}
                      placeholder={"请输入接口路径"}
                      onChange={onPathChange}
                    />
                  </EditorFormItem>
                </Space.Compact>
              </EditorFormItem>
              <Form.List name={PATH_PARAMS}>
                {(fields) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={10}>
                        <Col span={4}>
                          <EditorFormItem
                            {...restField}
                            name={[name, "key"]}
                            rules={[
                              { required: true, message: "请输入参数名称" },
                            ]}
                          >
                            <Input disabled />
                          </EditorFormItem>
                        </Col>
                        <Col span={10}>
                          <EditorFormItem {...restField} name={[name, "value"]}>
                            <Input placeholder="参数示例" />
                          </EditorFormItem>
                        </Col>
                        <Col span={10}>
                          <EditorFormItem
                            {...restField}
                            name={[name, "description"]}
                          >
                            <Input
                              style={{ width: "100%" }}
                              placeholder="参数描述"
                            />
                          </EditorFormItem>
                        </Col>
                      </Row>
                    ))}
                  </>
                )}
              </Form.List>
              <EditorFormItem
                name={"groupId"}
                label={"所属分组"}
                rules={[{ required: true, message: "请选择接口分组" }]}
              >
                <TreeSelect
                  allowClear={false}
                  treeData={apiDocsGroup}
                  fieldNames={IdName}
                />
              </EditorFormItem>
              <EditorFormItem
                style={{ marginBottom: 0 }}
                name={"state"}
                label={"接口状态"}
                rules={[{ required: true, message: "请选择接口状态" }]}
              >
                <Select
                  allowClear={false}
                  options={toLabelValue(ApiDocsState)}
                />
              </EditorFormItem>
            </div>
          </ApiDocsContent>
          <ApiDocsContent title={"请求参数"}>
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              value={requestEdit}
              options={Object.keys(RequestTypes)}
              onChange={(event) => setRequestEdit(event.target.value)}
              style={{ textAlign: "center" }}
            />
            <div style={contentStyle}>
              <ParamList
                style={{ display: requestEdit === "Headers" ? "" : "none" }}
                paramType={"Headers"}
              />
              <ParamList
                style={{ display: requestEdit === "Query" ? "" : "none" }}
                paramType={"Query"}
              />
              <Flex
                vertical
                style={{ display: requestEdit === "Body" ? "" : "none" }}
              >
                <EditorFormItem>
                  <Radio.Group
                    options={Object.keys(BodyTypes)}
                    value={bodyType}
                    onChange={({ target: { value } }) => {
                      setBodyType(value);
                      if (value === "Raw") {
                        editorForm.setFieldValue(
                          REQUEST_QUERY_BODY_RAW_TYPE,
                          "JSON"
                        );
                      } else if (value === "Binary") {
                        editorForm.setFieldValue(
                          REQUEST_QUERY_BODY_BINARY_TYPE,
                          "FILE"
                        );
                      }
                    }}
                  />
                </EditorFormItem>
                {bodyType === "Form" && <ParamList paramType={"Form"} />}
                {bodyType === "Binary" && (
                  <div>
                    <EditorFormItem
                      name={REQUEST_QUERY_BODY_BINARY_TYPE}
                      rules={[{ required: true }]}
                    >
                      <Radio.Group
                        size={"small"}
                        buttonStyle={"solid"}
                        optionType={"button"}
                        options={[
                          { label: "File", value: "FILE" },
                          { label: "Text", value: "TEXT" },
                        ]}
                      />
                    </EditorFormItem>
                    <EditorFormItem
                      name={[
                        ...REQUEST_QUERY_BODY_PARAM,
                        "binary",
                        "description",
                      ]}
                    >
                      <Input.TextArea
                        autoSize={{ minRows: 3 }}
                        placeholder={"描述信息"}
                      />
                    </EditorFormItem>
                  </div>
                )}
                {bodyType === "Raw" && (
                  <div>
                    <EditorFormItem name={REQUEST_QUERY_BODY_RAW_TYPE}>
                      <Radio.Group
                        size={"small"}
                        buttonStyle={"solid"}
                        optionType={"button"}
                        options={toLabelValue(RawType)}
                      />
                    </EditorFormItem>
                    {rawType === "JSON" ? (
                      <EditorFormItem
                        name={[
                          ...REQUEST_QUERY_BODY_PARAM,
                          "raw",
                          "jsonSchema",
                        ]}
                      >
                        <JsonSchemaEditor />
                      </EditorFormItem>
                    ) : rawType === "X_WWW_FORM_URLENCODED" ? (
                      <ParamList paramType={"X_WWW_FORM_URLENCODED"} />
                    ) : (
                      <Row gutter={20}>
                        <Col span={12}>
                          <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, nextValues) => {
                              const path = REQUEST_QUERY_BODY_RAW_TYPE;
                              return (
                                _.get(prevValues, path) ===
                                _.get(nextValues, path)
                              );
                            }}
                          >
                            {({ getFieldValue }) => {
                              return (
                                <EditorFormItem
                                  name={REQUEST_QUERY_BODY_RAW_VALUE}
                                >
                                  <MonacoEditor
                                    minimap={false}
                                    placeholder={"Example Body"}
                                    lineNumbers={"off"}
                                    language={getFieldValue([
                                      ...REQUEST_QUERY_BODY_PARAM,
                                      "raw",
                                      "type",
                                    ])?.toLowerCase()}
                                    height={300}
                                  />
                                </EditorFormItem>
                              );
                            }}
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <EditorFormItem
                            name={[
                              ...REQUEST_QUERY_BODY_PARAM,
                              "raw",
                              "description",
                            ]}
                          >
                            <Input.TextArea
                              autoSize={{ minRows: 3 }}
                              placeholder={"描述信息"}
                            />
                          </EditorFormItem>
                        </Col>
                      </Row>
                    )}
                  </div>
                )}
              </Flex>
            </div>
          </ApiDocsContent>
          <ApiDocsContent title={"响应数据"}>
            <Tabs
              type={"editable-card"}
              activeKey={activeResponse}
              onEdit={onResponseTabEdit}
              onTabClick={(value) => setActiveResponse(value)}
              items={tabItems}
            />
          </ApiDocsContent>
          <ApiDocsContent title={"接口描述"}>
            <EditorFormItem noStyle name={"description"}>
              <Lexical />
            </EditorFormItem>
          </ApiDocsContent>
        </Flex>
        <AddResponseForm />
        <Affix
          offsetBottom={0}
          onChange={(af) => setAffixed(af)}
          style={{ marginTop: 30 }}
        >
          <div
            style={{
              height: 56,
              paddingTop: 12,
              textAlign: "center",
              backgroundColor: affixed ? token.colorBorderSecondary : undefined,
            }}
          >
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={submitting}
              onClick={handleSubmit}
            >
              保存
            </Button>
          </div>
        </Affix>
      </Form>
    </>
  );
}

export default Editor;

import { ApiDocsContext } from "@/pages/ProjectDevelopment/ApiDocs";
import Debug from "@/pages/ProjectDevelopment/ApiDocs/Docs/Debug";
import Editor from "@/pages/ProjectDevelopment/ApiDocs/Docs/Editor";
import ItemTitle from "@/pages/ProjectDevelopment/ApiDocs/ItemTitle";
import {
  addApiDocs,
  deleteApiDocs,
  getApiDocsDetail,
} from "@/services/flode/apiDocsController";
import {
  addApiDocsGroup,
  deleteApiDocsGroup,
  treeApiDocsGroupDetail,
  updateApiDocsGroup,
} from "@/services/flode/apiDocsGroupController";
import {
  apiDocsStateTag,
  ApiMethod,
  getQueryParam,
  IdName,
  methodTag,
  ParamKey,
  updateQueryParam,
} from "@/util/Utils";
import {
  ApiOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
} from "@ant-design/pro-components";
import {
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  Flex,
  Form,
  Input,
  Popconfirm,
  Row,
  Table,
  TableProps,
  Tabs,
  TabsProps,
  theme,
  Tree,
  type TreeDataNode,
  Typography,
} from "antd";
import { useContext, useEffect, useState } from "react";
import Preview from "./Preview";

const cardStyles = {
  header: { padding: "0px 13px", minHeight: 45, fontWeight: 500 },
  body: { padding: "16px 13px" },
};

type ApiDocsGroupDetail = TreeDataNode & {
  key: string;
  apiDocs?: API.ApiDocsVO[];
  groupInfo?: API.ApiDocsGroupDetail;
  apiDocsInfo?: API.ApiDocsVO;
};

type SelectedNode = {
  groupInfo?: API.ApiDocsGroupDetail;
  apiDocsInfo?: API.ApiDocsVO;
};

export const PATH_PARAMS = ["apiSpecification", "request", "pathParams"];
export const REQUEST_HEADERS = ["apiSpecification", "request", "headers"];
export const REQUEST_QUERY_PARAMS = [
  "apiSpecification",
  "request",
  "queryParams",
];
export const REQUEST_QUERY_BODY_PARAM = [
  "apiSpecification",
  "request",
  "bodyParam",
];
export const REQUEST_QUERY_BODY_BINARY_TYPE = [
  ...REQUEST_QUERY_BODY_PARAM,
  "binary",
  "type",
];
export const REQUEST_QUERY_BODY_BINARY_VALUE = [
  ...REQUEST_QUERY_BODY_PARAM,
  "binary",
  "value",
];
export const REQUEST_QUERY_BODY_RAW_VALUE = [
  ...REQUEST_QUERY_BODY_PARAM,
  "raw",
  "value",
];
export const REQUEST_QUERY_BODY_RAW_TYPE = [
  ...REQUEST_QUERY_BODY_PARAM,
  "raw",
  "type",
];
export const REQUEST_QUERY_BODY_RAW_URLENCODED = [
  ...REQUEST_QUERY_BODY_PARAM,
  "raw",
  "urlencodedParams",
];
export const REQUEST_BODY_FORM_DATA = [
  ...REQUEST_QUERY_BODY_PARAM,
  "formDataParams",
];

function Docs() {
  const { token } = theme.useToken();
  const [addApiGroupForm] = Form.useForm();
  const [updateApiGroupForm] = Form.useForm();
  const [addApiDocsForm] = Form.useForm();
  const { projectId, apiDocsGroup, setApiDocsGroup } =
    useContext(ApiDocsContext);
  const [apiDocsGroupDetail, setApiDocsGroupDetail] = useState<
    ApiDocsGroupDetail[]
  >([]);
  const [selectedNode, setSelectedNode] = useState<SelectedNode>();
  const [apiDocsDetail, setApiDocsDetail] = useState<API.ApiDocsDetail>();
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  function generateTreeData(
    data?: API.ApiDocsGroupDetail[],
    activeId?: string
  ): ApiDocsGroupDetail[] {
    return data
      ? data.map((item) => {
          let children: ApiDocsGroupDetail[] = [];
          const node: ApiDocsGroupDetail = {
            key: item.id,
            icon: (props) => {
              return props.expanded ? (
                <FolderOpenOutlined />
              ) : (
                <FolderOutlined />
              );
            },
            title: item.name,
            apiDocs: item.apiDocs,
            groupInfo: item,
          };
          if (
            (selectedNode?.groupInfo &&
              item.id === selectedNode.groupInfo.id) ||
            item.id === activeId
          ) {
            setSelectedNode({ groupInfo: item });
          }
          if (item.children) {
            children = children.concat(
              ...generateTreeData(item.children, activeId)
            );
          }
          if (item.apiDocs) {
            const apiDocs: ApiDocsGroupDetail[] = item.apiDocs.map((docs) => {
              if (
                (selectedNode?.apiDocsInfo &&
                  docs.id === selectedNode.apiDocsInfo.id) ||
                docs.id === activeId
              ) {
                setSelectedNode({ apiDocsInfo: docs });
              }
              return {
                key: docs.id,
                title: (
                  <>
                    {methodTag(docs.method)}
                    {docs.name}
                  </>
                ),
                apiDocsInfo: docs,
              };
            });
            children = children.concat(...apiDocs);
          }
          node.children = children;
          return node;
        })
      : [];
  }

  function updateApiDocsGroupDetail(keyword?: string, activeId?: string) {
    if (!projectId) {
      return;
    }
    treeApiDocsGroupDetail({ projectId, keyword }).then((resp) => {
      setApiDocsGroup(resp);
      setApiDocsGroupDetail(generateTreeData(resp, activeId));
    });
  }

  useEffect(() => {
    const activeIdParam = getQueryParam(ParamKey.SEL_DOCS_ID_GROUP_ID);
    setApiDocsGroupDetail(generateTreeData(apiDocsGroup, activeIdParam));
  }, [apiDocsGroup]);

  const findParentKeys = (
    id: string,
    treeData: API.ApiDocsGroupDetail[]
  ): string[] => {
    if (!id || !treeData) return [];
    for (const item of treeData) {
      if (item.id === id) {
        return [item.id];
      }
      if (item.children) {
        const find = findParentKeys(id, item.children);
        return [item.id, ...find];
      }
      if (item.apiDocs) {
        const find = item.apiDocs.find((a) => a.id === id);
        if (find) {
          return [item.id, find.id];
        }
      }
    }
    return [];
  };

  useEffect(() => {
    if (selectedNode?.apiDocsInfo?.id) {
      updateQueryParam(
        ParamKey.SEL_DOCS_ID_GROUP_ID,
        selectedNode.apiDocsInfo.id
      );
      const parentKeys = findParentKeys(
        selectedNode.apiDocsInfo.id,
        apiDocsGroup
      );
      setExpandedKeys([...new Set([...expandedKeys, ...parentKeys])]);
      getApiDocsDetail({ id: selectedNode?.apiDocsInfo?.id }).then((resp) => {
        setApiDocsDetail(resp);
      });
    }
    if (selectedNode?.groupInfo) {
      updateQueryParam(
        ParamKey.SEL_DOCS_ID_GROUP_ID,
        selectedNode.groupInfo.id
      );
    }
  }, [selectedNode]);

  const apiDocsTableColumns: TableProps<API.ApiDocsVO>["columns"] = [
    {
      title: "接口名称",
      dataIndex: "name",
      render: (_, docs) => (
        <Typography.Link onClick={() => setSelectedNode({ apiDocsInfo: docs })}>
          {docs.name}
        </Typography.Link>
      ),
    },
    {
      title: "接口路径",
      render: (_, docs) => (
        <>
          {methodTag(docs.method)}
          {docs.path}
        </>
      ),
    },
    {
      title: "状态",
      dataIndex: "state",
      render: (state) => apiDocsStateTag(state),
    },
    {
      title: "操作",
      dataIndex: "action",
      render: (_, record) => (
        <Popconfirm
          title={"确认删除该接口文档吗？"}
          onConfirm={() => {
            deleteApiDocs({ id: record.id }).then(() =>
              updateApiDocsGroupDetail()
            );
          }}
        >
          <Button danger type={"text"} size={"small"} icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const items: TabsProps["items"] = [
    {
      key: "preview",
      icon: <EyeOutlined />,
      label: "预览",
      children: apiDocsDetail && <Preview apiDocsDetail={apiDocsDetail} />,
    },
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "编辑",
      children: apiDocsDetail && (
        <Editor
          apiDocsDetail={apiDocsDetail}
          apiDocsGroup={apiDocsGroup}
          afterEdit={() => {
            getApiDocsDetail({ id: apiDocsDetail?.id }).then((resp) => {
              setApiDocsDetail(resp);
            });
          }}
        />
      ),
    },
    {
      key: "debug",
      icon: <ApiOutlined />,
      label: "调试",
      children: apiDocsDetail && <Debug apiDocsDetail={apiDocsDetail} />,
    },
  ];

  return (
    <Row gutter={[16, 0]}>
      <Col span={6}>
        <Card
          title={"接口分组"}
          styles={cardStyles}
          extra={
            <Dropdown
              menu={{
                items: [
                  {
                    key: "addApiDocsGroup",
                    label: (
                      <ModalForm
                        width={630}
                        form={addApiGroupForm}
                        labelCol={{ span: 4 }}
                        title={"新建分组"}
                        layout="horizontal"
                        trigger={
                          <div
                            onClick={() =>
                              addApiGroupForm.setFieldsValue({
                                parentId: selectedNode?.groupInfo?.id,
                              })
                            }
                          >
                            <PlusOutlined /> 新建分组
                          </div>
                        }
                        onFinish={async () => {
                          const values = await addApiGroupForm.validateFields();
                          values.projectId = projectId;
                          return addApiDocsGroup(values).then(() => {
                            updateApiDocsGroupDetail();
                            addApiGroupForm.resetFields();
                            return true;
                          });
                        }}
                      >
                        <ProFormText
                          name={"name"}
                          label={"分组名称"}
                          rules={[
                            { required: true, message: "请输入分组名称" },
                            { max: 30, message: "分组名称不能超过 30 个字符" },
                          ]}
                        />
                        <ProFormTreeSelect
                          allowClear
                          name={"parentId"}
                          label={"父分组"}
                          fieldProps={{
                            fieldNames: IdName,
                            treeData: apiDocsGroup,
                          }}
                        />
                        <ProFormTextArea
                          name={"description"}
                          label={"描述"}
                          rules={[
                            {
                              max: 255,
                              message: "描述信息不能超过 255 个字符",
                            },
                          ]}
                        />
                      </ModalForm>
                    ),
                  },
                  {
                    key: "addApiDocs",
                    label: (
                      <ModalForm
                        width={660}
                        form={addApiDocsForm}
                        labelCol={{ flex: "90px" }}
                        title={"新建接口"}
                        layout="horizontal"
                        trigger={
                          <div
                            onClick={() =>
                              addApiDocsForm.setFieldsValue({
                                groupId: selectedNode?.groupInfo?.id,
                              })
                            }
                          >
                            <PlusOutlined /> 新建接口
                          </div>
                        }
                        onFinish={async () => {
                          const values = await addApiDocsForm.validateFields();
                          values.projectId = projectId;
                          return addApiDocs(values).then(() => {
                            updateApiDocsGroupDetail();
                            addApiDocsForm.resetFields();
                            return true;
                          });
                        }}
                      >
                        <ProFormText
                          allowClear={false}
                          name={"name"}
                          label={"接口名称"}
                          rules={[
                            { required: true, message: "请输入接口名称" },
                            { max: 30, message: "分组名称不能超过 30 个字符" },
                          ]}
                        />
                        <ProFormSelect
                          allowClear={false}
                          name={"method"}
                          label={"请求方法"}
                          style={{ width: 130 }}
                          options={Object.values(ApiMethod)}
                          rules={[
                            { required: true, message: "请选择接口请求方法" },
                          ]}
                        />
                        <ProFormText
                          allowClear={false}
                          name={"path"}
                          label={"接口地址"}
                          rules={[
                            { required: true, message: "请输入接口路径" },
                            {
                              max: 255,
                              message: "接口路径不能超过 255 个字符",
                            },
                          ]}
                        />
                        <ProFormTreeSelect
                          allowClear={false}
                          name={"groupId"}
                          label={"所属分组"}
                          rules={[
                            { required: true, message: "请选择接口分组" },
                          ]}
                          fieldProps={{
                            fieldNames: IdName,
                            treeData: apiDocsGroup,
                          }}
                        />
                        <ProFormTextArea
                          name={"description"}
                          label={"描述"}
                          rules={[
                            {
                              max: 255,
                              message: "描述信息不能超过 255 个字符",
                            },
                          ]}
                        />
                      </ModalForm>
                    ),
                  },
                ],
              }}
            >
              <Button icon={<PlusOutlined />} type={"text"} />
            </Dropdown>
          }
        >
          <Input.Search
            placeholder={"请输入接口名称"}
            enterButton
            onSearch={(keyword) => updateApiDocsGroupDetail(keyword)}
          />
          <Tree<ApiDocsGroupDetail>
            blockNode
            defaultExpandParent
            expandedKeys={expandedKeys}
            selectedKeys={[
              selectedNode?.groupInfo?.id || selectedNode?.apiDocsInfo?.id || 0,
            ]}
            onExpand={(keys) => setExpandedKeys(keys as string[])}
            style={{ paddingTop: 10 }}
            treeData={apiDocsGroupDetail}
            onSelect={(_, { selected, node }) => {
              if (!selected) {
                return;
              }
              setSelectedNode({
                apiDocsInfo: node.apiDocsInfo,
                groupInfo: node.groupInfo,
              });
            }}
          />
        </Card>
      </Col>
      <Col span={18}>
        {selectedNode?.groupInfo && (
          <Flex vertical gap={"middle"}>
            <Flex justify="space-between" align="center">
              <ItemTitle
                title={
                  <Flex gap={"small"} align={"flex-end"}>
                    <div>{selectedNode.groupInfo?.name}</div>
                    <div style={{ fontSize: 12, color: token.colorPrimary }}>
                      共{selectedNode.groupInfo.apiDocs?.length || 0}个接口
                    </div>
                  </Flex>
                }
              />
              <Flex gap="middle">
                <ModalForm
                  width={630}
                  form={updateApiGroupForm}
                  labelCol={{ span: 4 }}
                  title={"编辑分组"}
                  layout="horizontal"
                  trigger={
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() =>
                        updateApiGroupForm.setFieldsValue(
                          selectedNode.groupInfo
                        )
                      }
                    >
                      编辑
                    </Button>
                  }
                  onFinish={async () => {
                    const values = await updateApiGroupForm.validateFields();
                    values.projectId = projectId;
                    values.id = selectedNode.groupInfo?.id;
                    return updateApiDocsGroup(values).then(() => {
                      updateApiDocsGroupDetail();
                      updateApiGroupForm.resetFields();
                      return true;
                    });
                  }}
                >
                  <ProFormText
                    name={"name"}
                    label={"分组名称"}
                    rules={[
                      { required: true, message: "请输入分组名称" },
                      { max: 30, message: "分组名称不能超过 30 个字符" },
                    ]}
                  />
                  <ProFormTreeSelect
                    allowClear
                    name={"parentId"}
                    label={"父分组"}
                    fieldProps={{ fieldNames: IdName, treeData: apiDocsGroup }}
                  />
                  <ProFormTextArea
                    name={"description"}
                    label={"描述"}
                    rules={[
                      { max: 255, message: "描述信息不能超过 255 个字符" },
                    ]}
                  />
                </ModalForm>
                <Popconfirm
                  title="删除接口分组"
                  description="确认删除该接口分组吗？"
                  onConfirm={() => {
                    if (selectedNode.groupInfo) {
                      deleteApiDocsGroup({
                        id: selectedNode.groupInfo.id,
                      }).then(() => {
                        updateApiDocsGroupDetail();
                        setSelectedNode(undefined);
                      });
                    }
                  }}
                >
                  <Button danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>
              </Flex>
            </Flex>
            <div
              style={{
                fontSize: token.fontSizeSM,
                color: token.colorTextSecondary,
              }}
            >
              描述：{selectedNode.groupInfo.description || "-"}
            </div>
            <Table
              bordered
              size="middle"
              rowKey={"id"}
              pagination={false}
              columns={apiDocsTableColumns}
              dataSource={selectedNode.groupInfo.apiDocs}
            />
          </Flex>
        )}
        {selectedNode?.apiDocsInfo && (
          <>
            <Tabs
              defaultActiveKey="preview"
              items={items}
              type={"card"}
              tabBarExtraContent={
                <Popconfirm
                  title={"确认删除该接口吗？"}
                  onConfirm={() => {
                    if (selectedNode.apiDocsInfo?.id) {
                      deleteApiDocs({ id: selectedNode.apiDocsInfo.id }).then(
                        () => {
                          updateApiDocsGroupDetail();
                          setSelectedNode(undefined);
                        }
                      );
                    }
                  }}
                >
                  <Button danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>
              }
            />
          </>
        )}
        {!selectedNode?.groupInfo && !selectedNode?.apiDocsInfo && (
          <Empty
            style={{ height: "100%" }}
            styles={{
              root: {
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              },
            }}
            description={"请在左侧选择要查看的接口分组或者接口"}
          />
        )}
      </Col>
    </Row>
  );
}

export default Docs;

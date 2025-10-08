import { HexColorPicker } from "@/components";
import {
  addTemplate,
  deleteTemplate,
  getTemplateDetail,
  pageTemplate,
  updateTemplate,
} from "@/services/flode/templateController";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  ActionType,
  ModalForm,
  ModalFormProps,
  PageContainer,
  ProColumns,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from "@ant-design/pro-components";
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Popconfirm,
  Row,
  Tooltip,
} from "antd";
import React, { useEffect, useRef, useState } from "react";

const TemplateModalForm = <T,>({
  templateId,
  ...formProps
}: { templateId?: string } & ModalFormProps<T>) => {
  const [form] = Form.useForm<T>();

  const [init, setInit] = useState<API.TemplateDetail>();

  useEffect(() => {
    if (templateId) {
      getTemplateDetail({ id: templateId }).then((resp) => {
        setInit(resp);
      });
    }
  }, [templateId, form]);

  return (
    (!templateId || init) && (
      <>
        <ModalForm<T>
          form={form}
          width={"50%"}
          layout="horizontal"
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 21 }}
          modalProps={{
            destroyOnClose: true,
          }}
          initialValues={init}
          {...formProps}
        >
          <ProFormText name={"id"} label={"模板ID"} hidden />
          <ProFormText
            name={"name"}
            label={"模板名称"}
            rules={[{ required: true, max: 30 }]}
          />
          <Form.Item label={"需求类型"} required>
            <Form.List name="requirementTypes">
              {(fields, { add, remove, move }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Row
                      key={key}
                      justify="space-around"
                      align="middle"
                      gutter={10}
                    >
                      <Col flex={"auto"}>
                        <Row gutter={10}>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, "name"]}
                              rules={[
                                { required: true, message: "请输入类型名称" },
                                {
                                  max: 30,
                                  message: "类型名称不能超过 30 个字符",
                                },
                              ]}
                            >
                              <Input placeholder="请输入类型名称" />
                            </Form.Item>
                          </Col>
                          <Col span={16}>
                            <Form.Item
                              {...restField}
                              name={[name, "description"]}
                              rules={[{ max: 255 }]}
                            >
                              <Input.TextArea
                                rows={1}
                                placeholder="请输入描述信息"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>
                      <Col flex={"88px"}>
                        <Row gutter={10}>
                          <Col span={12}>
                            <Form.Item>
                              <Button
                                danger
                                shape="circle"
                                icon={<DeleteOutlined />}
                                onClick={() => remove(name)}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item>
                              <Button
                                shape="circle"
                                onClick={() =>
                                  move(index, index + (index === 0 ? 1 : -1))
                                }
                                icon={
                                  index === 0 ? (
                                    <ArrowDownOutlined />
                                  ) : (
                                    <ArrowUpOutlined />
                                  )
                                }
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加需求类型
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item label={"任务类型"} required>
            <Form.List name="taskTypes">
              {(fields, { add, remove, move }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Row
                      key={key}
                      justify="space-around"
                      align="middle"
                      gutter={10}
                    >
                      <Col flex={"1 1 100px"}>
                        <Form.Item
                          {...restField}
                          name={[name, "name"]}
                          rules={[
                            { required: true, message: "请输入类型名称" },
                            { max: 30, message: "类型名称不能超过 30 个字符" },
                          ]}
                        >
                          <Input placeholder="请输入类型名称" />
                        </Form.Item>
                      </Col>
                      <Col flex={"0 0 16px"}>
                        <Tooltip title={"后端接口"}>
                          <Form.Item
                            {...restField}
                            name={[name, "backendApi"]}
                            valuePropName="checked"
                          >
                            <Checkbox />
                          </Form.Item>
                        </Tooltip>
                      </Col>
                      <Col flex={"1 1 300px"}>
                        <Form.Item
                          {...restField}
                          name={[name, "description"]}
                          rules={[{ max: 255 }]}
                        >
                          <Input.TextArea
                            rows={1}
                            placeholder="请输入描述信息"
                          />
                        </Form.Item>
                      </Col>
                      <Col flex={"0 0 88px"}>
                        <Row gutter={10}>
                          <Col span={12}>
                            <Form.Item>
                              <Button
                                danger
                                shape="circle"
                                icon={<DeleteOutlined />}
                                onClick={() => remove(name)}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item>
                              <Button
                                shape="circle"
                                onClick={() =>
                                  move(index, index + (index === 0 ? 1 : -1))
                                }
                                icon={
                                  index === 0 ? (
                                    <ArrowDownOutlined />
                                  ) : (
                                    <ArrowUpOutlined />
                                  )
                                }
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加任务类型
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item label={"任务步骤"} required>
            <Form.List name="taskSteps">
              {(fields, { add, remove, move }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Row
                      key={key}
                      justify="space-around"
                      align="middle"
                      gutter={10}
                    >
                      <Col flex={"auto"}>
                        <Row gutter={10}>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, "name"]}
                              rules={[
                                { required: true, message: "请输入步骤名称" },
                                {
                                  max: 30,
                                  message: "步骤名称不能超过 30 个字符",
                                },
                              ]}
                            >
                              <Input placeholder="请输入步骤名称" />
                            </Form.Item>
                          </Col>
                          <Col span={16}>
                            <Form.Item
                              {...restField}
                              name={[name, "description"]}
                              rules={[{ max: 255 }]}
                            >
                              <Input.TextArea
                                rows={1}
                                placeholder="请输入描述信息"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>
                      <Col flex={"88px"}>
                        <Row gutter={10}>
                          <Col span={12}>
                            <Form.Item>
                              <Button
                                danger
                                shape="circle"
                                icon={<DeleteOutlined />}
                                onClick={() => remove(name)}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item>
                              <Button
                                shape="circle"
                                onClick={() =>
                                  move(index, index + (index === 0 ? 1 : -1))
                                }
                                icon={
                                  index === 0 ? (
                                    <ArrowDownOutlined />
                                  ) : (
                                    <ArrowUpOutlined />
                                  )
                                }
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加步骤
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item label={"任务优先级"} required>
            <Form.List name="requirementPriorities">
              {(fields, { add, remove, move }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Row
                      key={key}
                      justify="space-around"
                      align="middle"
                      gutter={10}
                    >
                      <Col flex={"auto"}>
                        <Row gutter={10}>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, "name"]}
                              rules={[
                                { required: true, message: "请输入优先级名称" },
                                {
                                  max: 30,
                                  message: "优先级名称不能超过 30 个字符",
                                },
                              ]}
                            >
                              <Input placeholder="请输入优先级名称" />
                            </Form.Item>
                          </Col>
                          <Col span={16}>
                            <Row gutter={10}>
                              <Col flex={"32px"}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "color"]}
                                  rules={[{ required: true, message: "颜色" }]}
                                >
                                  <HexColorPicker />
                                </Form.Item>
                              </Col>
                              <Col flex={"auto"}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "description"]}
                                  rules={[{ max: 255 }]}
                                >
                                  <Input.TextArea
                                    rows={1}
                                    placeholder="请输入描述信息"
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </Col>
                      <Col flex={"88px"}>
                        <Row gutter={10}>
                          <Col span={12}>
                            <Form.Item>
                              <Button
                                danger
                                shape="circle"
                                icon={<DeleteOutlined />}
                                onClick={() => remove(name)}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item>
                              <Button
                                shape="circle"
                                onClick={() =>
                                  move(index, index + (index === 0 ? 1 : -1))
                                }
                                icon={
                                  index === 0 ? (
                                    <ArrowDownOutlined />
                                  ) : (
                                    <ArrowUpOutlined />
                                  )
                                }
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加优先级
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
          <ProFormTextArea
            name={"description"}
            label={"描述"}
            rules={[{ max: 255 }]}
          />
        </ModalForm>
      </>
    )
  );
};

const TemplateManagement: React.FC = () => {
  const ref = useRef<ActionType>();
  const [form] = Form.useForm<API.AddTemplate>();

  const columns: ProColumns<API.TemplateVO>[] = [
    {
      title: "ID",
      valueType: "text",
      dataIndex: "id",
      copyable: true,
      editable: false,
    },
    {
      title: "模板名称",
      valueType: "text",
      dataIndex: "name",
      ellipsis: true,
      copyable: true,
    },
    {
      title: "描述",
      search: false,
      valueType: "text",
      dataIndex: "description",
    },
    {
      title: "操作",
      disable: true,
      valueType: "option",
      key: "option",
      render: (_, record) => [
        <TemplateModalForm<API.UpdateTemplate>
          key="edit"
          templateId={record.id}
          title={`编辑模板`}
          trigger={<a>编辑</a>}
          onFinish={(formData) =>
            updateTemplate(formData).then(() => {
              ref.current?.reload();
              return true;
            })
          }
        />,
        <Popconfirm
          key={"delete"}
          title="删除模板"
          style={{ width: "100vw" }}
          onConfirm={() => {
            deleteTemplate({ id: record.id }).then(() => ref.current?.reload());
          }}
        >
          <a style={{ color: "red" }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer title={false}>
      <ProTable<API.TemplateVO>
        bordered
        cardBordered
        rowKey={"id"}
        actionRef={ref}
        columns={columns}
        request={(params) => pageTemplate({ pageTemplate: params })}
        columnsState={{
          defaultValue: {
            option: { fixed: "right", disable: true },
          },
        }}
        toolBarRender={() => [
          <TemplateModalForm<API.AddTemplate>
            form={form}
            title={"新建模板"}
            trigger={
              <Button icon={<PlusOutlined />} type={"primary"}>
                新建模板
              </Button>
            }
            onFinish={async (formData) => {
              await addTemplate(formData);
              ref.current?.reload();
              return true;
            }}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default TemplateManagement;

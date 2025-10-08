import {
  ApiDocsContext,
  ApiDocsProjectContext,
} from "@/pages/ProjectDevelopment/ApiDocs";
import SubItemTitle from "@/pages/ProjectDevelopment/ApiDocs/SubItemTitle";
import {
  deleteProjectEnvironment,
  listProjectEnvironment,
  saveProjectEnvironment,
  updateProjectEnvironment,
} from "@/services/flode/projectEnvironmentController";
import { Schema, toLabelValue } from "@/util/Utils";
import { DeleteOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import {
  Affix,
  Button,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Tabs,
  theme,
} from "antd";
import React, { useContext, useEffect, useState } from "react";

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

const NEW_ID = "new";

function ProjectEnvironment() {
  const [messageApi, contextHolder] = message.useMessage();
  const { projectId } = useContext(ApiDocsContext);
  const { projectEnvironment, setProjectEnvironment } = useContext(
    ApiDocsProjectContext
  );
  const [activeKey, setActiveKey] = useState<string>();

  const fetchProjectEnvironments = (deletedId?: string) => {
    if (!projectId) {
      return;
    }
    listProjectEnvironment({ projectId }).then((resp) => {
      if (deletedId) {
        const newPE = projectEnvironment.find((item) => item.id === NEW_ID);
        const newPES = newPE ? [newPE, ...resp] : resp;
        if (activeKey === deletedId && newPES.length > 0) {
          setActiveKey(newPES[0].id);
        }
        setProjectEnvironment(newPES);
      } else {
        setProjectEnvironment(resp);
        if (!resp.find((item) => item.id === activeKey) && resp.length > 0) {
          setActiveKey(resp[0].id);
        }
      }
    });
  };

  const addProjectEnvironment = () => {
    if (!projectId) {
      return;
    }
    if (!projectEnvironment.find((item) => item.id === NEW_ID)) {
      setProjectEnvironment([
        {
          id: NEW_ID,
          projectId,
          name: "新环境",
          host: "127.0.0.1",
          schema: "HTTPS",
        },
        ...projectEnvironment,
      ]);
      setActiveKey(NEW_ID);
    }
  };

  const handleEdit = (key: TargetKey, action: "add" | "remove") => {
    if (action === "remove") {
      if (key === NEW_ID) {
        const filter = projectEnvironment.filter((item) => item.id !== key);
        setProjectEnvironment(filter);
        if (filter.length > 0) {
          setActiveKey(filter[0].id);
        }
      } else {
        deleteProjectEnvironment({ id: key as string }).then(() => {
          setProjectEnvironment(
            projectEnvironment.filter((item) => item.id !== key)
          );
          fetchProjectEnvironments(key as string);
        });
      }
    }
  };

  function ProjectEnvironmentForm({
    env,
    projectId,
    messageApi,
  }: {
    env: API.ProjectEnvironmentVO;
    projectId: string;
    messageApi: any;
  }) {
    const [form] = Form.useForm();
    const [affixed, setAffixed] = useState<boolean>();
    const [submitting, setSubmitting] = useState<boolean>(false);
    const { token } = theme.useToken();

    useEffect(() => {
      form.setFieldsValue(env);
    }, [env]);

    const handleSubmit = () => {
      setSubmitting(true);
      form
        .validateFields()
        .then((values) => {
          values.projectId = projectId;
          const saveOrUpdate =
            values.id === NEW_ID
              ? saveProjectEnvironment
              : updateProjectEnvironment;
          saveOrUpdate(values).then(() => {
            messageApi.success(values.id === NEW_ID ? "保存成功" : "更新成功");
            fetchProjectEnvironments();
          });
        })
        .finally(() => setSubmitting(false));
    };

    return (
      <Flex vertical gap="small">
        <Form form={form}>
          <Form.Item hidden name="id">
            <Input />
          </Form.Item>
          <SubItemTitle title="环境名称" />
          <Form.Item
            name="name"
            rules={[
              { required: true, message: "请输入环境名称" },
              {
                max: 30,
                type: "string",
                message: "环境名称字符长度不能超过 30 个字符",
              },
            ]}
          >
            <Input allowClear={false} placeholder="请输入环境名称" />
          </Form.Item>
          <SubItemTitle title="环境域名" />
          <Form.Item>
            <Space.Compact block>
              <Form.Item
                noStyle
                name="schema"
                rules={[{ required: true, message: "请选择请求协议" }]}
              >
                <Select
                  allowClear={false}
                  style={{ width: "88px" }}
                  options={toLabelValue(Schema)}
                />
              </Form.Item>
              <Form.Item
                noStyle
                name="host"
                rules={[{ required: true, message: "请输入主机名" }]}
              >
                <Input
                  allowClear={false}
                  style={{ flex: 3 }}
                  placeholder="主机名"
                />
              </Form.Item>
              <Form.Item noStyle name="port">
                <InputNumber style={{ width: "100px" }} placeholder="端口号" />
              </Form.Item>
              <Form.Item noStyle name="prefix" label="统一前缀">
                <Input style={{ flex: 1 }} placeholder="统一前缀" />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <SubItemTitle title="Header" />
          <Form.Item>
            <Form.List name="headers">
              {(fields, { add, remove }) => (
                <div>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={10}>
                      <Col flex="auto">
                        <Form.Item
                          {...restField}
                          name={[name, "key"]}
                          rules={[
                            { required: true, message: "请输入 HeaderKey" },
                          ]}
                        >
                          <Input placeholder="请输入 HeaderKey" />
                        </Form.Item>
                      </Col>
                      <Col flex="auto">
                        <Form.Item
                          {...restField}
                          name={[name, "value"]}
                          rules={[
                            { required: true, message: "请输入 HeaderValue" },
                          ]}
                        >
                          <Input placeholder="请输入 HeaderValue" />
                        </Form.Item>
                      </Col>
                      <Col flex="auto">
                        <Form.Item {...restField} name={[name, "description"]}>
                          <Input
                            style={{ width: "100%" }}
                            placeholder="参数描述"
                          />
                        </Form.Item>
                      </Col>
                      <Col flex="24px">
                        <Button
                          color="danger"
                          variant="filled"
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      </Col>
                    </Row>
                  ))}
                  <Button
                    type="primary"
                    style={{ width: "130px" }}
                    icon={<PlusOutlined />}
                    onClick={() => add({})}
                  >
                    添加 Header
                  </Button>
                </div>
              )}
            </Form.List>
          </Form.Item>
        </Form>
        <Affix offsetBottom={0} onChange={setAffixed}>
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
      </Flex>
    );
  }

  return (
    <>
      {contextHolder}
      <Tabs
        hideAdd
        tabPosition="left"
        type="editable-card"
        activeKey={activeKey}
        onTabClick={setActiveKey}
        onEdit={handleEdit}
        items={projectEnvironment.map((env) => ({
          key: env.id,
          label: env.name,
          children: projectId && (
            <ProjectEnvironmentForm
              env={env}
              projectId={projectId}
              messageApi={messageApi}
            />
          ),
        }))}
        tabBarExtraContent={{
          left: (
            <Button
              onClick={addProjectEnvironment}
              type="primary"
              icon={<PlusOutlined />}
              style={{ margin: 10 }}
            >
              新建环境
            </Button>
          ),
        }}
      />
    </>
  );
}

export default ProjectEnvironment;

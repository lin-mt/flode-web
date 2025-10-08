import { Lexical } from "@/components";
import { ApiMethod, IdName, IdUsername } from "@/util/Utils";
import { useModel } from "@@/exports";
import {
  ModalForm,
  ProFormItem,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { Col, Form, Row, Space } from "antd";
import React, { useEffect, useState } from "react";

type TaskModalProps<T> = {
  trigger: React.JSX.Element;
  onCancel?: () => void;
  onFinish: (values: T) => void;
  task?: API.TaskVO;
  template: API.TemplateDetail;
  projectDetail: API.ProjectDetail;
};

const TaskModal = <T,>({
  trigger,
  onCancel,
  onFinish,
  task,
  template,
  projectDetail,
}: TaskModalProps<T>) => {
  const [infoForm] = Form.useForm();
  const { initialState } = useModel("@@initialState");
  const [isBackendApi, setIsBackendApi] = useState<boolean>(false);

  const taskTypeId = Form.useWatch("typeId", infoForm);

  useEffect(() => {
    if (!taskTypeId) {
      return;
    }
    const taskType = template.taskTypes.find((t) => t.id === taskTypeId);
    const backendApi = !!taskType?.backendApi;
    setIsBackendApi(backendApi);
    if (!backendApi) {
      infoForm.setFieldValue("api", undefined);
    }
  }, [taskTypeId]);

  return (
    <ModalForm<T>
      width={"70%"}
      form={infoForm}
      title={"任务信息"}
      variant={"filled"}
      layout={"horizontal"}
      initialValues={{ ...task }}
      autoFocusFirstInput={false}
      labelCol={{ flex: "90px" }}
      wrapperCol={{ flex: "auto" }}
      modalProps={{
        onCancel,
        destroyOnClose: true,
      }}
      onOpenChange={(open) => {
        if (open && !task) {
          infoForm.setFieldValue("reporterId", initialState?.currentUser?.id);
          infoForm.setFieldValue("handlerId", initialState?.currentUser?.id);
        }
      }}
      trigger={trigger}
      onFinish={async (values) => {
        const newTask = { ...task, ...values };
        onFinish(newTask);
        return true;
      }}
    >
      <Row gutter={20}>
        <Col span={15}>
          <Form.Item name={"description"}>
            <Lexical placeholder={"请输入任务描述信息"} />
          </Form.Item>
        </Col>
        <Col span={9}>
          <ProFormText
            name={"title"}
            label={"标题"}
            allowClear={false}
            rules={[{ required: true, max: 30 }]}
          />
          <ProFormSelect
            allowClear={false}
            name={"typeId"}
            label={"类型"}
            rules={[{ required: true }]}
            options={template.taskTypes}
            fieldProps={{ fieldNames: IdName }}
          />
          {isBackendApi && (
            <ProFormItem required label="接口信息">
              <Space.Compact block>
                <ProFormSelect
                  noStyle
                  allowClear={false}
                  placeholder="请求方法"
                  style={{ flex: "130px" }}
                  name={["api", "method"]}
                  options={Object.values(ApiMethod)}
                  rules={[{ required: true, message: "请选择接口请求方法" }]}
                />
                <ProFormText
                  noStyle
                  allowClear={false}
                  style={{ flex: 1 }}
                  placeholder="接口路径"
                  name={["api", "path"]}
                  rules={[{ required: true, message: "请输入接口请求路径" }]}
                />
              </Space.Compact>
            </ProFormItem>
          )}
          <ProFormSelect
            allowClear={false}
            name={"reporterId"}
            label={"报告人"}
            rules={[{ required: true }]}
            options={projectDetail.members}
            fieldProps={{ fieldNames: IdUsername }}
          />
          <ProFormSelect
            allowClear={false}
            name={"handlerId"}
            label={"处理人"}
            rules={[{ required: true }]}
            options={projectDetail.members}
            fieldProps={{ fieldNames: IdUsername }}
          />
        </Col>
      </Row>
    </ModalForm>
  );
};

export default TaskModal;

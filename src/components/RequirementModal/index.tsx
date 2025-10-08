import { Lexical } from "@/components";
import { IdName, IdUsername } from "@/util/Utils";
import { useModel } from "@@/exports";
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { Col, Form, Row } from "antd";
import React from "react";

type RequirementModalProps<T> = {
  trigger: React.JSX.Element;
  onCancel?: () => void;
  onFinish: (values: T) => void;
  requirement?: API.RequirementVO;
  template: API.TemplateDetail;
  projectDetail: API.ProjectDetail;
};

const RequirementModal = <T,>({
  trigger,
  onCancel,
  onFinish,
  requirement,
  template,
  projectDetail,
}: RequirementModalProps<T>) => {
  const [infoForm] = Form.useForm();
  const { initialState } = useModel("@@initialState");

  return (
    <ModalForm<T>
      width={"70%"}
      form={infoForm}
      title={"需求信息"}
      variant={"filled"}
      layout={"horizontal"}
      autoFocusFirstInput={false}
      initialValues={requirement}
      labelCol={{ flex: "90px" }}
      wrapperCol={{ flex: "auto" }}
      modalProps={{
        onCancel,
        destroyOnClose: true,
      }}
      onOpenChange={(open) => {
        if (open && !requirement) {
          infoForm.setFieldValue("reporterId", initialState?.currentUser?.id);
          infoForm.setFieldValue("handlerId", initialState?.currentUser?.id);
        }
      }}
      trigger={trigger}
      onFinish={async (values) => {
        onFinish({ ...requirement, ...values });
        return true;
      }}
    >
      <Row gutter={20}>
        <Col span={15}>
          <Form.Item name={"description"}>
            <Lexical placeholder={"请输入需求描述信息"} />
          </Form.Item>
        </Col>
        <Col span={9}>
          <ProFormText
            allowClear={false}
            name={"title"}
            label={"标题"}
            rules={[{ required: true, max: 30 }]}
          />
          <ProFormSelect
            name={"typeId"}
            label={"类型"}
            allowClear={false}
            rules={[{ required: true }]}
            options={template.requirementTypes}
            fieldProps={{ fieldNames: IdName }}
          />
          <ProFormSelect
            allowClear={false}
            name={"priorityId"}
            label={"优先级"}
            rules={[{ required: true }]}
            options={template.requirementPriorities}
            fieldProps={{ fieldNames: IdName }}
          />
          <ProFormSelect
            name={"reporterId"}
            label={"报告人"}
            allowClear={false}
            rules={[{ required: true }]}
            options={projectDetail.members}
            fieldProps={{ fieldNames: IdUsername }}
          />
          <ProFormSelect
            name={"handlerId"}
            label={"处理人"}
            allowClear={false}
            rules={[{ required: true }]}
            options={projectDetail.members}
            fieldProps={{ fieldNames: IdUsername }}
          />
        </Col>
      </Row>
    </ModalForm>
  );
};

export default RequirementModal;

import {
  addRepository,
  deleteRepository,
  pageRepository,
  updateRepository,
} from "@/services/flode/repositoryController";
import { PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  ColumnsState,
  ModalForm,
  ModalFormProps,
  PageContainer,
  ProColumns,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from "@ant-design/pro-components";
import { Button, Form, Popconfirm } from "antd";
import React, { useRef, useState } from "react";

const RepositoryModalForm = <T,>(props: ModalFormProps<T>) => {
  const [form] = Form.useForm<T>();

  return (
    <ModalForm<T>
      form={form}
      layout={"horizontal"}
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
      modalProps={{
        destroyOnClose: true,
      }}
      {...props}
    >
      <ProFormText
        name="name"
        label="仓库名称"
        rules={[{ required: true, max: 30 }]}
      />
      <ProFormSelect
        name="type"
        label="仓库类型"
        valueEnum={{
          GITLAB: "GitLab",
          GITHUB: "GitHub",
        }}
        rules={[{ required: true }]}
      />
      <ProFormText
        name="url"
        label="仓库地址"
        rules={[{ required: true, max: 255 }]}
      />
      <ProFormSelect
        name="buildTool"
        label="构建工具"
        valueEnum={{
          MAVEN: "Maven",
          GRADLE: "Gradle",
          NPM: "npm",
          YARN: "Yarn",
          PNPM: "pnpm",
        }}
        rules={[{ required: true }]}
      />
      <ProFormText
        name="username"
        label="用户名"
        rules={[{ required: true, max: 255 }]}
      />
      <ProFormText
        name="password"
        label="密码"
        rules={[{ required: true, max: 255 }]}
      />
      <ProFormText
        name="accessToken"
        label="Token"
        rules={[{ required: true, max: 255 }]}
      />
      <ProFormTextArea
        name="description"
        label="仓库描述"
        rules={[{ max: 255 }]}
      />
    </ModalForm>
  );
};

const RepositoryManagement: React.FC = () => {
  const tableRef = useRef<ActionType>();
  const [columnsStateMap, setColumnsStateMap] = useState<
    Record<string, ColumnsState>
  >({
    description: {
      show: false,
    },
    option: { fixed: "right", disable: true },
  });

  const columns: ProColumns<API.RepositoryVO>[] = [
    {
      title: "ID",
      valueType: "text",
      dataIndex: "id",
      copyable: true,
    },
    {
      title: "仓库名称",
      valueType: "text",
      dataIndex: "name",
      ellipsis: true,
      copyable: true,
    },
    {
      title: "仓库类型",
      valueType: "select",
      dataIndex: "type",
      valueEnum: {
        GITLAB: {
          text: "GitLab",
        },
        GITHUB: {
          text: "GitHub",
        },
      },
    },
    {
      title: "构建工具",
      valueType: "select",
      dataIndex: "buildTool",
      valueEnum: {
        MAVEN: {
          text: "Maven",
        },
        GRADLE: {
          text: "Gradle",
        },
        NPM: {
          text: "npm",
        },
        YARN: {
          text: "Yarn",
        },
        PNPM: {
          text: "pnpm",
        },
      },
    },
    {
      title: "描述",
      valueType: "text",
      ellipsis: true,
      search: false,
      dataIndex: "description",
    },
    {
      title: "操作",
      disable: true,
      render: (_text, record) => [
        <RepositoryModalForm<API.UpdateRepository>
          name={"editRepository"}
          key={"editRepository"}
          title={"编辑仓库"}
          initialValues={record}
          trigger={<a style={{ marginRight: 10 }}>编辑</a>}
          onFinish={(formData) =>
            updateRepository({ ...record, ...formData }).then(() => {
              tableRef.current?.reload().then();
              return true;
            })
          }
        />,
        <Popconfirm
          key={"delete"}
          title="删除仓库"
          style={{ width: "100vw" }}
          onConfirm={() => {
            deleteRepository({ id: record.id }).then(() =>
              tableRef.current?.reload()
            );
          }}
        >
          <a style={{ color: "red" }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer title={false}>
      <ProTable<API.RepositoryVO>
        bordered
        cardBordered
        rowKey={"id"}
        actionRef={tableRef}
        columns={columns}
        request={(params) => pageRepository({ pageRepository: params })}
        columnsState={{
          value: columnsStateMap,
          onChange: setColumnsStateMap,
        }}
        toolBarRender={() => [
          <RepositoryModalForm<API.AddRepository>
            name={"addRepository"}
            title={"添加仓库"}
            trigger={
              <Button icon={<PlusOutlined />} type={"primary"}>
                添加仓库
              </Button>
            }
            onFinish={(formData) =>
              addRepository(formData).then(() => {
                tableRef.current?.reload().then();
                return true;
              })
            }
          />,
        ]}
      />
    </PageContainer>
  );
};

export default RepositoryManagement;

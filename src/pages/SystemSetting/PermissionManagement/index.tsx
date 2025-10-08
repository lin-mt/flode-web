import {
  addPermission,
  deletePermission,
  pagePermission,
  treePermission,
  updatePermission,
} from "@/services/flode/permissionController";
import {
  ApiMethod,
  IdName,
  isKey,
  PermissionType,
  toLabelValue,
  toValueEnum,
} from "@/util/Utils";
import { PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  ColumnsState,
  ModalForm,
  ModalFormProps,
  PageContainer,
  ProColumns,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
  ProTable,
} from "@ant-design/pro-components";
import { Button, Form, Popconfirm } from "antd";
import React, { useRef, useState } from "react";

const PermissionManagement: React.FC = () => {
  const ref = useRef<ActionType>();
  const [columnsStateMap, setColumnsStateMap] = useState<
    Record<string, ColumnsState>
  >({
    httpMethod: {
      show: false,
    },
    httpUrl: {
      show: false,
    },
    route: {
      show: false,
    },
    value: {
      show: false,
    },
    option: { fixed: "right", disable: true },
  });

  const PermissionModalForm = <T,>(props: ModalFormProps<T>) => {
    const [form] = Form.useForm<T>();

    const permissionType = Form.useWatch("type", form);

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
        <ProFormText hidden name={"id"} />
        <ProFormText
          name={"name"}
          label={"权限名称"}
          rules={[{ required: true, max: 30 }]}
        />
        <ProFormSelect
          name={"type"}
          label={"权限类型"}
          rules={[{ required: true }]}
          options={toLabelValue(PermissionType)}
        />
        <ProFormTreeSelect
          name={"parentId"}
          label={"父权限"}
          debounceTime={600}
          request={() => treePermission()}
          fieldProps={{
            treeLine: true,
            fieldNames: IdName,
          }}
        />
        {isKey(PermissionType, PermissionType.BUTTON, permissionType) && (
          <ProFormText
            name={"value"}
            label={"权限值"}
            rules={[{ required: true, max: 255 }]}
          />
        )}
        {isKey(PermissionType, PermissionType.MENU, permissionType) && (
          <ProFormText
            name={"route"}
            label={"前端路由"}
            rules={[{ required: true, max: 255 }]}
          />
        )}
        {isKey(PermissionType, PermissionType.API, permissionType) && (
          <>
            <ProFormSelect
              name={"httpMethod"}
              label={"请求方法"}
              options={Object.values(ApiMethod)}
              rules={[{ required: true }]}
            />
            <ProFormText
              name={"httpUrl"}
              label={"接口地址"}
              rules={[{ required: true, max: 255 }]}
            />
          </>
        )}
        <ProFormDigit
          name={"ordinal"}
          label={"排序"}
          min={0}
          rules={[{ required: true }]}
        />
        <ProFormTextArea
          name={"description"}
          label={"权限描述"}
          rules={[{ max: 255 }]}
        />
      </ModalForm>
    );
  };

  const columns: ProColumns<API.PermissionVO>[] = [
    {
      title: "ID",
      valueType: "text",
      dataIndex: "id",
      copyable: true,
    },
    {
      title: "权限名称",
      valueType: "text",
      dataIndex: "name",
      copyable: true,
      ellipsis: true,
    },
    {
      title: "权限值",
      valueType: "text",
      dataIndex: "value",
      ellipsis: true,
      copyable: true,
    },
    {
      title: "权限类型",
      valueType: "select",
      dataIndex: "type",
      valueEnum: toValueEnum(PermissionType),
    },
    {
      title: "父权限ID",
      valueType: "text",
      dataIndex: "parentId",
      ellipsis: true,
      copyable: true,
    },
    {
      title: "前端路由",
      valueType: "text",
      dataIndex: "route",
      copyable: true,
      ellipsis: true,
    },
    {
      title: "请求方法",
      valueType: "select",
      dataIndex: "httpMethod",
      valueEnum: toValueEnum(ApiMethod),
    },
    {
      title: "请求URL",
      valueType: "text",
      dataIndex: "httpUrl",
    },
    {
      title: "权限描述",
      valueType: "text",
      dataIndex: "description",
      ellipsis: true,
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      render: (_, record) => [
        <PermissionModalForm<API.UpdatePermission>
          key={"editPermission"}
          title={"编辑权限"}
          initialValues={record}
          trigger={<a>编辑</a>}
          onFinish={(formData) =>
            updatePermission(formData).then(() => {
              ref.current?.reload().then();
              return true;
            })
          }
        />,
        <Popconfirm
          key={"delete"}
          title="删除权限"
          style={{ width: "100vw" }}
          description="删除该权限后，与之关联的角色将不再拥有该权限，确定删除该权限?"
          onConfirm={() => {
            deletePermission({ id: record.id }).then(() =>
              ref.current?.reload()
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
      <ProTable<API.PermissionVO>
        bordered
        cardBordered
        rowKey={"id"}
        actionRef={ref}
        columns={columns}
        request={(params) => pagePermission({ pagePermission: params })}
        columnsState={{
          value: columnsStateMap,
          onChange: setColumnsStateMap,
        }}
        toolBarRender={() => [
          <PermissionModalForm<API.AddPermission>
            key={"add"}
            title={"新增权限"}
            trigger={
              <Button icon={<PlusOutlined />} type={"primary"}>
                新增权限
              </Button>
            }
            onFinish={(formData) =>
              addPermission(formData).then(() => {
                ref.current?.reload().then();
                return true;
              })
            }
          />,
        ]}
      />
    </PageContainer>
  );
};

export default PermissionManagement;

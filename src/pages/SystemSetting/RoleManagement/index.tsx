import TreeTransfer from "@/components/TreeTransfer";
import {
  addRole,
  deleteRole,
  listPermission,
  pageRole,
  treeRoles,
  updatePermissions,
  updateRole,
} from "@/services/flode/roleController";
import { IdName } from "@/util/Utils";
import { PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  ModalForm,
  ModalFormProps,
  PageContainer,
  ProColumns,
  ProFormDigit,
  ProFormText,
  ProFormTreeSelect,
  ProTable,
} from "@ant-design/pro-components";
import { useModel } from "@umijs/max";
import { Button, Form, Popconfirm, TreeDataNode } from "antd";
import React, { useEffect, useRef, useState } from "react";

const RoleModalForm = <T extends API.AddRole>(props: ModalFormProps<T>) => {
  const [form] = Form.useForm<T>();
  const { initialValues } = props;

  const [parentCode, setParentCode] = useState<string>("");

  useEffect(() => {
    if (initialValues?.code) {
      const code = initialValues.code;
      const currentCode = code.slice(-2);
      const parent = code.slice(0, -2);

      form.setFieldsValue({
        ...initialValues,
        code: currentCode,
      });
      setParentCode(parent);
    }
  }, [initialValues, form]);

  // noinspection JSUnusedGlobalSymbols
  return (
    <ModalForm<T>
      form={form}
      layout="horizontal"
      labelCol={{ span: 3 }}
      wrapperCol={{ span: 21 }}
      modalProps={{
        destroyOnClose: true,
        forceRender: true,
      }}
      {...props}
    >
      <ProFormText hidden name="id" />
      <ProFormText
        name="name"
        label="角色名称"
        rules={[{ required: true, max: 30 }]}
      />
      <ProFormText
        name="value"
        label="角色Value"
        rules={[{ required: true, max: 32 }]}
      />
      <ProFormTreeSelect
        name="parentId"
        label="父角色"
        debounceTime={600}
        request={() => treeRoles()}
        fieldProps={{
          treeLine: true,
          fieldNames: IdName,
          onSelect: (_, node) => setParentCode(node.code || ""),
        }}
      />
      <ProFormText
        name="code"
        label="角色编码"
        rules={[{ required: true, len: 2 }]}
        fieldProps={{
          addonBefore: parentCode,
          placeholder: "请输入",
        }}
      />
      <ProFormDigit
        name="ordinal"
        label="排序"
        min={0}
        rules={[{ required: true }]}
      />
    </ModalForm>
  );
};
const RoleManagement: React.FC = () => {
  const ref = useRef<ActionType>();
  const { treePermissions } = useModel("permission");
  const [rolePermissionIds, setRolePermissionIds] = useState<string[]>([]);
  const onChange = (keys: any[]) => {
    setRolePermissionIds(keys);
  };

  const flattenTreePermissions = (list: API.TreePermission[] = []) => {
    const tmp: TreeDataNode[] = [];
    function flatten(list: API.TreePermission[] = []) {
      list?.forEach((item) => {
        let node: any = item;
        node.key = node.id;
        node.title = node.name;
        if (!item.parentId) {
          tmp.push(node);
        }
        flatten(item.children);
      });
    }
    flatten(list);
    return tmp;
  };

  const columns: ProColumns<API.RoleVO>[] = [
    {
      title: "ID",
      valueType: "text",
      dataIndex: "id",
      copyable: true,
      editable: false,
    },
    {
      title: "角色名",
      valueType: "text",
      dataIndex: "name",
      ellipsis: true,
      copyable: true,
    },
    {
      title: "Value",
      valueType: "text",
      dataIndex: "value",
      ellipsis: true,
      copyable: true,
    },
    {
      title: "角色编码",
      valueType: "text",
      dataIndex: "code",
      ellipsis: true,
      copyable: true,
    },
    {
      title: "父角色ID",
      valueType: "text",
      dataIndex: "parentId",
      ellipsis: true,
      copyable: true,
    },
    {
      title: "创建时间",
      editable: false,
      search: false,
      valueType: "dateTime",
      dataIndex: "gmtCreate",
    },
    {
      title: "操作",
      disable: true,
      valueType: "option",
      key: "option",
      render: (_, record) => [
        <RoleModalForm<API.UpdateRole>
          key={"editRole"}
          initialValues={record}
          title={"编辑角色"}
          trigger={<a>编辑</a>}
          onFinish={(formData) =>
            updateRole(formData).then(() => {
              ref.current?.reload().then();
              return true;
            })
          }
        />,
        <ModalForm
          key={"editRolePermission"}
          title="编辑权限"
          onFinish={() =>
            updatePermissions({
              roleId: record.id,
              permissionIds: rolePermissionIds,
            }).then(() => true)
          }
          trigger={
            <a
              onClick={() =>
                listPermission({ roleId: record.id }).then((resp) =>
                  setRolePermissionIds(resp)
                )
              }
            >
              编辑权限
            </a>
          }
        >
          <TreeTransfer
            dataSource={flattenTreePermissions(treePermissions())}
            targetKeys={rolePermissionIds}
            onChange={onChange}
          />
        </ModalForm>,
        <Popconfirm
          key={"delete"}
          title="删除角色"
          style={{ width: "100vw" }}
          description="删除该角色后，与之关联的用户将不再拥有该角色，确定删除该角色?"
          onConfirm={() => {
            deleteRole({ id: record.id }).then(() => ref.current?.reload());
          }}
        >
          <a style={{ color: "red" }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer title={false}>
      <ProTable<API.RoleVO>
        bordered
        cardBordered
        rowKey={"id"}
        actionRef={ref}
        columns={columns}
        request={(params) => pageRole({ pageRole: params })}
        columnsState={{
          defaultValue: {
            option: { fixed: "right", disable: true },
          },
        }}
        toolBarRender={() => [
          <RoleModalForm<API.AddRole>
            key={"add"}
            title={"新建角色"}
            trigger={
              <Button icon={<PlusOutlined />} type={"primary"}>
                新建角色
              </Button>
            }
            onFinish={(formData) =>
              addRole(formData).then(() => {
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

export default RoleManagement;

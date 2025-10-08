import { Table, TableProps, Tooltip } from "antd";
import { JSONSchema7 } from "json-schema";
import _ from "lodash";
import { useState } from "react";

type NewSchemaTableProps = {
  jsonSchema?: string;
};

type SchemaTableData = JSONSchema7 & {
  name?: string;
  children?: SchemaTableData[];
  isRequired?: boolean;
  key?: string;
};

const messageMap: Record<string, string> = {
  maximum: "最大值",
  minimum: "最小值",
  maxItems: "最大数量",
  minItems: "最小数量",
  maxLength: "最大长度",
  minLength: "最小长度",
  enum: "枚举",
  enumDesc: "枚举备注",
  uniqueItems: "元素是否唯一",
  itemType: "item 类型",
  format: "format",
  itemFormat: "format",
  default: "默认值",
};

function SchemaTable(props: NewSchemaTableProps) {
  const { jsonSchema } = props;
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]); // 用于存储展开的行的 key

  // 将 JSONSchema7 转换为表格数据
  function jsonSchema2TableData(schema?: JSONSchema7): SchemaTableData[] {
    if (!schema) {
      return [];
    }

    // 递归映射 JSONSchema 到表格数据
    function mapping(
      schemaMapping: JSONSchema7,
      name?: string,
      parentKey?: string
    ): SchemaTableData {
      const result: SchemaTableData = _.cloneDeep(schemaMapping);
      result.name = name;
      result.key = parentKey ? `${parentKey}.${name}` : name;

      if (result.type === "array") {
        if (result.items) {
          const items = mapping(result.items as JSONSchema7, "", result.key);
          result.children = items.children;
        }
      } else if (result.type === "object") {
        const { properties, required } = result;
        if (properties) {
          result.children = Object.keys(properties).map((key) => {
            const childSchema = properties[key];
            const child = mapping(childSchema as JSONSchema7, key, result.key);
            child.isRequired = required?.includes(key) || false;
            return child;
          });
        }
      }

      return result;
    }
    const root = mapping(schema, "", "");
    return root.children ? root.children : [root];
  }

  const handleExpand = (expanded: boolean, record: SchemaTableData) => {
    const keys = expanded
      ? [...expandedRowKeys, record.key!]
      : expandedRowKeys.filter((key) => key !== record.key);
    setExpandedRowKeys(keys);
  };

  const columns: TableProps<SchemaTableData>["columns"] = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (text, item) => {
        if (text === "array") {
          if (item.items) {
            const itemType = (item.items as JSONSchema7).type;
            return `${itemType ? itemType : "object"} []`;
          }
          return "unknown []";
        }
        return `${text ? text : "object"}`;
      },
    },
    {
      title: "是否必须",
      dataIndex: "isRequired",
      key: "isRequired",
      width: 80,
      render: (required) => (required ? "是" : "否"),
    },
    {
      title: "默认值",
      dataIndex: "default",
      key: "default",
      render: (text) => {
        return <div>{text && String(text)}</div>;
      },
    },
    {
      title: "备注",
      dataIndex: "description",
      key: "description",
      render: (text: string) => {
        const maxLength = 20;
        if (!text) return "-";

        return text.length > maxLength ? (
          <Tooltip
            title={<span style={{ whiteSpace: "pre-line" }}>{text}</span>}
            styles={{ root: { maxWidth: 600 } }}
          >
            <span>{text.slice(0, maxLength)}...</span>
          </Tooltip>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: "其他信息",
      dataIndex: "extensions",
      key: "extensions",
      render: (_, record) => {
        return Object.keys(messageMap)
          .filter((key) => (record as any)[key] !== undefined)
          .map((key) => {
            const value = (record as any)[key];
            let content = value.toString();
            let displayContent = content;
            if (key === "enum" && Array.isArray(value)) {
              const enumValues = value.join(", ");
              if (value.length > 3 || enumValues.length > 20) {
                const shortEnum = value.slice(0, 3).join(", ");
                displayContent = `${shortEnum}`;
                content = enumValues;
              } else {
                displayContent = enumValues;
              }
            }

            return (
              <div key={key}>
                <span style={{ fontWeight: 600 }}>{messageMap[key]}: </span>
                {content.length > 30 ? (
                  <Tooltip title={content}>
                    <span>{displayContent.slice(0, 30)}...</span>
                  </Tooltip>
                ) : (
                  <span>{displayContent}</span>
                )}
              </div>
            );
          });
      },
    },
  ];

  return (
    <Table
      bordered
      size={"small"}
      pagination={false}
      columns={columns}
      dataSource={jsonSchema2TableData(jsonSchema && JSON.parse(jsonSchema))}
      expandable={{
        childrenColumnName: "children",
        expandedRowKeys,
        onExpand: handleExpand,
      }}
    />
  );
}

export default SchemaTable;

import {
  ApiDocsContext,
  ApiDocsProjectContext,
} from "@/pages/ProjectDevelopment/ApiDocs";
import SubItemTitle from "@/pages/ProjectDevelopment/ApiDocs/SubItemTitle";
import {
  getProjectDetail,
  updateQsConfig,
} from "@/services/flode/projectController";
import { ArrayFormat, toLabelValue } from "@/util/Utils";
import { SaveOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Switch,
  theme,
  Typography,
} from "antd";
import { FormItemProps } from "antd/es/form/FormItem";
import { ReactNode, useContext, useEffect, useState } from "react";

const DEFAULT_CONFIG: API.QsConfig = {
  enabled: false,
  encode: true,
  encodeValuesOnly: false,
  addQueryPrefix: false,
  delimiter: "&",
  skipNulls: false,
  strictNullHandling: false,
  allowDots: false,
  arrayFormat: "indices",
  indices: true,
  format: "RFC3986",
  arrayFormatSeparator: ",",
  allowEmptyArrays: false,
};

const QsConfig = () => {
  const { token } = theme.useToken();
  const [form] = Form.useForm<API.SaveQsConfig>();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { projectId } = useContext(ApiDocsContext);
  const { projectDetail, setProjectDetail } = useContext(ApiDocsProjectContext);

  useEffect(() => {
    if (projectDetail?.qsConfig) {
      form.setFieldsValue(projectDetail.qsConfig);
    } else {
      form.setFieldsValue(DEFAULT_CONFIG);
    }
  }, [projectDetail]);

  function handleSubmit() {
    if (!projectId) {
      return;
    }
    setSubmitting(true);
    form
      .validateFields()
      .then(async (values) => {
        values.projectId = projectId;
        await updateQsConfig(values).then(() => setSubmitting(false));
        getProjectDetail({ id: projectId }).then((result) => {
          setProjectDetail(result);
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  const ConfigItem = ({
    title,
    description,
    children,
    ...itemProp
  }: {
    title: ReactNode;
    description?: ReactNode;
    children: ReactNode;
  } & FormItemProps) => {
    return (
      <Col span={12}>
        <Flex vertical>
          <SubItemTitle title={title} />
          <Typography.Text
            style={{ fontSize: token.fontSizeSM }}
            type="secondary"
          >
            {description}
          </Typography.Text>
          <Form.Item {...itemProp}>{children}</Form.Item>
        </Flex>
      </Col>
    );
  };

  return (
    <Form<API.SaveQsConfig> form={form}>
      <Row gutter={90}>
        <ConfigItem title={"是否对 URL 进行编码"} name={"encode"}>
          <Switch />
        </ConfigItem>
        <ConfigItem title={"仅编码值，不编码键"} name={"encodeValuesOnly"}>
          <Switch />
        </ConfigItem>
        <ConfigItem title={"是否加 ? 前缀"} name={"addQueryPrefix"}>
          <Switch />
        </ConfigItem>
        <Col span={12}>
          <Flex vertical>
            <SubItemTitle title={"参数分隔符"} />
            <Form.Item
              name={"delimiter"}
              rules={[{ required: true, message: "请输入参数分隔符" }]}
            >
              <Input allowClear={false} />
            </Form.Item>
          </Flex>
        </Col>
        <ConfigItem title={"是否跳过 null/undefined"} name={"skipNulls"}>
          <Switch />
        </ConfigItem>
        <ConfigItem title={"处理 null 时仅输出键"} name={"strictNullHandling"}>
          <Switch />
        </ConfigItem>
        <ConfigItem title={"是否用 . 表示嵌套对象"} name={"allowDots"}>
          <Switch />
        </ConfigItem>
        <ConfigItem title={"数组格式"} name={"arrayFormat"}>
          <Select allowClear={false} options={toLabelValue(ArrayFormat)} />
        </ConfigItem>
        <ConfigItem title={"是否给数组的键添加索引"} name={"indices"}>
          <Switch />
        </ConfigItem>
        <ConfigItem title={"编码格式"} name={"format"}>
          <Select
            allowClear={false}
            options={[{ value: "RFC3986" }, { value: "RFC1738" }]}
          />
        </ConfigItem>
        <Col span={12}>
          <Flex vertical>
            <SubItemTitle title={"数组分隔符"} />
            <Form.Item
              name={"arrayFormatSeparator"}
              rules={[{ required: true, message: "请输入数组分隔符" }]}
            >
              <Input allowClear={false} />
            </Form.Item>
          </Flex>
        </Col>
        <ConfigItem title={"允许空数组"} name={"allowEmptyArrays"}>
          <Switch />
        </ConfigItem>
        <ConfigItem
          name={"enabled"}
          title={
            <Flex gap={"small"} align={"flex-end"}>
              启用当前 qs 设置
              <Typography.Link
                style={{ fontSize: token.fontSizeSM }}
                target="_blank"
                href={"https://github.com/ljharb/qs"}
              >
                文档
              </Typography.Link>
            </Flex>
          }
          description={
            <>
              使用 Swagger 时，Get 请求参数没有使用
              <Typography.Link
                target={"_blank"}
                href={
                  "https://springdoc.org/faq.html#_how_can_i_extract_fields_from_parameter_object"
                }
              >
                @ParameterObject
              </Typography.Link>
              注解或有自定义参数解析器的情况下可以开启该配置。
            </>
          }
        >
          <Switch />
        </ConfigItem>
      </Row>
      <Flex gap="large" justify={"center"}>
        <Button onClick={() => form.setFieldsValue(DEFAULT_CONFIG)}>
          默认设置
        </Button>
        <Button
          type="primary"
          onClick={handleSubmit}
          icon={<SaveOutlined />}
          loading={submitting}
        >
          保存
        </Button>
      </Flex>
    </Form>
  );
};

export default QsConfig;

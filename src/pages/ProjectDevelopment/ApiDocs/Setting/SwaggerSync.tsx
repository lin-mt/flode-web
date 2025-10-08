import {
  ApiDocsContext,
  ApiDocsProjectContext,
} from "@/pages/ProjectDevelopment/ApiDocs";
import SubItemTitle from "@/pages/ProjectDevelopment/ApiDocs/SubItemTitle";
import {
  getProjectDetail,
  updateSwaggerSync,
} from "@/services/flode/projectController";
import { ApiDocsState, SwaggerSyncStrategy, toLabelValue } from "@/util/Utils";
import { QuestionCircleOutlined, SaveOutlined } from "@ant-design/icons";
import {
  Button,
  Flex,
  Form,
  Input,
  Select,
  Switch,
  theme,
  Tooltip,
  Typography,
} from "antd";
import { useContext, useEffect, useState } from "react";

const Item = Form.Item;

function SwaggerSync() {
  const { token } = theme.useToken();
  const [form] = Form.useForm<API.SaveSwaggerSync>();
  const { projectId } = useContext(ApiDocsContext);
  const { projectDetail, setProjectDetail } = useContext(ApiDocsProjectContext);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const sync = projectDetail?.swaggerSync;
    if (sync) {
      form.setFieldsValue(sync);
    } else {
      form.setFieldsValue({
        defaultState: "COMPLETED",
        syncStrategy: "FULL_REPLACE",
      });
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
        await updateSwaggerSync(values).then(() => setSubmitting(false));
        getProjectDetail({ id: projectId }).then((result) => {
          setProjectDetail(result);
        });
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <Form<API.SaveSwaggerSync> form={form}>
      <Flex vertical>
        <SubItemTitle title="Swagger Json URL" />
        <Item
          name={"jsonUrl"}
          rules={[
            { required: true, message: "请输入 Swagger 的 Json 数据地址" },
          ]}
        >
          <Input placeholder={"http://127.0.0.1:8080/v3/api-docs"} />
        </Item>
        <SubItemTitle title={"新文档默认状态"} />
        <Item name={"defaultState"}>
          <Select allowClear={false} options={toLabelValue(ApiDocsState)} />
        </Item>
        <SubItemTitle
          title={
            <Flex gap={"small"} align={"flex-end"}>
              定时同步 Cron
              <Typography.Link
                style={{ fontSize: token.fontSizeSM }}
                target="_blank"
                href={
                  "https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/tutorial-lesson-06.html"
                }
              >
                文档
              </Typography.Link>
            </Flex>
          }
        />
        <Item
          name={"cron"}
          rules={[{ required: true, message: "请输入定时任务的 cron 表达式" }]}
        >
          <Input placeholder={"0 0/10 * * * ?"} />
        </Item>
        <SubItemTitle
          title={
            <Flex gap={"small"}>
              同步策略
              <Tooltip
                styles={{ body: { width: 300, fontSize: token.fontSizeSM } }}
                title={
                  <>
                    <p>仅追加：已存在的文档不处理，只新增不存在的文档</p>
                    <p>
                      完全覆盖：删除旧数据中不存在的文档，更新旧数据中已存在的文档，新增不存在的文档
                    </p>
                    <p>
                      更新：仅更新旧数据中已存在的文档，不处理已存在的文档，并新增不存在的文档
                    </p>
                  </>
                }
              >
                <QuestionCircleOutlined
                  style={{ fontSize: token.fontSizeIcon }}
                />
              </Tooltip>
            </Flex>
          }
        />
        <Item name={"syncStrategy"} rules={[{ required: true }]}>
          <Select
            allowClear={false}
            options={toLabelValue(SwaggerSyncStrategy)}
          />
        </Item>
        <SubItemTitle
          title={
            <Flex gap={"small"} align={"flex-end"}>
              开启自动同步
              <Typography.Link
                style={{ fontSize: token.fontSizeSM }}
                target="_blank"
                href={"https://springdoc.org/"}
              >
                文档
              </Typography.Link>
            </Flex>
          }
        />
        <Item name={"enable"}>
          <Switch />
        </Item>
        <Item style={{ textAlign: "center" }}>
          <Button
            type="primary"
            onClick={handleSubmit}
            icon={<SaveOutlined />}
            loading={submitting}
          >
            保存
          </Button>
        </Item>
      </Flex>
    </Form>
  );
}

export default SwaggerSync;

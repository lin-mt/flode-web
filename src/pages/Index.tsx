import { AlertOneTime } from "@/components";
import { AlertStorageKey } from "@/components/AlertOneTime";
import { PageContainer } from "@ant-design/pro-components";
import { useModel } from "@umijs/max";
import { Card, Flex, Steps, Typography } from "antd";
import React from "react";

const { Title, Text, Link } = Typography;

const SimpleSteps = ({ title, steps }: { title: string; steps: string[] }) => {
  return (
    <Flex vertical gap={"small"} style={{ width: 300 }}>
      <Title level={5}>{title}</Title>
      <Steps
        progressDot
        direction="vertical"
        items={steps.map((step) => ({ title: step, status: "finish" }))}
      />
    </Flex>
  );
};

const Index: React.FC = () => {
  const { initialState } = useModel("@@initialState");
  return (
    <PageContainer>
      <Card
        style={{
          borderRadius: 8,
        }}
        styles={{
          body: {
            backgroundImage:
              initialState?.settings?.navTheme === "realDark"
                ? "background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)"
                : "background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)",
          },
        }}
      >
        <div
          style={{
            backgroundPosition: "100% -30%",
            backgroundRepeat: "no-repeat",
            backgroundSize: "274px auto",
            backgroundImage:
              "url('https://gw.alipayobjects.com/mdn/rms_a9745b/afts/img/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ')",
          }}
        >
          <Title level={2}>Flode</Title>
          <Link href="https://github.com/lin-mt/flode" target="_blank">
            <Text>项目地址：</Text>Github
          </Link>
          <div
            style={{
              lineHeight: "22px",
              marginTop: 16,
              marginBottom: 32,
              width: "63%",
            }}
          >
            <AlertOneTime
              showIcon
              closable
              type="info"
              storageKey={AlertStorageKey.INTRODUCE}
              message="欢迎使用 Flode，这是一个管理项目周期、项目接口文档以及调试接口的开源项目。"
            />
          </div>
          <Title level={4}>快速开始</Title>
          <Flex gap={"large"}>
            <SimpleSteps
              title={"创建项目"}
              steps={[
                "创建用户",
                "创建项目组",
                "添加项目组成员",
                "创建模板",
                "创建项目",
              ]}
            />
            <SimpleSteps
              title={"规划项目"}
              steps={[
                "创建项目",
                "创建版本",
                "创建迭代",
                "创建需求",
                "需求规划到迭代",
                "开始迭代",
                "创建任务",
              ]}
            />
            <SimpleSteps
              title={"管理调试接口文档"}
              steps={[
                "创建项目",
                "创建接口分组",
                "创建接口",
                "创建调试环境",
                "调试接口",
              ]}
            />
            <SimpleSteps
              title={"导入Swagger接口文档"}
              steps={[
                "创建项目",
                "配置Swagger",
                "开启文档同步",
                "创建调试环境",
                "调试接口",
              ]}
            />
          </Flex>
          <Title level={4}>TODO</Title>
          <Typography.Paragraph>
            <ul>
              <li>自动化</li>
              <li>接入代码托管平台</li>
            </ul>
          </Typography.Paragraph>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Index;

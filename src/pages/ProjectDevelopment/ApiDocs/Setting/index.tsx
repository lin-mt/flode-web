import ProjectEnvironment from "@/pages/ProjectDevelopment/ApiDocs/Setting/ProjectEnvironment";
import QsConfig from "@/pages/ProjectDevelopment/ApiDocs/Setting/QsConfig";
import SwaggerSync from "@/pages/ProjectDevelopment/ApiDocs/Setting/SwaggerSync";
import { Tabs } from "antd";

function Setting() {
  return (
    <Tabs
      defaultActiveKey="project_environment"
      items={[
        {
          key: "project_environment",
          label: "调试环境",
          children: <ProjectEnvironment />,
        },
        {
          key: "swagger_sync",
          label: "Swagger",
          children: <SwaggerSync />,
        },
        {
          key: "qs_config",
          label: "qs",
          children: <QsConfig />,
        },
      ]}
    />
  );
}

export default Setting;

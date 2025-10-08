import Docs from "@/pages/ProjectDevelopment/ApiDocs/Docs";
import Setting from "@/pages/ProjectDevelopment/ApiDocs/Setting";
import { treeApiDocsGroupDetail } from "@/services/flode/apiDocsGroupController";
import {
  getProjectDetail,
  listCurrentUserProject,
} from "@/services/flode/projectController";
import { listProjectEnvironment } from "@/services/flode/projectEnvironmentController";
import { getParseQueryParam, ParamKey, updateQueryParam } from "@/util/Utils";
import { FileTextOutlined, SettingOutlined } from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { Cascader, Empty, Tabs, theme } from "antd";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ApiDocsContextProps {
  projectId?: string;
  setProjectId: (projectId: string) => void;
  apiDocsGroup: API.ApiDocsGroupDetail[];
  setApiDocsGroup: (apiDocsGroup: API.ApiDocsGroupDetail[]) => void;
}

interface ApiDocsProjectContextProps {
  projectEnvironment: API.ProjectEnvironmentVO[];
  setProjectEnvironment: (
    projectEnvironment: API.ProjectEnvironmentVO[]
  ) => void;
  projectDetail?: API.ProjectDetail;
  setProjectDetail: (detail: API.ProjectDetail) => void;
}

export const ApiDocsContext = createContext<ApiDocsContextProps>({
  setProjectId: () => {},
  apiDocsGroup: [],
  setApiDocsGroup: () => {},
});

export const ApiDocsProjectContext = createContext<ApiDocsProjectContextProps>({
  projectEnvironment: [],
  setProjectEnvironment: () => {},
  setProjectDetail: () => {},
});

const ApiDocsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [projectId, updateProjectId] = useState<string>();
  const [apiDocsGroup, updateApiDocsGroup] = useState<API.ApiDocsGroupDetail[]>(
    []
  );

  const setProjectId = (id: string) => {
    updateProjectId(id);
  };

  const setApiDocsGroup = (groups: API.ApiDocsGroupDetail[]) => {
    updateApiDocsGroup(groups);
  };

  useEffect(() => {
    if (!projectId) {
      return;
    }
    treeApiDocsGroupDetail({ projectId }).then((resp) => setApiDocsGroup(resp));
  }, [projectId]);

  return (
    <ApiDocsContext.Provider
      value={{
        projectId,
        setProjectId,
        apiDocsGroup,
        setApiDocsGroup,
      }}
    >
      {children}
    </ApiDocsContext.Provider>
  );
};

const ProjectDetailProvider: React.FC<{
  children: React.ReactNode;
  projectId?: string;
}> = ({ children, projectId }) => {
  const [projectEnvironment, updateProjectEnvironment] = useState<
    API.ProjectEnvironmentVO[]
  >([]);
  const [projectDetail, updateProjectDetail] = useState<API.ProjectDetail>();

  const setProjectEnvironment = (envs: API.ProjectEnvironmentVO[]) => {
    updateProjectEnvironment(envs);
  };

  const setProjectDetail = (detail: API.ProjectDetail) => {
    updateProjectDetail(detail);
  };

  useEffect(() => {
    if (!projectId) {
      return;
    }
    listProjectEnvironment({ projectId }).then((resp) =>
      setProjectEnvironment(resp)
    );
    getProjectDetail({ id: projectId }).then((resp) => {
      setProjectDetail(resp);
    });
  }, [projectId]);

  return (
    <ApiDocsProjectContext.Provider
      value={{
        projectEnvironment,
        setProjectEnvironment,
        projectDetail,
        setProjectDetail,
      }}
    >
      {children}
    </ApiDocsProjectContext.Provider>
  );
};

const ApiDocsContent: React.FC = () => {
  const { token } = theme.useToken();
  const [selected, setSelected] = useState<string[]>();
  const { projectId, setProjectId } = useContext(ApiDocsContext);
  const [userProjects, setUserProjects] = useState<API.UserProject[]>([]);

  useEffect(() => {
    listCurrentUserProject().then((resp) => {
      setUserProjects(resp);
      const projectSelect = getParseQueryParam(ParamKey.SEL_PROJECT);
      if (projectSelect) {
        setSelected(projectSelect);
      }
    });
  }, []);

  useEffect(() => {
    if (selected && selected.length > 0) {
      setProjectId(selected[selected.length - 1]);
    }
  }, [selected]);

  function TabBody({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactNode {
    return (
      <div style={{ paddingBottom: 18, paddingLeft: 18, paddingRight: 18 }}>
        {children}
      </div>
    );
  }

  return (
    <PageContainer title={false}>
      <ProjectDetailProvider projectId={projectId}>
        <Tabs
          defaultActiveKey="apiDocs"
          type="card"
          size={"large"}
          style={{
            backgroundColor: token.colorBgContainer,
          }}
          tabBarExtraContent={
            <Cascader
              value={selected}
              allowClear={false}
              placeholder="请选择项目"
              expandTrigger="hover"
              style={{ width: 300, marginRight: 16 }}
              fieldNames={{ label: "name", value: "id", children: "projects" }}
              options={userProjects}
              onChange={(val) => {
                setSelected(val);
                updateQueryParam(ParamKey.SEL_PROJECT, val);
              }}
            />
          }
          items={[
            {
              key: "apiDocs",
              icon: <FileTextOutlined />,
              label: "接口",
              children: (
                <TabBody>
                  {projectId ? (
                    <Docs />
                  ) : (
                    <Empty description={"请在右上角选择项目"} />
                  )}
                </TabBody>
              ),
            },
            {
              key: "setting",
              icon: <SettingOutlined />,
              disabled: !projectId,
              label: "设置",
              children: (
                <TabBody>
                  <Setting />
                </TabBody>
              ),
            },
          ]}
        />
      </ProjectDetailProvider>
    </PageContainer>
  );
};

const ApiDocs = () => (
  <ApiDocsProvider>
    <ApiDocsContent />
  </ApiDocsProvider>
);

export default ApiDocs;

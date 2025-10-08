import {
  getProjectDetail,
  listCurrentUserProject,
} from "@/services/flode/projectController";
import { requirementTask } from "@/services/flode/requirementController";
import { getTemplateDetail } from "@/services/flode/templateController";
import { treeVersionDetail } from "@/services/flode/versionController";
import {
  getParseQueryParam,
  getQueryParam,
  IdName,
  IdUsername,
  ParamKey,
  planningStatusColor,
  PlanningStatusType,
  updateQueryParam,
} from "@/util/Utils";
import { SearchOutlined } from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import {
  Button,
  Card,
  Cascader,
  Col,
  Empty,
  Input,
  Row,
  Select,
  Tag,
  theme,
  TreeSelect,
} from "antd";
import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import BoardRow from "./BoardRow";

type PlanningTreeNode = {
  value: string;
  label: React.ReactNode;
  name: string;
  disabled?: boolean;
  versionId?: string;
  versionStatus?: string;
  iterationId?: string;
  iterationStatus?: PlanningStatusType;
  children?: PlanningTreeNode[];
};

type QueryParam = {
  title?: string;
  priorityId?: string;
  handlerId?: string;
};

const colWidth = 330;
const colGutter = 20;
const colBackgroundColor = "#ebecf0";

const containerStyle: CSSProperties = {
  width: `${colWidth - colGutter}px`,
  height: "100%",
  backgroundColor: colBackgroundColor,
  padding: "4px 8px",
};

const titleStyle: CSSProperties = {
  margin: 0,
  color: "#172b4d",
  fontStyle: "inherit",
  lineHeight: 1.25,
  fontSize: "16px",
};

const buildPlanningTreeData = (
  versions?: API.TreeVersionDetail[]
): PlanningTreeNode[] | undefined => {
  return versions?.map((version): PlanningTreeNode => {
    const node: PlanningTreeNode = {
      value: version.id,
      name: version.name,
      label: <>{version.name}</>,
      disabled: true,
      versionId: version.id,
      versionStatus: version.status,
    };

    if (version.children?.length) {
      node.children = buildPlanningTreeData(version.children);
    }

    if (version.iterations?.length) {
      node.children = [
        ...(node.children || []),
        ...version.iterations.map(
          (iteration): PlanningTreeNode => ({
            value: iteration.id,
            name: iteration.name,
            label: (
              <>
                <Tag
                  bordered={false}
                  color={planningStatusColor(iteration.status)}
                >
                  迭代
                </Tag>
                {iteration.name}
              </>
            ),
            iterationId: iteration.id,
            iterationStatus: iteration.status,
          })
        ),
      ];
    }

    return node;
  });
};

const useProjectData = () => {
  const [projectDetail, setProjectDetail] = useState<API.ProjectDetail>();
  const [templateDetail, setTemplateDetail] = useState<API.TemplateDetail>();
  const [planningTree, setPlanningTree] = useState<PlanningTreeNode[]>();

  const fetchProjectData = useCallback(async (projectId: string) => {
    try {
      const projectDetail = await getProjectDetail({ id: projectId });
      setProjectDetail(projectDetail);
      const templateDetail = await getTemplateDetail({
        id: projectDetail.templateId,
      });
      setTemplateDetail(templateDetail);
      const versionDetail = await treeVersionDetail({ projectId });
      setPlanningTree(buildPlanningTreeData(versionDetail));
    } catch (error) {
      console.error("Failed to fetch project data:", error);
    }
  }, []);

  return { projectDetail, templateDetail, planningTree, fetchProjectData };
};

const useRequirementTasks = () => {
  const [requirementTasks, setRequirementTasks] =
    useState<API.RequirementTask[]>();

  const fetchRequirementTasks = useCallback(
    async (id?: string, params?: QueryParam) => {
      if (!id) {
        setRequirementTasks([]);
        return;
      }
      try {
        const tasks = await requirementTask({
          listRequirementTask: {
            iterationId: id,
            ...params,
          },
        });
        setRequirementTasks(tasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setRequirementTasks([]);
      }
    },
    []
  );

  return { requirementTasks, fetchRequirementTasks };
};

const RequirementBoard: React.FC = () => {
  const { token } = theme.useToken();
  const [userProjects, setUserProjects] = useState<API.UserProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string[]>([]);
  const [iterationId, setIterationId] = useState<string>();
  const [queryParam, setQueryParam] = useState<QueryParam>({});
  const { projectDetail, templateDetail, planningTree, fetchProjectData } =
    useProjectData();
  const { requirementTasks, fetchRequirementTasks } = useRequirementTasks();

  useEffect(() => {
    listCurrentUserProject().then((resp) => {
      setUserProjects(resp);
      const selProject = getParseQueryParam(ParamKey.SEL_PROJECT) ?? [];
      const selIterationId = getQueryParam(ParamKey.SEL_ITERATION_ID);

      if (selProject.length > 0) {
        setSelectedProject(selProject);
        fetchProjectData(selProject[selProject.length - 1]).then(() => {
          setIterationId(selIterationId || undefined);
          if (selIterationId) {
            fetchRequirementTasks(selIterationId).then();
          }
        });
      }
    });
  }, [fetchProjectData, fetchRequirementTasks]);

  const renderBoardHeader = useMemo(() => {
    if (!templateDetail) return null;

    const titleContainerStyle: CSSProperties = {
      backgroundColor: colBackgroundColor,
      borderTopLeftRadius: token.borderRadius,
      borderTopRightRadius: token.borderRadius,
      padding: 8,
    };

    return (
      <Row
        gutter={[20, 0]}
        style={{
          width: `${colWidth * (templateDetail.taskSteps.length + 1)}px`,
        }}
      >
        <Col key={"req"} flex={`${colWidth}px`}>
          <div style={titleContainerStyle}>
            <h4 style={titleStyle}>需求</h4>
          </div>
        </Col>
        {templateDetail.taskSteps.map((step) => (
          <Col key={step.id} flex={`${colWidth}px`}>
            <div style={titleContainerStyle}>
              <h4 style={titleStyle}>{step.name}</h4>
            </div>
          </Col>
        ))}
      </Row>
    );
  }, [templateDetail]);

  const renderBoardFooter = useMemo(() => {
    if (!templateDetail) return null;

    const colBottomStyle: CSSProperties = {
      backgroundColor: colBackgroundColor,
      borderBottomLeftRadius: token.borderRadius,
      borderBottomRightRadius: token.borderRadius,
      height: 5,
    };

    return (
      <Row
        gutter={[20, 0]}
        style={{
          width: `${colWidth * (templateDetail.taskSteps.length + 1)}px`,
        }}
      >
        <Col key={"req_bottom"} flex={`${colWidth}px`}>
          <div style={colBottomStyle}></div>
        </Col>
        {templateDetail.taskSteps.map((step) => (
          <Col key={step.id + "_bottom"} flex={`${colWidth}px`}>
            <div style={colBottomStyle}></div>
          </Col>
        ))}
      </Row>
    );
  }, [templateDetail]);

  const renderBoardContent = useMemo(() => {
    let description = undefined;
    if (!projectDetail || !templateDetail) {
      description = "请选择项目";
    } else if (!requirementTasks?.length) {
      description = "请选择项目迭代";
    }
    if (description) {
      return <Empty description={description} style={{ padding: "3rem 0" }} />;
    }

    return (
      <>
        {requirementTasks?.map((requirementTask) => (
          <BoardRow
            key={requirementTask.id}
            requirementTask={requirementTask}
            colGutter={colGutter}
            colWidth={colWidth}
            projectDetail={projectDetail!}
            templateDetail={templateDetail!}
            containerStyle={containerStyle}
          />
        ))}
        {renderBoardFooter}
      </>
    );
  }, [requirementTasks, projectDetail, templateDetail, renderBoardFooter]);

  return (
    <PageContainer title={false}>
      <Card
        styles={{
          title: { fontWeight: "normal" },
          body: { overflowX: "scroll" },
        }}
        title={
          <Row gutter={[20, 0]}>
            <Col flex={"1"}>
              <Cascader
                allowClear={false}
                value={selectedProject}
                options={userProjects}
                expandTrigger={"hover"}
                placeholder={"请选择项目"}
                style={{ width: "100%" }}
                fieldNames={{
                  label: "name",
                  value: "id",
                  children: "projects",
                }}
                onChange={(value: string[]) => {
                  setSelectedProject(value);
                  setIterationId(undefined);
                  fetchProjectData(value[value.length - 1]).then(() => {
                    updateQueryParam(ParamKey.SEL_PROJECT, value);
                    updateQueryParam(ParamKey.SEL_ITERATION_ID, undefined);
                  });
                }}
              />
            </Col>
            <Col flex={"1"}>
              <TreeSelect
                treeLine
                allowClear={false}
                treeDefaultExpandAll
                style={{ width: "100%" }}
                treeData={planningTree}
                value={iterationId}
                placeholder="请选择项目迭代"
                onChange={(value: string) => {
                  setIterationId(value);
                  fetchRequirementTasks(value).then(() => {
                    updateQueryParam(ParamKey.SEL_ITERATION_ID, value);
                  });
                }}
              />
            </Col>
            <Col flex={"1"}>
              <Input
                allowClear
                style={{ width: "100%" }}
                placeholder="请输入标题"
                onChange={(e) =>
                  setQueryParam((prev) => ({
                    ...prev,
                    title: e.target.value || undefined,
                  }))
                }
              />
            </Col>
            <Col flex={"1"}>
              <Select
                allowClear
                style={{ width: "100%" }}
                placeholder="请选择优先级"
                options={templateDetail?.requirementPriorities}
                fieldNames={IdName}
                onChange={(val: string) =>
                  setQueryParam((prev) => ({
                    ...prev,
                    priorityId: val || undefined,
                  }))
                }
              />
            </Col>
            <Col flex={"1"}>
              <Select
                allowClear
                placeholder="请选择处理人"
                style={{ width: "100%" }}
                options={projectDetail?.members}
                fieldNames={IdUsername}
                onChange={(val: string) =>
                  setQueryParam((prev) => ({
                    ...prev,
                    handlerId: val || undefined,
                  }))
                }
              />
            </Col>
            <Col flex={"0 0 82px"}>
              <Button
                type="primary"
                disabled={!iterationId}
                onClick={() =>
                  iterationId && fetchRequirementTasks(iterationId, queryParam)
                }
                icon={<SearchOutlined />}
              >
                查询
              </Button>
            </Col>
          </Row>
        }
      >
        {renderBoardHeader}
        {renderBoardContent}
      </Card>
    </PageContainer>
  );
};

export default React.memo(RequirementBoard);

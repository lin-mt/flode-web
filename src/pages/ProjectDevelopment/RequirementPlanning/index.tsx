import { RequirementModal } from "@/components";
import IterationStatusButton from "@/components/IterationStatusButton";
import RequirementCard from "@/components/RequirementCard";
import { getIterationDetail } from "@/services/flode/iterationController";
import {
  getProjectDetail,
  listCurrentUserProject,
} from "@/services/flode/projectController";
import {
  addRequirement,
  listRequirement,
  listRequirementByIterationId,
  planningRequirement,
} from "@/services/flode/requirementController";
import { getTemplateDetail } from "@/services/flode/templateController";
import { treeVersionDetail } from "@/services/flode/versionController";
import {
  getParseQueryParam,
  IdName,
  ParamKey,
  planningStatusColor,
  planningStatusTag,
  updateQueryParam,
} from "@/util/Utils";
import { PlusOutlined, SendOutlined } from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Button,
  Card,
  Cascader,
  Col,
  Descriptions,
  Divider,
  Empty,
  Flex,
  Form,
  Input,
  List,
  message,
  Row,
  Select,
  Tag,
  theme,
  Tooltip,
  TreeSelect,
} from "antd";
import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { history } from "umi";

type PlanningTreeNode = {
  value: string;
  title: string;
  disabled?: boolean;
  versionId?: string;
  versionStatus?: string;
  iterationId?: string;
  iterationStatus?: string;
  children?: PlanningTreeNode[];
};

type PlanningIterationState = {
  projectIds?: string[];
  versionId?: string;
  iterationId?: string;
};

const DroppableId = {
  IterationPlanning: "IterationPlanning",
  RequirementPool: "RequirementPool",
} as const;

const IdPrefix = {
  IterationPlanning: "ip_",
  RequirementPool: "rp_",
} as const;

const LIST_LIMIT = 20;
const INITIAL_OFFSET = "0";

const containerStyle: CSSProperties = {
  height: "calc(100vh - 433px)",
  overflow: "auto",
};

function buildPlanningTreeData(
  versions?: API.TreeVersionDetail[]
): PlanningTreeNode[] {
  return (versions || []).map((version) => ({
    value: version.id,
    title: version.name,
    disabled: true,
    versionId: version.id,
    versionStatus: version.status,
    children: [
      ...(version.children ? buildPlanningTreeData(version.children) : []),
      ...(version.iterations?.map((iteration: API.TreeVersionDetail) => ({
        value: iteration.id,
        title: iteration.name,
        iterationId: iteration.id,
        iterationStatus: iteration.status,
      })) || []),
    ],
  }));
}

const RequirementPlanning: React.FC = () => {
  const { token } = theme.useToken();
  const [searchForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [searchParam, setSearchParam] = useState<API.ListRequirement>();
  const [requirements, setRequirements] = useState<API.RequirementVO[]>([]);
  const [iterationRequirements, setIterationRequirements] = useState<
    API.RequirementVO[]
  >([]);
  const [userProjects, setUserProjects] = useState<API.UserProject[]>([]);
  const [planningTree, setPlanningTree] = useState<PlanningTreeNode[]>([]);
  const [projectDetail, setProjectDetail] = useState<API.ProjectDetail>();
  const [templateDetail, setTemplateDetail] = useState<API.TemplateDetail>();
  const [selectedIteration, setSelectedIteration] =
    useState<PlanningIterationState>({});
  const [planningIteration, setPlanningIteration] =
    useState<API.IterationDetail>();
  const [hasMore, setHasMore] = useState(true);

  const preSelectedIterationRef = useRef<PlanningIterationState>();

  useEffect(() => {
    listCurrentUserProject().then((resp) => {
      setUserProjects(resp);
      setSelectedIteration(
        getParseQueryParam(ParamKey.ITERATION_PLANNING) || {}
      );
    });
  }, []);

  const updateRequirements = () => {
    if (!searchParam?.projectId) {
      setRequirements([]);
      return;
    }

    const shouldLoadMore = hasMore || searchParam.offset === INITIAL_OFFSET;
    if (!shouldLoadMore) return;

    const params: API.ListRequirement = {
      ...searchParam,
      status: "TO_BE_PLANNED",
      offset: searchParam.offset || INITIAL_OFFSET,
      limit: String(LIST_LIMIT),
    };

    listRequirement({ listRequirement: params }).then((resp) => {
      if (!resp) {
        setRequirements(params.offset === INITIAL_OFFSET ? [] : requirements);
        return;
      }

      setHasMore(resp.length >= LIST_LIMIT);
      setRequirements((prev) =>
        params.offset === INITIAL_OFFSET ? resp : [...prev, ...resp]
      );
    });
  };

  const handleRequirementUpdate = (newReq: API.RequirementVO) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === newReq.id ? newReq : r))
    );
    setIterationRequirements((prev) =>
      prev.map((r) => (r.id === newReq.id ? newReq : r))
    );
  };

  const handleRequirementRemove = (id: string) => {
    setRequirements((prev) => prev.filter((r) => r.id !== id));
    setIterationRequirements((prev) => prev.filter((r) => r.id !== id));
  };

  useEffect(() => {
    const { projectIds, iterationId } = selectedIteration;
    const projectId = projectIds?.slice(-1)[0];
    if (
      projectId &&
      preSelectedIterationRef.current?.projectIds !== projectIds
    ) {
      setSearchParam({
        projectId,
        offset: INITIAL_OFFSET,
        limit: String(LIST_LIMIT),
      });

      getProjectDetail({ id: projectId }).then((resp) => {
        setProjectDetail(resp);
        if (resp.templateId) {
          getTemplateDetail({ id: resp.templateId }).then(setTemplateDetail);
        }
      });

      treeVersionDetail({ projectId }).then((resp) =>
        setPlanningTree(buildPlanningTreeData(resp))
      );
    }

    if (
      iterationId &&
      preSelectedIterationRef.current?.iterationId !== iterationId
    ) {
      getIterationDetail({ id: iterationId }).then(setPlanningIteration);
      listRequirementByIterationId({ iterationId }).then(
        setIterationRequirements
      );
    }
    preSelectedIterationRef.current = selectedIteration;
  }, [selectedIteration]);

  useEffect(() => updateRequirements(), [searchParam]);

  const handleUpdateIterationStatus = useCallback(() => {
    const { projectIds, iterationId } = selectedIteration;
    const projectId = projectIds?.slice(-1)[0];

    if (projectId && iterationId) {
      treeVersionDetail({ projectId }).then((resp) =>
        setPlanningTree(buildPlanningTreeData(resp))
      );
      getIterationDetail({ id: iterationId }).then(setPlanningIteration);
      listRequirementByIterationId({ iterationId }).then(
        setIterationRequirements
      );
      return true;
    }
  }, [selectedIteration]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const requirementId = draggableId
      .replace(IdPrefix.RequirementPool, "")
      .replace(IdPrefix.IterationPlanning, "");

    const isMovingToIteration =
      destination.droppableId === DroppableId.IterationPlanning;
    const targetIterationId = selectedIteration.iterationId;

    if (isMovingToIteration && !targetIterationId) {
      messageApi.warning("请选择规划的迭代").then();
      return;
    }

    const updateState = (
      sourceList: API.RequirementVO[],
      destList: API.RequirementVO[],
      updateFn: (req: API.RequirementVO) => API.RequirementVO
    ) => {
      const itemIndex = sourceList.findIndex((r) => r.id === requirementId);
      if (itemIndex === -1) return;

      const updatedItem = updateFn(sourceList[itemIndex]);
      const newSource = [...sourceList];
      newSource.splice(itemIndex, 1);

      const newDest = [...destList];
      newDest.splice(destination.index, 0, updatedItem);

      return [newSource, newDest];
    };

    if (isMovingToIteration) {
      const [newRequirements, newIterationReqs] = updateState(
        requirements,
        iterationRequirements,
        (req) => ({ ...req, iterationId: targetIterationId })
      ) || [requirements, iterationRequirements];

      setRequirements(newRequirements);
      setIterationRequirements(newIterationReqs);
      planningRequirement({
        requirementId,
        iterationId: targetIterationId!,
      }).catch(() => {
        setRequirements(requirements);
        setIterationRequirements(iterationRequirements);
      });
    } else {
      const [newIterationReqs, newRequirements] = updateState(
        iterationRequirements,
        requirements,
        (req) => ({ ...req, iterationId: undefined })
      ) || [iterationRequirements, requirements];

      setIterationRequirements(newIterationReqs);
      setRequirements(newRequirements);
      planningRequirement({ requirementId }).catch(() => {
        setIterationRequirements(iterationRequirements);
        setRequirements(requirements);
      });
    }
  };

  return (
    <PageContainer title={false}>
      {contextHolder}
      <Card>
        <DragDropContext onDragEnd={handleDragEnd}>
          规划项目：
          <Cascader
            placeholder="请选择项目"
            expandTrigger="hover"
            allowClear={false}
            style={{ width: 300 }}
            fieldNames={{ label: "name", value: "id", children: "projects" }}
            options={userProjects}
            value={selectedIteration.projectIds}
            onChange={(val) => {
              const planning = {
                projectIds: val,
                versionId: undefined,
                iterationId: undefined,
              };
              setSelectedIteration(planning);
              updateQueryParam(ParamKey.ITERATION_PLANNING, planning);
            }}
          />
          <Divider
            style={{ marginTop: token.margin, marginBottom: token.margin }}
          />
          <Row gutter={20}>
            <Col span={12}>
              <Flex
                justify={"space-between"}
                align={"center"}
                style={{ marginBottom: 10 }}
              >
                {templateDetail && projectDetail && (
                  <RequirementModal<API.AddRequirement>
                    template={templateDetail}
                    projectDetail={projectDetail}
                    trigger={
                      <Tooltip
                        title={
                          !selectedIteration?.projectIds ? "请选择项目" : ""
                        }
                      >
                        <Button
                          color={"default"}
                          variant={"filled"}
                          disabled={!selectedIteration?.projectIds}
                          icon={<PlusOutlined />}
                        >
                          新建需求
                        </Button>
                      </Tooltip>
                    }
                    onFinish={async (values) => {
                      values.projectId = projectDetail?.id || "";
                      await addRequirement(values).then(() => {
                        updateRequirements();
                      });
                    }}
                  />
                )}
                <Form form={searchForm}>
                  <Flex
                    justify={"space-between"}
                    align={"center"}
                    gap={"small"}
                  >
                    <Form.Item noStyle name={"priorityId"}>
                      <Select
                        allowClear
                        placeholder="优先级"
                        options={templateDetail?.requirementPriorities}
                        fieldNames={IdName}
                      />
                    </Form.Item>
                    <Form.Item noStyle name={"typeId"}>
                      <Select
                        allowClear
                        placeholder="需求类型"
                        options={templateDetail?.requirementTypes}
                        fieldNames={IdName}
                      />
                    </Form.Item>
                    <Form.Item noStyle name={"title"}>
                      <Input.Search
                        allowClear
                        enterButton
                        placeholder="请输入需求标题"
                        onSearch={() => {
                          const params = searchForm.getFieldsValue(true);
                          if (!searchParam?.projectId) {
                            messageApi.info("请选择要规划的项目").then();
                            return;
                          }
                          setSearchParam({
                            ...searchParam,
                            INITIAL_OFFSET,
                            LIST_LIMIT,
                            ...params,
                          });
                        }}
                      />
                    </Form.Item>
                  </Flex>
                </Form>
              </Flex>
              <Droppable droppableId={DroppableId.RequirementPool}>
                {(droppableProvided, snapshot) => {
                  const isDraggingOver = snapshot.isDraggingOver;
                  return (
                    <div ref={droppableProvided.innerRef}>
                      <List<API.RequirementVO>
                        style={containerStyle}
                        dataSource={requirements}
                        locale={{
                          emptyText: (
                            <Empty description={"无更多待规划的需求"} />
                          ),
                        }}
                        renderItem={(item, index) => {
                          const draggableId =
                            IdPrefix.RequirementPool + item.id;
                          return (
                            <>
                              <Draggable
                                draggableId={draggableId}
                                index={index}
                                key={draggableId}
                              >
                                {(draggableProvider) => {
                                  return (
                                    <div
                                      {...draggableProvider.draggableProps}
                                      {...draggableProvider.dragHandleProps}
                                      ref={draggableProvider.innerRef}
                                    >
                                      {templateDetail && projectDetail && (
                                        <div style={{ marginBottom: 10 }}>
                                          <RequirementCard
                                            projectDetail={projectDetail}
                                            template={templateDetail}
                                            requirement={item}
                                            afterDelete={() =>
                                              handleRequirementRemove(item.id)
                                            }
                                            afterUpdate={(newReq) =>
                                              handleRequirementUpdate(newReq)
                                            }
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                }}
                              </Draggable>
                              {index === requirements.length - 1 &&
                                !isDraggingOver &&
                                (hasMore ? (
                                  <Button
                                    block
                                    type="text"
                                    size="small"
                                    onClick={() => {
                                      if (searchParam) {
                                        setSearchParam({
                                          ...searchParam,
                                          offset: (
                                            Number(searchParam.offset) +
                                            Number(LIST_LIMIT)
                                          ).toString(),
                                        });
                                      }
                                    }}
                                  >
                                    加载更多...
                                  </Button>
                                ) : (
                                  <Divider plain>已无更多待规划的需求</Divider>
                                ))}
                            </>
                          );
                        }}
                      />

                      {droppableProvided.placeholder}
                    </div>
                  );
                }}
              </Droppable>
            </Col>
            <Col span={12}>
              <Flex
                justify={"space-between"}
                align={"center"}
                style={{ marginBottom: 10 }}
              >
                <Flex justify={"space-between"} align={"center"} gap={"small"}>
                  <TreeSelect<string>
                    treeLine
                    treeDefaultExpandAll
                    treeData={planningTree}
                    placeholder={"请选择要规划的迭代"}
                    value={selectedIteration.iterationId}
                    treeTitleRender={(node) => (
                      <>
                        <Tag
                          bordered={false}
                          color={
                            planningStatusColor(node.versionStatus) ||
                            planningStatusColor(node.iterationStatus)
                          }
                        >
                          {node.versionId && "版本"}
                          {node.iterationId && "迭代"}
                        </Tag>
                        {node.title}
                      </>
                    )}
                    style={{ width: 300 }}
                    onSelect={(iterationId) => {
                      const planning = { ...selectedIteration, iterationId };
                      setSelectedIteration(planning);
                      updateQueryParam(ParamKey.ITERATION_PLANNING, planning);
                    }}
                  />
                  <Tooltip
                    title={
                      !selectedIteration?.iterationId
                        ? "请选择要规划的迭代"
                        : ""
                    }
                  >
                    <Button
                      type="text"
                      disabled={!selectedIteration?.iterationId}
                      icon={<SendOutlined />}
                      onClick={() =>
                        history.push({
                          pathname: "/project-development/requirement-board",
                          search: `?${ParamKey.SEL_PROJECT.toString()}=${JSON.stringify(
                            selectedIteration.projectIds
                          )}&${ParamKey.SEL_ITERATION_ID}=${
                            selectedIteration.iterationId
                          }`,
                        })
                      }
                    >
                      Kanban
                    </Button>
                  </Tooltip>
                </Flex>
                <IterationStatusButton
                  id={planningIteration?.id}
                  status={planningIteration?.status}
                  afterUpdate={handleUpdateIterationStatus}
                />
              </Flex>
              {planningIteration ? (
                <div style={containerStyle}>
                  <Descriptions
                    bordered
                    column={2}
                    size="small"
                    items={[
                      {
                        label: "迭代名称",
                        children: (
                          <Tooltip title={planningIteration.id}>
                            {planningIteration.name}
                          </Tooltip>
                        ),
                      },
                      {
                        label: "迭代状态",
                        children: planningStatusTag(planningIteration.status),
                      },
                      {
                        label: "计划开始时间",
                        children: planningIteration.plannedStartTime,
                      },
                      {
                        label: "计划结束时间",
                        children: planningIteration.plannedEndTime,
                      },
                      {
                        label: "实际开始时间",
                        children: planningIteration.actualStartTime,
                      },
                      {
                        label: "实际结束时间",
                        children: planningIteration.actualEndTime,
                      },
                      {
                        label: "描述",
                        children: planningIteration.description,
                        span: 2,
                      },
                    ]}
                  />
                  <Droppable droppableId={DroppableId.IterationPlanning}>
                    {(droppableProvided) => (
                      <div ref={droppableProvided.innerRef}>
                        <List<API.RequirementVO>
                          style={{ marginTop: 10 }}
                          dataSource={iterationRequirements}
                          locale={{
                            emptyText: (
                              <Empty
                                description={"请拖动需求到此处进行需求规划"}
                              />
                            ),
                          }}
                          renderItem={(item, index) => {
                            const draggableId =
                              IdPrefix.IterationPlanning + item.id;
                            return (
                              <Draggable
                                draggableId={draggableId}
                                index={index}
                                key={draggableId}
                              >
                                {(draggableProvider) => {
                                  return (
                                    <div
                                      {...draggableProvider.draggableProps}
                                      {...draggableProvider.dragHandleProps}
                                      ref={draggableProvider.innerRef}
                                    >
                                      {templateDetail && projectDetail && (
                                        <div style={{ marginBottom: 10 }}>
                                          <RequirementCard
                                            projectDetail={projectDetail}
                                            template={templateDetail}
                                            requirement={item}
                                            afterDelete={() =>
                                              handleRequirementRemove(item.id)
                                            }
                                            afterUpdate={(newReq) =>
                                              handleRequirementUpdate(newReq)
                                            }
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                }}
                              </Draggable>
                            );
                          }}
                        />
                        {droppableProvided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ) : (
                <Empty
                  style={{ marginTop: 100 }}
                  description="请选择要规划的迭代"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Col>
          </Row>
        </DragDropContext>
      </Card>
    </PageContainer>
  );
};

export default RequirementPlanning;

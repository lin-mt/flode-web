import IterationStatusButton from "@/components/IterationStatusButton";
import RequirementCard from "@/components/RequirementCard";
import {
  addIteration,
  getIterationDetail,
  updateIteration,
} from "@/services/flode/iterationController";
import {
  getProjectDetail,
  listCurrentUserProject,
} from "@/services/flode/projectController";
import { listRequirementByIterationId } from "@/services/flode/requirementController";
import { getTemplateDetail } from "@/services/flode/templateController";
import {
  addVersion,
  deleteVersion,
  getVersionDetail,
  treeVersionDetail,
  updateVersion,
} from "@/services/flode/versionController";
import {
  FormType,
  getParseQueryParam,
  IdName,
  ParamKey,
  PlanningStatus,
  planningStatusColor,
  planningStatusTag,
  PlanningStatusType,
  updateQueryParam,
} from "@/util/Utils";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import {
  ModalForm,
  PageContainer,
  ProFormItem,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
} from "@ant-design/pro-components";
import {
  Button,
  Card,
  Cascader,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Empty,
  Flex,
  Form,
  List,
  Popconfirm,
  Row,
  Table,
  Tag,
  theme,
  Tooltip,
  Tree,
  Typography,
} from "antd";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";

type PlanningSelected = {
  versionId?: string;
  iterationId?: string;
};

type PlanningTreeNode = {
  key: string;
  title: string;
  versionId?: string;
  versionStatus?: PlanningStatusType;
  iterationId?: string;
  iterationStatus?: PlanningStatusType;
  children?: PlanningTreeNode[];
};

const formatPlannedRange = (value: any) => {
  if (value.plannedRange) {
    value.plannedStartTime = dayjs(value.plannedRange[0]).format(
      "YYYY-MM-DD HH:mm"
    );
    value.plannedEndTime = dayjs(value.plannedRange[1]).format(
      "YYYY-MM-DD HH:mm"
    );
  } else {
    value.plannedStartTime = undefined;
    value.plannedEndTime = undefined;
  }
};

const buildPlanningTreeData = (
  versions?: API.TreeVersionDetail[]
): PlanningTreeNode[] | undefined => {
  return versions?.map((version) => {
    const node: PlanningTreeNode = {
      key: version.id,
      title: version.name,
      versionId: version.id,
      versionStatus: version.status,
    };
    if (version.children) {
      node.children = buildPlanningTreeData(version.children);
    }
    if (version.iterations) {
      node.children = node.children || [];
      node.children.push(
        ...version.iterations.map((iteration) => ({
          key: iteration.id,
          title: iteration.name,
          iterationId: iteration.id,
          iterationStatus: iteration.status,
        }))
      );
    }
    return node;
  });
};

const ProjectPlanning: React.FC = () => {
  const { token } = theme.useToken();
  const [versionForm] = Form.useForm();
  const [iterationForm] = Form.useForm();
  const [selectedKey, setSelectedKey] = useState<React.Key[]>();
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedProject, setSelectedProject] = useState<string[]>();
  const [planningSelect, setPlanningSelect] = useState<PlanningSelected>();
  const [userProjects, setUserProjects] = useState<API.UserProject[]>([]);
  const [projectVersionDetail, setProjectVersionDetail] =
    useState<API.TreeVersionDetail[]>();
  const [versionDetail, setVersionDetail] = useState<API.VersionDetail>();
  const [iterationDetail, setIterationDetail] = useState<API.IterationDetail>();
  const [iterationRequirements, setIterationRequirements] = useState<
    API.RequirementVO[]
  >([]);
  const [projectDetail, setProjectDetail] = useState<API.ProjectDetail>();
  const [templateDetail, setTemplateDetail] = useState<API.TemplateDetail>();

  const updateProjectDetail = useCallback(async () => {
    if (selectedProject) {
      const projectId = getProjectId();
      treeVersionDetail({ projectId }).then((resp) =>
        setProjectVersionDetail(resp)
      );
      getProjectDetail({ id: projectId }).then((resp) => {
        setProjectDetail(resp);
        getTemplateDetail({ id: resp.templateId }).then((template) =>
          setTemplateDetail(template)
        );
      });
    }
  }, [selectedProject]);

  const updateSelectDetail = useCallback(async () => {
    const { versionId, iterationId } = planningSelect || {};
    if (versionId) {
      const resp = await getVersionDetail({ id: versionId });
      setVersionDetail(resp);
    } else {
      setVersionDetail(undefined);
    }
    if (iterationId) {
      const resp = await getIterationDetail({ id: iterationId });
      setIterationDetail(resp);
      listRequirementByIterationId({ iterationId }).then(
        setIterationRequirements
      );
    } else {
      setIterationDetail(undefined);
      setIterationRequirements([]);
    }
  }, [planningSelect]);

  const handleAddIteration = useCallback(
    async (value: any) => {
      formatPlannedRange(value);
      await addIteration(value as API.AddIteration);
      await updateProjectDetail();
      await updateSelectDetail();
      return true;
    },
    [updateProjectDetail, updateSelectDetail]
  );

  const handleAddVersion = useCallback(
    async (value: any) => {
      value.projectId = getProjectId();
      formatPlannedRange(value);
      await addVersion(value as API.AddVersion);
      if (value.parentId === versionDetail?.id) {
        await updateSelectDetail();
      }
      const resp = await treeVersionDetail({ projectId: value.projectId });
      setProjectVersionDetail(resp);
      return true;
    },
    [selectedProject, versionDetail, updateSelectDetail]
  );

  const handleUpdateVersion = useCallback(
    async (value: any) => {
      formatPlannedRange(value);
      const newVersion = { ...versionDetail, ...value };
      await updateVersion(newVersion);
      setVersionDetail(newVersion);
      const resp = await treeVersionDetail({ projectId: newVersion.projectId });
      setProjectVersionDetail(resp);
      return true;
    },
    [versionDetail]
  );

  const versionModalForm = useCallback(
    (formType: FormType) => {
      const title = formType === FormType.ADD ? "新建版本" : "编辑版本";
      return (
        <ModalForm
          title={title}
          layout={"horizontal"}
          labelCol={{ span: 3 }}
          form={versionForm}
          onFinish={
            formType === FormType.ADD ? handleAddVersion : handleUpdateVersion
          }
          trigger={
            <Button
              color="default"
              variant="filled"
              icon={
                formType === FormType.ADD ? <PlusOutlined /> : <EditOutlined />
              }
              onClick={() => {
                if (formType === FormType.UPDATE && versionDetail) {
                  versionForm.setFieldsValue(versionDetail);
                  if (
                    versionDetail.plannedStartTime &&
                    versionDetail.plannedEndTime
                  ) {
                    versionForm.setFieldValue("plannedRange", [
                      dayjs(versionDetail.plannedStartTime),
                      dayjs(versionDetail.plannedEndTime),
                    ]);
                  }
                }
              }}
            >
              {title}
            </Button>
          }
        >
          <ProFormText
            name={"name"}
            label={"版本名称"}
            rules={[{ required: true }, { max: 30 }]}
          />
          <ProFormTreeSelect
            allowClear
            name={"parentId"}
            label={"父版本"}
            placeholder={"请选择父版本"}
            fieldProps={{
              fieldNames: IdName,
              treeData: projectVersionDetail,
            }}
          />
          <ProFormItem name={"plannedRange"} label="计划时间">
            <DatePicker.RangePicker
              showTime={{ format: "HH:mm" }}
              format="YYYY-MM-DD HH:mm"
              placeholder={["计划开始时间", "计划结束时间"]}
            />
          </ProFormItem>
          <ProFormTextArea
            name={"description"}
            label={"版本描述"}
            rules={[{ max: 255 }]}
          />
        </ModalForm>
      );
    },
    [
      versionForm,
      versionDetail,
      projectVersionDetail,
      handleAddVersion,
      handleUpdateVersion,
    ]
  );

  const iterationModalForm = useCallback(
    (formType: FormType) => {
      const title = formType === FormType.ADD ? "新建迭代" : "编辑迭代";

      return (
        <ModalForm
          title={title}
          layout={"horizontal"}
          labelCol={{ span: 3 }}
          onFinish={
            formType === FormType.ADD
              ? handleAddIteration
              : handleUpdateIteration
          }
          trigger={
            <Button
              color="default"
              variant="filled"
              icon={
                formType === FormType.ADD ? <PlusOutlined /> : <EditOutlined />
              }
              onClick={() => {
                if (formType === FormType.UPDATE && iterationDetail) {
                  iterationForm.setFieldsValue(iterationDetail);
                  if (
                    iterationDetail.plannedStartTime &&
                    iterationDetail.plannedEndTime
                  ) {
                    iterationForm.setFieldValue("plannedRange", [
                      dayjs(iterationDetail.plannedStartTime),
                      dayjs(iterationDetail.plannedEndTime),
                    ]);
                  }
                }
              }}
            >
              {title}
            </Button>
          }
        >
          <ProFormText
            name={"name"}
            label={"迭代名称"}
            rules={[{ required: true }, { max: 30 }]}
          />
          <ProFormTreeSelect
            allowClear
            name="versionId"
            label={"所属版本"}
            placeholder={"请选择迭代的所属版本"}
            rules={[{ required: true, message: "请选择迭代的所属版本" }]}
            fieldProps={{
              fieldNames: IdName,
              treeData: projectVersionDetail,
            }}
          />
          <ProFormItem name={"plannedRange"} label="计划时间">
            <DatePicker.RangePicker
              showTime={{ format: "HH:mm" }}
              format="YYYY-MM-DD HH:mm"
              placeholder={["计划开始时间", "计划结束时间"]}
            />
          </ProFormItem>
          <ProFormTextArea
            name={"description"}
            label={"迭代描述"}
            rules={[{ max: 255 }]}
          />
        </ModalForm>
      );
    },
    [versionDetail, iterationDetail, projectVersionDetail]
  );

  const getParentKeys = useCallback(
    (
      id: string | undefined,
      treeData: PlanningTreeNode[] | undefined
    ): React.Key[] => {
      if (!id || !treeData) {
        return [];
      }
      const keys: React.Key[] = [];
      const findParentKeys = (
        nodes: PlanningTreeNode[] | undefined,
        targetId?: string,
        parentKeys: React.Key[] = []
      ): boolean => {
        if (!nodes) return false;
        for (const node of nodes) {
          if (node.key === targetId) {
            keys.push(...parentKeys);
            return true;
          }
          if (node.children) {
            const newParentKeys = [...parentKeys, node.key];
            if (findParentKeys(node.children, targetId, newParentKeys)) {
              return true;
            }
          }
        }
        return false;
      };
      findParentKeys(treeData, id);
      return keys;
    },
    []
  );

  const planningTree = useMemo(() => {
    const data = buildPlanningTreeData(projectVersionDetail);
    setExpandedKeys(
      getParentKeys(
        planningSelect?.versionId || planningSelect?.iterationId,
        data
      )
    );
    return data;
  }, [projectVersionDetail]);

  const getProjectId = useCallback(() => {
    return selectedProject ? selectedProject[selectedProject.length - 1] : "";
  }, [selectedProject]);

  const getVersionPlanning = useCallback((versionDetail: API.VersionDetail) => {
    const planning: any[] = [];
    versionDetail?.children?.forEach((v) =>
      planning.push({ isVersion: true, ...v })
    );
    versionDetail?.iterations?.forEach((v) =>
      planning.push({ isIteration: true, ...v })
    );
    return planning;
  }, []);

  const updateSelectedKey = useCallback(
    (versionId: string | undefined, iterationId: string | undefined) => {
      if (versionId) {
        setSelectedKey([versionId]);
      }
      if (iterationId) {
        setSelectedKey([iterationId]);
      }
      const select = { versionId, iterationId };
      setPlanningSelect(select);
      updateQueryParam(ParamKey.PROJECT_PLANNING, select);
    },
    []
  );

  const handleUpdateIteration = useCallback(
    async (value: any) => {
      formatPlannedRange(value);
      const newIteration = { ...iterationDetail, ...value };
      await updateIteration(newIteration);
      setIterationDetail(newIteration);
      await updateProjectDetail();
      return true;
    },
    [iterationDetail, updateProjectDetail]
  );

  const handleDeleteVersion = useCallback(async () => {
    if (versionDetail) {
      await deleteVersion({ id: versionDetail.id });
      setPlanningSelect(undefined);
      updateQueryParam(ParamKey.PROJECT_PLANNING, undefined);
      const resp = await treeVersionDetail({
        projectId: versionDetail.projectId,
      });
      setProjectVersionDetail(resp);
      if (versionDetail.parentId) {
        updateSelectedKey(versionDetail.parentId, undefined);
      }
    }
  }, [versionDetail, updateSelectedKey]);

  const handleDeleteIteration = useCallback(async () => {
    if (iterationDetail) {
      await deleteVersion({ id: iterationDetail.id });
      updateSelectedKey(iterationDetail.versionId, undefined);
      await updateProjectDetail();
    }
  }, [iterationDetail, updateSelectedKey, updateProjectDetail]);

  const handleRequirementUpdate = useCallback((newReq: API.RequirementVO) => {
    setIterationRequirements((prev) =>
      prev.map((r) => (r.id === newReq.id ? newReq : r))
    );
  }, []);

  const handleRequirementRemove = useCallback((id: string) => {
    setIterationRequirements((prev) => prev.filter((r) => r.id !== id));
  }, []);

  useEffect(() => {
    listCurrentUserProject().then((resp) => {
      setUserProjects(resp);
      const selProject = getParseQueryParam(ParamKey.SEL_PROJECT);
      if (selProject) {
        setSelectedProject(selProject);
      }
    });
  }, []);

  useEffect(() => {
    updateProjectDetail().then();
    setIterationDetail(undefined);
    setSelectedKey(undefined);
    setVersionDetail(undefined);
    setExpandedKeys([]);
    const projectPlanning = getParseQueryParam(ParamKey.PROJECT_PLANNING);
    if (projectPlanning) {
      setPlanningSelect(projectPlanning);
      const key = projectPlanning.versionId || projectPlanning.iterationId;
      setSelectedKey([key]);
    }
  }, [selectedProject, updateProjectDetail]);

  useEffect(() => {
    updateSelectDetail().then();
  }, [planningSelect, updateSelectDetail]);

  return (
    <PageContainer title={false}>
      <Card>
        规划项目：
        <Cascader
          placeholder="请选择项目"
          expandTrigger="hover"
          allowClear={false}
          style={{ width: 300 }}
          fieldNames={{ label: "name", value: "id", children: "projects" }}
          options={userProjects}
          value={selectedProject}
          onChange={(val) => {
            setSelectedProject(val);
            updateQueryParam(ParamKey.SEL_PROJECT, val);
            updateQueryParam(ParamKey.PROJECT_PLANNING);
          }}
        />
        <Divider
          style={{ marginTop: token.margin, marginBottom: token.margin }}
        />
        {selectedProject ? (
          <Row gutter={30}>
            <Col span={12}>
              <Flex
                justify={"space-between"}
                align={"center"}
                style={{ marginBottom: 10 }}
              >
                <Typography.Title
                  level={5}
                  style={{ margin: 0, fontWeight: 500 }}
                >
                  <Row gutter={7}>
                    <Col>项目规划</Col>
                    {Object.values(PlanningStatus).map((s) => (
                      <Col key={s}>{planningStatusTag(s)}</Col>
                    ))}
                  </Row>
                </Typography.Title>
                <Flex justify={"space-between"} gap={"small"} align={"center"}>
                  {versionModalForm(FormType.ADD)}
                  {iterationModalForm(FormType.ADD)}
                </Flex>
              </Flex>
              {planningTree?.length ? (
                <Tree<PlanningTreeNode>
                  blockNode
                  treeData={planningTree}
                  selectedKeys={selectedKey}
                  expandedKeys={expandedKeys}
                  onExpand={(keys) => setExpandedKeys(keys)}
                  onSelect={(_, { node }) =>
                    updateSelectedKey(node.versionId, node.iterationId)
                  }
                  titleRender={(node) => (
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
                />
              ) : (
                <Empty />
              )}
            </Col>
            <Col span={12}>
              {versionDetail && (
                <Flex vertical gap={"small"}>
                  <Flex justify={"space-between"} align={"center"}>
                    {versionModalForm(FormType.UPDATE)}
                    <Popconfirm
                      title="确认删除该版本吗?"
                      onConfirm={handleDeleteVersion}
                    >
                      <Button
                        color="danger"
                        variant="filled"
                        icon={<DeleteOutlined />}
                      >
                        删除
                      </Button>
                    </Popconfirm>
                  </Flex>
                  <Descriptions
                    bordered
                    column={2}
                    size="small"
                    items={[
                      {
                        label: "版本名称",
                        children: (
                          <Tooltip title={`ID：${versionDetail.id}`}>
                            {versionDetail.name}
                          </Tooltip>
                        ),
                      },
                      {
                        label: "版本状态",
                        children: planningStatusTag(versionDetail.status),
                      },
                      {
                        label: "计划开始时间",
                        children: versionDetail.plannedStartTime,
                      },
                      {
                        label: "计划结束时间",
                        children: versionDetail.plannedEndTime,
                      },
                      {
                        label: "实际开始时间",
                        children: versionDetail.actualStartTime,
                      },
                      {
                        label: "实际结束时间",
                        children: versionDetail.actualEndTime,
                      },
                      {
                        label: "描述",
                        children: versionDetail.description,
                        span: 2,
                      },
                    ]}
                  />
                  <Table
                    bordered
                    rowKey={"id"}
                    size={"small"}
                    pagination={false}
                    dataSource={getVersionPlanning(versionDetail)}
                    columns={[
                      {
                        title: "名称（类型/状态）",
                        dataIndex: "name",
                        render: (_, record) => (
                          <>
                            <Button
                              size="small"
                              type={"link"}
                              onClick={() =>
                                updateSelectedKey(
                                  record.isVersion ? record.id : undefined,
                                  record.isIteration ? record.id : undefined
                                )
                              }
                            >
                              {record.name}
                            </Button>
                            <Tag
                              bordered={false}
                              color={planningStatusColor(record.status)}
                            >
                              {record.isVersion && "版本"}
                              {record.isIteration && "迭代"}
                            </Tag>
                          </>
                        ),
                      },
                      {
                        title: "计划开始时间",
                        dataIndex: "plannedStartTime",
                      },
                      {
                        title: "计划结束时间",
                        dataIndex: "plannedEndTime",
                      },
                      {
                        title: (
                          <>
                            需求&nbsp;
                            <Tooltip title={"总数/未开始/进行中/已完成/已关闭"}>
                              <QuestionCircleOutlined />
                            </Tooltip>
                          </>
                        ),
                        render: (_, record) => {
                          const statistics = record.requirementStatistics;
                          if (!statistics) {
                            return "--/--/--/--/--";
                          }
                          return `${statistics.total}/${statistics.planned}/${statistics.processing}/${statistics.done}/${statistics.closed}`;
                        },
                      },
                    ]}
                  />
                </Flex>
              )}
              {iterationDetail && (
                <Flex vertical gap={"small"}>
                  <Flex justify={"space-between"} align={"center"}>
                    <Flex gap={"middle"}>
                      {iterationModalForm(FormType.UPDATE)}
                      <IterationStatusButton
                        id={iterationDetail.id}
                        status={iterationDetail.status}
                        afterUpdate={() => {
                          updateSelectDetail().then();
                          updateProjectDetail().then();
                        }}
                      />
                    </Flex>

                    <Popconfirm
                      title="确认删除该迭代吗?"
                      onConfirm={handleDeleteIteration}
                    >
                      <Button
                        color={"danger"}
                        variant={"filled"}
                        icon={<DeleteOutlined />}
                      >
                        删除
                      </Button>
                    </Popconfirm>
                  </Flex>
                  <Descriptions
                    bordered
                    column={2}
                    size="small"
                    items={[
                      {
                        label: "迭代名称",
                        children: (
                          <Tooltip title={`ID：${iterationDetail.id}`}>
                            {iterationDetail.name}
                          </Tooltip>
                        ),
                      },
                      {
                        label: "迭代状态",
                        children: (
                          <Flex>
                            {planningStatusTag(iterationDetail.status)}
                          </Flex>
                        ),
                      },
                      {
                        label: "计划开始时间",
                        children: iterationDetail.plannedStartTime,
                      },
                      {
                        label: "计划结束时间",
                        children: iterationDetail.plannedEndTime,
                      },
                      {
                        label: "实际开始时间",
                        children: iterationDetail.actualStartTime,
                      },
                      {
                        label: "实际结束时间",
                        children: iterationDetail.actualEndTime,
                      },
                      {
                        label: "描述",
                        children: iterationDetail.description,
                        span: 2,
                      },
                    ]}
                  />
                  <List<API.RequirementVO>
                    dataSource={iterationRequirements}
                    renderItem={(item) => {
                      return (
                        <>
                          {templateDetail && projectDetail && (
                            <div style={{ marginBottom: 8 }}>
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
                        </>
                      );
                    }}
                  />
                </Flex>
              )}
              {!versionDetail && !iterationDetail && (
                <Empty description={"请在左侧选择要规划的版本或者迭代"} />
              )}
            </Col>
          </Row>
        ) : (
          <Empty description={"请选择要规划的项目"} />
        )}
      </Card>
    </PageContainer>
  );
};

export default ProjectPlanning;

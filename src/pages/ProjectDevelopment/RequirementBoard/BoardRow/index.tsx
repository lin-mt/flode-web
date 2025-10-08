import { TaskModal } from "@/components";
import RequirementCard from "@/components/RequirementCard";
import TaskCard from "@/components/TaskCard";
import { addTask, moveTask } from "@/services/flode/taskController";
import { PlusOutlined } from "@ant-design/icons";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { Button, Col, Flex, Row, theme } from "antd";
import _ from "lodash";
import { CSSProperties, useState } from "react";

type TaskRowProps = {
  requirementTask: API.RequirementTask;
  colGutter: number;
  colWidth: number;
  projectDetail: API.ProjectDetail;
  templateDetail: API.TemplateDetail;
  containerStyle: CSSProperties;
};

function BoardRow(props: TaskRowProps) {
  const {
    requirementTask,
    colGutter,
    colWidth,
    containerStyle,
    projectDetail,
    templateDetail,
  } = props;

  const { token } = theme.useToken();
  const [taskContainerBgColor, setTaskContainerBgColor] = useState<string>();
  const [requirementTasks, setRequirementTasks] = useState<
    Record<string, any> | undefined
  >(requirementTask.tasks);

  function handleTaskDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination || !requirementTasks) {
      setTaskContainerBgColor(undefined);
      return;
    }
    if (destination.droppableId === source.droppableId) {
      setTaskContainerBgColor(undefined);
      return;
    }
    const preRequirementTasks = _.clone(requirementTasks);
    const sourceTasks: API.TaskVO[] = requirementTasks[source.droppableId];
    const destinationTasks: API.TaskVO[] =
      requirementTasks[destination.droppableId];
    const clonedSourceTasks = Array.from(sourceTasks);
    let clonedDestinationTasks = Array.from(destinationTasks || []);
    clonedDestinationTasks = clonedDestinationTasks
      ? clonedDestinationTasks
      : [];
    const task = clonedSourceTasks.splice(source.index, 1)[0];
    task.taskStepId = destination.droppableId;
    clonedDestinationTasks.splice(destination.index, 0, task);
    const newRequirementTasks = _.clone(requirementTasks);
    newRequirementTasks[source.droppableId] = clonedSourceTasks;
    newRequirementTasks[destination.droppableId] = clonedDestinationTasks;
    setRequirementTasks(newRequirementTasks);
    moveTask({ id: draggableId, taskStepId: destination.droppableId })
      .catch(() => setRequirementTasks(preRequirementTasks))
      .finally(() => {
        setTaskContainerBgColor(undefined);
      });
  }

  const draggingOverBgColor = token.colorTextQuaternary;

  function handleTaskDragStart(): void {
    setTaskContainerBgColor(token.colorBgTextActive);
  }

  return (
    <DragDropContext
      onDragEnd={handleTaskDragEnd}
      onDragStart={handleTaskDragStart}
    >
      <Row
        gutter={[colGutter, 0]}
        style={{
          width: `${
            colWidth *
            (templateDetail?.taskSteps.length
              ? templateDetail?.taskSteps.length + 1
              : 1)
          }px`,
        }}
      >
        <Col flex={`${colWidth}px`}>
          <div style={{ ...containerStyle, paddingRight: 6 }}>
            {projectDetail && templateDetail && (
              <Flex justify={"space-between"}>
                <div style={{ width: colWidth - 2 * colGutter }}>
                  <RequirementCard
                    projectDetail={projectDetail}
                    template={templateDetail}
                    requirement={requirementTask}
                  />
                  <Flex justify="flex-end" align="center">
                    <TaskModal<API.AddTask>
                      template={templateDetail}
                      projectDetail={projectDetail}
                      onFinish={async (values) => {
                        values.projectId = projectDetail?.id || "";
                        values.requirementId = requirementTask.id;
                        await addTask(values).then((newTask) => {
                          const clone = _.clone(
                            requirementTasks ? requirementTasks : {}
                          );
                          let tasks = clone[templateDetail.taskSteps[0].id];
                          if (!tasks) {
                            clone[templateDetail.taskSteps[0].id] = [];
                          }
                          clone[templateDetail.taskSteps[0].id].push(newTask);
                          setRequirementTasks(clone);
                        });
                      }}
                      trigger={
                        <Button
                          size="small"
                          type="text"
                          icon={<PlusOutlined />}
                          style={{
                            marginTop: 5,
                            fontSize: 12,
                            padding: "0 8px",
                            height: 20,
                            color: token.colorPrimary,
                          }}
                        >
                          新建任务
                        </Button>
                      }
                    />
                  </Flex>
                </div>
              </Flex>
            )}
          </div>
        </Col>
        {templateDetail?.taskSteps.map((step) => {
          const tasks: API.TaskVO[] = requirementTasks?.[step.id];
          let content: any = (
            <Droppable droppableId={step.id}>
              {(droppableProvided, snapshot) => {
                const isDraggingOver = snapshot.isDraggingOver;
                return (
                  <div
                    ref={droppableProvided.innerRef}
                    style={{
                      ...containerStyle,
                      backgroundColor: isDraggingOver
                        ? draggingOverBgColor
                        : taskContainerBgColor ||
                          containerStyle.backgroundColor,
                    }}
                  >
                    {droppableProvided.placeholder}
                  </div>
                );
              }}
            </Droppable>
          );
          if (tasks && tasks.length > 0) {
            content = (
              <div style={{ height: "100%" }}>
                <Droppable droppableId={step.id}>
                  {(droppableProvided, snapshot) => {
                    const isDraggingOver = snapshot.isDraggingOver;
                    return (
                      <div
                        ref={droppableProvided.innerRef}
                        style={{
                          ...containerStyle,
                          backgroundColor: isDraggingOver
                            ? draggingOverBgColor
                            : taskContainerBgColor ||
                              containerStyle.backgroundColor,
                        }}
                      >
                        {tasks.map((task, index) => {
                          return (
                            <Draggable
                              key={task.id}
                              draggableId={task.id}
                              index={index}
                            >
                              {(draggableProvider) => {
                                return (
                                  <div
                                    style={{
                                      width: "100%",
                                      marginBottom: token.marginSM,
                                    }}
                                  >
                                    <div
                                      {...draggableProvider.draggableProps}
                                      {...draggableProvider.dragHandleProps}
                                      ref={draggableProvider.innerRef}
                                    >
                                      {projectDetail && templateDetail && (
                                        <TaskCard
                                          projectDetail={projectDetail}
                                          template={templateDetail}
                                          task={task}
                                          afterDelete={() => {
                                            if (!requirementTasks) {
                                              return;
                                            }
                                            const clone: API.TaskVO[] =
                                              Array.from(
                                                requirementTasks[step.id]
                                              );
                                            clone.splice(index, 1);
                                            const newRequirementTasks =
                                              _.clone(requirementTasks);
                                            newRequirementTasks[step.id] =
                                              clone;
                                            setRequirementTasks(
                                              newRequirementTasks
                                            );
                                          }}
                                        />
                                      )}
                                      {droppableProvided.placeholder}
                                    </div>
                                  </div>
                                );
                              }}
                            </Draggable>
                          );
                        })}
                      </div>
                    );
                  }}
                </Droppable>
              </div>
            );
          }
          return (
            <Col
              key={requirementTask.id + "_" + step.id}
              flex={`${colWidth}px`}
            >
              {content}
            </Col>
          );
        })}
      </Row>
    </DragDropContext>
  );
}

export default BoardRow;

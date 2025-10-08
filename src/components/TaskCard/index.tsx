import { TaskModal } from "@/components";
import { deleteTask, updateTask } from "@/services/flode/taskController";
import { DeleteOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Popconfirm, Tag, theme, Typography } from "antd";
import { CSSProperties, useEffect, useState } from "react";
import styles from "./index.less";

const { Text } = Typography;

type TaskCardProps = {
  style?: CSSProperties;
  projectDetail: API.ProjectDetail;
  template: API.TemplateDetail;
  task: API.TaskVO;
  afterDelete?: () => void;
  afterUpdate?: (newReq: API.TaskVO) => void;
};

function TaskCard(props: TaskCardProps) {
  const { token } = theme.useToken();
  const { projectDetail, template } = props;
  const [hoverIn, setHoverIn] = useState<boolean>(false);

  const [task, setTask] = useState<API.TaskVO>(props.task);
  const infoStyle: CSSProperties = {
    fontSize: token.sizeSM,
    color: token.colorText,
  };

  useEffect(() => {
    setTask(props.task);
  }, [props.task]);

  return (
    <Card
      hoverable
      size="small"
      className={styles.taskCard}
      onMouseEnter={() => setHoverIn(true)}
      onMouseLeave={(event) => {
        if (event.relatedTarget !== window) {
          setHoverIn(false);
        }
      }}
      styles={{
        body: {
          padding: 6,
        },
      }}
      style={{
        borderColor: token.colorTextTertiary,
        ...props.style,
      }}
    >
      <Flex vertical gap={3}>
        <Text style={{ fontWeight: 500 }} ellipsis={{ tooltip: task.title }}>
          {task.title}
        </Text>
        <Text style={infoStyle} ellipsis={{ tooltip: task.description }}>
          处理人：{task.handler}
        </Text>
        <Flex justify={"space-between"} align={"center"} style={{ height: 24 }}>
          <Tag
            bordered={false}
            color={token.colorFillSecondary}
            style={infoStyle}
          >
            {template.taskTypes.find((t) => t.id === task.typeId)?.name}
          </Tag>
          {hoverIn && (
            <div>
              <TaskModal<API.UpdateTask>
                task={task}
                template={template}
                projectDetail={projectDetail}
                onCancel={() => setHoverIn(false)}
                trigger={
                  <Button
                    size="small"
                    type="text"
                    icon={<UnorderedListOutlined />}
                  />
                }
                onFinish={async (values) => {
                  const newTask = { ...task, ...values };
                  await updateTask(newTask).then(() =>
                    props.afterUpdate?.(newTask)
                  );
                  newTask.handler = projectDetail.members?.find(
                    (m) => m.id === newTask.handlerId
                  )?.username;
                  setTask(newTask);
                }}
              />
              <Popconfirm
                title={"确定删除该任务吗"}
                onConfirm={() => {
                  deleteTask({ id: task.id }).then(() => props.afterDelete?.());
                }}
              >
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </div>
          )}
        </Flex>
      </Flex>
    </Card>
  );
}

export default TaskCard;

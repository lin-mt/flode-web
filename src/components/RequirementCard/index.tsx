import RequirementModal from "@/components/RequirementModal";
import {
  deleteRequirement,
  updateRequirement,
} from "@/services/flode/requirementController";
import { DeleteOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Popconfirm, Tag, theme, Typography } from "antd";
import { CSSProperties, useEffect, useState } from "react";
import styles from "./index.less";

const { Text } = Typography;

type RequirementCardProps = {
  style?: CSSProperties;
  projectDetail: API.ProjectDetail;
  template: API.TemplateDetail;
  requirement: API.RequirementVO;
  afterDelete?: () => void;
  afterUpdate?: (newReq: API.RequirementVO) => void;
};

function RequirementCard(props: RequirementCardProps) {
  const { token } = theme.useToken();
  const { projectDetail, template } = props;
  const [hoverIn, setHoverIn] = useState<boolean>(false);

  const [requirement, setRequirement] = useState<API.RequirementVO>(
    props.requirement
  );

  useEffect(() => {
    setRequirement(props.requirement);
  }, [props.requirement]);

  const infoStyle: CSSProperties = {
    fontSize: token.sizeSM,
    color: token.colorText,
  };

  return (
    <Card
      hoverable
      size="small"
      className={styles.requirementCard}
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
        borderColor: template.requirementPriorities.find(
          (p) => p.id === requirement.priorityId
        )?.color,
        ...props.style,
      }}
    >
      <Flex vertical gap={3}>
        <Text
          style={{ fontWeight: 500 }}
          ellipsis={{ tooltip: requirement.title }}
        >
          {requirement.title}
        </Text>
        <Text style={infoStyle}>处理人：{requirement.handler}</Text>
        <Flex justify="space-between" align="center" style={{ height: 24 }}>
          <Tag color={token.colorFillSecondary} style={infoStyle}>
            {
              template.requirementTypes.find((t) => t.id === requirement.typeId)
                ?.name
            }
          </Tag>
          {hoverIn && (
            <div>
              <RequirementModal<API.UpdateRequirement>
                requirement={requirement}
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
                  const newRequirement = { ...requirement, ...values };
                  await updateRequirement(newRequirement).then(() =>
                    props.afterUpdate?.(newRequirement)
                  );
                  newRequirement.handler = projectDetail.members?.find(
                    (m) => m.id === newRequirement.handlerId
                  )?.username;
                  setRequirement(newRequirement);
                }}
              />
              <Popconfirm
                title={"确定删除该需求吗"}
                onConfirm={() => {
                  deleteRequirement({ id: requirement.id }).then(() =>
                    props.afterDelete?.()
                  );
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

export default RequirementCard;

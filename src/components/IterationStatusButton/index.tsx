import { updateIterationStatus } from "@/services/flode/iterationController";
import { PlanningStatusType } from "@/util/Utils";
import { ForwardFilled, PauseOutlined } from "@ant-design/icons";
import { Button } from "antd";

const IterationStatusButton = ({
  id,
  status,
  afterUpdate,
}: {
  id?: string;
  status?: PlanningStatusType;
  afterUpdate?: () => void;
}) => {
  if (!id) {
    return <></>;
  }

  function handleUpdateIterationStatus(nextStatus: PlanningStatusType) {
    if (!id) {
      return;
    }
    updateIterationStatus({
      id,
      nextStatus,
    }).then(() => {
      if (afterUpdate) {
        afterUpdate();
      }
    });
  }

  return (
    <>
      {(status === "PLANNED" || status === "DONE") && (
        <Button
          color={"primary"}
          variant={"filled"}
          icon={<ForwardFilled />}
          onClick={() => handleUpdateIterationStatus("ONGOING")}
        >
          开始
        </Button>
      )}
      {status === "ONGOING" && (
        <Button
          color={"orange"}
          variant={"filled"}
          icon={<PauseOutlined />}
          onClick={() => handleUpdateIterationStatus("DONE")}
        >
          结束
        </Button>
      )}
    </>
  );
};

export default IterationStatusButton;

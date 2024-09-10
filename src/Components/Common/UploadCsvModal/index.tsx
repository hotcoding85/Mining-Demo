import { InboxOutlined } from "@ant-design/icons";
import { Select, Spin, Steps } from "antd";
import Dragger from "antd/es/upload/Dragger";
import { capitalize } from "lodash";
import { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

interface UploadCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (type: string, file: any) => void;
}

const UploadCsvModal: React.FC<UploadCsvModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [step, setStep] = useState<number>(0);
  const [type, setType] = useState<string>("user");

  useEffect(() => {
    setStep(0);
    setType("user");
  }, [isOpen]);

  const haneleChange = (value: any, option: any) => {
    setType(value);
    setStep(step + 1);
  };

  const handleCsvFileDrop = (file) => {
    if (type) {
      onUpload(type, file);
      setStep(step + 1);
    }
    return false;
  };

  const stepsContent = [
    {
      title: step > 0 ? capitalize(type) : "Data source",
      content: (
        <Select
          onChange={haneleChange}
          style={{ width: 220 }}
          placeholder="Select data source"
        >
          <Select.Option value="user">User</Select.Option>
          <Select.Option value="fleet">Fleet</Select.Option>
          <Select.Option value="material">Material</Select.Option>
        </Select>
      ),
    },
    {
      title: "Upload CSV File",
      content: (
        <Dragger
          name="benchUpload"
          multiple={false}
          accept={".csv"}
          beforeUpload={handleCsvFileDrop}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload benches {".csv"} file
          </p>
        </Dragger>
      ),
    },
    {
      title: "Validate File",
      content: (
        <div className="d-flex flex-column align-items-center gap-2">
          <Spin size="large" />
          <p>Validating...</p>
        </div>
      ),
    },
  ];

  const renderSteps = () =>
    stepsContent.map((step) => ({
      key: step.title,
      title: step.title,
    }));

  return (
    <Modal isOpen={isOpen} className="import-file-modal">
      <ModalHeader
        tag="h4"
        close={<span className="mdi mdi-close noti-icon" onClick={onClose} />}
      >
        <h4 className="modal-title">Upload CSV data</h4>
      </ModalHeader>
      <ModalBody>
        <Steps current={step} items={renderSteps()} />
        <div
          className="mt-3 d-flex justify-content-center align-items-center"
          style={{ width: "100%", minHeight: "150px" }}
        >
          {stepsContent[step].content}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default UploadCsvModal;

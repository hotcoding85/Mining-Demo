import React from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { InboxOutlined } from "@ant-design/icons";
import { Steps, Upload, Spin } from "antd";
import "./index.css";

const { Dragger } = Upload;

interface ImportFileModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: any) => void;
  stepOneTitle?: string;
  stepSecTitle?: string;
  isUploading?: boolean;
  accept?: string;
}

const ImportFileModal: React.FC<ImportFileModalProps> = ({
  title,
  isOpen,
  onClose,
  onUpload,
  stepOneTitle,
  stepSecTitle,
  isUploading = false,
  accept,
}) => {
  const handleCsvFileDrop = (file) => {
    onUpload(file);
    return false;
  };

  const stepsContent = [
    {
      title: stepOneTitle || "Upload File",
      content: (
        <Dragger
          name="benchUpload"
          multiple={false}
          accept={accept || ".csv"}
          beforeUpload={handleCsvFileDrop}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click to select or drag a {accept || ".csv"}{" "}file to this area to upload
          </p>
        </Dragger>
      ),
    },
    {
      title: stepSecTitle || "Validate File",
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
        close={<span className="mdi mdi-close noti-icon" onClick={onClose} />} className="d-flex justify-content-between" 
      >
        <h4 className="modal-title">{title}</h4>
      </ModalHeader>
      <ModalBody>
        <Steps current={isUploading ? 1 : 0} items={renderSteps()} />
        <div
          className="mt-3 d-flex justify-content-center align-items-center"
          style={{ width: "100%", minHeight: "150px" }}
        >
          {stepsContent[isUploading ? 1 : 0].content}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ImportFileModal;

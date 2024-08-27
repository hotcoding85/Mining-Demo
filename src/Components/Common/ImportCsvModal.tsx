import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { InboxOutlined } from "@ant-design/icons";
import { Steps, Upload, Spin } from "antd";
import { csvFileToJson } from "utils/csvConverter";

const { Dragger } = Upload;

interface ImportCsvModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: any) => void;
}

const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  title,
  isOpen,
  onClose,
  onUpload,
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleCsvFileDrop = (file) => {
    csvFileToJson(file, async (data: any) => {
      setIsUploading(true);
      await onUpload(data);
      onClose();
      setIsUploading(false);
    });
    return false;
  };

  const stepsContent = [
    {
      title: "Upload Benchs",
      content: (
        <Dragger
          name="benchUpload"
          multiple={false}
          accept=".csv,.str"
          beforeUpload={handleCsvFileDrop}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload benches CSV file
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
    <Modal isOpen={isOpen}>
      <ModalHeader
        tag="h4"
        close={<button className="close" onClick={onClose} type="button" />}
      >
        {title}
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

export default ImportCsvModal;

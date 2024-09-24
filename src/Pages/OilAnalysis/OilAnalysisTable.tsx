import React, { useState } from "react";
import {
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalFooter,
  Button,
} from "reactstrap";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { CloseCircleOutlined } from "@ant-design/icons";
import { FaCogs } from "react-icons/fa";
import { Space } from "antd";
import Table from "Components/Common/Table";
const OilAnalysisTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const navigate = useNavigate();

  const columns = [
    {
      title: "Machine ID",
      dataIndex: "machineId",
      key: "machineId",
      dataType: "string",
    },
    {
      title: "Viscosity",
      dataIndex: "viscosity",
      key: "viscosity",
      dataType: "string",
    },
    {
      title: "Wear Metals",
      dataIndex: "wearMetals",
      key: "wearMetals",
      dataType: "date",
    },
    {
      title: "Water Content",
      dataIndex: "waterContent",
      key: "waterContent",
      dataType: "date",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      dataType: "string",
      render: (text) => {
        return handleStatus(text);
      },
    },
    {
      title: "View Report",
      key: "viewReport",
      render: (_, record) => (
        <Space size="middle">
          <i onClick={() => toggleModal(record)} className="fas fa-eye"></i>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: "DT106",
      machineId: "DT106",
      viscosity: "Low",
      wearMetals: "07/11/24",
      waterContent: "07/11/24",
      status: "Caution",
    },
    {
      key: "DT106",
      machineId: "DT106",
      viscosity: "Medium",
      wearMetals: "07/11/24",
      waterContent: "07/11/24",
      status: "Normal",
    },
    {
      key: "DT106",
      machineId: "DT106",
      viscosity: "Unknown",
      wearMetals: "07/11/24",
      waterContent: "07/11/24",
      status: "Critical",
    },
    {
      key: "DT101",
      machineId: "DT101",
      viscosity: "Recently Tested",
      wearMetals: "07/11/24",
      waterContent: "07/11/24",
      status: "Normal",
    },
    {
      key: "DT106",
      machineId: "DT106",
      viscosity: "Unknown",
      wearMetals: "07/11/24",
      waterContent: "07/11/24",
      status: "Normal",
    },
    {
      key: "DT106",
      machineId: "DT106",
      viscosity: "Unknown",
      wearMetals: "07/11/24",
      waterContent: "07/11/24",
      status: "Normal",
    },
    {
      key: "DT106",
      machineId: "DT106",
      viscosity: "Unknown",
      wearMetals: "07/11/24",
      waterContent: "07/11/24",
      status: "Normal",
    },
  ];

  const toggleModal = (rowData: any) => {
    setSelectedData(rowData);
    setIsModalOpen(!isModalOpen);
  };

  const openDetailedReportPage = () => {
    setIsModalOpen(false);
    navigate("/oil-analysis-report", { state: { selectedData } });
  };

  const handleStatus = (status) => {
    if (status === "Critical") {
      return <span className="status critical">{status}</span>;
    } else if (status === "Caution") {
      return <span className="status caution">{status}</span>;
    } else {
      return <span className="status normal">{status}</span>;
    }
  };

  return (
    <div>
      <Card className="oil-analysis-card">
        <CardBody>
          <h2 className="mb-4">Oil Analysis Report</h2>
          <Table columns={columns} data={data} paginationPageSize={5} />
        </CardBody>
      </Card>

      {/* Modal */}
      {selectedData && (
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          className="oil-analysis-modal"
        >
          <ModalBody>
            <div className="d-flex justify-content-end">
              <CloseCircleOutlined
                style={{ fontSize: "180%" }}
                onClick={toggleModal}
              />
            </div>
            <div className="modal-header-content">
              <p>
                <FaCogs />
                Machine ID: {selectedData.machineId}
              </p>
              <p>
                <FaCogs />
                Operator Name: nisl consectetur
              </p>
            </div>
            <div className="modal-details-content">
              <p>
                <strong>Evaluation:</strong> nisi consectetur
              </p>
              <p>
                <strong>Sample Number:</strong> 87966644000123
              </p>
              <p>
                <strong>Status:</strong> {handleStatus(selectedData.status)}
              </p>
              <p>
                <strong>Registration:</strong> 6759903322
              </p>
              <p>
                <strong>Sampled:</strong> 07/11/24
              </p>
              <p>
                <strong>Evaluated:</strong> 07/11/24
              </p>
              <p>
                <strong>Unit Hours:</strong> 78690
              </p>
              <p>
                <strong>Comp. Hours:</strong> 67890
              </p>
              <p>
                <strong>Oil Hours:</strong> 56789
              </p>
              <p>
                <strong>Oil Make:</strong> FUCHS
              </p>
              <p>
                <strong>Oil Type:</strong> 07/11/24
              </p>
              <p>
                <strong>Oil Grade:</strong> 07/11/24
              </p>
              <p>
                <strong>Oil Changed:</strong> No
              </p>
              <p>
                <strong>Job Number:</strong> 8907668
              </p>
            </div>
          </ModalBody>
          <ModalFooter className="modal-footer-custom">
            <Button
              color="primary"
              className="oil-report-btn"
              onClick={openDetailedReportPage}
            >
              Oil Analysis Report
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default OilAnalysisTable;

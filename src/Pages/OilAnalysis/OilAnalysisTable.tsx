import React, { useMemo, useState } from "react";
import {
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  Col,
} from "reactstrap";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { CloseCircleOutlined } from "@ant-design/icons";
import { FaCogs } from "react-icons/fa";
import { Input, Space } from "antd";
import Table from "Components/Common/Table";
const OilAnalysisTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [data] = useState([
    {
      key: "DT101",
      machineId: "DT101",
      viscosity: "Low",
      wearMetals: "07/11/24",
      waterContent: "07/11/24",
      status: "Caution",
    },
    {
      key: "DT102",
      machineId: "DT102",
      viscosity: "Medium",
      wearMetals: "07/11/24",
      waterContent: "07/11/24",
      status: "Normal",
    },
    {
      key: "DT103",
      machineId: "DT103",
      viscosity: "Unknown",
      wearMetals: "07/11/24",
      waterContent: "07/11/24",
      status: "Critical",
    },
    {
      key: "DT104",
      machineId: "DT104",
      viscosity: "Recently Tested",
      wearMetals: "07/11/24",
      waterContent: "07/11/24",
      status: "Normal",
    },
    {
      key: "DT105",
      machineId: "DT105",
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
      key: "DT107",
      machineId: "DT107",
      viscosity: "Unknown",
      wearMetals: "07/11/24",
      waterContent: "07/11/24",
      status: "Normal",
    },
  ]);

  const columns: any = useMemo(
    () => [
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
    ],
    []
  );

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

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const result = data.filter((item) =>
      columns.some((col) =>
        String(item[col.dataIndex])
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
    return result;
  }, [data, searchTerm, columns]);

  return (
    <div>
      <Card className="oil-analysis-card">
        <CardBody>
          <h2 className="mb-4">Oil Analysis Report</h2>
          <Col sm={4}>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: 16 }}
              allowClear
            />
          </Col>
          <Table
            columns={columns}
            data={filteredData || []}
            paginationPageSize={5}
          />
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

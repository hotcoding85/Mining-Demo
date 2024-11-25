import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  Col,
  Row,
} from "reactstrap";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import { CloseCircleOutlined } from "@ant-design/icons";
import { FaCogs } from "react-icons/fa";
import { Input, Space } from "antd";
import Table from "Components/Common/Table";
import { PiClockClockwiseLight } from "react-icons/pi";
import dayjs, { Dayjs } from "dayjs";
const OilAnalysisTable = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [startDate, setStartDate] = React.useState(props.startDate);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const status = [
    'Normal',
    'Query',
    'Caution',
    'Action',
    'Critical'
  ]
  function generateRandomDate(startDate): string {
    console.log(startDate)
    return startDate.toLocaleDateString("en-GB"); // Format: DD/MM/YY
  }
  
  function getRandomFromArray<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  function generateDynamicData(count: number, startDate: string): any[] {
    const statuses = ["Normal", "Query", "Caution", "Action", "Critical"];
    const waterContents = ["Caution", "Critical", "Optimal"];
    const viscosities = ["Low", "Medium", "Unknown", "Recently Tested"];
  
    return Array.from({ length: count }, (_, i) => {
      const prefix = i % 2 === 0 ? "DT10" : "DT12"; // Alternate between DT10? and DT12?
      const machineId = `${prefix}${Math.floor(i / 2) + 1}`; // Generate IDs like DT101, DT121, DT102, DT122, etc.
      return {
        key: machineId,
        machineId: machineId,
        viscosity: getRandomFromArray(viscosities),
        wearMetals: generateRandomDate(startDate),
        waterContent: getRandomFromArray(waterContents),
        status: getRandomFromArray(statuses),
      };
    });
  }
  
  // Example usage
  const [data, setData] = useState<any[]>([])
  useEffect(() => {
    const dynamicData = generateDynamicData(6, props.startDate); // Generate 10 entries
    setData(dynamicData)
  }, [props.startDate])

  const columns: any = useMemo(
    () => [
      {
        title: "Machine ID",
        dataIndex: "machineId",
        key: "machineId",
        dataType: "string",
        render: (_, record) => {
          return MachineId(_, record);
        },
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

  const MachineId = (text, rowData: any) => {
    if (rowData.status === "Critical") {
      return <><div>{text}</div><div style={{color: 'grey', fontSize: '11px'}}><PiClockClockwiseLight />Recently Viewed</div></>;
    } else if (rowData.status === "Caution") {
      return <><div>{text}</div><div style={{color: 'grey', fontSize: '11px'}}><PiClockClockwiseLight />Last seen: {dayjs(startDate).toISOString().substring(0, 10)}</div></>;
    } else {
      return <><div>{text}</div><div style={{color: 'grey', fontSize: '11px'}}><PiClockClockwiseLight />Last seen: {dayjs(startDate).toISOString().substring(0, 10)}</div></>;
    }
    
  }

  const toggleModal = useCallback((rowData: any) => {
    setSelectedData(rowData);
    props.setSelectedData(rowData)
    // setIsModalOpen(!isModalOpen);
    navigate(`/oil-analysis/${rowData.machineId}`, {state: {rowData}});
  }, [startDate])

  const openDetailedReportPage = () => {
    setIsModalOpen(false);
    navigate(`/oil-analysis/${selectedData.machineId}`, {state: {selectedData}});
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
    <Row>
      <Card className="oil-analysis-card">
        <CardBody>
          <h2 className="mb-4">Report</h2>
          <Col sm={4}>
            {/* <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: 16 }}
              allowClear
            /> */}
          </Col>
          <Table
            columns={columns}
            data={filteredData || []}
            paginationPageSize={10}
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
    </Row>
  );
};

export default OilAnalysisTable;

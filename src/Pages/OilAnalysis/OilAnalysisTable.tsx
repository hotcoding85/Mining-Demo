import React, { useState } from "react";
import { Card, CardBody, Modal, ModalBody, ModalFooter, Button } from "reactstrap";
import './index.css';
import { useNavigate } from "react-router-dom";
import { CloseCircleOutlined } from "@ant-design/icons";
import { FaCogs } from "react-icons/fa";
const OilAnalysisTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const navigate = useNavigate();
  

  const data = [
    { id: 'DT106', viscosity: 'nisi consr', wearMetals: '07/11/24', waterContent: '07/11/24', status: 'Caution' },
    { id: 'DT106', viscosity: 'nisi cons', wearMetals: '07/11/24', waterContent: '07/11/24', status: 'Normal' },
    { id: 'DT106', viscosity: '', wearMetals: '07/11/24', waterContent: '07/11/24', status: 'Critical' },
    { id: 'DT101', viscosity: 'Recently Tested', wearMetals: '07/11/24', waterContent: '07/11/24', status: 'Normal' },
    { id: 'DT106', viscosity: '', wearMetals: '07/11/24', waterContent: '07/11/24', status: 'Normal' },
    { id: 'DT106', viscosity: '', wearMetals: '07/11/24', waterContent: '07/11/24', status: 'Normal' },
    { id: 'DT106', viscosity: '', wearMetals: '07/11/24', waterContent: '07/11/24', status: 'Normal' },
  ];

  const toggleModal = (rowData: any) => {
    setSelectedData(rowData);
    setIsModalOpen(!isModalOpen);
  };

  const openDetailedReportPage = () => {
    setIsModalOpen(false); 
    navigate("/oil-analysis-report",{ state: { selectedData } });; 
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Caution':
        return 'status caution';
      case 'Normal':
        return 'status normal';
      case 'Critical':
        return 'status critical';
      default:
        return '';
    }
  };

  return (
    <div>
      <Card className="oil-analysis-card">
        <CardBody>
          <h2 className="text-center mb-4">Oil Analysis Report</h2>
          <div className="table-responsive oil-analysis-scrollable">
            <table className="oil-analysis-table">
              <thead>
                <tr>
                  <th>Machine ID</th>
                  <th>Viscosity</th>
                  <th>Wear Metals</th>
                  <th>Water Content</th>
                  <th>Status</th>
                  <th>View Report</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className={row.id === 'DT101' ? 'highlighted-row' : ''} onClick={() => toggleModal(row)}>
                    <td>{row.id}</td>
                    <td>{row.viscosity}</td>
                    <td>{row.wearMetals}</td>
                    <td>{row.waterContent}</td>
                    <td className={getStatusClass(row.status)}>{row.status}</td>
                    <td><i className="fas fa-eye"></i></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Modal */}
      {selectedData && (
        <Modal isOpen={isModalOpen} toggle={toggleModal} className="oil-analysis-modal">
          <ModalBody>
            <div className="d-flex justify-content-end"><CloseCircleOutlined style={{fontSize: '180%'}} onClick={toggleModal}/></div>
            <div className="modal-header-content">
              <p><FaCogs />Machine ID: {selectedData.id}</p>
              <p><FaCogs />Operator Name: nisl consectetur</p>
            </div>
            <div className="modal-details-content">
              <p><strong>Evaluation:</strong> nisi consectetur</p>
              <p><strong>Sample Number:</strong> 87966644000123</p>
              <p><strong>Status:</strong> <span className={getStatusClass(selectedData.status)}>{selectedData.status}</span></p>
              <p><strong>Registration:</strong> 6759903322</p>
              <p><strong>Sampled:</strong> 07/11/24</p>
              <p><strong>Evaluated:</strong> 07/11/24</p>
              <p><strong>Unit Hours:</strong> 78690</p>
              <p><strong>Comp. Hours:</strong> 67890</p>
              <p><strong>Oil Hours:</strong> 56789</p>
              <p><strong>Oil Make:</strong> FUCHS</p>
              <p><strong>Oil Type:</strong> 07/11/24</p>
              <p><strong>Oil Grade:</strong> 07/11/24</p>
              <p><strong>Oil Changed:</strong> No</p>
              <p><strong>Job Number:</strong> 8907668</p>
            </div>
          </ModalBody>
          <ModalFooter className="modal-footer-custom">
          <Button color="primary" className="oil-report-btn" onClick={openDetailedReportPage}>
          Oil Analysis Report
        </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default OilAnalysisTable;

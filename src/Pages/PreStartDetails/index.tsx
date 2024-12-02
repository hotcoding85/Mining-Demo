import React, { useState } from "react";
import { Card, CardBody, Col, Container, Row, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Badge } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import 'Pages/PreStartDetails/style.scss';

// Manual imports of images
import img1 from "../../assets/images/Generated images.png";
import img2 from "../../assets/images/Generated images.png";
import img3 from "../../assets/images/Generated images.png";
import img4 from "../../assets/images/Generated images.png";
import img5 from "../../assets/images/Generated images.png";
import img6 from "../../assets/images/Generated images.png";
import img7 from "../../assets/images/Generated images.png";
import img8 from "../../assets/images/Generated images.png";
import img9 from "../../assets/images/Generated images.png";
import img10 from "../../assets/images/Generated images.png";
import img11 from "../../assets/images/Generated images.png";
import img12 from "../../assets/images/Generated images.png";
import img13 from "../../assets/images/Generated images.png";
import { DownOutlined, FileImageOutlined, FileOutlined, UpOutlined, WarningOutlined } from "@ant-design/icons";
interface ChecklistItem {
    id: string;
    description: string;
    status: 'pass' | 'fail' | 'inspectionRequired';
    note?: any;
    images?: number;
}

const PreStartsDetails = (props: any) => {
    document.title = "Pre Starts | FMS Live";

    const [modal, setModal] = useState(false);

    const [attentionList, setAttentionList] = useState<ChecklistItem[]>([
        { id: '1', description: 'IF FITTED WITH HYDRAULICS : Rams, Hoses, leaks, connections, wear, fluid.', status: 'pass' },
        { id: '2', description: 'IF FITTED WITH HYDRAULICS : Rams, Hoses, leaks, connections, wear, fluid.', status: 'fail' },
        // Add more items as needed
    ]);

    const [checklist, setChecklist] = useState<any>([
        { id: "10", description: "WEAR, DAMAGE AND LEAKS: Structure, accident damage guard, tip body.", status: 'inspectionRequired', note: generateRandomString(), images: getRandomNumber() },
        { id: "11", description: "HYDRAULICS: Rams, Hoses, leaks, connections, wear, fluid.", status: 'pass', note: generateRandomString(), images: getRandomNumber() },
        { id: "12", description: "WHEELS, TYRES: nuts, pressure and tread Wear", status: 'fail', note: generateRandomString(), images: getRandomNumber() },
        { id: "13", description: "TRAILER: Warning decals, towing hitch, tip body, body prop", status: 'pass', note: generateRandomString(), images: getRandomNumber() },
        { id: "14", description: "FLUIDS: Oil, coolant, fuel, battery, wiper water", status: 'fail', note: generateRandomString(), images: getRandomNumber() },
        { id: "15", description: "CABIN: access, seats, seat belts, loose objects, visibility", status: 'pass', note: generateRandomString(), images: getRandomNumber() },
        { id: "16", description: "BRAKES: part brake, service brake, drain air tank.", status: 'fail', note: generateRandomString(), images: getRandomNumber() },
        { id: "17", description: "CONTROLS: Steering, pedals, reverse lights, brake lights.", status: 'pass', note: generateRandomString(), images: getRandomNumber() },
        { id: "18", description: "OTHER CONTROLS: hoist control, tail gate control.", status: 'pass', note: generateRandomString(), images: getRandomNumber() },
        { id: "19", description: "WARNING DEVICES: Horn, reversing beeper, alarms.", status: 'fail', note: generateRandomString(), images: getRandomNumber() },
        { id: "20", description: "OTHER: number plates, operational manual, fire extinguisher.", status: 'fail', note: null, images: getRandomNumber() }
    ]);
    // Helper function to generate a random string (e.g., 28 characters)
    function generateRandomString(): string | null {
        const randomValue = Math.random();
        if (randomValue < 0.3) return null; // 30% chance to return null
        if (randomValue < 0.6) return ''; // 30% chance to return an empty string
        return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur scelerisque quam ac purus tincidunt, vel feugiat lorem volutpat. Vivamus ut lectus purus. Quisque consectetur sem nec odio consequat, in vehicula sapien viverra.";
    }
    // Helper function to get a random number between 1 and 9
    function getRandomNumber(): number {
        return Math.floor(Math.random() * 9) + 1; // Generates a number between 1 and 9
    }
    const toggleModal = () => setModal(!modal);
    checklist.map(item => {
    })
    // Array of images
    const images = [
        { src: img1, altText: 'Image 1' },
        { src: img2, altText: 'Image 2' },
        { src: img3, altText: 'Image 3' },
        { src: img4, altText: 'Image 4' },
        { src: img5, altText: 'Image 5' },
        { src: img6, altText: 'Image 6' },
        { src: img7, altText: 'Image 7' },
        { src: img8, altText: 'Image 8' },
        { src: img9, altText: 'Image 9' },
        { src: img10, altText: 'Image 10' },
        { src: img11, altText: 'Image 11' },
        { src: img12, altText: 'Image 12' },
        { src: img13, altText: 'Image 13' }
    ];

    // State to track the dropdown for each checklist item
    const [dropdownOpen1, setDropdownOpen1] = useState(false);
    const [dropdownOpen2, setDropdownOpen2] = useState(false);

    const toggleDropdown1 = () => setDropdownOpen1(!dropdownOpen1);
    const toggleDropdown2 = () => setDropdownOpen2(!dropdownOpen2);

    // State to track the index of the first visible image
    const [startIndex, setStartIndex] = useState(0);

    // Number of images to show at a time
    const visibleImagesCount = 7;

    // Function to handle the "Next" button
    const handleNext = () => {
        if (startIndex + visibleImagesCount < images.length) {
            setStartIndex(startIndex + visibleImagesCount);
        }
    };

    // Function to handle the "Prev" button
    const handlePrev = () => {
        if (startIndex - visibleImagesCount >= 0) {
            setStartIndex(startIndex - visibleImagesCount);
        }
    };

    // Get the visible images based on the start index
    const visibleImages = images.slice(startIndex, startIndex + visibleImagesCount);
    const handleRadioChange = (id: string, status: 'pass' | 'fail' | 'inspectionRequired') => {
        setAttentionList(prevState =>
          prevState.map(item =>
            item.id === id ? { ...item, status } : item
          )
        );
    };
    const handleRadioTableChange = (id: string, status: 'pass' | 'fail' | 'inspectionRequired') => {
        console.log(status)
        setChecklist(prevState =>
          prevState.map(item =>
            item.id === id ? { ...item, status } : item
          )
        );
    };
    const [showModal, setShowModal] = useState(false);
    const handleImageClick = () => {
        setShowModal(true);
    };
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const handleExpandToggle = (id: string) => {
        setExpandedRow(prevRow => (prevRow === id ? null : id)); // Toggle expand/collapse
    };

    const [expandedTableRow, setExpandedTableRow] = useState<string | null>(null);
    const [inspectionList, setInspectionList] = useState<any[]>(['12', '17'])
    const [attentionInspectionList, setAttentionInspectionList] = useState<any[]>(['1'])
    const handleExpandTableToggle = (id: string) => {
        setExpandedTableRow(prevRow => (prevRow === id ? null : id)); // Toggle expand/collapse
    };
    const inspectionChange = (event, id) => {
        setInspectionList(prevList => {
            if (prevList.includes(id)) {
                // If id exists in the list, remove it
                return prevList.filter(item => item !== id);
            } else {
                // If id doesn't exist, add it
                return [...prevList, id];
            }
        });
    }
    const attentionCheckListChanged = (id) => {
        setAttentionInspectionList(prevList => {
            if (prevList.includes(id)) {
                // If id exists in the list, remove it
                return prevList.filter(item => item !== id);
            } else {
                // If id doesn't exist, add it
                return [...prevList, id];
            }
        });
    }
    const [startModalIndex, setStartModalIndex] = useState(0);

    const handleClose = () => {
        setShowModal(false);
    };

    const handleModalPrev = () => {
    if (startModalIndex > 0) setStartModalIndex(startModalIndex - 1);
    };

    const handleModalNext = () => {
    if (startModalIndex < images.length - 1) setStartModalIndex(startModalIndex + 1);
    };

    const visibleModalImages = [images[startModalIndex]]; // Only show the current image

    return (
        <>
            {/* First Banner: Attention Needed & Schedule Maintenance */}
            <Card className="banner-card">
                <div className="attention-banner-container">
                    <div className="attention-banner d-flex">
                        <WarningOutlined />
                        <div className="checkedlist-title">Attention Needed</div>
                    </div>
                    <Button className="schedule-button" onClick={toggleModal}>
                        + Schedule Maintenance
                    </Button>
                </div>
                {/* Popup Modal */}
                <Modal isOpen={modal} toggle={toggleModal}>
                    <ModalHeader toggle={toggleModal}>Schedule Maintenance</ModalHeader>
                    <ModalBody>
                        <Form>
                            <FormGroup>
                                <Label for="equipment">Equipment</Label>
                                <Input type="text" id="equipment" placeholder="Enter equipment" />
                            </FormGroup>
                            <FormGroup>
                                <Label for="datetime">Date & Time Range Selection</Label>
                                <Input type="datetime-local" id="datetime" />
                            </FormGroup>
                            <FormGroup>
                                <Label for="technicians">Technicians</Label>
                                <Input type="text" id="technicians" placeholder="Enter technician names" />
                            </FormGroup>
                            <FormGroup>
                                <Label for="workLocation">Work Location</Label>
                                <Input type="text" id="workLocation" placeholder="Enter work location" />
                            </FormGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={toggleModal}>Cancel</Button>
                        <Button color="primary" onClick={() => { /* Handle Schedule action */ toggleModal(); }}>
                            Schedule
                        </Button>
                    </ModalFooter>
                </Modal>
                <Row style={{margin: '2rem', width: '100%'}}>
                    
                    <table className="pre-start-detail-checklist-table">
                        <thead>
                            <tr>
                                <th style={{width: '50%'}}>Checklist</th>
                                <th style={{width: '15%'}}>Pass</th>
                                <th style={{width: '15%'}}>Fail</th>
                                <th style={{width: '20%'}}>Inspection Required</th>
                            </tr>
                        </thead>
                        <tbody>
                        {attentionList.map(item => (
                            <React.Fragment key={item.id}>
                            <tr key={item.id}>
                                <td>{item.description}</td>
                                <td>
                                <div className="custom-radio pass">
                                    <input
                                    id={`pass-${item.id}`}
                                    type="radio"
                                    name={`check-${item.id}`}
                                    checked={item.status === 'pass'}
                                    onChange={() => handleRadioChange(item.id, 'pass')}
                                    />
                                    <label htmlFor={`pass-${item.id}`}></label>
                                </div>
                                </td>
                                <td>
                                <div className="custom-radio fail">
                                    <input
                                    id={`fail-${item.id}`}
                                    type="radio"
                                    name={`check-${item.id}`}
                                    checked={item.status === 'fail'}
                                    onChange={() => handleRadioChange(item.id, 'fail')}
                                    />
                                    <label htmlFor={`fail-${item.id}`}></label>
                                </div>
                                </td>
                                <td>
                                    <div className="custom-checkbox">
                                        <input
                                            name={`expand-${item.id}`}
                                            type="checkbox"
                                            onChange={() => {attentionCheckListChanged(item.id)}}
                                            checked={attentionInspectionList.includes(item.id)}
                                        />
                                        <label  style={{marginBottom: 0}} onClick={() => handleExpandToggle(item.id)}>
                                        View Attachments{expandedRow === item.id ? <UpOutlined /> : <DownOutlined />}
                                        </label>
                                    </div>
                                </td>
                            </tr>
                            {expandedRow === item.id && (
                                <tr className="expanded-row">
                                  <td colSpan={1}>
                                    <div className="expanded-content">
                                        <h6>Notes</h6>
                                            <div className="notes-content">
                                                <p>
                                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur scelerisque quam ac purus tincidunt, vel feugiat lorem volutpat. Vivamus ut lectus purus. Quisque consectetur sem nec odio consequat, in vehicula sapien viverra.
                                                </p>
                                                <p>
                                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur scelerisque quam ac purus tincidunt, vel feugiat lorem volutpat. Vivamus ut lectus purus. Quisque consectetur sem nec odio consequat, in vehicula sapien viverra.
                                                </p>
                                                <p>
                                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur scelerisque quam ac purus tincidunt, vel feugiat lorem volutpat. Vivamus ut lectus purus. Quisque consectetur sem nec odio consequat, in vehicula sapien viverra.
                                                </p>
                                                <p>
                                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur scelerisque quam ac purus tincidunt, vel feugiat lorem volutpat. Vivamus ut lectus purus. Quisque consectetur sem nec odio consequat, in vehicula sapien viverra.
                                                </p>
                                                <p>
                                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur scelerisque quam ac purus tincidunt, vel feugiat lorem volutpat. Vivamus ut lectus purus. Quisque consectetur sem nec odio consequat, in vehicula sapien viverra.
                                                </p>
                                                <p>
                                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur scelerisque quam ac purus tincidunt, vel feugiat lorem volutpat. Vivamus ut lectus purus. Quisque consectetur sem nec odio consequat, in vehicula sapien viverra.
                                                </p>
                                            </div>
                                    </div>
                                  </td>
                                  <td colSpan={3}>
                                    <div className="expanded-content">
                                        <h6 style={{textAlign: 'left'}}>View Images</h6>
                                            <div className="d-flex align-items-center justify-content-center">
                                                <Button
                                                    onClick={handlePrev}
                                                    disabled={startIndex === 0}
                                                    className="gallery-nav"
                                                >
                                                    &lt;
                                                </Button>

                                                <div className="image-gallery" onClick={handleImageClick}>
                                                    {visibleImages.map((image, index) => (
                                                        <div key={index} className="image-item">
                                                            <img src={image.src} alt={image.altText} className="img-fluid" />
                                                        </div>
                                                    ))}
                                                </div>

                                                <Button
                                                    onClick={handleNext}
                                                    disabled={startIndex + visibleImagesCount >= images.length}
                                                    className="gallery-nav"
                                                >
                                                    &gt;
                                                </Button>
                                            </div>
                                    </div>
                                  </td>
                                </tr>
                            )}
                            </React.Fragment>
                            ))}
                            {
                                <Modal open={showModal}>
                                <div className="prestart-detail-modal-content">
                                    <div className="prestart-detail-modal-header">
                                        <span className="close" onClick={handleClose}></span>
                                        <h6 style={{ textAlign: 'left' }}>View Images</h6>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                    <Button
                                        onClick={handleModalPrev}
                                        disabled={startModalIndex === 0}
                                        className="gallery-nav"
                                    >
                                        &lt;
                                    </Button>

                                    <div className="image-gallery1">
                                        {visibleModalImages.map((image, index) => (
                                        <div key={index} className="image-item1">
                                            <img src={image.src} alt={image.altText} className="img-fluid" />
                                        </div>
                                        ))}
                                    </div>

                                    <Button
                                        onClick={handleModalNext}
                                        disabled={startModalIndex + 1 >= images.length}
                                        className="gallery-nav"
                                    >
                                        &gt;
                                    </Button>
                                    </div>
                                </div>
                                </Modal>
                            }
                        </tbody>
                    </table>
                </Row>
            </Card>

            {/* Checklist Section */}
            <Row >
                <Col lg="12" style={{padding:12, borderRadius: '10px'}}>
                    <Card style={{padding: 16}}>
                        <table className="pre-start-detail-checklist-table mt-2" style={{width: '100%', borderRadius: '10px'}}>
                            <thead>
                                <tr>
                                    <th style={{width: '50%'}}>Checklist</th>
                                    <th style={{width: '15%'}}>Pass</th>
                                    <th style={{width: '15%'}}>Fail</th>
                                    <th style={{width: '20%'}}>Inspection Required</th>
                                </tr>
                            </thead>
                            <tbody>
                            {checklist.map(item => (
                                <React.Fragment key={item.id}>
                                <tr key={item.id}>
                                    <td>{item.description}</td>
                                    <td>
                                    <div className="custom-radio pass">
                                        <input
                                        id={`pass-${item.id}`}
                                        type="radio"
                                        name={`check-${item.id}`}
                                        checked={item.status === 'pass'}
                                        onChange={() => handleRadioTableChange(item.id, 'pass')}
                                        />
                                        <label htmlFor={`pass-${item.id}`}></label>
                                    </div>
                                    </td>
                                    <td>
                                    <div className="custom-radio fail">
                                        <input
                                        id={`fail-${item.id}`}
                                        type="radio"
                                        name={`check-${item.id}`}
                                        checked={item.status === 'fail'}
                                        onChange={() => handleRadioTableChange(item.id, 'fail')}
                                        />
                                        <label htmlFor={`fail-${item.id}`}></label>
                                    </div>
                                    </td>
                                    <td>
                                        <div className="custom-checkbox">
                                            <input
                                                id={`expand-${item.id}`}
                                                type="checkbox"
                                                onChange={(event) => inspectionChange(event, item.id)}
                                                checked={inspectionList.includes(item.id)}
                                            />
                                            <label style={{marginBottom: 0}} onClick={() => handleExpandTableToggle(item.id)}>
                                                View Attachments{expandedTableRow === item.id ? <UpOutlined /> : <DownOutlined />}
                                            </label>
                                        </div>
                                        <div className="mt-2" style={{display: 'flex', justifyContent: 'space-around'}}>
                                            {item.images && <Badge style={{borderRadius: '50px'}}><FileImageOutlined />{item.images} Images</Badge>}
                                            {item.note !== '' && item.note !== null && <Badge style={{borderRadius: '50px'}}><FileOutlined />View Notes</Badge>}
                                        </div>
                                    </td>
                                </tr>
                                {expandedTableRow === item.id && (
                                    <tr className="expanded-row">
                                    <td colSpan={1}>
                                        <div className="expanded-content">
                                            <h6>Notes</h6>
                                                <div className="notes-content">
                                                    {item.note}
                                                </div>
                                        </div>
                                    </td>
                                    <td colSpan={3}>
                                        <div className="expanded-content">
                                            <h6 style={{textAlign: 'left'}}>View Images</h6>
                                                <div className="d-flex align-items-center justify-content-center">
                                                    <Button
                                                        onClick={handlePrev}
                                                        disabled={startIndex === 0}
                                                        className="gallery-nav"
                                                    >
                                                        &lt;
                                                    </Button>

                                                    <div className="image-gallery" onClick={handleImageClick}>
                                                        {visibleImages.map((image, index) => (
                                                            <div key={index} className="image-item">
                                                                <img src={image.src} alt={image.altText} className="img-fluid" />
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <Button
                                                        onClick={handleNext}
                                                        disabled={startIndex + visibleImagesCount >= images.length}
                                                        className="gallery-nav"
                                                    >
                                                        &gt;
                                                    </Button>
                                                </div>
                                        </div>
                                    </td>
                                    </tr>
                                )}
                                </React.Fragment>
                                ))}
                                {
                                    <Modal isOpen={showModal}>
                                    <div className="prestart-detail-modal-content">
                                        <ModalHeader className="prestart-detail-modal-header">
                                            <span className="close" onClick={handleClose} style={{cursor: 'pointer'}}></span>
                                            <h6 style={{ textAlign: 'left' }}>View Images</h6>
                                        </ModalHeader>
                                        <div className="d-flex align-items-center justify-content-center" style={{padding: '1rem'}}>
                                        <Button
                                            onClick={handleModalPrev}
                                            disabled={startModalIndex === 0}
                                            className="gallery-nav"
                                        >
                                            &lt;
                                        </Button>

                                        <div className="image-gallery1">
                                            {visibleModalImages.map((image, index) => (
                                            <div key={index} className="image-item1">
                                                <img src={image.src} alt={image.altText} className="img-fluid" />
                                            </div>
                                            ))}
                                        </div>

                                        <Button
                                            onClick={handleModalNext}
                                            disabled={startModalIndex + 1 >= images.length}
                                            className="gallery-nav"
                                        >
                                            &gt;
                                        </Button>
                                        </div>
                                    </div>
                                    </Modal>
                                }
                            </tbody>
                        </table>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default PreStartsDetails;

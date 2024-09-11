import React, { useState } from "react";
import { Card, CardBody, Col, Container, Row, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import 'Pages/PreStartDetails/style.css';

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

const checklistItems = [
    { description: "WEAR, DAMAGE AND LEAKS: Structure, accident damage guard, tip body.", pass: true, fail: false, na: false, inspectionRequired: true },
    { description: "HYDRAULICS: Rams, Hoses, leaks, connections, wear, fluid.", pass: true, fail: false, na: false, inspectionRequired: false },
    { description: "WHEELS, TYRES: nuts, pressure and tread Wear", pass: false, fail: false, na: false, inspectionRequired: false },
    { description: "TRAILER: Warning decals, towing hitch, tip body, body prop", pass: true, fail: false, na: false, inspectionRequired: false },
    { description: "FLUIDS: Oil, coolant, fuel, battery, wiper water", pass: false, fail: true, na: false, inspectionRequired: true },
    { description: "CABIN: access, seats, seat belts, loose objects, visibility", pass: true, fail: false, na: false, inspectionRequired: false },
    { description: "BRAKES: part brake, service brake, drain air tank.", pass: true, fail: false, na: false, inspectionRequired: false },
    { description: "CONTROLS: Steering, pedals, reverse lights, brake lights.", pass: true, fail: false, na: false, inspectionRequired: false },
    { description: "OTHER CONTROLS: hoist control, tail gate control.", pass: true, fail: false, na: false, inspectionRequired: false },
    { description: "WARNING DEVICES: Horn, reversing beeper, alarms.", pass: false, fail: false, na: true, inspectionRequired: false },
    { description: "OTHER: number plates, operational manual, fire extinguisher.", pass: false, fail: false, na: false, inspectionRequired: false }
];




const PreStartsDetails = (props: any) => {
    document.title = "Pre Starts | FMS Live";

    const [modal, setModal] = useState(false);


    const toggleModal = () => setModal(!modal);

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

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    {/* Breadcrumb */}
                    <Breadcrumb title="Maintenance" breadcrumbItem="Pre Starts" />

                    {/* First Banner: Attention Needed & Schedule Maintenance */}
                    <Row className="banner-card">
                        <Col lg="10" className="attention-banner-container">
                            <div className="attention-banner d-flex align-items-center justify-content-center">
                                <h4 className="mt-1">ATTENTION NEEDED</h4>
                            </div>
                        </Col>
                        <Col lg="2">
                            <Button className="schedule-button" onClick={toggleModal}>
                                + Schedule Maintenance
                            </Button>
                        </Col>
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
                    </Row>
                    <Row className="checklist-banner">
                        <Col lg="4" className="text-left">
                            <h5>Checklist</h5>
                        </Col>
                        <Col lg="2" className="text-center">
                            <h5>Pass</h5>
                        </Col>
                        <Col lg="2" className="text-center">
                            <h5>Fail</h5>
                        </Col>
                        <Col lg="4" className="text-center">
                            <h5>Inspection Required</h5>
                        </Col>
                    </Row>

                    <div className="section-group">

                        {/* IF FITTED WITH HYDRAULICS Checklist Section */}
                        <Row >
                            <Col lg="12">
                                <Card className="checklist-card red-border">
                                    <CardBody>
                                        <Row className="checklist-item  border border-danger">
                                            <Col lg="8">
                                                <p>IF FITTED WITH HYDRAULICS : Rams, Hoses, leaks, connections, wear, fluid.</p>
                                            </Col>
                                            <Col lg="4" className="text-center checklist-options">
                                                <div className="custom-radio">
                                                    <input id="check" type="radio" name="hydraulics-check1" />
                                                    <label htmlFor="check"></label>
                                                </div>
                                                <div className="custom-radio">
                                                    <input id="check1" type="radio" name="hydraulics-check2" />
                                                    <label htmlFor="check1"></label>
                                                </div>
                                                <input type="radio" name="hydraulics-check1" />
                                                <Dropdown isOpen={dropdownOpen1} toggle={toggleDropdown1} className="view-dropdown">
                                                    <DropdownToggle caret>
                                                        View Images
                                                    </DropdownToggle>
                                                    <DropdownMenu>
                                                        <DropdownItem>View Images</DropdownItem>
                                                        <DropdownItem>View Notes</DropdownItem>
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </Col>
                                        </Row>
                                        <Row className="checklist-item border border-danger mt-4">
                                            <Col lg="8">
                                                <p>IF FITTED WITH HYDRAULICS : Rams, Hoses, leaks, connections, wear, fluid.</p>
                                            </Col>
                                            <Col lg="4" className="text-center checklist-options">
                                                <div className="custom-radio">
                                                    <input id="pass" type="radio" name="hydraulics-check2" />
                                                    <label htmlFor="pass"></label>
                                                </div>
                                                <div className="custom-radio">
                                                    <input type="radio" id="fail" name="hydraulics-check1" />
                                                    <label htmlFor="fail"></label>
                                                </div>
                                                <Dropdown isOpen={dropdownOpen2} toggle={toggleDropdown2} className="view-dropdown">
                                                    <DropdownToggle caret>
                                                        View Notes
                                                    </DropdownToggle>
                                                    <DropdownMenu>
                                                        <DropdownItem>View Images</DropdownItem>
                                                        <DropdownItem>View Notes</DropdownItem>
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>

                        {/* Notes Section */}
                        <Row className="notes-section">
                            <Col lg="12">
                                <Card className="notes-card">
                                    <CardBody>
                                        <h5>Notes</h5>
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
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>

                        {/* Image Gallery Section */}
                        <Row className="mt-4 image-gallery-container">
                            <Col lg="12">
                                <Card>
                                    <CardBody>
                                        <h5>View Images</h5>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <Button
                                                onClick={handlePrev}
                                                disabled={startIndex === 0}
                                                className="gallery-nav"
                                            >
                                                &lt;
                                            </Button>

                                            <div className="image-gallery">
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
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </div>


                    {/* Checklist Section */}
                    <Row >
                        <Col lg="12">
                            <Card className="table-section ">
                                <CardBody>
                                    <h5>Checklist</h5>
                                    <table className="checklist-table">
                                        <thead>
                                            <tr>
                                                <th>Checklist</th>
                                                <th>Pass</th>
                                                <th>Fail</th>
                                                <th>N/A</th>
                                                <th>Inspection Required</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {checklistItems.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.description}</td>

                                                    <td className="custom-radio">
                                                        <input id="check3" type="radio" name="hydraulics-check2" />
                                                        <label htmlFor="check3"></label>
                                                    </td>
                                                    <td className="custom-radio">
                                                        <input id="check4" type="radio" name="hydraulics-check2" />
                                                        <label htmlFor="check4"></label>
                                                    </td>
                                                    <td className="custom-radio">
                                                        <input id="check5" type="radio" name="hydraulics-check2" />
                                                        <label htmlFor="check5"></label>
                                                    </td>

                                                    <td><input type="checkbox" checked={item.inspectionRequired} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>


                </Container>
            </div>
        </React.Fragment>
    );
};

export default PreStartsDetails;

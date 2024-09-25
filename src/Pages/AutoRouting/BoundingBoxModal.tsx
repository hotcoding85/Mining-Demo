import React, { useState } from "react";
import { Modal, Button, Input, Form } from 'antd';
import { ModalBody } from "reactstrap";
import _ from 'lodash';

interface BoundingBoxModalProps {
    isVisible: boolean;
    handleOk: (minLng, minLat, maxLng, maxLat) => void;
    handleCancel: () => void;
}

const BoundingBoxModal: React.FC<BoundingBoxModalProps> = ({ isVisible, handleOk, handleCancel }) => {
    const [minLng, setMinLng] = useState('120.43943381725552');
    const [minLat, setMinLat] = useState('-29.16332315558488');
    const [maxLng, setMaxLng] = useState('120.45253735754262');
    const [maxLat, setMaxLat] = useState('-29.137385979112082');

    const applyBoundingBox = () => {
        // Handle Apply Bounding Box action
        handleOk(minLng, minLat, maxLng, maxLat);
    };

    return (
        <Modal
            title="Set Bounding Box"
            open={isVisible}
            onOk={applyBoundingBox}
            onCancel={handleCancel}
            footer={[
                <Button key="back" onClick={handleCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={applyBoundingBox}>
                    Apply Bounding Box
                </Button>
            ]}
        >
            <ModalBody>
                <Form layout="vertical">
                    <Form.Item label="Min Longitude">
                        <Input value={minLng} onChange={(e) => setMinLng(e.target.value)} />
                    </Form.Item>
                    <Form.Item label="Min Latitude">
                        <Input value={minLat} onChange={(e) => setMinLat(e.target.value)} />
                    </Form.Item>
                    <Form.Item label="Max Longitude">
                        <Input value={maxLng} onChange={(e) => setMaxLng(e.target.value)} />
                    </Form.Item>
                    <Form.Item label="Max Latitude">
                        <Input value={maxLat} onChange={(e) => setMaxLat(e.target.value)} />
                    </Form.Item>
                </Form>
            </ModalBody>
        </Modal>
    );
};

export default BoundingBoxModal;

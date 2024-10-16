import React, { useCallback, useEffect, useState } from "react";
import { Modal, Button, Input, Form, Select } from 'antd';
import { ModalBody } from "reactstrap";
import _ from 'lodash';

interface BoundingBoxModalProps {
    isVisible: boolean;
    handleOk: (_type, _slotId) => void;
    handleCancel: () => void;
    startTime: string;
    endTime: string;
    slotId: string;
}

const ScheduleModal: React.FC<BoundingBoxModalProps> = ({ isVisible, handleOk, handleCancel, startTime, endTime, slotId }) => {
    
    const types = ['FI' , 'FO' , 'R&R' , 'DS' , 'NS']
    const rosterTypes = [
        { value: 'DS', label: 'DS' },
        { value: 'NS', label: 'NS' },
        { value: 'R&R', label: 'R&R' },
        { value: 'FI', label: 'FI' },
        { value: 'FO', label: 'FO' },
    ]
    const [currentRosterType, setCurrentRosterType] = useState<any>('DS')
    const [localSlotId, setSlotId] = useState<any>(slotId)
    useEffect(() => {
        setSlotId(slotId)
    }, [slotId])

    const saveSchedule = useCallback(() => {
        handleOk(currentRosterType, localSlotId);
    }, [currentRosterType, localSlotId]);

    return (
        <Modal
            title="Roster Schedule"
            open={isVisible}
            onOk={saveSchedule}
            onCancel={handleCancel}
            footer={[
                <Button key="back" onClick={handleCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={saveSchedule}>
                    Save
                </Button>
            ]}
        >
            <ModalBody>
                <Form layout="vertical">
                    <Form.Item label="Start Time">
                        <Input value={startTime} disabled />
                    </Form.Item>
                    <Form.Item label="End Time">
                        <Input value={endTime} disabled />
                    </Form.Item>
                    <Form.Item label="End Time">
                        <Select
                            className="basic-single"
                            showSearch
                            placeholder="Target Type"
                            options={rosterTypes}
                            value={currentRosterType} // set selected value
                            onChange={(_type) => setCurrentRosterType(_type)}
                        />
                    </Form.Item>
                </Form>
            </ModalBody>
        </Modal>
    );
};

export default ScheduleModal;

import React from 'react';
import { Button, Modal } from 'antd';

const ConfirmModal = ({ isOpen, setIsOpen, title, text, onOK, onCancel }) => {

    const handleOk = () => {
        setIsOpen((prevState) => {
            return {
                ...prevState,
                isOpen: false
            }
        });
        if (onOK) {
            onOK();
        }
    };

    const handleCancel = () => {
        setIsOpen((prevState) => {
            return {
                ...prevState,
                isOpen: false
            }
        });
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <>
            <Modal
                title={title}
                open={isOpen}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <p>{text}</p>
            </Modal>
        </>
    );
};

export default ConfirmModal;
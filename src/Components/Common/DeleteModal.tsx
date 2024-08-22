import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const DeleteModal = ({ item, isOpen, toggle, onConfirm }) => {
  return (
    <Modal isOpen={isOpen}>
      <ModalHeader>Confirm Delete</ModalHeader>
      <ModalBody>
        Are you sure you want to delete <span style={{color: 'red'}}>{item}</span> ?
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>Cancel</Button>
        <Button color="danger" onClick={onConfirm}>Delete</Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteModal;

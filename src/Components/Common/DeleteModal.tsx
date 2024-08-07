// import React from "react"
// import { Modal, ModalBody } from "reactstrap"

// interface props {
//   show: boolean;
//   onDeleteClick: any;
//   onCloseClick: any;
// }

// const DeleteModal = ({ show, onDeleteClick, onCloseClick }:props) => {
//   return (
//     <Modal isOpen={show} toggle={onCloseClick} centered={true}>
//       <div className="modal-content">
//         <ModalBody className="px-4 py-5 text-center">
//           <button type="button" onClick={onDeleteClick} className="btn-close position-absolute end-0 top-0 m-3"></button>
//           <div className="avatar-sm mb-4 mx-auto">
//             <div className="avatar-title bg-primary text-primary bg-opacity-10 font-size-20 rounded-3">
//               <i className="mdi mdi-trash-can-outline"></i>
//             </div>
//           </div>
//           <p className="text-muted font-size-16 mb-4">Are you sure you want to permanently erase the job.</p>

//           <div className="hstack gap-2 justify-content-center mb-0">
//             <button type="button" className="btn btn-danger" onClick={onDeleteClick}>Delete Now</button>
//             <button type="button" className="btn btn-secondary" onClick={onCloseClick}>Close</button>
//           </div>
//         </ModalBody>
//       </div>
//     </Modal>
//   )
// }

// export default DeleteModal

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

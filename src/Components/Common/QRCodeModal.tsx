import React from "react"
import { Modal, ModalBody } from "reactstrap"
import { QRCodeCanvas } from 'qrcode.react';

interface props {
  show: boolean;
  data: any;
  onCloseClick: any;
}

const QRCodeModal = ({ show, data, onCloseClick }: props) => {
  return (
    <Modal isOpen={show} toggle={onCloseClick} centered={true}>
      <div className="modal-content">
        <ModalBody className="px-4 py-5 text-center">
          <p className="text-muted text-left font-size-16 mb-4">Device Name - {data && data.name ? data.name : ''}</p>
          <p className="text-muted font-size-16 mb-4">Device ID - {data && data.identifier ? data.identifier : ''}</p>
          <QRCodeCanvas size={120} bgColor="#FFFFFF" includeMargin={true} value={data && data.identifier ? data.identifier : ''} />
          <p>   </p>
          <div className="hstack gap-2 justify-content-center mb-0">
            <button type="button" className="btn btn-secondary" onClick={onCloseClick}>Close</button>
          </div>

        </ModalBody>
      </div>
    </Modal>
  )
}

export default QRCodeModal

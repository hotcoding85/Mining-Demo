import React from "react"
import { Modal, ModalBody } from "reactstrap"
import { QRCode } from 'antd';

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
          <span className="text-muted font-size-24 mb-4">Tracker info for <span style={{ color: 'red', fontWeight: 'bold' }}>{data && data.vehicle ? data.vehicle.name : ''}</span></span>
          <div className="hstack gap-2 justify-content-center mt-2">
            <QRCode type="canvas" value={data && data.id ? data.id : ''} color={'black'}
              bgColor={'white'} size={360} />
          </div>
          <div className="hstack gap-2 justify-content-center mt-2">
            <button type="button" className="btn btn-secondary" onClick={onCloseClick}>Close</button>
          </div>
        </ModalBody>
      </div>
    </Modal>
  )
}

export default QRCodeModal

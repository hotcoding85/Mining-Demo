import { useEffect, useState } from "react";
import { Input } from "antd";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

const content: any = {
  top: "50%",
  left: "50%",
  right: "auto",
  bottom: "auto",
  marginRight: "-50%",
  transform: "translate(-50%, -50%)",
};

interface ROMEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  wasteData?: any;
}

const ROMEditModal: React.FC<ROMEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  wasteData,
}) => {
  const [newTitle, setNewTitle] = useState<string>("");
  const [newColor, setNewColor] = useState<string>("");

  useEffect(() => {
    if (wasteData?.color) {
      setNewColor(wasteData.color);
    }

    if (wasteData?.name) {
      setNewTitle(wasteData.name);
    }
  }, [wasteData]);

  const handleNewTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  const handleColorChange = (e) => {
    setNewColor(e.target.value);
  };

  const handleSave = () => {
    console.log(newTitle, newColor);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Edit ROM Title"
      style={{
        content: content,
      }}
    >
      <ModalHeader tag="h4">Edit ROM</ModalHeader>
      <ModalBody>
        <Input
          type="text"
          value={newTitle}
          placeholder="ROM Name"
          onChange={handleNewTitleChange}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <Input
          type="color"
          value={newColor}
          placeholder="SpeedLimit"
          onChange={handleColorChange}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
      </ModalBody>
      <ModalFooter>
        <Button onClick={handleSave} style={{ marginRight: "10px" }}>
          Save
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ROMEditModal;

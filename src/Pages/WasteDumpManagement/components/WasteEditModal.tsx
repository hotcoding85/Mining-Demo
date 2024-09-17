import { useEffect, useState } from "react";
import { Input } from "antd";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { Bench } from "slices/benches/reducer";

const content: any = {
  top: "50%",
  left: "50%",
  right: "auto",
  bottom: "auto",
  marginRight: "-50%",
  transform: "translate(-50%, -50%)",
};

interface WasteEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (bench: any, color: string) => void;
  benches: any[];
  wasteData?: any;
}

const WasteEditModal: React.FC<WasteEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  benches,
  wasteData,
}) => {
  const [newColor, setNewColor] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [selectedBench, setSelectedBench] = useState<any>();

  useEffect(() => {
    if (wasteData?.color) {
      setNewColor(wasteData.color);
    }

    if (wasteData?.benchId) {
      console.log(benches);
      setSelectedBench(
        benches.find((bench) => bench.id === wasteData.benchId) as Bench
      );
    }
  }, [wasteData, benches]);

  const handleColorChange = (e) => {
    setNewColor(e.target.value);
  };

  const handleSave = () => {
    if (selectedBench && onSave) {
      onSave(selectedBench, newColor);
    }
  };

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Edit Waste Dump Title"
      style={{
        content: content,
      }}
    >
      <ModalHeader tag="h4">
        {wasteData?.benchId ? "Edit Waste Dump" : "Add Waste Dump"}
      </ModalHeader>
      <ModalBody>
        <label>Associate bench:</label>
        <Dropdown
          isOpen={dropdownOpen}
          toggle={toggle}
          direction={"down"}
          style={{ width: "100%", marginBottom: "10px" }}
        >
          <DropdownToggle caret style={{ width: "100%" }}>
            {selectedBench
              ? `${selectedBench.name} - ${selectedBench.blockId}`
              : "Select bench"}
          </DropdownToggle>
          <DropdownMenu
            style={{ width: "100%", maxHeight: "450px", overflowY: "scroll" }}
          >
            {benches.map((bench) => (
              <DropdownItem onClick={() => setSelectedBench(bench)}>
                {bench.name} - {bench.blockId}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
        <label>Waste dump color:</label>
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

export default WasteEditModal;

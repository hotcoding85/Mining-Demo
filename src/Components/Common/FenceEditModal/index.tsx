import { useEffect, useState } from "react";
import { Input } from "antd";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { Select } from "antd";

const { Option } = Select;

const content: any = {
  top: "50%",
  left: "50%",
  right: "auto",
  bottom: "auto",
  marginRight: "-50%",
  transform: "translate(-50%, -50%)",
};

interface FenceEditModalProps {
  category: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (bench: any, name: string, color: string) => void;
  benches: any[];
  wasteData?: any;
}

const FenceEditModal: React.FC<FenceEditModalProps> = ({
  category,
  isOpen,
  onClose,
  onSave,
  benches,
  wasteData,
}) => {
  const [newName, setNewName] = useState<string>("");
  const [newColor, setNewColor] = useState<string>("");
  const [selectedBenchId, setSelectedBenchId] = useState<any>();

  useEffect(() => {
    setNewName(wasteData?.name || "");
    setNewColor(wasteData.color);
    setSelectedBenchId(wasteData?.benchId || null);
  }, [wasteData, benches]);

  const handleInputChange = (e) => {
    setNewName(e.target.value);
  };

  const handleColorChange = (e) => {
    setNewColor(e.target.value);
  };

  const handleSave = () => {
    if (newName && onSave) {
      onSave(
        benches.find((bench) => bench.id === selectedBenchId),
        newName,
        newColor
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        content: content,
      }}
    >
      <ModalHeader tag="h4">
        {wasteData?.benchId ? `Edit ${category} Dump` : `Add ${category} Dump`}
      </ModalHeader>
      <ModalBody>
        <label>{category} Dump Name:</label>
        <Input
          type="text"
          value={newName}
          placeholder={`${category} dump name`}
          onChange={handleInputChange}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <label>Associate bench:</label>
        <Select
          showSearch
          style={{ width: "100%", marginBottom: "10px", height: "44px" }}
          placeholder="Select a bench"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option?.name?.toLowerCase().includes(input.toLowerCase())
          }
          filterSort={(optionA, optionB) =>
            optionA?.name
              ?.toLowerCase()
              .localeCompare(optionB?.name?.toLowerCase())
          }
          value={selectedBenchId}
          onChange={(option) => {
            setSelectedBenchId(option);
          }}
        >
          {benches?.map((option) => (
            <Option key={option.id} value={option.id} name={option.name}>
              {option.name} - {option.blockId}
            </Option>
          ))}
        </Select>
        <label>{category} dump color:</label>
        <Input
          type="color"
          value={newColor}
          placeholder="SpeedLimit"
          onChange={handleColorChange}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            height: "44px",
          }}
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

export default FenceEditModal;

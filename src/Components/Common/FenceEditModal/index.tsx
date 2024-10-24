import { useEffect, useMemo, useState } from "react";
import { Divider, Input, Space, Button } from "antd";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { Select } from "antd";
import { useMaterials } from "Hooks/useMaterials";
import { PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

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
  onSave?: (bench: any, name: string, color: string, newBench: any) => void;
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
  const { materials, findMaterialsById } = useMaterials();

  const [newName, setNewName] = useState<string>("");
  const [newColor, setNewColor] = useState<string>("");
  const [selectedBenchId, setSelectedBenchId] = useState<any>();
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [benchName, setBenchName] = useState<string>();
  const [isValidation, setIsValdation] = useState<boolean>(false);
  const [savedBenches, setSavedBenches] = useState<any[]>(benches);
  const [showMaterial, setShowMaterial] = useState<boolean>(false);

  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => item.category === category);
  }, [materials, category]);

  useEffect(() => {
    setNewName(wasteData?.name || "");
    setNewColor(wasteData.color);
    setSelectedBenchId(wasteData?.benchId);
    setBenchName(undefined);
    setSelectedMaterialId("");
    setShowMaterial(false);
    setSavedBenches(benches);
  }, [wasteData, benches]);

  const handleInputChange = (e) => {
    setNewName(e.target.value);
  };

  const handleColorChange = (e) => {
    setNewColor(e.target.value);
  };

  const handleBenchNameChange = (e) => {
    setBenchName(e.target.value);
  };

  const confirmBench = () => {
    const result = savedBenches.some((item) => !item.id);
    return result;
  };

  const findBenchName = (benchId) => {
    const filteredBench = savedBenches.find((item) => item?.id === benchId);
    return filteredBench?.name || benchName;
  };

  const addItem = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    e.preventDefault();
    const isExist = confirmBench();
    if (!benchName) {
      toast.warning("Add bench name!", { autoClose: 2000 });
    } else if (isExist) {
      const result = savedBenches.map((item) =>
        item?.id ? item : { ...item, name: benchName }
      );
      setSavedBenches(result);
    } else {
      const isBenchExisting = savedBenches.some(
        (item) => item?.name === benchName
      );

      if (isBenchExisting) {
        toast.warning("Bench already exists!", { autoClose: 2000 });
      } else {
        setSavedBenches([...savedBenches, { name: benchName }]);
        setShowMaterial(true);
      }
    }
  };

  const handleSave = () => {
    if (selectedMaterialId === "" && !selectedBenchId) {
      setIsValdation(true);
      return;
    }
    onClose();

    if (newName && onSave) {
      onSave(
        benches.find((bench) => bench.id === selectedBenchId),
        newName,
        newColor,
        {
          blockId: findMaterialsById(selectedMaterialId)?.name,
          materialId: selectedMaterialId,
          category: "DESTINATION",
          name: benchName,
          status: "ACTIVE",
        }
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
        <label>Associate bench</label>
        <Select
          showSearch
          style={{ width: "100%", marginBottom: "10px", height: "44px" }}
          placeholder="Select a bench"
          optionFilterProp="children"
          filterOption={(input, option: any) =>
            option?.name?.toLowerCase().includes(input.toLowerCase())
          }
          filterSort={(optionA, optionB) =>
            optionA?.name
              ?.toLowerCase()
              .localeCompare(optionB?.name?.toLowerCase())
          }
          value={findBenchName(selectedBenchId)}
          onChange={(option, e) => {
            setSelectedBenchId(e?.key);
            setShowMaterial(true);
          }}
          dropdownRender={(menu) => (
            <>
              {menu}
              <Divider style={{ margin: "8px 0" }} />
              <div className="d-flex justify-content-between align-items-center gap-2">
                <Input
                  type="text"
                  placeholder="Please enter bench name"
                  value={benchName}
                  onChange={handleBenchNameChange}
                  onKeyDown={(e) => e.stopPropagation()}
                />
                <Button type="text" icon={<PlusOutlined />} onClick={addItem}>
                  {confirmBench() ? "Edit bench name" : "Add bench name"}
                </Button>
              </div>
            </>
          )}
          options={savedBenches.map((item) => ({
            key: item.id,
            // value: `${item.name} - ${item?.blockId ? item?.blockId : ""}`,
            value: item.name + (item?.blockId ? `-${item?.blockId}` : ""),
            name: item.name,
          }))}
        />
        <label>
          {!selectedBenchId && showMaterial && `${category} material :`}
        </label>
        {!selectedBenchId && showMaterial && (
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
            value={selectedMaterialId}
            onChange={(option) => {
              setSelectedMaterialId(option);
              setIsValdation(false);
            }}
          >
            {filteredMaterials?.map((option) => (
              <Option key={option.id} value={option.id} name={option.name}>
                {option.name}
              </Option>
            ))}
          </Select>
        )}
        {isValidation && (
          <p style={{ color: "red" }}>Please select a material.</p>
        )}
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

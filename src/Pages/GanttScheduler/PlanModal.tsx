import React, { useState, useEffect } from "react";
import { Plan } from "./interfaces/type";
import "./styles/Modal.css";
import { Select, Input } from "antd";
interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: Plan) => void;
  deletePlan: (planId: string) => void;
  plan?: any;
  plans: any;
}

const { Option } = Select;

const PlanModal: React.FC<PlanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  deletePlan,
  plan,
  plans,
}) => {
  const defaultColor = "#ff6247";
  const [planName, setPlanName] = useState<string>("");
  const [blockId, setBlockId] = useState<string>("");
  const [newColor, setNewColor] = useState<string>(plan?.color || defaultColor);
  const [selectedBenchId, setSelectedBenchId] = useState<any>(null);
  
  // Reset the fields whenever the modal is opened or after a plan is saved
  useEffect(() => {
    if (isOpen) {
      setPlanName(plan?.name || "");
      setBlockId(plan?.blockId || "");
      setNewColor(plan?.color || defaultColor);
      setSelectedBenchId(plan?.id);
    }
  }, [isOpen, plan]);

  const handleColorChange = (e) => {
    setNewColor(e.target.value);
  };

  const handleSave = () => {
    if (plan) {
      const updatedPlan: any = {
        ...plan,
        blockId: blockId,
        name: planName,
        color: newColor,
        sourceId: selectedBenchId,
      };
      onSave(updatedPlan);
      onClose();
    }
  };

  // Function to handle clicks outside the modal content
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`modal-overlay ${isOpen ? "show" : ""}`}
      onMouseDown={handleOverlayClick}
    >
      <div className="custom-modal-content">
        <div className="custom-modal-header">
          <h2>Edit the plan</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

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
          value={`${planName} - ${blockId}`}
          onChange={(id, e: any) => {
            console.log("options", e, id);
            setSelectedBenchId(id);
            setPlanName(e.name);
            setBlockId(e.blockId);
          }}
        >
          {plans?.map((option: any) => (
            <Option
              key={option.id}
              value={option.id}
              name={option.name}
              blockId={option.blockId}
            >
              {option.name} - {option.blockId}
            </Option>
          ))}
        </Select>
        <label> dump color:</label>
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
        <button onClick={handleSave}>Save Plan</button>
        <button onClick={() => deletePlan(plan.id)}>Delete Plan</button>
      </div>
    </div>
  );
};

export default PlanModal;

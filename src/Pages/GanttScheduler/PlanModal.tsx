import React, { useState, useEffect } from "react";
import { Modal, Select, Input, Button, Form, Space } from "antd";
import { DeleteOutlined, SaveOutlined } from "@ant-design/icons";
import { Plan } from "./interfaces/type";
import { exit } from "process";

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: Plan) => void;
  deletePlan: (planId: string) => void;
  plan?: any;
  plans: any[];
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
  const [form] = Form.useForm();
  const defaultColor = "#ff6247";
  const [planName, setPlanName] = useState<string>(plan?.name);
  const [blockId, setBlockId] = useState<string>(plan?.blockId);
  const [newColor, setNewColor] = useState<string>(plan?.color || defaultColor);
  const [selectedBenchId, setSelectedBenchId] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setPlanName(plan?.name || "");
      setBlockId(plan?.blockId || "");
      setNewColor(plan?.color || defaultColor);
      setSelectedBenchId(plan?.sourceId);
      form.setFieldsValue({
        bench: plan ? `${plan.name} - ${plan.blockId}` : undefined,
        color: plan?.color || defaultColor,
      });
    }
  }, [isOpen, plan, form]);

  const handleSave = () => {
    const updatedPlan: any = {
      ...plan,
      blockId: blockId,
      name: planName,
      color: newColor,
      sourceId: selectedBenchId,
    };
    onSave(updatedPlan);
    onClose();
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Are you sure you want to delete this plan?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        deletePlan(plan.id);
        onClose();
      },
    });
  };

  return (
    <Modal
      title="Edit the plan"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="bench"
          label="Select a bench"
          rules={[{ required: true, message: "Please select a bench" }]}
        >
          <Select
            showSearch
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
              setSelectedBenchId(id);
              setPlanName(e.name);
              setBlockId(e.blockId);
            }}
          >
            {plans?.map((option: any) => (
              <Option
                key={option.id}
                value={`${option.name} - ${option.blockId}`}
                label={`${option.name} - ${option.blockId}`}
              >
                {option.name} - {option.blockId}
              </Option>
            ))}
          </Select>
        </Form.Item>
        {/* <Form.Item name="color" label="Dump color">
          <Input onChange={(e) => {setNewColor(e.target.value)}} type="color" style={{ width: "100%", height: "32px" }} />
        </Form.Item> */}
        <Form.Item>
          <Space className="d-flex" style={{justifyContent: 'space-between'}}>
            <Button icon={<SaveOutlined />} onClick={handleSave}>
              Save Plan
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              disabled={!plan}
            >
              Delete Plan
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PlanModal;
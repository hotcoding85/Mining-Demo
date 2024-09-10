import { Progress } from "antd";
import { Col, Row } from "reactstrap";

interface EfficiencyRatingBarProps {
  value: "poor" | "good" | "fair" | "excellent";
}

const stateColors = {
  poor: { value: 6, color: "#CF1322" },
  good: { value: 38, color: "#722ED1" },
  fair: { value: 71, color: "#FAAD14" },
  excellent: { value: 100, color: "#389E0D" },
};

const EfficiencyRatingBar: React.FC<EfficiencyRatingBarProps> = ({ value }) => {
  return (
    <div className="rating-bar">
      <div className="rating-bar-title">Efficiency Rating</div>
      <div className="rating-bar-wrapper">
        <Progress
          className="mt-3 mb-1"
          percent={stateColors[value].value}
          strokeColor={{
            "0%": stateColors[value].color,
            "100%": stateColors[value].color,
          }}
        />
        <div className="ant-progress-dot-wrapper">
          <Row>
            <Col xs={4}>
              <div className="ant-progress-dot" />
            </Col>
            <Col xs={4}>
              <div className="ant-progress-dot" />
            </Col>
            <Col xs={4}>
              <div className="d-flex justify-content-between align-items-center gap-2">
                <div className="ant-progress-dot" />
                <div className="ant-progress-dot" />
              </div>
            </Col>
          </Row>
        </div>
      </div>
      <Row className="rating-bar-labels">
        <Col xs={4}>
          <div className="rating-bar-label">Poor</div>
        </Col>
        <Col xs={4}>
          <div className="rating-bar-label">Fair</div>
        </Col>
        <Col xs={4}>
          <div className="d-flex justify-content-between align-items-center gap-2">
            <div className="rating-bar-label">Good</div>
            <div className="rating-bar-label">Excellent</div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default EfficiencyRatingBar;

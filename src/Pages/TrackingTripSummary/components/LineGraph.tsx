import { Line } from "react-chartjs-2";
import { ChartOptions } from "chart.js";
import { CustomLineChartData, TextColor } from "../../../Components/Charts/interfaces/general";
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Card, Col, Row } from "reactstrap";
import ProgressPieChart from "Components/Charts/ProgressPieChart";
import { useSelector } from "react-redux";
import { LAYOUT_MODE_TYPES } from "Components/constants/layout";
import { LayoutSelector } from "selectors";

ChartJS.register(
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels,
    ArcElement,
    Filler
);

interface LineGraphProps {
    data: CustomLineChartData;
    options: ChartOptions<"line">;
    textColor: TextColor[];
    widthVal?: string;
    header?: string,
    backgroundCol?: string;
}

export const LineGraph: React.FC<LineGraphProps> = ({
    data,
    options,
    textColor,
    widthVal,
    backgroundCol,
    header="",
}) => {

    const { layoutModeType } = useSelector(LayoutSelector);
    const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;

    return (
        <div className="BarGraphContainer">
            <Row>
                <Col md={6}>
                    {header && <h4 className="progress-header" style={{fontFamily:"Montserrat", fontSize:'large', fontWeight: 'bold'}}>{header}</h4>}
                    <div className="LegendContainer">
                        {textColor.map((item, index) => (
                        <div className="LegendItem" key={index}>
                            <div
                                className="LegendCircle"
                                style={{ backgroundColor: item.color }}
                                />
                            <div className="LegendText">{item.text}</div>
                        </div>
                        ))}
                    </div>
                </Col>
                {/* <Col md={6}>
                    <div className='d-flex justify-content-center align-items-center h-100'>
                            <ProgressPieChart width={220} height={220} color={'#00ff00'} bgColor={isLight? 'transparent' : '#00ff00'} textColor='#a6b0cf' value={420} maxValue={580} />
                            <div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <h5>Trips Completed</h5>
                                    <span>420/580</span>
                                    <span>Forecasted Trips</span>
                                </div>
                            </div>
                        </div>
                </Col> */}
            </Row>
            <Line data={data} options={options} />

        </div>
    );
};

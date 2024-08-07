import { Card, CardBody, CardTitle, Table } from "reactstrap";
import './dashboard.css';

const ScoreBoard = (props: any) => {

    const data = [
        {
            "name": "HT0002",
            "workingHours": 3.37,
            "payloadHour": 216.89,
            "avgPayload": 730.99
        },
        {
            "name": "DT102",
            "workingHours": 3.42,
            "payloadHour": 216.73,
            "avgPayload": 740.99
        },
        {
            "name": "DT101",
            "workingHours": 3.87,
            "payloadHour": 229.48,
            "avgPayload": 887.6
        }
    ];

    return (
        <Card>
            <CardBody>
                <CardTitle className="h4">Trucking Info</CardTitle>
                <div className="table-responsive">
                    <Table className="table mb-0 table-striped">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th className="align-right">Working Hrs.</th>
                                <th className="align-right">TPH (t/h)</th>
                                <th className="align-right">Avg. Payload</th>
                                <th className="align-right">SMR (hrs)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data.map((item, key) => {
                                    return (
                                        <tr key={key}>
                                            <td scope="row">{item.name}</td>
                                            <td className="align-right">{item.workingHours}</td>
                                            <td className="align-right">{item.payloadHour}</td>
                                            <td className="align-right">{item.avgPayload}</td>
                                            <td className="align-right">{0}</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </Table>
                </div>
            </CardBody>
        </Card>
    )
}
export default ScoreBoard;
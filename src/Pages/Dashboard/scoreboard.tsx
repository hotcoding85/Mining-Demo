import { Card, CardBody, CardTitle, Table } from "reactstrap";
import './dashboard.css';
import { createSelector } from "reselect";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { dashboardTruckingInfo } from "slices/thunk";

const ScoreBoard = ({ roster }) => {

    const dispatch: any = useDispatch();

    useEffect(() => {
        dispatch(dashboardTruckingInfo(roster));
    }, [roster]);

    const selectProperties = createSelector(
        (state: any) => state.Events,
        (info) => ({
            data: info.dashboardTruckingInfo
        })
    );

    const { data } = useSelector(selectProperties);

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
                            {data &&
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
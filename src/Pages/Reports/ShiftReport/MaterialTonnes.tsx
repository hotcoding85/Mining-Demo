import { round } from "lodash"
import { Row, Col, Card, CardBody, CardTitle } from "reactstrap"

const MaterialTonnes = ({ materialData }) => {
    if (materialData && materialData.length === 0) {
        return (
            <Row>
                {/* <h4>No records</h4> */}
            </Row>
        )
    }

    return (
        <Row>

            {materialData.map((item, index) => {
                return (
                    <Col lg="2">
                        <Card key={index}>
                            <CardBody>
                                <CardTitle tag="h4" className="mb-3">{item.materialName}</CardTitle>
                                <CardBody>
                                    <h3 style={{ textAlign: 'center' }}>{round(item.payload, 2)}</h3>
                                </CardBody>
                            </CardBody>
                        </Card>
                    </Col>
                )
            })}

        </Row>
    )
}

export default MaterialTonnes;
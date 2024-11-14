import React from "react";
import { Card } from "reactstrap";
import { divide12HoursRandomlyFormatted } from "utils/common";
import { getRandomInt } from "utils/random";

const DrillerCard = ({data}) => {
    return (
        <React.Fragment>
            <Card className="status-card gap-2">
                <div className="status-card-header">
                    <div>
                        <img
                            src={data.img}
                            width={"64px"}
                            alt="Equipment"
                        />
                    </div>
                    <div>
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            {data.name} ({data.model})
                        </span>
                        <div style={{ fontSize: "14px", color: "#9CA3B1" }}>{data.operator ? (data.operator.lastName.charAt(0)+ '. ' + data.operator.firstName) : 'Unassigned'}</div>
                        <div
                            style={{
                                display: "flex",
                                alignContent: "center",
                                gap: 2,
                            }}
                        >
                            <div className="img">
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M5.99996 5.99996C5.26663 5.99996 4.63885 5.73885 4.11663 5.21663C3.5944 4.6944 3.33329 4.06663 3.33329 3.33329C3.33329 2.59996 3.5944 1.97218 4.11663 1.44996C4.63885 0.927737 5.26663 0.666626 5.99996 0.666626C6.73329 0.666626 7.36107 0.927737 7.88329 1.44996C8.40551 1.97218 8.66663 2.59996 8.66663 3.33329C8.66663 4.06663 8.40551 4.6944 7.88329 5.21663C7.36107 5.73885 6.73329 5.99996 5.99996 5.99996ZM0.666626 11.3333V9.46663C0.666626 9.08885 0.763959 8.74151 0.958626 8.42463C1.15285 8.10818 1.41107 7.86663 1.73329 7.69996C2.42218 7.35551 3.12218 7.09707 3.83329 6.92463C4.5444 6.75263 5.26663 6.66663 5.99996 6.66663C6.73329 6.66663 7.45551 6.75263 8.16663 6.92463C8.87774 7.09707 9.57774 7.35551 10.2666 7.69996C10.5888 7.86663 10.8471 8.10818 11.0413 8.42463C11.236 8.74151 11.3333 9.08885 11.3333 9.46663V11.3333H0.666626Z"
                                        fill="#CF1322"
                                    />
                                </svg>
                            </div>
                            <em style={{ marginLeft: "4px" }}>
                                Updated {Math.round(Math.random() * 10)}m ago
                            </em>
                        </div>
                    </div>
                    <span
                        className="card-status"
                        style={{ backgroundColor: data.stateColor }}
                    >
                        {data.state}
                    </span>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0px 16px",
                        margin: "20px 0 8px",
                    }}
                >
                    <div className="hole-wrapper">
                        <div className="loadsView">
                            <div className="contents">
                                <span>
                                    {getRandomInt(30, 150)}
                                    <span>
                                        {"/" + data.plannedLoads}
                                    </span>
                                </span>
                            </div>
                            <p>
                                Total Holes
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className="d-flex justify-content-between gap-2 text-muted"
                    style={{ padding: "0px 16px", marginTop: "8px" }}
                >
                    {data.stateConfig.map((config, key) => {
                        const hours = divide12HoursRandomlyFormatted(data.stateConfig.length);
                        return (
                            <div className="d-flex align-items-center">
                                {/* <i className='bx bxs-circle font-size-12' style={{ color: config.color }}></i> */}
                                <span
                                    style={{
                                        margin: "0 0 0 1px",
                                        fontSize: "1.4em",
                                        color: config.color,
                                    }}
                                >
                                    {hours[key]}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </React.Fragment>
    )
}

export default DrillerCard;
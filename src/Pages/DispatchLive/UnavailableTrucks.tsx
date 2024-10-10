import React ,{useState} from "react";
import TruckItem from "./TruckItem";

const UnavailableTrucks : React.FC = () => {
    const [isShowMore, setIsShowMore] = useState<boolean>(false);

    const onShowMoreOrLess = () => {
        setIsShowMore(!isShowMore);
    };

    return (
        <React.Fragment>
            <div>
                <div className="d-flex flex-row justify-content-between">
                    <p className="right-board-topic">Trucks NOT Available</p>
                    <div className="show-more-btn" onClick={onShowMoreOrLess}>{!isShowMore ? "View more" : "View Less"}</div>
                </div>
                {isShowMore && (
                    <div className="d-flex flex-row justify-content-between" style={{height : 64}}>
                        <TruckItem
                            title="DT110"
                            fontColor="#FF4D4F"
                        />
                        <TruckItem
                            title="DT111"
                            fontColor="#FF4D4F"
                        />
                        <TruckItem
                            title=""
                            fontColor="#FF4D4F"
                        />
                    </div>
                )}
            </div>
        </React.Fragment>
    )
}

export default UnavailableTrucks;

import React from "react";

interface OreBodyItemProps {
    oreBodyId: string;
    fontColor: string;    
}
const OreBodyItem : React.FC<OreBodyItemProps> = ({
    oreBodyId,
    fontColor
}) => {
    return (
        <div className={"ore-body-item " + (oreBodyId ? "filled" : "empty")}>
            <p className="ore-body-label">{oreBodyId}</p>
        </div>
    )
}

export default OreBodyItem;

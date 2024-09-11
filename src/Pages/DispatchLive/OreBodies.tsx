import React from "react";
import OreBodyItem from "./OreBodyItem";

const OreBodies : React.FC = () => {
    return (
        <React.Fragment>
            <div>
                <p className="right-board-topic">Ore Bodies Material Grades</p>
                <div className="d-flex flex-row justify-content-between" style={{height : 64}}>
                    <OreBodyItem
                        oreBodyId="HG01"
                        fontColor="#FFFFFF"
                    />
                    <OreBodyItem
                        oreBodyId="HG02"
                        fontColor="#FFFFFF"
                    />
                    <OreBodyItem
                        oreBodyId="HG03"
                        fontColor="#FFFFFF"
                    />
                </div>
            </div>
        </React.Fragment>
    )
}

export default OreBodies;
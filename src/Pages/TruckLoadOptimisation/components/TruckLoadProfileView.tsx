import React, { useEffect, useState } from "react";
import GraphCard from "./GraphCard";
import ProfileTableView from "./ProfileTableView";
import _ from "lodash";
import {data} from "../data/sampleData";

const TruckLoadProfileView = (props) => {
  
  const [models, setModels] = useState<any>(null);
  useEffect(() => {    

    const _models: any = []
    if (props.selectedValues['model'] && props.selectedValues['model'].length !== 0) {
      props.selectedValues['model'].map(model => {
        _models.push(model);
      })
      setModels(_models)
      return
    }

    if (!props.selectedValues || !props.selectedValues['fleet'] ||  props.selectedValues['fleet'].length === 0) {
      setModels(null)
      return
    }

    if (!props.selectedValues['model'] || props.selectedValues['model'].length === 0){
      
      const _models = _.uniq(
          _.flatMap(props.selectedValues['fleet'], equipmentName => 
            // Find matching equipment in data and return its models
          _.flatMap(data[0], item => 
            item.equipmentName === equipmentName ? item.model : []
          )
        )
      );
      setModels(_models)
    }
    else{
      setModels(null)
    }
  }, [props.selectedValues])
  return (
    <div>
      {
        models ?
        models.map((item, index) => {
          const title = "Payload Profile Window (" + item + ")";
          return <GraphCard title={title} type={item} loads={85 + 15 * (index)} />
        })
        : 
        <></>
      }
      <div className="d-flex align-items-center justify-content-between">
        <ProfileTableView selectedValues={props.selectedValues}/>
      </div>
    </div>
  );
};

export default TruckLoadProfileView;

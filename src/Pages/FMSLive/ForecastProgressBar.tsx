import React from 'react';
import { Progress } from 'reactstrap';

const ForecastProgressBar = ({ forecastColor, forecast, value, max }) => (
    <div>
        <div style={{ position: 'relative', paddingBottom: '30px' }}>
            <div style={{
                position: 'absolute',
                right: '0',
                top: '-30px',
                color: 'white',
            }}>
                Forecast: 
                <span style={{
                    backgroundColor: forecastColor,
                    color: 'white',
                    borderRadius: '10px',
                    padding: '5px',
                    border: '2px solid white'
                }}>
                    {forecast}
                </span>
                <div style={{
                    height: '20px',
                    width: '2px',
                    borderRight: '2px dashed ' + forecastColor,
                    marginTop: '5px',
                    marginLeft: '75px'
                }}/>
            </div>
            <Progress value={value} max={max} style={{ height: '20px' }}>Completed: {value} of {max}</Progress>
        </div>
    </div>
);

export default ForecastProgressBar;

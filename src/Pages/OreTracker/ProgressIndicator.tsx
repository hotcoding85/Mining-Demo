import React from 'react';
import { Card, CardBody, CardTitle, Progress } from 'reactstrap';
import Chart from 'react-apexcharts';

const ProgressIndicator = ({ title, percentage, color, direction, label, progressColor, targetPlan }) => {
  const options = {
    plotOptions: {
      radialBar: {
        startAngle: 0,
        endAngle: 360,
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: '22px',
            color: '#fff',
            formatter: function (val) {
              return val + "%";
            }
          }
        }
      }
    },
    fill: {
      colors: [color]
    },
  };

  return (
    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
      <CardTitle>{title}</CardTitle>
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <Chart options={options}
                    series={[percentage]}
                    type="radialBar" />
            <div style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'gray', padding: '5px', color: '#fff' }}>
            {percentage}%
            </div>
            { 
                direction === 'up' && 
                <div style={{ position: 'absolute', right: '-20px', top: '35%', transform: 'translateY(-45%)', color: color }}>
                    <svg height="30" width="40">
                        <polygon points="15,0 30,30 0,30" style={{fill:"green",stroke:"purple",strokeWidth:1}} />
                    </svg>
                </div>
            }
            { 
                direction === 'down' && 
                <div style={{ position: 'absolute', right: '-20px', top: '65%', transform: 'translateY(-50%)', color: color}}>
                    <svg height="30" width="40">
                        <polygon points="15,30 30,0 0,0" style={{fill:color,stroke:"purple",strokeWidth:1}} />
                    </svg>
                </div>
            }
        </div>
        <Progress value={percentage} max="100" style={{ width: '80%', color: progressColor, marginBottom: '30px', marginLeft: '20px' }}>{label}</Progress>
        
        <CardTitle>{targetPlan}</CardTitle>
        <div style={{backgroundColor: color, color: '#fff', padding: '5px', marginTop: '10px', borderRadius: '25px', textAlign: 'center', width: '100px', margin: 'auto'}}>{percentage}%</div>
    </div>
  );
}

export default ProgressIndicator;

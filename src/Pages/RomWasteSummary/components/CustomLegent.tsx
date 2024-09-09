import _ from "lodash"

export const CustomLegend = (props: any) => {
    return (<>
        {/* Custom Legend */} 
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
            {_.map(props.legends, (legend, index) => 
                <div key={index} style={{ marginRight: '10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems :'center' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: legend.color }}></div>
                    {legend.label}
                </div>
            )}
        </div>
    </>)
}
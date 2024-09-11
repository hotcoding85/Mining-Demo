interface MarkerProps {
    id: string;
    label: string;
    icon?: string; // URL or inline SVG for the vehicle icon
    position: [number, number];
}

const CustomMarker: React.FC<MarkerProps> = ({ id, label, icon }) => {
    return (
        <div className="custom-marker">
            {/* Top section with the image and label */}
            <div className="marker-top">
                <img src={icon} alt={label} className="vehicle-icon" />
                <div className="marker-label">{label}</div>
            </div>

            {/* Bottom section - black tooltip */}
            <div className="marker-bottom">
                <div className="tooltip-icon">
                <img src={icon} alt={label} className="tooltip-vehicle-icon" />
                </div>
                <div className="tooltip-label">{label}</div>
            </div>
        </div>
    );
};

export default CustomMarker;
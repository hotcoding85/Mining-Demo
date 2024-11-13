import React, { useState } from 'react';
import { Select, Input, Button } from 'antd';

const { Option } = Select;

const TripSelector: React.FC = () => {
  const [selectedTrips, setSelectedTrips] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const tripOptions = ["Trip 1", "Trip 2", "Trip 3", "Trip 4", "Trip 5"];

  const handleChange = (value: string[]) => {
    setSelectedTrips(value);
  };

  // Filter trip options based on the search term
  const filteredOptions = tripOptions.filter(trip =>
    trip.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minWidth: 200, marginLeft: '1rem' }}>
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder="Quick Search"
        value={selectedTrips}
        onChange={handleChange}
        optionLabelProp="label"
        showSearch
        dropdownRender={(menu) => (
          <>
            <div style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
              <Input
                type="text"
                placeholder="Quick Search"
                style={{ width: '100%', padding: '4px' }}
                onChange={(e) => {
                  setSearchTerm(e.target.value); // Update search term on input change
                }}
              />
            </div>
            {menu}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px' }}>
              <Button size="small" onClick={() => setSelectedTrips([])}>
                Cancel
              </Button>
              <Button size="small" type="primary" onClick={() => console.log("Selected trips:", selectedTrips)}>
                Apply
              </Button>
            </div>
          </>
        )}
        filterOption={false} // Disable default filtering to use custom filtering
      >
        {filteredOptions.map((trip) => (
          <Option key={trip} value={trip} label={trip}>
            {trip}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default TripSelector;

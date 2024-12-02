import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardBody, Col, Container, Row, Input, InputGroup, InputGroupText } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { useNavigate, useSearchParams } from "react-router-dom";
import "Pages/PreStarts/style.css";
import { Button, Segmented, Space } from "antd";
import Table from "Components/Common/Table";
import {DatePicker} from "antd";
import SearchDropdown from "./../TruckLoadOptimisation/components/SearchDropdown";
import { BackwardOutlined, SearchOutlined } from "@ant-design/icons";
import { RangePickerProps } from "antd/es/date-picker";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import PreStartsDetails from "Pages/PreStartDetails";
dayjs.extend(isBetween);
const { RangePicker } = DatePicker;
interface DataType {
  key: string;
  name: string;
  date: string;
  check?: string;
  equipmentType: string;
  passCount: number;
  failCount: number;
  naCount: number;
  inspectionRequired: boolean;
  skippedCount: number;
}

const PreStarts = (props: any) => {
  document.title = "Pre Starts | FMS Live";
  const navigate = useNavigate();
  let _CURENT_SHIFT
  const [currentTab, setCurrentTab] = useState<'main' | 'detail'>('main')
  const now = dayjs(); // Current date and time
  const startOfDayShift = now.startOf('day').add(6, 'hour'); // 6AM today
  const startOfNightShift = now.startOf('day').add(18, 'hour'); // 6PM today
  const [searchParams, setSearchParams] = useSearchParams();
  
  if (now.isBetween(startOfDayShift, startOfNightShift)) {
    _CURENT_SHIFT = "Day Shift"; // 6AM to 6PM
  } else {
    _CURENT_SHIFT = "Night Shift"; // 6PM to 6AM (next day)
  }
  const [currentShift, setCurrentShift] = useState(_CURENT_SHIFT)
  const [timeRange, setTimeRange] = useState('CURRENT_SHIFT');
  const [preStartsData, setPreStartData] = useState<any[]>([]);


  function generateRandomData({
    count = 10, // Number of data items to generate
    timeRange = "PAST", // "PAST" or "CUSTOM"
    startDate,
    endDate,
  }) {
    const names = ["Anderson", "Brown", "Clark", "Davis", "Evans", "Garcia", "Harris", "Jones", "Lewis", "Martinez"];
    const equipmentTypes = ["Haul Truck", "Haul Truck", "Haul Truck", "Excavator"];
  
    // Generate random date
    function getRandomDate() {
      if (timeRange === "CUSTOM" && startDate && endDate && startDate !== "" && endDate !== "") {
        const start = dayjs(startDate).valueOf();
        const end = dayjs(endDate).valueOf();
        const randomTimestamp = Math.random() * (end - start) + start;
        return dayjs(randomTimestamp).format("DD/MM/YYYY");
      }
      const now = dayjs();
      const randomTimestamp = Math.random() * now.valueOf();
      return dayjs(randomTimestamp).format("DD/MM/YYYY");
    }
  
    // Generate random number between min and max
    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  
    // Get random equipmentId based on type
    function getEquipmentId(type) {
      if (type === "Haul Truck") {
        const options = [
          `DT10${getRandomInt(1, 5)}`, // DT101 to DT105
          `DT12${getRandomInt(1, 5)}`, // DT121 to DT125
        ];
        return options[getRandomInt(0, options.length - 1)];
      }
      if (type === "Excavator") {
        const options = [`EX201`, `EX202`, 'EX203'];
        return options[getRandomInt(0, options.length - 1)];
      }
      return null;
    }
  
    // Generate random data
    return Array.from({ length: count }, (_, i) => {
      const equipmentType = equipmentTypes[getRandomInt(0, equipmentTypes.length - 1)];
      return {
        id: i + 1,
        name: names[getRandomInt(0, names.length - 1)],
        date: getRandomDate(),
        equipmentType: equipmentType,
        equipmentId: getEquipmentId(equipmentType), // Assign equipmentId based on type
        passCount: getRandomInt(1, 10),
        failCount: getRandomInt(1, 10),
        naCount: getRandomInt(1, 10),
        inspectionRequired: getRandomInt(1, 10),
        skippedCount: getRandomInt(1, 10),
      };
    });
  }
  

  useEffect(() => {
    // if (timeRange === 'CUSTOM') {
    //   const { _startDate, _endDate } = getShiftDates('CURRENT_SHIFT');
    //   var params: URLSearchParams = new URLSearchParams({
    //     start: dayjs(_startDate).format("YYYY-MM-DD"),
    //     end: 'now',
    //   });
    //   setSearchParams(params);
    // }  if(timeRange === 'CURRENT_SHIFT'){
    // }
    // else{
    //   const { _startDate, _endDate } = getShiftDates(timeRange);
    //   var params: URLSearchParams = new URLSearchParams({
    //     start: dayjs(_startDate).format("YYYY-MM-DD"),
    //     end: 'now',
    //   });
    //   setSearchParams(params);
    // }
  }, [timeRange])
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  function getShiftDates(timeRange) {
    const now = dayjs(); // Current time
    let _startDate, _endDate;
  
    if (timeRange === "CURRENT_SHIFT") {
      const dayShiftStart = now.startOf('day').add(6, 'hour'); // 6 AM today
      const nightShiftStart = now.startOf('day').add(18, 'hour'); // 6 PM today
  
      if (now.isBetween(dayShiftStart, nightShiftStart)) {
        // Current shift is Day Shift
        _startDate = dayShiftStart;
        _endDate = nightShiftStart;
      } else {
        // Current shift is Night Shift
        _startDate = nightShiftStart;
        _endDate = nightShiftStart.add(12, 'hour'); // 6 AM next day
      }
    } else if (timeRange === "PREVIOUS_SHIFT") {
      const dayShiftStart = now.startOf('day').add(6, 'hour'); // 6 AM today
      const nightShiftStart = now.startOf('day').add(18, 'hour'); // 6 PM today
  
      if (now.isBetween(dayShiftStart, nightShiftStart)) {
        // Previous shift is Night Shift
        _startDate = nightShiftStart.subtract(1, 'day'); // 6 PM yesterday
        _endDate = dayShiftStart; // 6 AM today
      } else {
        // Previous shift is Day Shift
        _startDate = dayShiftStart;
        _endDate = nightShiftStart;
      }
    }
  
    return { _startDate: _startDate.format("YYYY-MM-DD HH:mm"), _endDate: _endDate.format("YYYY-MM-DD HH:mm") };
  }

  useEffect(() => {
    let randomData: any = [];
    console.log(timeRange)
    if (timeRange === 'CUSTOM') {
      if (!startDate || !endDate) {
        const { _startDate, _endDate } = getShiftDates('CURRENT_SHIFT');
        randomData = generateRandomData({
          count: 10,
          timeRange:  "CUSTOM", // or "PAST"
          startDate: _startDate,
          endDate: _endDate,
        });
      }
      else{
        randomData = generateRandomData({
          count: 10,
          timeRange:  "CUSTOM", // or "PAST"
          startDate: startDate,
          endDate: endDate,
        });
        var params: URLSearchParams = new URLSearchParams({
          start: dayjs(startDate).format("YYYY-MM-DD"),
          end: dayjs(endDate).format("YYYY-MM-DD"),
        });
        setSearchParams(params);
      }
    }
    else if(timeRange === 'CURRENT_SHIFT'){
      const { _startDate, _endDate } = getShiftDates(timeRange);
      randomData = generateRandomData({
        count: 10,
        timeRange:  "CUSTOM", // or "PAST"
        startDate: _startDate,
        endDate: _endDate,
      });
      var params: URLSearchParams = new URLSearchParams({
        start: dayjs(_startDate).format("YYYY-MM-DD"),
        end: 'now',
      });
      setSearchParams(params);
    }
    else {
      const { _startDate, _endDate } = getShiftDates(timeRange);
      randomData = generateRandomData({
        count: 10,
        timeRange:  "CUSTOM", // or "PAST"
        startDate: _startDate,
        endDate: _endDate,
      });
      var params: URLSearchParams = new URLSearchParams({
        start: dayjs(_startDate).format("YYYY-MM-DD"),
        end: dayjs(_endDate).format("YYYY-MM-DD"),
      });
      setSearchParams(params);
    }
    setPreStartData(randomData)
  }, [timeRange, startDate, endDate])

  const columns = useMemo(
    () => [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        dataType: "string",
        align: "center",
      },
      {
        title: "Equipment Type",
        dataIndex: "equipmentType",
        key: "equipmentType",
        align: "center",
        dataType: "string",
      },
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        dataType: "date",
        align: "center",
        // render: (text) => formatDate(text),
      },
      {
        title: "Pass Count",
        dataIndex: "passCount",
        align: "center",
        key: "passCount",
        dataType: "number",
      },
      {
        title: "Fail Count",
        dataIndex: "failCount",
        align: "center",
        key: "failCount",
        dataType: "number",
      },
      {
        title: "N/A Count",
        dataIndex: "naCount",
        align: "center",
        key: "naCount",
        dataType: "number",
      },
      {
        title: "Inspection Required",
        dataIndex: "inspectionRequired",
        key: "inspectionRequired",
        align: "center",
        dataType: "boolean",
        render: (text) => (text ? "Yes" : "No"),
      },
      {
        title: "Skipped Count",
        dataIndex: "skippedCount",
        align: "center",
        key: "skippedCount",
        dataType: "number",
      },
      {
        title: "Action",
        align: "center",
        key: "action",
        render: (_, record) => (
          <Space size="middle">
            <i onClick={() => handleRowClick(record)} style={{color: 'green'}} className="fas fa-eye"></i>
            <i onClick={() => remove(record.id)} style={{color: 'red'}} className="fas fa-trash"></i>
          </Space>
        ),
      },
    ],
    []
  );

  const data: DataType[] = preStartsData.map((item) => ({
    key: String(item.id),
    name: item.name,
    id: item.id,
    equipmentId: item.equipmentId,
    date: item.date,
    equipmentType: item.equipmentType,
    passCount: item.passCount,
    failCount: item.failCount,
    naCount: item.naCount,
    inspectionRequired: item.inspectionRequired === 1,
    skippedCount: item.skippedCount,
  }));

  const [equipmentId, setEquipmentId] = useState<string>('')
  const handleRowClick = useCallback((row: any) => {
    const equipmentId = row.equipmentId
    const currentParams = new URLSearchParams(window.location.search);

    // Add or update `equipmentId`
    currentParams.set("equipmentId", equipmentId);
    setEquipmentId(equipmentId)
    // Set updated search params
    setSearchParams(currentParams);
    setCurrentTab('detail')
  }, [timeRange]);

  const remove = (id: number) => {

  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      // hour: "2-digit",
      // minute: "2-digit",
    };
    return date.toLocaleDateString("en-GB", options);
  };

  const handleRangeChange: RangePickerProps["onChange"] = (dates, dateStrings) => {
    if (dates) {
      setStartDate(dates[0]?.toDate() || null); // Convert Moment to JS Date
      setEndDate(dates[1]?.toDate() || null);
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      columns.some((col) =>
        String(item[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, columns]);

  const filters = {
    model: [
      {
        label: "HD1500",
        value: "HD1500",
      },
      {
        label: "HD785",
        value: "HD785",
      },
    ],
    fleet: [
      {
        label: "Fleet1",
        value: "EX201",
      },
      {
        label: "Fleet2",
        value: "EX202",
      },
      {
        label: "Fleet3",
        value: "EX205",
      },
    ],
  };

  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: string[];
  }>({ "model": ['HD1500', 'HD785'] });

  const onApply = useCallback(() => {
    if (Object.keys(selectedValues).length === 0) return
  }, [selectedValues])

  useEffect(() => {
  }, [currentTab])

  const goToMain = () => {
    setCurrentTab('main'); 
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.delete("equipmentId");
    // Set updated search params
    setSearchParams(currentParams);
  }
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row className="justify-content-end mb-2">
            <Col xs={12} sm={4} lg={4}>
              <div style={{fontSize: '20px'}}>{currentTab === 'main' ? 'Pre Starts' : 'Checklist'}</div>
            </Col>
            <Col sm={8} xs={12} lg={8} className="d-flex" style={{alignItems: 'center', justifyContent: 'flex-end'}}>
              {
                currentTab === 'main' ? 
                <>
                  <Space>
                    <Segmented className="customSegmentLabel customSegmentBackground" value={timeRange} onChange={(e) => setTimeRange(e)} options={[{ value: 'CUSTOM', label: 'Custom' }, { value: 'PREVIOUS_SHIFT', label: 'Previous Shift' }, { value: 'CURRENT_SHIFT', label: 'Current Shift' }]}/>
                    {
                      timeRange == 'CUSTOM' && <RangePicker onChange={handleRangeChange} style={{minWidth: '240px'}} />
                    }
                </Space>
                <SearchDropdown
                  itemsGroup={filters}
                  disableTitle={false}
                  disableDivider={false}
                  onApply={onApply}
                  selectedValues={selectedValues}
                  setSelectedValues={setSelectedValues}
                />
                <InputGroup style={{flexWrap: 'nowrap'}}>
                  <InputGroupText>
                    <SearchOutlined />
                  </InputGroupText>
                  <Input placeholder="Quick Search" />
                </InputGroup>
                </> :
                <>
                  <Button style={{height: '40px'}} size="middle" onClick={goToMain}>
                    Go to list
                    <BackwardOutlined />
                  </Button>
                </>
              }
            </Col>
          </Row>

          <Row>
            <Col lg="12">
              {
                currentTab === 'main' ?
                <Card>
                  <CardBody>
                    <Table
                      columns={columns}
                      data={filteredData || []}
                      paginationPageSize={10}
                    />
                  </CardBody>
                </Card> :
                <PreStartsDetails equipmentId={equipmentId} />
              }
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default PreStarts;

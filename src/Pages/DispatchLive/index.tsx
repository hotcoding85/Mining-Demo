import React, { useEffect, useState } from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Breadcrumb from 'Components/Common/Breadcrumb';
import { Col, Container, Row } from 'reactstrap';
import { createSelector } from 'reselect';
import { useDispatch, useSelector } from 'react-redux';
import { getShiftRosters, updateShiftRoster, getAllFleet, getAllUsers, addShiftRoster } from 'slices/thunk';
import _ from 'lodash';
import { Button, DatePicker, DatePickerProps, Segmented, Select, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import dayjs from "dayjs";
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import ConfirmModal from 'Components/Common/ConfirmModal';
import { shifts, shiftsInFormat } from 'utils/common';

const DispatchLive = () => {
    document.title = "Dispatch Live | FMS Live";
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb breadcrumbItem="Dispatch Live" title="Operations" />
                    
                </Container>
            </div>
        </React.Fragment>
    )

}
export default DispatchLive;
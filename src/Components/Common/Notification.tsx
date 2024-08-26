import { notification } from 'antd';
import { capitalize } from 'lodash';
import { useEffect } from 'react';

const Notification = ({ type, message, onClose }) => {

    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (message) {
            openNotification();
        }
    }, [message]);

    const openNotification = () => {
        api[type]({
            message: capitalize(type),
            description: message,
            onClose: onClose
        });
    };

    return (
        <>
            {contextHolder}
        </>
    )
}

export default Notification;
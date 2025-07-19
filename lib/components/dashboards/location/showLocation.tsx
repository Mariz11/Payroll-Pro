'use client'
import Location from './location'
import { ToastifyProps } from './types/component';
import { DataRowProps } from './types/location';

type Props = {
    onClose: () => void;
    toastify: ToastifyProps
    data?: DataRowProps;
}

const ShowLocation = (props: Props) => {
    return (
        <Location {...props} type='VIEW' disabled />
    )
}

export default ShowLocation
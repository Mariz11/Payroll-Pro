

import React from 'react'
import { CSVLink } from 'react-csv';

interface Headers {
    label: string
    key: string
}

const CSVDownloadTemplate = ({ ref, filename, headers, data }: { ref: any, filename: string, headers: Headers[], data: any[] }) => {


    return (
        <CSVLink
            ref={ref}
            filename={filename}
            headers={headers}
            data={data}
            target="_blank"
        >
        </CSVLink>
    );
}

export default CSVDownloadTemplate
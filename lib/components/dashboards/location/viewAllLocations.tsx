import { checkIfLocationIsLive, convertDateTime } from 'lib/utils/locationFunctions';
import { VDivider } from 'lib/components/blocks/divider';
import { Button } from 'primereact/button';
import { Column, ColumnProps } from 'primereact/column';
import { DataTable } from 'primereact/datatable'
import { InputSwitch } from 'primereact/inputswitch';
import { Paginator } from 'primereact/paginator';
import { Skeleton } from 'primereact/skeleton';
import React, { useCallback, useEffect, useState } from 'react'
import { DataRowProps } from './types/location';

type ViewLocationsProps = {
    locationsQuery: any;
    first: number;
    setFirst: (first: number) => void;
    pagination: { offset: number; limit: number };
    setPagination: (pagination: { offset: number; limit: number }) => void;
    onView: (params?: { id?: string, data?: DataRowProps }) => void;
    onEdit: (params?: { id?: string, data?: DataRowProps }) => void;
    onDelete: (params?: { id?: string, data?: any }) => void;
    controlStatus?: {
        activate: (params?: { id?: string, data?: DataRowProps }) => void;
        deactivate: (params?: { id?: string, data?: DataRowProps }) => void;
        reActivate: (params?: { id?: string, data?: DataRowProps }) => void;
    };
}
enum LocationStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    EXPIRED = 'EXPIRED',
}

const ViewLocations = (props: ViewLocationsProps) => {
    const { onEdit, onView, onDelete } = props;
    const { locationsQuery, first, setFirst, pagination, setPagination } = props;
    const [tableColumns, setTableColumns] = useState<ColumnProps[]>([])
    const renderStatus = (status: string) => {
        const className = `font-semibold py-3 px-7 text-center text-white rounded-full`;
        switch (status) {
            case LocationStatus.INACTIVE:
            case "0":
                return <span className={`${className} bg-orange-500`}>{LocationStatus.INACTIVE}</span>
            case LocationStatus.ACTIVE:
            case "1":
                return <span className={`${className} bg-green-500`}>{LocationStatus.ACTIVE}</span>
            case LocationStatus.EXPIRED:
            case "2":
                return <span className={`${className} bg-red-700`}>{LocationStatus.EXPIRED}</span>
            default:
                return <span className={`${className} bg-yellow-500`}>{status}</span>;
        }
    }

    const actionsTemplate = useCallback((locationId: string, data?: DataRowProps) => {
        const handleStatusOnChange = (e: any, data?: DataRowProps) => {
            if (!data) return
            const checked = e.value
            const expired = data.is_active?.toString() === "2" || data.is_active === 2;
            if (expired) {
                props.controlStatus?.reActivate({ id: data.location_id.toString(), data })
            } else if (checked) {
                props.controlStatus?.activate({ id: data.location_id.toString(), data })
            } else if (!checked) {
                props.controlStatus?.deactivate({ id: data.location_id.toString(), data })
            }
        }

        if (locationsQuery.isLoading || locationsQuery.isFetching) return <Skeleton />
        return (
            <div className="flex flex-nowrap gap-2">
                <Button
                    type="button"
                    text
                    severity="secondary"
                    icon="pi pi-eye"
                    tooltip="View"
                    disabled={locationsQuery.isLoading}
                    tooltipOptions={{ position: 'top' }}
                    onClick={async () => onView({ id: locationId, data })}
                />
                <VDivider />
                <Button
                    type="button"
                    text
                    severity="info"
                    icon="pi pi-file-edit"
                    tooltip="Edit"
                    disabled={locationsQuery.isLoading}
                    tooltipOptions={{ position: 'top' }}
                    onClick={async () => onEdit({ id: locationId, data })}
                />
                <VDivider />
                <Button
                    type="button"
                    text
                    severity="danger"
                    icon="pi pi-trash"
                    tooltip="Delete"
                    disabled={locationsQuery.isLoading}
                    tooltipOptions={{ position: 'top' }}
                    onClick={async () => onDelete({ id: locationId, data })}
                />
                <VDivider />
                <InputSwitch checked={data?.is_active === 1} onChange={(e) => handleStatusOnChange(e, data)} />
            </div>
        )
    }, [locationsQuery.isFetching, locationsQuery.isLoading, onDelete, onEdit, onView, props.controlStatus])

    useEffect(() => {
        const columns: ColumnProps[] = [
            {
                field: 'location',
                header: 'Location'
            },
            {
                field: 'startDateTime',
                header: 'Start Date/Time'
            },
            {
                field: 'endDateTime',
                header: 'End Date/Time'
            },
            {
                field: 'validity',
                header: 'Validity'
            },
            {
                field: 'status',
                header: 'Status'
            },
            {
                field: 'actions',
                header: 'Actions'
            }
        ]
        setTableColumns(columns)
    }, []);

    return (
        <div className="line-container rounded-lg p-5">
            <p className='text-red-500 font-semibold italic mb-2'>
                Note: {`Employees will still be able to time in/out from any location if no specific location is set.`}
            </p>
            <DataTable value={locationsQuery.isLoading ? [
                {
                    dummy: '',
                },
                {
                    dummy: '',
                },
                {
                    dummy: '',
                },
            ] : (locationsQuery.data && locationsQuery.data.rows || [])} tableStyle={{ minWidth: '50rem' }} emptyMessage="No Locations Found">
                {tableColumns.map((column, index) =>
                    <Column key={index} {...column} body={(row: DataRowProps) => {
                        if (locationsQuery.isLoading || locationsQuery.isFetching) return <Skeleton />
                        if (column.field === "status") return renderStatus(row.is_active?.toString() || "2")
                        if (column.field === "location") return <span>{row.name || row.address}</span>
                        if (column.field === "startDateTime") return <span>{convertDateTime({ date: row.start_date, time: row.time_from })}</span>
                        if (column.field === "endDateTime") return <span>{convertDateTime({ date: row.end_date, time: row.time_to })}</span>
                        if (column.field === "validity") return <span>{row.validity}</span>
                        if (column.field === "actions") return actionsTemplate(row.location_id?.toString(), row)
                    }
                    } />)}
            </DataTable>
            <Paginator
                first={first}
                rows={pagination.limit}
                totalRecords={locationsQuery.data && locationsQuery.data.count}
                rowsPerPageOptions={[5, 15, 25, 50, 100]}
                onPageChange={(event) => {
                    const { page, rows, first }: any = event;
                    console.log({ page, rows, first });
                    setFirst(first);
                    setPagination({
                        offset: rows * page,
                        limit: rows,
                    });
                }}
            />
        </div>
    )
}

export default ViewLocations
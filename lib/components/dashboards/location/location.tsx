'use client'

import "./style.css";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LoadScriptNext, GoogleMap, Marker, Circle, Autocomplete } from '@react-google-maps/api';
import { CalculateScheduleValidity, convertDate, convertDateTime, convertTime } from 'lib/utils/locationFunctions';
import crypto from 'crypto'
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { InputSwitch } from 'primereact/inputswitch';
import { DataTable } from 'primereact/datatable';
import { Column, ColumnProps } from 'primereact/column';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';
import { useQueries } from '@tanstack/react-query';

import { GlobalContainer } from 'lib/context/globalContext';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import { useParams } from "next/navigation";
import { Dialog } from "primereact/dialog";
import { Skeleton } from "primereact/skeleton";
import { ToastifyProps } from "./types/component";
import { DataRowProps } from "./types/location";
import { API } from "./service/api.service";
import moment from "@constant/momentTZ";


type Props = {
    onClose: () => void;
    disabled?: boolean;
    toastify: ToastifyProps;
    data?: DataRowProps;
    type?: "EDIT" | "ADD" | "VIEW";
}

type Coordinates = {
    lat: number;
    lng: number;
};

type EmployeeProps = {
    companyId: number,
    departName: string,
    employeeId: number,
    departmentId: number,
    employee_name: string
}

const Location = (props: Props) => {
    const params = useParams();
    const companyId = params.companyId;
    const { onClose, disabled, type = "ADD", toastify, data } = props;
    const columns: ColumnProps[] = [{ field: 'employee', header: 'Employee' }, { field: 'department', header: 'Department' }, { field: 'actions', header: 'Actions' }]
    const libraries: ("places" | "geometry")[] = ["places"];
    const context = useContext(GlobalContainer);
    const userData = context?.userData;
    const [customizeNameOfPlace, setCustomizeNameOfPlace] = useState(false);
    const [place, setPlace] = useState<string>();
    const [autoCompletePlace, setAutoCompletePlace] = useState<string>();
    const [address, setAddress] = useState<string>();
    const [center, setCenter] = useState<Coordinates>({ lat: 0, lng: 0 });
    const [radius, setRadius] = useState<number>(20);
    const [targetLocation, setTargetLocation] = useState<Coordinates>({ lat: 0, lng: 0 });
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [googleMapLoaded, setGoogleMapLoaded] = useState<boolean>(false);
    const [timeFormat, setTimeFormat] = useState<"24" | "12">("24");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");
    const [timeFrom, setTimeFrom] = useState<string>("");
    const [timeTo, setTimeTo] = useState<string>("");
    const [selectedDepartments, setSelectedDepartments] = useState<{ departmentId: number, departName: string, }[]>([]);
    const [assignedEmployees, setAssignedEmployees] = useState<EmployeeProps[]>([]);
    const [employeeTable, setEmployeeTable] = useState<EmployeeProps[]>([]);
    const [switchedToDepartment, setSwitchedToDepartment] = useState<boolean>(false);
    const [tableColumns, setTableColumns] = useState<ColumnProps[]>(columns);
    const [employeeFilter, setEmployeeFilter] = useState<string>("");
    const [selectedEmployeeToRemove, setSelectedEmployeeToRemove] = useState<EmployeeProps>();
    const [showRemoveDialog, setShowRemoveDialog] = useState<boolean>(false);
    const [toBeAddEmployees, setToBeAddEmployees] = useState<EmployeeProps[]>([]);
    const [toBeDeleteEmployees, setToBeDeleteEmployees] = useState<EmployeeProps[]>([]);
    const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [employeesQuery, assignedEmployeesQuery] = useQueries({
        queries: [
            {
                queryKey: ['getEmployees'],
                queryFn: async () => await API.getEmployeesByCompanyId({
                    companyId: companyId || userData?.companyId,
                    // startDate: dateFrom,
                    // endDate: dateTo,
                    limit: 999,
                    offset: 0,
                }),
            },
            {
                queryKey: ['getEmployeesByLocation', data?.location_id],
                queryFn: async () => await API.getEmployeesByLocation(data?.location_id, { limit: 999, offset: 0 }),
            }
        ],
    });
    const employees: EmployeeProps[] = useMemo(() => {
        return [
            ...employeesQuery?.data?.rows || [],
            ...assignedEmployeesQuery?.data?.rows || [],
        ]

    }, [assignedEmployeesQuery?.data?.rows, employeesQuery?.data?.rows]);

    const validity = useMemo(() => CalculateScheduleValidity({ dateFrom, dateTo, timeFrom, timeTo }), [dateFrom, dateTo, timeFrom, timeTo]);

    const dateToIsBeforeDateNow: boolean = useMemo(() => {
        if (!dateTo) return false;
        const dateNow = moment().startOf('day');
        return moment(dateTo).isBefore(dateNow, 'day');
    }, [dateTo]);

    const headerButtonTemplate = useMemo(() => {
        const defaultHeaderButtons: Buttons[] = [];
        const navTitle = () => {
            if (type === "ADD") return "Add Location"
            if (type === "EDIT") return "Edit Location"
            if (type === "VIEW") return "View Location"
            return "Location"
        }
        const DashboardOptions = {
            default: {
                navTitle: navTitle(),
                buttons: defaultHeaderButtons,
            },
        };
        return <DashboardNav {...DashboardOptions.default} />
    }, [type]);

    const employeesOptions = useMemo(() => {
        if (!employees) return [];
        const assignedIds = new Set(employeeTable.map(emp => emp.employeeId))
        return (employees)
            .filter(emp => !assignedIds.has(emp.employeeId))
    }, [employeeTable, employees]);

    const departmentOptions = useMemo(() => {
        if (!employeesOptions) return [];
        const seen = new Set<number>();
        return employeesOptions
            .filter(emp => {
                if (seen.has(emp.departmentId)) return false;
                seen.add(emp.departmentId);
                return true;
            })
            .map(({ departName, departmentId }) => ({
                departName, departmentId
            }));
    }, [employeesOptions]);

    const disableSubmit = useMemo(() => {
        try {
            return !address || !dateFrom || !dateTo || !timeFrom || !timeTo || !employeeTable?.length || submitLoading
        } catch (error) {
            return false
        }
    }, [address, dateFrom, dateTo, employeeTable?.length, submitLoading, timeFrom, timeTo])

    const disableAssigning = useMemo(() => {
        try {
            return !dateFrom || !dateTo || !employeesQuery?.data
        } catch (error) {
            return false
        }
    }, [dateFrom, dateTo, employeesQuery?.data])

    const checkIfDataChanged = useMemo(() => {
        if (!data) return false;
        const newPayload = {
            name: place,
            address: address,
            validity: validity,
            latitude: targetLocation.lat,
            longitude: targetLocation.lng,
            start_date: dateFrom,
            end_date: dateTo,
            time_from: timeFrom,
            time_to: timeTo,
            radius: radius,
        };

        const oldPayload = {
            name: data.name,
            address: data.address,
            validity: data.validity,
            latitude: data.latitude,
            longitude: data.longitude,
            start_date: convertDate(data.start_date),
            end_date: convertDate(data.end_date),
            time_from: convertTime(convertDateTime({ date: new Date().toDateString(), time: data.time_from })),
            time_to: convertTime(convertDateTime({ date: new Date().toDateString(), time: data.time_to })),
            radius: data.radius,
        };
        return JSON.stringify(newPayload) !== JSON.stringify(oldPayload);
    }, [data, place, address, validity, targetLocation.lat, targetLocation.lng, dateFrom, dateTo, timeFrom, timeTo, radius]);

    const handlePlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry?.location) {
                const payload = {
                    name: place.name,
                    address: place.formatted_address,
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                };
                setTargetLocation({ lat: payload.lat, lng: payload.lng });
                setPlace(payload.name);
                setAutoCompletePlace(payload.name);
                setAddress(payload.address);
            } else {
                console.error("No details found for selected place.");
            }
        }
    };

    const handleMarkerDragEnd = ({ lat, lng }: Coordinates) => {
        setTargetLocation({ lat, lng })
        try {
            if (!window.google || !window.google.maps) return;
            const geocoder = new google.maps.Geocoder();
            const latlng = { lat, lng };
            geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === "OK" && results) {
                    setAddress(results[0].formatted_address);
                    setPlace(results[0]?.address_components?.[0]?.long_name)
                } else {
                    console.error("Geocoder failed due to: ", status);
                }
            });
        } catch (error) {
            console.error("Error geocoding coordinates: ", error);
        }
    };

    const handleAddLocation = useCallback(async () => {
        toastify.loading();
        setSubmitLoading(true);
        try {
            const payload = {
                company_id: companyId?.length ? +companyId : userData?.companyId,
                name: place,
                address: address,
                validity: validity,
                latitude: targetLocation.lat,
                longitude: targetLocation.lng,
                start_date: dateFrom,
                end_date: dateTo,
                time_from: timeFrom,
                time_to: timeTo,
                radius: radius,
                employee_ids: employeeTable.map(emp => emp.employeeId),
            };
            const signature = crypto.createHash('sha512').update(JSON.stringify(payload)).digest('hex');
            const body = {
                signature,
                ...payload
            };
            const result = await API.addLocation(body);
            if (result) {
                toastify.success(undefined, "Successfully added location!");
            }
            return onClose();
        } catch (error: any) {
            console.error("Error adding location: ", error);
            const fallbackMsg = error?.message || "An error occurred while adding location.";
            if (error?.response?.status < 500) {
                return toastify.error("Error Creating Location", error?.response?.data?.error || fallbackMsg);
            }
            toastify.error("Error Creating Location", fallbackMsg);
            return onClose();
        } finally {
            setSubmitLoading(false);
        }
    }, [toastify, companyId, userData?.companyId, place, address, validity, targetLocation.lat, targetLocation.lng, dateFrom, dateTo, timeFrom, timeTo, radius, employeeTable, onClose]);

    const handleEditLocation = useCallback(async () => {
        toastify.loading();
        setSubmitLoading(true);
        try {
            const payload = {
                location_id: data?.location_id,
                company_id: companyId?.length ? +companyId : userData?.companyId,
                name: place,
                address: address,
                validity: validity,
                latitude: targetLocation.lat,
                longitude: targetLocation.lng,
                start_date: dateFrom,
                end_date: dateTo,
                time_from: timeFrom,
                time_to: timeTo,
                radius: radius,
            };
            const body = {
                ...payload
            };
            const result = checkIfDataChanged && await API.editLocation(body);
            if (toBeAddEmployees?.length) {
                const addEmployeeResp = await API.addEmployeeToLocation({
                    locationId: data?.location_id,
                    employeeIds: toBeAddEmployees.map(emp => emp.employeeId),
                });
            }
            if (toBeDeleteEmployees?.length) {
                const removeEmployeeResponse = await API.removeEmployeeFromLocation({
                    locationId: data?.location_id,
                    employeeIds: toBeDeleteEmployees.map(emp => emp.employeeId),
                });
            }
            toastify.success(undefined, "Successfully updated location!");
            return onClose();
        } catch (error: any) {
            console.error("Error editing location: ", error);
            const fallbackMsg = error?.message || "An error occurred while editing location.";
            if (error?.response?.status < 500) {
                return toastify.error("Error Editing Location", error?.response?.data?.error || fallbackMsg);
            }
            toastify.error("Error Editing Location", fallbackMsg);
            return onClose();
        } finally {
            setSubmitLoading(false);
        }
    }, [toastify, data?.location_id, companyId, userData?.companyId, place, address, validity, targetLocation.lat, targetLocation.lng, dateFrom, dateTo, timeFrom, timeTo, radius, checkIfDataChanged, toBeAddEmployees, toBeDeleteEmployees, onClose]);

    const handleAssignEmployee = useCallback(async (selection: "employee" | "department") => {
        const assignees: EmployeeProps[] = assignedEmployeesQuery?.data?.rows || [];
        if (selection === "employee") {
            setEmployeeTable(prev => prev.concat(assignedEmployees));
            setToBeAddEmployees(prev => prev.concat(assignedEmployees
                .filter(emp => !assignees
                    .some(assignedEmp => assignedEmp.employeeId === emp.employeeId)
                )));
            setToBeDeleteEmployees(prev => prev.filter(employee => !assignedEmployees.some(emp => emp.employeeId === employee.employeeId)));
        }
        if (selection === "department") {
            const selectedEmployees = employees.filter((emp: EmployeeProps) =>
                selectedDepartments
                    .some((department) => emp.departmentId === department.departmentId)
            );
            setEmployeeTable(prev => prev.concat(selectedEmployees)
            );
            setToBeAddEmployees(prev => prev.concat(selectedEmployees
                .filter(emp => !assignees
                    .some(assignedEmp => assignedEmp.employeeId === emp.employeeId)
                ))
            );
            setToBeDeleteEmployees(prev => prev.filter(employee => !selectedEmployees.some(emp => emp.employeeId === employee.employeeId)));
        }

        setSelectedDepartments([]);
        setAssignedEmployees([])
    }, [employees, assignedEmployeesQuery?.data, assignedEmployees, selectedDepartments]);

    const openRemoveEmployeeDialog = useCallback((employee: EmployeeProps) => {
        setSelectedEmployeeToRemove(employee);
        setShowRemoveDialog(true);
    }, []);

    const handleRemoveEmployee = useCallback(async () => {
        try {
            setEmployeeTable(prev => prev.filter(employee => employee.employeeId !== selectedEmployeeToRemove?.employeeId));
            setToBeAddEmployees(prev => prev.filter(employee => employee.employeeId !== selectedEmployeeToRemove?.employeeId));
            if (!assignedEmployeesQuery?.data) return;
            setToBeDeleteEmployees(prev => [...prev, ...(assignedEmployeesQuery?.data.rows as EmployeeProps[]).filter(employee => employee.employeeId === selectedEmployeeToRemove?.employeeId)]);
        }
        catch (error) {
            console.error("Error removing employee: ", error);
        } finally {
            setShowRemoveDialog(false);
        }
    }, [assignedEmployeesQuery?.data, selectedEmployeeToRemove?.employeeId]);

    useEffect(() => {
        if (type === "ADD") return;
        if (data) {
            setPlace(data.name);
            setAddress(data.address);
            setTargetLocation({ lat: data.latitude || 0, lng: data.longitude || 0 });
            setRadius(data.radius);
            setDateFrom(convertDate(data.start_date));
            setDateTo(convertDate(data.end_date));
            setTimeFrom(convertTime(convertDateTime({ date: new Date().toDateString(), time: data.time_from })));
            setTimeTo(convertTime(convertDateTime({ date: new Date().toDateString(), time: data.time_to })));
        }
        if (assignedEmployeesQuery?.data) {
            setEmployeeTable(assignedEmployeesQuery?.data.rows);
        }
    }, [data, type, assignedEmployeesQuery?.data]);

    useEffect(() => {
        if (type === "ADD") {
            setCustomizeNameOfPlace(false);
        } else {
            setCustomizeNameOfPlace(true);
        }
    }, [type]);

    useEffect(() => {
        if (!googleMapLoaded) return;
        if (window.google && google.maps) autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
        if (type !== "ADD") return;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    handleMarkerDragEnd({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setCenter({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error getting location: ", error);
                    setTargetLocation({ lat: 0, lng: 0 });
                    setCenter({ lat: 0, lng: 0 });
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }, [googleMapLoaded, type]);

    useEffect(() => {
        if (!map) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setCenter(targetLocation);
            map.panTo(targetLocation);
        }, 500);
    }, [map, targetLocation])

    return (
        <>
            <div className='w-full flex flex-wrap gap-5 justify-between items-center'>
                {headerButtonTemplate}
            </div>
            <div className='w-full flex flex-wrap'>
                <div className='relative w-1/2 h-auto bg-white flex flex-col justify-start items-center gap-3 pl-0 pr-5 pb-5 font-thin'>
                    <div className='w-full flex flex-wrap gap-5 items-center'>
                        <InputSwitch disabled={disabled} checked={customizeNameOfPlace} onChange={() => setCustomizeNameOfPlace(prev => !prev)} /> {customizeNameOfPlace ? <span>Switch to search place</span> : <span>Switch to customize name of place</span>}
                    </div>
                    {!customizeNameOfPlace ? googleMapLoaded &&
                        <Autocomplete className='w-full' onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)} onPlaceChanged={() => handlePlaceChanged()} >
                            <InputText defaultValue={address} className='w-full' type='search' placeholder='Search Location' disabled={disabled} />
                        </Autocomplete>
                        : <InputText className='w-full' type='text' placeholder='Input Name of Place' disabled={disabled} value={place} onChange={(e) => setPlace(e.target.value)} />}
                    <div className='w-full flex flex-wrap justify-between'>
                        <div className='w-[280px]'>
                            <label htmlFor="lat">Latitude</label>
                            <InputText name='lat' className='w-full' disabled value={targetLocation.lat.toString()} />
                        </div>
                        <div className='w-[280px]'>
                            <label htmlFor="lng">Longitude</label>
                            <InputText name='lng' className='w-full' disabled value={targetLocation.lng.toString()} />
                        </div>
                    </div>
                    <div className='w-full'>
                        <label htmlFor="radius">{`Radius (meters)`}</label>
                        <InputText name='radius' className='w-full' type="number" onChange={e => setRadius(+e.target.value)} value={radius.toString()} disabled={disabled} />
                    </div>
                    <div className="w-full flex flex-wrap justify-start items-center gap-5"><InputSwitch checked={timeFormat === "12"} onChange={e => setTimeFormat(prev => (prev === "24" ? "12" : "24"))} /> <span>{timeFormat} Hour Format</span></div>
                    <div className='w-full flex flex-wrap justify-between'>
                        <div className='w-[280px]'>
                            <label htmlFor="dateFrom">Date From:</label>
                            <Calendar required id='dateFrom' name='dateFrom' className='w-full' value={dateFrom ? moment(dateFrom, "YYYY-MM-DD").toDate() : null} showIcon dateFormat='MM dd yy - DD' showButtonBar onChange={e => { setDateFrom(convertDate(e.value)) }} disabled={disabled}
                            />
                        </div>
                        <div className='w-[280px]'>
                            <label htmlFor="timeFrom">Time From:</label>
                            <Calendar required id='timeFrom' name='timeFrom' className='w-full' value={timeFrom && new Date(convertDateTime({ date: new Date().toDateString(), time: timeFrom }))} showIcon showTime hourFormat={timeFormat} timeOnly icon={"pi pi-clock"} showButtonBar onChange={e => setTimeFrom(convertTime(e.value))} disabled={disabled} />
                        </div>
                    </div>
                    <div className='w-full flex flex-wrap justify-between'>
                        <div className='w-[280px]'>
                            <label htmlFor="dateTo">Date To:</label>
                            <Calendar required id='dateTo' name='dateTo' className='w-full' value={dateTo ? moment(dateTo, "YYYY-MM-DD").toDate() : null} showIcon dateFormat='MM dd yy - DD' showButtonBar minDate={dateFrom ? moment(dateFrom, "YYYY-MM-DD").toDate() : null} onChange={e => setDateTo(convertDate(e.value))} disabled={disabled || !dateFrom.length || !timeFrom.length} />
                        </div>
                        <div className='w-[280px]'>
                            <label htmlFor="timeTo">Time To:</label>
                            <Calendar required id='timeTo' name='timeTo' className='w-full' value={timeTo && new Date(convertDateTime({ date: new Date().toDateString(), time: timeTo }))} showIcon showTime hourFormat={timeFormat} timeOnly icon={"pi pi-clock"} showButtonBar onChange={e => setTimeTo(convertTime(e.value))} disabled={disabled || !dateFrom.length || !timeFrom.length} />
                        </div>
                    </div>
                    <div className='w-full'>
                        <label htmlFor="validity">Validity</label>
                        <InputText name='validity' className='w-full' disabled value={validity} />
                    </div>
                </div>
                <div className='relative w-1/2 h-[calc(70vh-4rem)]'>
                    {libraries?.length && <LoadScriptNext googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string} onLoad={() => setGoogleMapLoaded(true)} libraries={libraries}>
                        <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={center}
                            zoom={19}
                            options={{
                                disableDefaultUI: true,
                                zoomControl: true,
                                streetViewControl: false,
                                mapTypeControl: false,
                            }}
                            onLoad={(mapInstance) => setMap(mapInstance)}
                        >
                            <Marker
                                position={targetLocation}
                                onDragEnd={async (e) => await handleMarkerDragEnd({ lat: e.latLng?.lat() || 0, lng: e.latLng?.lng() || 0 })}
                                draggable
                                animation={googleMapLoaded ? google.maps.Animation.DROP : undefined}
                                icon={{
                                    url: '/images/google-marker.png',
                                    scaledSize: googleMapLoaded ? new google.maps.Size(16, 30) : undefined,
                                }}
                            />
                            <Circle
                                center={targetLocation}
                                radius={radius}
                                options={{
                                    fillColor: 'blue',
                                    fillOpacity: 0.15,
                                    strokeColor: 'blue',
                                    strokeOpacity: 0.15,
                                }}
                            />
                        </GoogleMap>
                    </LoadScriptNext>}
                    {disabled && <div className='absolute w-full h-full top-0 bottom-0 left-0 right-0 '></div>}
                </div>
                {disabled ?
                    <label htmlFor="assignEmployee" className='font-semibold'>Assign Employee</label>
                    : <div className='w-[30%] pr-5'>
                        <label htmlFor="assignEmployee" className='font-semibold'>Assign Employee</label>
                        <div className='flex flex-col gap-5'>
                            <div className='flex items-center gap-5 pt-3'>
                                <InputSwitch name='switchToDepartment' checked={switchedToDepartment} onChange={() => setSwitchedToDepartment(prev => !prev)} disabled={disabled} />
                                {
                                    switchedToDepartment ?
                                        <span>Switch to Employee</span>
                                        : <span>Switch to Department</span>
                                }
                            </div>
                            {
                                switchedToDepartment ?
                                    <div className='flex flex-col'>
                                        <label htmlFor="chooseDepartment" >{"Choose Department/s"}</label>
                                        <MultiSelect filter optionLabel='departName' placeholder='Search Department' closeIcon={"pi pi-times"} disabled={disabled} display="chip"
                                            value={selectedDepartments}
                                            options={departmentOptions}
                                            onChange={e => setSelectedDepartments(e.value)}
                                        />
                                    </div>
                                    : <div className='flex flex-col'>
                                        <label htmlFor="chooseEmployee" >{"Choose Employee/s"}</label>
                                        <MultiSelect filter optionLabel='employee_name' placeholder='Search Employee' closeIcon={"pi pi-times"} disabled={disabled} display="chip"
                                            value={assignedEmployees}
                                            options={employeesOptions}
                                            onChange={e => setAssignedEmployees(e.value)} />

                                    </div>
                            }
                            <Button className='w-32 flex justify-center rounded-full text-center items-center' disabled={disabled || disableAssigning || dateToIsBeforeDateNow} onClick={() => handleAssignEmployee(switchedToDepartment ? "department" : "employee")}>Assign</Button>
                        </div>
                    </div>}
                <div className={`flex flex-col gap-5 ${disabled ? "w-full" : "w-[70%]"} line-container rounded-lg p-5`}>
                    <div className='relative flex flex-row w-full '>
                        <InputText className='w-full' type='text' placeholder='Search' value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} /><i className="pi pi-search absolute top-1/2 -translate-y-1/2 right-4"></i>
                    </div>

                    <DataTable disabled={disabled} className='w-full' value={assignedEmployeesQuery.isLoading ? [
                        {
                            dummy: '',
                        },
                        {
                            dummy: '',
                        },
                        {
                            dummy: '',
                        },
                    ] : employeeTable
                    } scrollable scrollHeight='calc(70vh - 4rem)'
                        globalFilterFields={['employee_name', 'departName']}
                        filters={{ global: { value: employeeFilter, matchMode: 'contains' } }}
                        dataKey="employeeId"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[10, 15, 20, 25]}
                    >
                        {tableColumns.map((column, index) => <Column key={index} {...column} body={(row) => {
                            if (assignedEmployeesQuery.isLoading) return <Skeleton />
                            if (column.field === "employee") return (<span>{row.employee_name}</span>);
                            if (column.field === "department") return (<span>{row.departName}</span>);
                            if (column.field === "actions")
                                return (<Button
                                    id="remove-employee-button"
                                    type="button"
                                    text
                                    severity="danger"
                                    icon="pi pi-trash"
                                    tooltip="Delete"
                                    tooltipOptions={{ position: 'top' }}
                                    onClick={() => openRemoveEmployeeDialog(row)}
                                    disabled={disabled}
                                />)
                        }} />)}
                    </DataTable>
                </div>
                <div className='w-full py-5 flex flex-wrap gap-5 justify-end'>
                    <Button type='button' className='rounded-full' severity='secondary' text onClick={() => onClose()}>Cancel</Button>
                    {type == "ADD" && <Button className='rounded-full px-5' disabled={disabled || disableSubmit} onClick={() => handleAddLocation()} >Add Location</Button>}
                    {type == "EDIT" && <Button className='rounded-full px-5' disabled={disabled || disableSubmit} onClick={() => handleEditLocation()} >Update Location</Button>}
                </div>
            </div >
            <Dialog header="Confirmation" visible={showRemoveDialog} onHide={() => setShowRemoveDialog(false)}
                footer={
                    <div className='w-full flex justify-end gap-5'>
                        <Button type='button' severity='secondary' text onClick={() => setShowRemoveDialog(false)}>No</Button>
                        <Button onClick={() => handleRemoveEmployee()}>Yes</Button>
                    </div>
                }>
                <li className="pi pi-exclamation-triangle"></li> <span>{"Do you want to remove this employee?"}</span>
            </Dialog>
        </>
    )
}

export default Location
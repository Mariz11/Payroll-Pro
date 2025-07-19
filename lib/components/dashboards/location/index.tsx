'use client';

import { useQueries } from '@tanstack/react-query';
import { Toast } from 'primereact/toast';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import ViewAllLocations from './viewAllLocations';
import AddLocation from './addLocation';
import EditLocation from './editLocation';
import ShowLocation from './showLocation';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { ButtonType } from '@enums/button';
import { DataRowProps, LocationActivationProps } from './types/location';
import { API } from './service/api.service';
import { useParams } from 'next/navigation';
import { GlobalContainer } from 'lib/context/globalContext';

type ActionType = "MAIN" | "ADD" | "SHOW" | "EDIT";

type ConfirmSidebarConfigProps = {
    controller: "location" | "status";
    type: "delete" | "activate" | "deactivate" | "reActivate";
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    buttonLabel: "Delete" | "Confirm" | "Update";
}

const Index = () => {
    const params = useParams();
    const companyId = params.companyId;
    const context = useContext(GlobalContainer);
    const userData = context?.userData;
    const [searchQuery, setSearchQuery] = useState('');
    const [first, setFirst] = useState(0);
    const [pagination, setPagination] = useState({ offset: 0, limit: 5 });
    const [activeComponent, setActiveComponent] = useState<ActionType>("MAIN")
    const [data, setData] = useState<DataRowProps>()
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false)
    const [confirmSidebarConfig, setConfirmSidebarConfig] = useState<ConfirmSidebarConfigProps | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const toast = useRef<Toast>(null);

    const [locationsQuery] = useQueries({
        queries: [
            {
                queryKey: ['locations'],
                queryFn: async () => await API.getLocations({
                    companyId: companyId || userData?.companyId,
                    searchPhrase: searchQuery,
                    role: "ADMIN",
                    ...pagination,
                }),
                cacheTime: 0,
                refetchOnWindowFocus: false,
            },
        ],
    });

    const toastify = useMemo(() => ({
        loading() {
            toast.current?.show({ severity: 'info', summary: 'Submitting Request', detail: 'Please wait...', sticky: true });
        },
        clear() {
            toast.current?.clear();
        },
        success(summary?: string, message?: string) {
            this.clear();
            toast.current?.show({ severity: 'success', summary: summary || 'Successfully Created', detail: message, life: 3000 });
        },
        error(summary?: string, message?: string) {
            this.clear();
            toast.current?.show({ severity: 'error', summary: summary || 'Error Creating', detail: message || "There is a problem this request", life: 3000 });
        },
    }), [toast]);

    const headerButtonTemplate = useMemo(() => {
        const defaultHeaderButtons: Buttons[] = [
            {
                icon: 'pi pi-plus',
                label: 'Add Location',
                isDropdown: false,
                isIcon: true,
                type: ButtonType.Red,
                handler: () => {
                    setActiveComponent("ADD")
                }
            },
        ];
        const DashboardOptions = {
            default: {
                navTitle: 'Company > Location',
                buttons: defaultHeaderButtons,
                isShowSearch: true,
                searchPlaceholder: 'Search Location',
                setValueSearchText: setSearchQuery,
                valueSearchText: searchQuery,
            },

        };
        return <DashboardNav {...DashboardOptions.default} />
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, activeComponent]);

    const renderLocationComponent = useMemo(() => {
        switch (activeComponent) {
            case 'ADD':
                return <AddLocation onClose={() => setActiveComponent("MAIN")} toastify={toastify} />
            case 'EDIT':
                return <EditLocation onClose={() => setActiveComponent("MAIN")} toastify={toastify} data={data} />
            case 'SHOW':
                return <ShowLocation onClose={() => setActiveComponent("MAIN")} toastify={toastify} data={data} />
            default:
                return <></>;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeComponent, locationsQuery, toastify, data])

    const handleDeleteLocation = useCallback(async (locationData: any) => {
        if (!locationData) return;
        toastify.loading();
        try {
            setIsLoading(true);
            const response = await API.deleteLocation({ locationId: locationData.location_id, companyId: locationData.company_id });
            if (response) {
                toastify.success("Location Deleted Successfully");
                setShowConfirmDialog(false);
                setActiveComponent("MAIN")
                setData(undefined);
                setConfirmSidebarConfig(undefined);
            }
            locationsQuery.refetch();
        } catch (error: any) {
            console.error("Error deleting location:", error);
            const fallbackMsg = error?.message || "There is a problem with this request";
            if (error?.response?.status < 500) {
                return toastify.error(error?.response?.data?.error || fallbackMsg);
            }
            toastify.error(fallbackMsg);
        } finally {
            setIsLoading(false);
        }
    }, [locationsQuery, toastify])

    const handleUpdateLocationStatus = useCallback(async (body: LocationActivationProps) => {
        try {
            toastify.loading();
            setIsLoading(true);
            const response = await API.updateLocationStatus(body);
            if (response) {
                toastify.success("Location Status Updated Successfully");
                setShowConfirmDialog(false);
                setActiveComponent("MAIN")
                setData(undefined);
                setConfirmSidebarConfig(undefined);
            }
        }
        catch (error: any) {
            toastify.error(error?.message || "There is a problem with this request")
        }
        finally {
            setIsLoading(false);
            locationsQuery.refetch();
        }
    }, [locationsQuery, toastify])


    const handleControlConfirmSidebar = (controller: any, type: any, locationData?: DataRowProps,) => {
        if (!locationData) return;
        setData(locationData);
        if (controller === "location") {
            if (type === "delete") {
                setConfirmSidebarConfig({
                    controller: controller,
                    type: type,
                    title: `Delete Location${locationData ? " " + locationData.name : ""}?`,
                    message: "Removing this Location cannot be undone. Are you sure you want to continue?",
                    onCancel: () => setShowConfirmDialog(prev => !prev),
                    onConfirm: async () => await handleDeleteLocation(locationData),
                    buttonLabel: "Delete",
                });
                setShowConfirmDialog(true);
                return;
            }
        }
        if (controller === "status") {
            const body = {
                locationId: locationData.location_id,
                company_id: locationData.company_id,
                start_date: locationData.start_date,
                end_date: locationData.end_date,
                is_active: type === "activate" ? 1 : 0,
            }
            if (type === "activate") {
                setConfirmSidebarConfig({
                    controller: controller,
                    type: type,
                    title: `Activate Location${locationData ? " " + locationData.name : ""}`,
                    message: `You are about to activate the location ${locationData.name}. Are you sure you want to continue?`,
                    onCancel: () => setShowConfirmDialog(prev => !prev),
                    onConfirm: async () => await handleUpdateLocationStatus(body),
                    buttonLabel: "Confirm",
                });
                setShowConfirmDialog(true);
                return;
            }
            if (type === "deactivate") {
                setConfirmSidebarConfig({
                    controller: controller,
                    type: type,
                    title: `Deactivate Location${locationData ? " " + locationData.name : ""}`,
                    message: `You are about to deactivate the location ${locationData.name}. Are you sure you want to continue?`,
                    onCancel: () => setShowConfirmDialog(prev => !prev),
                    onConfirm: async () => await handleUpdateLocationStatus(body),
                    buttonLabel: "Confirm",
                });
                setShowConfirmDialog(true);
                return;
            }
            if (type === "reActivate") {
                setConfirmSidebarConfig({
                    controller: controller,
                    type: type,
                    title: `Location${locationData ? " " + locationData.name : " expired!"}`,
                    message: `The validity for this location is already ended. Please update the start and/or end date before reactivating the location.`,
                    onCancel: () => setShowConfirmDialog(prev => !prev),
                    onConfirm: () => { setActiveComponent("EDIT"); setShowConfirmDialog(prev => !prev) },
                    buttonLabel: "Update",
                });
                setShowConfirmDialog(true);
                return;
            }
        }
    }

    const renderConfirmSidebar = useMemo(() => {
        if (!confirmSidebarConfig) return <></>;
        return (
            <Sidebar visible={showConfirmDialog} onHide={() => setShowConfirmDialog(prev => !prev)} position='right' className='p-sidebar-md'>
                <div className='w-full h-full flex flex-col items-center justify-center gap-3 text-center'>
                    <h1 className="text-black font-medium text-3xl">{confirmSidebarConfig.title}</h1>
                    <h3 className="font-medium mt-5">{confirmSidebarConfig.message}</h3>
                    <div className='mt-2 w-full flex flex-nowrap justify-center items-center gap-2 text-center'>
                        <Button disabled={isLoading} type='button' severity='secondary' className='w-full' rounded text onClick={() => confirmSidebarConfig.onCancel?.()} label={"Cancel"} />
                        <Button disabled={isLoading} className='w-full' rounded label={confirmSidebarConfig?.buttonLabel} onClick={() => confirmSidebarConfig.onConfirm?.()} />
                    </div>
                </div>
            </Sidebar>
        )
    }, [confirmSidebarConfig, showConfirmDialog, isLoading])

    useEffect(() => {
        locationsQuery.refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeComponent, pagination, searchQuery]);

    useEffect(() => {

    }, []);

    return (
        <>
            <div className="w-screen h-screen overflow-auto p-5">
                {headerButtonTemplate}
                <Sidebar visible={activeComponent !== "MAIN"} onHide={() => setActiveComponent("MAIN")} position='right' style={{ width: "84%" }} className='p-sidebar-md relative' >
                    {renderLocationComponent}
                </Sidebar>
                <ViewAllLocations
                    locationsQuery={locationsQuery}
                    first={first}
                    setFirst={setFirst}
                    pagination={pagination}
                    setPagination={setPagination}
                    onEdit={e => { setActiveComponent("EDIT"); setData(e?.data) }}
                    onView={e => { setActiveComponent("SHOW"); setData(e?.data) }}
                    onDelete={e => handleControlConfirmSidebar("location", "delete", e?.data,)}
                    controlStatus={
                        {
                            activate: e => handleControlConfirmSidebar("status", "activate", e?.data),
                            deactivate: e => handleControlConfirmSidebar("status", "deactivate", e?.data),
                            reActivate: e => handleControlConfirmSidebar("status", "reActivate", e?.data,),
                        }
                    }
                />
            </div>
            {renderConfirmSidebar}
            <Toast ref={toast} position="bottom-left" />
        </>
    );
};

export default Index;
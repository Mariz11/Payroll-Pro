"use client"

import Script from 'next/script';
import CustomSidebar from '@layout/customSidebar';
import Index from 'lib/components/dashboards/location';
import axios from 'axios';
import { useEffect, useState } from 'react';
import LoadingScreen from 'lib/components/loading/loading';
import NotFound from 'app/not-found';


const Page = () => {
    const [moduleAccess, setModuleAccess] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [roleName, setRoleName] = useState<any>('');
    useEffect(() => {
        setIsLoading(true);
        axios
            .get(`/api/user/role`, {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                },
            })
            .then((res: any) => {
                setIsLoading(false);
                setModuleAccess(JSON.parse(res.data.message.moduleAccess));
                setRoleName(res.data.message.roleName);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);
    let isAllowed = moduleAccess.find((item: any) => item.moduleId === 9)
        ? true
        : false;
    if (isLoading) {
        return <LoadingScreen />;
    }
    if (!isAllowed) {
        return <NotFound />;
    }
    return (
        <>
            <Script
                async
                src={`${process.env.NEXT_PUBLIC_GOOGLE_API}/maps/api/geocode/json?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&loading=async&libraries=placescallback=initMap`}
                strategy="afterInteractive"
            />
            <div className="h-screen flex">
                {/* SIDE BAR */}
                <CustomSidebar roleName={roleName} moduleAccess={moduleAccess} />

                {/* MAIN COMPONENT */}
                <Index />
            </div>
        </>
    )
}

export default Page
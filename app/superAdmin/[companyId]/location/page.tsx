import Script from 'next/script';
import CustomSidebar from '@layout/customSidebar';
import Index from 'lib/components/dashboards/location';


const Page = () => {
    return (
        <>
            <Script
                async
                src={`${process.env.NEXT_PUBLIC_GOOGLE_API}/maps/api/geocode/json?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&loading=async&libraries=placescallback=initMap`}
                strategy="beforeInteractive"
            />
            <div className="h-screen flex">
                {/* SIDE BAR */}
                <CustomSidebar />

                {/* MAIN COMPONENT */}
                <Index />
            </div>
        </>
    )
}

export default Page
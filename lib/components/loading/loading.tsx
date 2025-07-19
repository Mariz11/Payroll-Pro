import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function LoadingScreen (){
    return (
        <div className="loading-screen flex flex-col items-center justify-center align-middle bg-white h-screen">
            <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" animationDuration=".5s" />
            Loading Page...
            {/* <style jsx>{`
                .loading-screen {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: #f0f0f0;
                }
            `}</style> */}
        </div>
    );
};

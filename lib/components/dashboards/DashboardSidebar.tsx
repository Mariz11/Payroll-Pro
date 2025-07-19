import moment from '@constant/momentTZ';
import { Button } from 'primereact/button';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Sidebar } from 'primereact/sidebar';
import ReactHtmlParser from 'react-html-parser';
import React from 'react';
import Image from 'next/image';
const DashboardSidebar = ({
  configuration: { isOpen, setIsOpen },
  announcement,
}: {
  configuration: Configuration;
  announcement: any;
}) => {
  return (
    <Sidebar
      position="right"
      className="p-sidebar-md"
      visible={isOpen}
      style={{
        width: '84%',
      }}
      onHide={() => {
        setIsOpen(false);
      }}
    >
      <div className=" h-full flex flex-col w-full">
        <div className=" h-full mx-10 mt-[50px] flex flex-col justify-start">
          <div className="mb-[40px]">
            <h1 className="text-black font-medium text-4xl break-words">
              {announcement?.title}
            </h1>
            <p className=" text-sm">
              {moment(announcement?.createdAt, 'YYYY-MM-DD HH:mm:ss').format(
                'MMMM D, YYYY'
              )}
            </p>
          </div>

          <div className="flex gap-5  flex-col md:flex-row lg:flex-row">
            <div className="w-full md:w-4/12">
              <Image
                //   src={selectedLogo.url}
                //   width={360}
                //   height={200}
                //   alt={selectedLogo.name}
                src={
                  announcement.image === ''
                    ? '/images/noimage.jpg'
                    : `${
                        process.env.NEXT_PUBLIC_ML_FILE_UPLOAD_URL
                      }/${encodeURIComponent(announcement.image)}`
                }
                width={360}
                height={200}
                alt={announcement.image}
              ></Image>
            </div>
            <div className="w-full md:w-8/12">
              <div className="w-full">
                <ScrollPanel
                  style={{ width: '100%', height: '400px' }}
                  color="success"
                  className="custombar1"
                >
                  <div className=" break-words w-full">
                    {ReactHtmlParser(announcement?.content)}
                  </div>
                </ScrollPanel>
              </div>
            </div>
          </div>
          <div className="mt-10 w-full flex justify-end align-bottom">
            <Button
              rounded
              className="rounded-full px-20 justify-center"
              severity="secondary"
              text
              label="Cancel"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
              }}
            />
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default DashboardSidebar;

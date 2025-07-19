import moment from '@constant/momentTZ';
import { Button } from 'primereact/button';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Sidebar } from 'primereact/sidebar';
import ReactHtmlParser from 'react-html-parser';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Dialog } from 'primereact/dialog';
import { Galleria, GalleriaResponsiveOptions } from 'primereact/galleria';
import { Editor } from 'primereact/editor';

function Announcements({
  configuration: { isOpen, setIsOpen },
  announcement,
}: {
  configuration: Configuration;
  announcement: any;
}) {
  const [images, setImages] = useState<any>([]);
  const galleria = useRef<any>(null);
  const [visible, setVisible] = useState(false);
  const responsiveOptions: GalleriaResponsiveOptions[] = [
    {
      breakpoint: '1500px',
      numVisible: 5,
    },
    {
      breakpoint: '1024px',
      numVisible: 3,
    },
    {
      breakpoint: '768px',
      numVisible: 2,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
    },
  ];

  const itemTemplate = (item: any) => {
    return (
      <Image
        src={item.src}
        alt={item.alt}
        className=" max-h-[90vh]"
        width={1280}
        height={720}
        sizes="100vw"
      />
    );
  };

  const thumbnailTemplate = (item: any) => {
    return <></>;
  };

  useEffect(() => {
    const image =
      announcement.image === ''
        ? '/images/noimage.jpg'
        : `${process.env.NEXT_PUBLIC_ML_FILE_UPLOAD_URL}/${encodeURIComponent(
            announcement.image
          )}`;
    setImages(() => [
      {
        src: image,
        alt: 'zoom',
      },
    ]);
  }, [announcement]);
  return (
    <>
      <Sidebar
        position="right"
        className="p-sidebar-md"
        visible={isOpen}
        style={{
          width: '87%',
        }}
        onHide={() => {
          setIsOpen(false);
        }}
      >
        <Galleria
          className="announcementgallery z-50"
          ref={galleria}
          value={images}
          responsiveOptions={responsiveOptions}
          // numVisible={9}
          style={{ maxWidth: '50%' }}
          // circular
          fullScreen
          // showItemNavigators
          item={itemTemplate}
          thumbnail={thumbnailTemplate}
        />
        <div className=" h-full flex flex-col w-full">
          <div className=" h-full mx-10 mt-[50px] flex flex-col justify-start">
            <div className="mb-[40px]">
              <h1 className="text-black font-medium text-4xl break-words">
                {announcement?.title}
              </h1>
              <p className=" text-sm">
                {moment(announcement.updatedAt, 'YYYY-MM-DD HH:mm:ss').format(
                  'MMMM D, YYYY'
                )}
              </p>
            </div>

            <div className="flex gap-5  flex-col md:flex-row lg:flex-row">
              <div className="w-max-[360px]">
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
                  onClick={(e) => {
                    e.preventDefault();

                    galleria.current.show();
                  }}
                ></Image>
              </div>
              <div className="w-full md:w-8/12 h-[50vh] overflow-auto">
                <div className="w-full">
                  {/* <ScrollPanel
                    style={{ width: '100%', height: '50vh' }}
                    color="success"
                    className="announcementbar1"
                  >
                    <div className=" break-words w-full">
                      {ReactHtmlParser(announcement?.content)}
                    </div>
                  </ScrollPanel> */}
                  <Editor
                    className="read-only-editor"
                    style={{ width: '100%', height: '100%' }}
                    value={announcement?.content}
                    readOnly
                    headerTemplate={<></>}
                  ></Editor>
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
    </>
  );
}

export default Announcements;

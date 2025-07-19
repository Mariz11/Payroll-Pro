import { Dialog } from 'primereact/dialog';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { TabView, TabPanel } from 'primereact/tabview';
import { useState } from 'react';
import { Button } from 'primereact/button';
import Image from 'next/image';
import Link from 'next/link';

const ErrorDialog = () => {
  const [visible, setVisible] = useState(true);
  const [isClearingCache, setIsClearingCache] = useState(false);

  const clearCacheData = async () => {
    setIsClearingCache(true);
    await caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
    setIsClearingCache(false);
  };

  return (
    <Dialog
      header="Error occured"
      showHeader={false}
      visible={visible}
      style={{ width: '50vw' }}
      onHide={() => setVisible(false)}
      className="h-[700px]"
    >
      <div className="py-5 flex flex-col items-center gap-5">
        <i className="pi pi-exclamation-triangle text-red-500 text-9xl"></i>
        <h1 className="text-2xl">An error has occured</h1>
        <h2>You can try the following options to resolve the issue</h2>
        <div className="w-full">
          <Accordion activeIndex={0}>
            <AccordionTab header="Option 1: Automatic Cache Clearing">
              <div className="flex flex-col gap-2">
                <p>Click the button below to automatically clear the cache</p>
                <Button onClick={clearCacheData} className="rounded-md w-fit">
                  Clear Cache
                </Button>
                {isClearingCache && <div>Clearing Cache...</div>}
              </div>
            </AccordionTab>
            <AccordionTab header="Option 2: Manual Cache Clearing">
              <p>Select your browser below to see specific instructions</p>
              <TabView>
                <TabPanel header="Chrome">
                  <div className="flex flex-col gap-2">
                    <ol className="list-decimal flex flex-col gap-2">
                      <li>
                        <p>
                          At the top left corner, click the menu (three lines),
                          and then click Settings
                        </p>
                        <Image
                          src={'/images/ChromeCache_1.png'}
                          alt={'chrome settings'}
                          width={1000}
                          height={500}
                          quality={100}
                        />
                      </li>
                      <li>
                        <p>
                          Click “More tools,” and then click “Clear browsing
                          data.”
                        </p>
                      </li>
                      <li>
                        <p>
                          At the top, choose a time range. To delete everything,
                          select “All time.”
                        </p>
                      </li>
                      <li>
                        <p>
                          Remove the check mark in the box beside “Cookies and
                          other site Data.”
                        </p>
                      </li>
                      <li>
                        <p>
                          Check the box beside “Cached images and files” then
                          click the “Clear” button.
                        </p>
                        <Image
                          src={'/images/ChromeCache_2.png'}
                          alt={'chrome settings'}
                          width={1000}
                          height={500}
                          quality={100}
                        />
                      </li>
                    </ol>
                    <span className="text-sm">
                      Instructions sourced from: &nbsp;
                      <Link
                        href={
                          'https://itdc.up.edu.ph/faqs/how-to-clear-browser-cache#chrome'
                        }
                        className="underline text-blue-500"
                      >
                        https://itdc.up.edu.ph/faqs/how-to-clear-browser-cache#chrome
                      </Link>
                    </span>
                  </div>
                </TabPanel>
                <TabPanel header="Safari">
                  <div className="flex flex-col gap-2">
                    <ol className="list-decimal flex flex-col gap-2">
                      <li>
                        <p>
                          Click the Safari menu in the upper left corner of your
                          screen, then choose Preferences from the dropdown list
                        </p>
                        <Image
                          src={'/images/SafariCache_1.webp'}
                          alt={'chrome settings'}
                          width={1000}
                          height={500}
                          quality={100}
                        />
                        <span className="text-sm">
                          Image Source: &nbsp;
                          <Link
                            href={
                              'https://www.businessinsider.com/guides/tech/how-to-clear-cache-on-safari-browser'
                            }
                            className="underline text-blue-500"
                          >
                            https://www.businessinsider.com/guides/tech/how-to-clear-cache-on-safari-browser
                          </Link>
                        </span>
                      </li>
                      <li>
                        <p>
                          Click on the Advanced tab in the menu that appears
                        </p>
                      </li>
                      <li>
                        <p>
                          At the bottom of the tab, check the box labeled Show
                          Develop menu in menu bar, then close the Preferences
                          window
                        </p>
                        <Image
                          src={'/images/SafariCache_2.webp'}
                          alt={'chrome settings'}
                          width={1000}
                          height={500}
                          quality={100}
                        />
                        <span className="text-sm">
                          Image Source: &nbsp;
                          <Link
                            href={
                              'https://www.businessinsider.com/guides/tech/how-to-clear-cache-on-safari-browser'
                            }
                            className="underline text-blue-500"
                          >
                            https://www.businessinsider.com/guides/tech/how-to-clear-cache-on-safari-browser
                          </Link>
                        </span>
                      </li>
                      <li>
                        <p>
                          Click on the Develop tab in the Safari menu at the top
                          of the screen
                        </p>
                      </li>
                      <li>
                        <p>Click Empty Caches from the dropdown menu</p>
                        <Image
                          src={'/images/SafariCache_3.webp'}
                          alt={'chrome settings'}
                          width={1000}
                          height={500}
                          quality={100}
                        />
                        <span className="text-sm">
                          Image Source: &nbsp;
                          <Link
                            href={
                              'https://www.businessinsider.com/guides/tech/how-to-clear-cache-on-safari-browser'
                            }
                            className="underline text-blue-500"
                          >
                            https://www.businessinsider.com/guides/tech/how-to-clear-cache-on-safari-browser
                          </Link>
                        </span>
                      </li>
                    </ol>
                    <span className="text-sm">
                      Instructions sourced from: &nbsp;
                      <Link
                        href={
                          'https://www.businessinsider.com/guides/tech/how-to-clear-cache-on-safari-browser'
                        }
                        className="underline text-blue-500"
                      >
                        https://www.businessinsider.com/guides/tech/how-to-clear-cache-on-safari-browser
                      </Link>
                    </span>
                  </div>
                </TabPanel>
                <TabPanel header="Firefox">
                  <div className="flex flex-col gap-2">
                    <ol className="list-decimal flex flex-col gap-2">
                      <li>
                        <p>
                          At the top left corner, click the menu (three lines),
                          and then click Settings
                        </p>
                        <Image
                          src={'/images/FirefoxCache_1.png'}
                          alt={'chrome settings'}
                          width={1000}
                          height={500}
                          quality={100}
                        />
                      </li>
                      <li>
                        <p>Click the Privacy & Security panel.</p>
                        <Image
                          src={'/images/FirefoxCache_2.png'}
                          alt={'chrome settings'}
                          width={1000}
                          height={500}
                          quality={100}
                        />
                      </li>
                      <li>
                        <p>
                          Scroll down to the “Cookies and Site Data” section,
                          then click “Clear Data.”
                        </p>
                        <Image
                          src={'/images/FirefoxCache_3.png'}
                          alt={'chrome settings'}
                          width={1000}
                          height={500}
                          quality={100}
                        />
                      </li>
                      <li>
                        <p>
                          Remove the check mark in the box beside “Cookies and
                          Site Data.”
                        </p>
                      </li>
                      <li>
                        <p>
                          Check the box beside “Cached Web Content,” then click
                          the “Clear” button.
                        </p>
                        <Image
                          src={'/images/FirefoxCache_4.png'}
                          alt={'chrome settings'}
                          width={1000}
                          height={500}
                          quality={100}
                        />
                      </li>
                    </ol>
                    <span className="text-sm">
                      Instructions sourced from: &nbsp;
                      <Link
                        href={
                          'https://itdc.up.edu.ph/faqs/how-to-clear-browser-cache#firefox'
                        }
                        className="underline text-blue-500"
                      >
                        https://itdc.up.edu.ph/faqs/how-to-clear-browser-cache#firefox
                      </Link>
                    </span>
                  </div>
                </TabPanel>
                <TabPanel header="Edge">
                  <div className="flex flex-col gap-2">
                    <ol className="list-decimal flex flex-col gap-2">
                      <li>
                        <p>
                          At the top left corner, click the menu (three lines),
                          and then click Settings
                        </p>
                        <Image
                          src={'/images/EdgeCache_1.png'}
                          alt={'chrome settings'}
                          width={1000}
                          height={500}
                          quality={100}
                        />
                      </li>
                      <li>
                        <p>Click the Privacy, Search and Services panel.</p>
                        <Image
                          src={'/images/EdgeCache_2.png'}
                          alt={'chrome settings'}
                          width={1000}
                          height={500}
                          quality={100}
                        />
                      </li>
                      <li>
                        <p>
                          Scroll down to the “Clear browsing data” section, then
                          click the “Choose What to Clear” button on the right
                          side of Clear browsing data now
                        </p>
                        <Image
                          src={'/images/EdgeCache_3.png'}
                          alt={'chrome settings'}
                          width={1000}
                          height={500}
                          quality={100}
                        />
                      </li>
                      <li>
                        <p>
                          Remove the check mark in the box beside “Browsing
                          History”, “Download History”, and “Cookies and other
                          site data”
                        </p>
                      </li>
                      <li>
                        <p>
                          Check the box beside “Cached images and files” then
                          click the “Clear now” button.
                        </p>
                        <Image
                          src={'/images/FirefoxCache_4.png'}
                          alt={'chrome settings'}
                          width={1000}
                          height={500}
                          quality={100}
                        />
                      </li>
                    </ol>
                    <span className="text-sm">
                      Instructions sourced from: &nbsp;
                      <Link
                        href={
                          'https://itdc.up.edu.ph/faqs/how-to-clear-browser-cache#edge'
                        }
                        className="underline text-blue-500"
                      >
                        https://itdc.up.edu.ph/faqs/how-to-clear-browser-cache#edge
                      </Link>
                    </span>
                  </div>
                </TabPanel>
              </TabView>
              <p className="font-semibold">
                Once you have cleared the cache, please reload the page.
              </p>
              <p>
                If the issue persists, please contact our support team for
                further assistance.
              </p>
            </AccordionTab>
          </Accordion>
        </div>
      </div>
    </Dialog>
  );
};

export default ErrorDialog;

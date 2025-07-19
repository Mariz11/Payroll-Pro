import {
  GENERATE_TOKEN_API,
  ML_FILE_UPLOAD_URL,
} from 'lib/constant/partnerAPIDetails';
import { requestPreSignedImageURLS } from './partnerAPIs';
import axios from 'axios';
const XMLHttpRequest = require('xhr2');

export async function fileUploadToCloud({
  timeUploaded,
  file,
}: {
  timeUploaded: number;
  file: any;
}) {
  let image_url: any = `${ML_FILE_UPLOAD_URL}/${timeUploaded}-${file.name.replace(
    / /g,
    '_'
  )}`;
  if (file.size > 52428800) {
    return { success: false, message: 'File size should be lesser than 50MB.' };
  }
  if (
    file.name.includes('.svg') ||
    file.name.includes('.htm') ||
    file.name.includes('.txt') ||
    file.name.includes('.js')
  ) {
    return { success: false, message: 'File type not supported' };
  }
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.open('PUT', image_url, false);
  try {
    xmlhttp.send(file);

    if (xmlhttp.status >= 200 && xmlhttp.status < 300) {
      return image_url;
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
}

export async function fileUploadToCKYC({
  fileURL,
  file,
}: {
  fileURL: string;
  file: File;
}) {
  try {
    if (file.size > 52428800) {
      return {
        success: false,
        message: 'File size should be lesser than 50MB.',
      };
    }
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open('PUT', fileURL, false);
    // xmlhttp.setRequestHeader('Content-Type', 'multipart/form-data');
    xmlhttp.send(file);
    // const res = await axios.put(fileURL, file, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //   },
    //   // transformRequest: (file) => file,
    // });
    // console.log(res);

    // console.log(res);
    if (xmlhttp.status >= 200 && xmlhttp.status < 300) {
      return xmlhttp.responseURL;
    } else {
      return null;
    }
    // return res;
  } catch (err) {
    console.log(err);
    return err;
  }
}

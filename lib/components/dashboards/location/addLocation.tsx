'use client'

import Location from './location'
import { ToastifyProps } from './types/component';

type Props = {
  onClose: ()=>void;
  toastify: ToastifyProps;
}


const AddLocation = (props: Props) => {
  
  return (
    <Location {...props} type='ADD' />
  )
}

export default AddLocation
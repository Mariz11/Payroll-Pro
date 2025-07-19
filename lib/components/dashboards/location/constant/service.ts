import axios from 'axios';

export const LocationInstance = () => axios.create({
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
  },
});

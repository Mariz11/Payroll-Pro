'use client';

import { createContext } from 'react';

const GlobalContainer = createContext<null | GlobalContext>(null);

export { GlobalContainer };

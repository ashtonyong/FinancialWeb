"use client";

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function SWRProvider({ children }: { children: ReactNode }) {
    return (
        <SWRConfig value={{
            fetcher,
            revalidateOnFocus: false,
            shouldRetryOnError: true,
            errorRetryCount: 3,
        }}>
            {children}
        </SWRConfig>
    );
}

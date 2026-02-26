'use client';

import React, { useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { InvoiceDataType } from '@/types/invoice.types';
import InvoiceDetails from './InvoiceDetails';
import { Button } from '../ui/button';

const InvoiceDownload = ({ invoiceData }: { invoiceData: InvoiceDataType }) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const printFn = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'AwesomeFileName'
  });

  const handleOnClick = useCallback(() => {
    printFn();
  }, [printFn]);

  if (!invoiceData) {
    return <div>No invoice data found</div>;
  }

  return (
    <div className=" flex flex-col justify-center items-center mb-4 mx-auto mt-10 gap-5 ">
      <div className="relative ">
        <Button className="sticky " onClick={handleOnClick}>
          Download Invoice
        </Button>
      </div>

      <InvoiceDetails ref={componentRef} invoiceData={invoiceData} />
    </div>
  );
};

export default InvoiceDownload;

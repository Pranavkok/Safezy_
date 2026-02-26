import React, { forwardRef } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import { InvoiceDataType } from '@/types/invoice.types';
import { FileText, Building2, Phone, Mail, Globe } from 'lucide-react';
import Image from 'next/image';
import ASSETS from '@/assets';

interface ConsolidatedOrderItem {
  product: {
    id: string;
    ppeName: string;
    hsnCode?: string | null;
    gst?: number | null;
    price?: number | null;
  };
  quantity: number;
  price: number;
  variants: Array<{
    size: string;
    color: string;
    quantity: number;
  }>;
}

const InvoiceDetails = forwardRef<
  HTMLDivElement | null,
  { invoiceData: InvoiceDataType }
>(({ invoiceData }, ref) => {
  const consolidatedOrderItems = invoiceData.order.orderItems.reduce(
    (acc, item) => {
      const existingItemIndex = acc.findIndex(
        consolidatedItem => consolidatedItem.product.id === item.product.id
      );

      if (existingItemIndex > -1) {
        // If product already exists, update quantity and add variant info
        acc[existingItemIndex].quantity += item.quantity;
        acc[existingItemIndex].variants.push({
          size: item.size,
          color: item.color,
          quantity: item.quantity
        });
      } else {
        acc.push({
          ...item,
          variants: [
            {
              size: item.size,
              color: item.color,
              quantity: item.quantity
            }
          ]
        });
      }

      return acc;
    },
    [] as ConsolidatedOrderItem[]
  );

  const totalAmount = consolidatedOrderItems.reduce((total, item) => {
    const itemTotal = item.quantity * item.price;
    const gstAmount = item.product.gst
      ? itemTotal * (item.product.gst / 100)
      : 0;
    return total + itemTotal + gstAmount;
  }, 0);

  const totalAmountWithShipping =
    totalAmount + (invoiceData.order?.shippingCharges || 0);

  return (
    <Card
      ref={ref}
      style={{
        width: '210mm', // A4 width
        minHeight: '297mm', // A4 height
        padding: '4mm', // Standard margin for print
        boxSizing: 'border-box',
        position: 'relative'
      }}
      className="shadow-none rounded-none border-none bg-white"
    >
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <div className="transform -rotate-45 text-9xl font-bold">PAID</div>
      </div>

      {/* Simple header */}
      <CardHeader className="bg-primary/5 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 relative">
              <Image
                src={ASSETS.IMG.APP_LOGO}
                alt="Safezy Solutions Logo"
                fill
                className="object-contain"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-black ">
                Safezy Solutions Pvt. Ltd.
              </h1>
              <h1 className="text-2xl font-bold text-primary flex items-center">
                <FileText className="mr-2 h-6 w-6" />
                INVOICE
              </h1>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 py-2">
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">
                {invoiceData.contractor.firstName}{' '}
                {invoiceData.contractor.lastName}
              </p>
              <p className="text-sm text-gray-600">
                {invoiceData.contractor.email}
              </p>
              <p className="text-sm text-gray-600">
                {invoiceData.contractor.contactNumber}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Shipping Address:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                {invoiceData.order.address}
              </p>
            </div>
          </div>
        </div>
        {/* Order Details */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="col-span-2">
              <p className="font-medium">Order ID:</p>
              <p className="text-gray-600">{invoiceData.order.id}</p>
            </div>
            <div>
              <p className="font-medium">Transaction ID:</p>
              <p className="text-gray-600">
                {invoiceData.order.transaction.tnxId}
              </p>
            </div>
            <div>
              <p className="font-medium">Payment Mode:</p>
              <p className="text-gray-600">
                {invoiceData.order.transaction.paymentMode}
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-3" />

        {/* Simplified table */}
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5">
              <TableHead className="text-center w-10">S.No</TableHead>
              <TableHead className="whitespace-nowrap">Product / HSN</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead className="text-center w-28">Qty & Price</TableHead>
              <TableHead className="text-center w-16">GST</TableHead>
              <TableHead className="text-right w-24">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consolidatedOrderItems.map((item, index) => {
              const itemTotal = item.quantity * item.price;
              const gstAmount = item.product.gst
                ? itemTotal * (item.product.gst / 100)
                : 0;
              const totalItemAmount = itemTotal + gstAmount;
              return (
                <TableRow key={item.product.id}>
                  <TableCell className="text-center py-2">
                    {index + 1}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="font-medium  capitalize">
                      {item.product.ppeName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.product.hsnCode ?? '-'}
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {item.variants.map(variant => (
                        <div
                          key={variant.color + variant.size}
                          className="flex items-center gap-1 text-xs border border-gray-200 rounded px-1.5 py-1"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: variant.color }}
                          />
                          <span className="font-medium">{variant.size}</span>
                          <span className="text-gray-500">
                            ({variant.quantity})
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-2">
                    <div>
                      {item.quantity} <span className="text-xs">x</span> ₹
                      {item.price}
                      <div className="text-xs text-gray-500">
                        = ₹{(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-2">
                    <div className="flex flex-col">
                      <span>{item.product.gst ?? 0}%</span>
                      <span className="text-xs text-gray-500">
                        ₹{gstAmount.toFixed(2)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-2 font-medium">
                    ₹{totalItemAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
            {/* Summary Row */}
            <TableRow className="bg-muted/30 font-medium">
              <TableCell colSpan={3} className="text-right py-2">
                Total:
              </TableCell>
              <TableCell className="text-center py-2">
                <div>
                  ₹
                  {consolidatedOrderItems
                    .reduce((total, item) => {
                      return total + item.quantity * item.price;
                    }, 0)
                    .toFixed(2)}
                </div>
              </TableCell>
              <TableCell className="text-center py-2">
                <div className="flex flex-col">
                  <span className="">
                    ₹
                    {consolidatedOrderItems
                      .reduce((total, item) => {
                        const itemTotal = item.quantity * item.price;
                        const gstAmount = item.product.gst
                          ? itemTotal * (item.product.gst / 100)
                          : 0;
                        return total + gstAmount;
                      }, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right py-2 ">
                ₹
                {consolidatedOrderItems
                  .reduce((total, item) => {
                    const itemTotal = item.quantity * item.price;
                    const gstAmount = item.product.gst
                      ? itemTotal * (item.product.gst / 100)
                      : 0;
                    return total + itemTotal + gstAmount;
                  }, 0)
                  .toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Simple totals section */}
        <div className="mt-4 flex justify-end">
          <div className="w-72  p-4 rounded-lg border border-primary/10 shadow-sm">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping Charges:</span>
                <span className="font-medium">
                  ₹{(invoiceData.order?.shippingCharges || 0).toFixed(2)}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-primary/80">
                  Total Payable:
                </span>
                <span className="text-xl font-bold text-primary   py-1 rounded-md">
                  ₹{totalAmountWithShipping.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t">
          <div className="text-center text-sm text-gray-500">
            <p className="font-medium">Safezy Solutions Pvt. Ltd.</p>
            <div className="flex justify-center items-center gap-1">
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                <span>123 Business Park, Tech City, TC 12345</span>
              </div>
              |{' '}
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>contact@safezy.com</span>
              </div>
            </div>
            <div className="flex justify-center items-center gap-1">
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </div>
              |{' '}
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <span>www.safezy.com</span>
              </div>
            </div>
            <p>Thank you for your business!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

InvoiceDetails.displayName = 'InvoiceDetails';

export default InvoiceDetails;

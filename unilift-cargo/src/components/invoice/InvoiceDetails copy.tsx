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
import { Building2, Phone, Mail, Globe } from 'lucide-react';
import { InvoiceDataType } from '@/types/invoice.types';
import { formattedDate } from '@/lib';
import Image from 'next/image';
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
  // Generate a unique invoice number
  const invoiceNumber = `INV-${invoiceData.order.id.slice(-6).toUpperCase()}-${new Date().getFullYear()}`;
  return (
    <Card
      ref={ref}
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '8mm',
        boxSizing: 'border-box',
        position: 'relative'
      }}
      className="shadow-none rounded-none border-none bg-white"
    >
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <div className="transform -rotate-45 text-9xl font-bold">PAID</div>
      </div>
      {/* Professional Header */}
      <CardHeader className="bg-white p-6 border-b">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 relative">
              <Image
                src="/logo.png"
                alt="Safezy Solutions Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">
                Safezy Solutions Pvt. Ltd.
              </h1>
              <div className="text-sm text-gray-600 mt-1">
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  <span>123 Business Park, Tech City, TC 12345</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>contact@safezy.com</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <span>www.safezy.com</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-primary/5 p-4 rounded-lg">
              <h2 className="text-3xl font-bold text-primary mb-2">INVOICE</h2>
              <div className="text-sm">
                <p className="font-medium">Invoice Number:</p>
                <p className="text-primary">{invoiceNumber}</p>
                <p className="font-medium mt-2">Date:</p>
                <p>{formattedDate(invoiceData.order.date)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-6">
        {/* Billing & Shipping Information */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">Bill To:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">
                {invoiceData.contractor.firstName}{' '}
                {invoiceData.contractor.lastName}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {invoiceData.contractor.email}
              </p>
              <p className="text-sm text-gray-600">
                {invoiceData.contractor.contactNumber}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Shipping Address:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                {invoiceData.order.address}
              </p>
            </div>
          </div>
        </div>
        {/* Order Details */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium">Order ID:</p>
              <p className="text-gray-600">#{invoiceData.order.id}</p>
            </div>
            <div>
              <p className="font-medium">Payment Mode:</p>
              <p className="text-gray-600">
                {invoiceData.order.transaction.paymentMode}
              </p>
            </div>
            <div>
              <p className="font-medium">Transaction ID:</p>
              <p className="text-gray-600">
                {invoiceData.order.transaction.paymentMode}
              </p>
            </div>
          </div>
        </div>
        <Separator className="my-6" />
        {/* Items Table */}
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
                  <TableCell className="text-center py-4">
                    {index + 1}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="font-medium capitalize">
                      {item.product.ppeName}
                    </div>
                    <div className="text-xs text-gray-500">
                      HSN: {item.product.hsnCode ?? '-'}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
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
                  <TableCell className="text-center py-4">
                    <div>
                      {item.quantity} <span className="text-xs">x</span> ₹
                      {item.price}
                      <div className="text-xs text-gray-500">
                        = ₹{(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <div className="flex flex-col">
                      <span>{item.product.gst ?? 0}%</span>
                      <span className="text-xs text-gray-500">
                        ₹{gstAmount.toFixed(2)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4 font-medium">
                    ₹{totalItemAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {/* Totals Section */}
        <div className="mt-8 flex justify-end">
          <div className="w-80 bg-gray-50 p-6 rounded-lg">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping Charges:</span>
                <span className="font-medium">
                  ₹{(invoiceData.order?.shippingCharges || 0).toFixed(2)}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-primary">
                  Total Amount:
                </span>
                <span className="text-xl font-bold text-primary">
                  ₹{totalAmountWithShipping.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Terms and Conditions */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold mb-3">Terms & Conditions</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>1. Payment is due within 30 days of invoice date.</p>
            <p>2. Goods once sold will not be taken back or exchanged.</p>
            <p>3. Interest @ 18% p.a. will be charged on overdue payments.</p>
            <p>4. All disputes are subject to local jurisdiction.</p>
          </div>
        </div>
        {/* Footer */}
        <div className="mt-12 pt-6 border-t">
          <div className="text-center text-sm text-gray-500">
            <p className="font-medium">Safezy Solutions Pvt. Ltd.</p>
            <p>GSTIN: 29ABCDE1234F1Z5 | PAN: ABCDE1234F</p>
            <p>Thank you for your business!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
InvoiceDetails.displayName = 'InvoiceDetails';
export default InvoiceDetails;

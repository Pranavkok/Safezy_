'use server';

import xlsx from 'node-xlsx';
import { fetchAllContractors } from '../admin/contractor';

export async function generateExcel() {
  const customers = await fetchAllContractors();
  const jsonData = customers.data;

  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    throw new Error('No contractor data available');
  }

  const contractorDetails = jsonData.map(contractor => ({
    customer_name: `${contractor.first_name} ${contractor.last_name}`,
    email: contractor.email,
    contact_number: contractor.contact_number,
    company_name: contractor.company_name || 'N/A',
    total_workers: contractor.total_workers || 'N/A',
    total_worksite: contractor.total_worksite || 0,
    total_orders: contractor.total_orders,
    total_amount: contractor.total_amount
  }));

  const data = [
    [
      'Customer Name',
      'Email',
      'Contact Number',
      'Company Name',
      'Total Number Of Workers',
      'Total Worksite',
      'Total Orders',
      'Total Value Of Orders'
    ],
    ...contractorDetails.map(row => [
      row.customer_name,
      row.email,
      row.contact_number,
      row.company_name,
      row.total_workers,
      row.total_worksite,
      row.total_orders,
      row.total_amount
    ])
  ];

  const buffer = xlsx.build([{ name: 'Customers', data, options: {} }]);

  const base64Data = buffer.toString('base64');

  return {
    fileName: 'customers.xlsx',
    contentType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    base64Data
  };
}

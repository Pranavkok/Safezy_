export const downloadSampleCSV = async () => {
  const sampleData = [
    {
      name: 'John Doe',
      contact_number: '1234567890',
      designation: 'Worker',
      department: 'Engineering',
      plant: 'AB900'
    }
  ];

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    ['name,contact_number,designation,department,plant']
      .concat(
        sampleData.map(
          row =>
            `${row.name},${row.contact_number},${row.designation},${row.department},${row.plant}`
        )
      )
      .join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'sample.csv');
  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
};

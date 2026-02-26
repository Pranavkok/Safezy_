import { generateExcel } from '@/actions/contractor/generateExcel';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import toast from 'react-hot-toast';

export const handleDownload = async () => {
  try {
    const { fileName, contentType, base64Data } = await generateExcel();

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success(SUCCESS_MESSAGES.EXCEL_FILE_DOWNLOADED);
  } catch (error) {
    console.error('Error downloading Excel file:', error);
    toast.error(ERROR_MESSAGES.FAILED_DOWNLOADING_EXCEL_FILE);
  }
};

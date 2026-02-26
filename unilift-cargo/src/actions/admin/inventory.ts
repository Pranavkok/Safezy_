'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { SafetyItem, Worksite } from '@/types/inventory.types';
import { createClient } from '@/utils/supabase/server';

export const fetchContractorInventory = async (
  contractorId: string
): Promise<{ success: boolean; message: string; data?: Worksite[] }> => {
  const supabase = await createClient();

  try {
    const { data: worksitesData, error: worksitesError } = await supabase
      .from('worksite')
      .select(`id, site_name, address(*)`)
      .eq('user_id', contractorId);

    if (worksitesError) {
      console.error('Error fetching worksites', worksitesError);
      return { success: false, message: ERROR_MESSAGES.WORKSITE_NOT_FETCHED };
    }

    const { data: inventoryData, error: inventoryError } = await supabase
      .from('product_inventory')
      .select(`product_id, product_name, product_quantity, worksite_id`)
      .eq('user_id', contractorId);

    if (inventoryError) {
      console.error('Error fetching inventory', inventoryError);
      return { success: false, message: ERROR_MESSAGES.INVENTORY_NOT_FETCHED };
    }

    const inventoryGroupedByWorksite: Record<string, SafetyItem[]> = {};
    inventoryData?.forEach(item => {
      if (!inventoryGroupedByWorksite[item.worksite_id!]) {
        inventoryGroupedByWorksite[item.worksite_id!] = [];
      }
      inventoryGroupedByWorksite[item.worksite_id!].push({
        id: item.product_id || '-',
        name: item.product_name || 'N/A',
        availability: item.product_quantity || 0
      });
    });

    const worksites: Worksite[] = worksitesData.map(worksite => {
      const worksiteAddress = worksite.address
        ? [
            worksite.address[0]?.street1,
            worksite.address[0]?.street2 ?? '',
            worksite.address[0]?.locality ?? '',
            worksite.address[0]?.city,
            worksite.address[0]?.state,
            worksite.address[0]?.country,
            worksite.address[0]?.zipcode
          ]
            .filter(Boolean)
            .join(', ')
        : '';

      const safetyItems = inventoryGroupedByWorksite[worksite.id] || [];

      return {
        id: worksite.id,
        name: worksite.site_name,
        location: worksiteAddress,
        safetyItems: safetyItems
      };
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.WORKSITE_INVENTORY_FETCHED,
      data: worksites
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Bell } from 'lucide-react';
import {
  fetchDeliveredOrderNotAddedToInventory,
  addToInventory
} from '@/actions/contractor/inventory';
import {
  fetchAppNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification
} from '@/actions/contractor/notifications';
import AddOrderInComplaintModal from '@/components/modals/AddOrderInComplaintModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const NOTIFICATION_ICONS: Record<string, string> = {
  registration: '👋',
  toolbox_talk_completion: '✅',
  checklist_submission: '✅',
  incident_report: '📋',
  cart_reminder: '🛒',
  portal_news: '📰',
  portal_toolbox_talk: '📚',
  portal_checklist: '📋',
  order_placed: '📦',
  order_delivered: '🚚'
};

const NotificationPage = () => {
  const [openComplaintModal, setOpenComplaintModal] = useState<string | null>(
    null
  );
  const queryClient = useQueryClient();

  const { data: allNotifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const fetchedResponse = await fetchDeliveredOrderNotAddedToInventory();
      if (!fetchedResponse.success || !Array.isArray(fetchedResponse.data)) {
        throw new Error(
          fetchedResponse.message || 'Failed to fetch notifications'
        );
      }
      return fetchedResponse.data;
    }
  });

  const { data: appNotifications = [] } = useQuery({
    queryKey: ['appNotifications'],
    queryFn: async () => {
      const res = await fetchAppNotifications();
      return res.data;
    }
  });

  const activeNotifications = allNotifications
    .filter(
      order =>
        !order.added_to_inventory &&
        order.is_delivered &&
        order.order_status !== 'Complaint'
    )
    .map(order => ({
      id: order.id,
      title: `Order #${order.id} Delivered`,
      description:
        'Would you like to add items to inventory or generate a complaint?',
      timestamp: 'Just now',
      needsAction: true
    }));

  const historyNotifications = allNotifications
    .filter(
      order =>
        order.added_to_inventory ||
        (!order.added_to_inventory && order.order_status === 'Complaint')
    )
    .map(order => ({
      id: order.id,
      title: `Order #${order.id} Processed`,
      description:
        order.order_status === 'Complaint'
          ? 'Complaint was generated for this order'
          : 'Items were added to inventory',
      timestamp: 'Processed',
      needsAction: false
    }));

  const addToInventoryMutation = useMutation({
    mutationFn: (orderId: string) => addToInventory(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['deliveredOrdersCount'] });
    }
  });

  const handleConfirm = (orderId: string) => {
    addToInventoryMutation.mutate(orderId);
  };

  const handleGenerateComplaint = (orderId: string) => {
    setOpenComplaintModal(orderId);
  };

  const handleComplaintSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['deliveredOrdersCount'] });
  };

  const handleAppNotificationClick = async (notif: AppNotification) => {
    if (notif.is_read) return;
    await markNotificationRead(notif.id);
    queryClient.invalidateQueries({ queryKey: ['appNotifications'] });
    queryClient.invalidateQueries({ queryKey: ['appNotificationsUnread'] });
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    queryClient.invalidateQueries({ queryKey: ['appNotifications'] });
    queryClient.invalidateQueries({ queryKey: ['appNotificationsUnread'] });
  };

  return (
    <>
      <div className="space-y-4">
        {/* Notifications Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              Notifications
            </CardTitle>
            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-sm">
              {activeNotifications.length} pending
            </span>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[580px] pr-4">
              <div className="space-y-4">
                <div className="bg-white ">
                  <div className="space-y-3">
                    {activeNotifications.length > 0 &&
                      activeNotifications.map(notification => (
                        <div
                          key={notification.id}
                          className="flex flex-col items-start space-x-3 p-4 bg-white rounded-lg border border-gray-100"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <h3 className="font-medium">
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.description}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Button
                              className="capitalize "
                              size="sm"
                              onClick={() => handleConfirm(notification.id)}
                              disabled={addToInventoryMutation.isPending}
                            >
                              {addToInventoryMutation.isPending &&
                              addToInventoryMutation.variables ===
                                notification.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />{' '}
                                  Processing...
                                </>
                              ) : (
                                'Add to inventory'
                              )}
                            </Button>
                            <Button
                              className="capitalize "
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleGenerateComplaint(notification.id)
                              }
                              disabled={addToInventoryMutation.isPending}
                            >
                              Generate Complaint
                            </Button>
                          </div>
                        </div>
                      ))}

                    {historyNotifications.length > 0 &&
                      historyNotifications.map(item => (
                        <div
                          key={item.id}
                          className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-100"
                        >
                          <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">
                                {item.title}
                              </h4>
                              <span className="text-sm text-gray-500">
                                {item.timestamp}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {item.description}
                            </p>
                            <span className="inline-block mt-2 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                              {item.timestamp}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Activity Section — notifications from push/app events */}
                {appNotifications.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-base font-semibold text-gray-800">
                        Activity
                      </h2>
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark all as read
                      </button>
                    </div>

                    <div className="space-y-2">
                      {appNotifications.map(notif => (
                        <button
                          key={notif.id}
                          onClick={() => handleAppNotificationClick(notif)}
                          className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition ${
                            notif.is_read
                              ? 'bg-gray-50'
                              : 'bg-blue-50 border border-blue-100'
                          }`}
                        >
                          <span className="text-xl flex-shrink-0">
                            {NOTIFICATION_ICONS[notif.type] ?? '🔔'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium ${notif.is_read ? 'text-gray-700' : 'text-gray-900'}`}
                            >
                              {notif.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {notif.body}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notif.created_at
                                ? new Date(notif.created_at).toLocaleString()
                                : ''}
                            </p>
                          </div>
                          {!notif.is_read && (
                            <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {openComplaintModal && (
        <AddOrderInComplaintModal
          order_id={openComplaintModal}
          isOpen={openComplaintModal !== null}
          setIsOpen={(isOpen: boolean) =>
            setOpenComplaintModal(isOpen ? openComplaintModal : null)
          }
          onComplaintSuccess={handleComplaintSuccess}
        />
      )}
    </>
  );
};

export default NotificationPage;

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
  const [markAllLoading, setMarkAllLoading] = useState(false);
  const [readingNotifId, setReadingNotifId] = useState<string | null>(null);
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
    if (notif.is_read || readingNotifId === notif.id) return;
    setReadingNotifId(notif.id);
    try {
      await markNotificationRead(notif.id);
      queryClient.invalidateQueries({ queryKey: ['appNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['appNotificationsUnread'] });
    } finally {
      setReadingNotifId(null);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkAllLoading(true);
    try {
      await markAllNotificationsRead();
      queryClient.invalidateQueries({ queryKey: ['appNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['appNotificationsUnread'] });
    } finally {
      setMarkAllLoading(false);
    }
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
                        disabled={markAllLoading}
                        className="text-xs text-primary hover:underline disabled:opacity-50 flex items-center gap-1"
                      >
                        {markAllLoading && (
                          <svg aria-hidden="true" className="animate-spin w-3 h-3" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" opacity="0.3"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                          </svg>
                        )}
                        {markAllLoading ? 'Marking...' : 'Mark all as read'}
                      </button>
                    </div>

                    <div className="space-y-2">
                      {appNotifications.map(notif => (
                        <button
                          key={notif.id}
                          onClick={() => handleAppNotificationClick(notif)}
                          disabled={readingNotifId === notif.id}
                          className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition disabled:opacity-60 ${
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

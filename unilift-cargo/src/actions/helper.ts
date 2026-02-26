export const generateRandomNumber = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const calculateOrderFrequencyFromItems = (
  orderItems: { created_at: string }[]
) => {
  const orderDates = orderItems.map(item => new Date(item.created_at));

  const monthsMap = orderDates.reduce(
    (acc, date) => {
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalMonths = Object.keys(monthsMap).length;

  return totalMonths > 0 ? orderItems.length / totalMonths : orderItems.length;
};

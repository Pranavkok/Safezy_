type EmailContext = {
  orderId: string;
};

export const orderConfirmationEmailHTML = (
  context: EmailContext,
  url: string
) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #000;
            line-height: 1.5;
        }
        h1 {
            font-size: 24px;
        }
    </style>
</head>
<body>
    <h1>Order Created</h1>

    <h2>One order has been assigned to your warehouse</h2>
    <h2>Please find order number and order link for other related information</h2>

    <p><strong>Order ID:</strong> ${context.orderId}</p>
    <p>
        <a href="${url}/${context.orderId}">
            View Order Details
        </a>
    </p>
</body>
</html>`;

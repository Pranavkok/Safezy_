type ComplaintEmailContext = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export const complaintEmailToAdminHTML = (ctx: ComplaintEmailContext) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Safezy Complaint Notification</title>
  <style>
    body { font-family: Arial, sans-serif; color: #000; line-height: 1.5; }
    p { font-size: 16px; margin: 8px 0; }
    ul { font-size: 16px; margin-left: 20px; }
  </style>
</head>
<body>
  <h2>Hi, Admin!</h2>
  <p><strong>${ctx.name}</strong> has submitted a complaint on Safezy. Below are the details:</p>
  <ul>
    <li><strong>Email:</strong> ${ctx.email}</li>
    <li><strong>Subject:</strong> ${ctx.subject}</li>
    <li><strong>Message:</strong> ${ctx.message}</li>
  </ul>
  <p>Please review and take the necessary action.</p>
  <p>Thank you.</p>
</body>
</html>`;

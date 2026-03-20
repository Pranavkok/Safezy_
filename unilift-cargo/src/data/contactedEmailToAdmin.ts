type EmailContext = {
  first_name: string;
  last_name: string;
  contact_number: string;
  email: string;
  company_name: string;
  requirements: string;
};

export const contactedEmailToAdminHTML = (EmailContext: EmailContext) => `
<!DOCTYPE html>
<html lang="en">        
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Safezy Team Contact Notification</title>
    <style>
        body {
          font-family: Arial, sans-serif;
          color: #000;
          line-height: 1.5;
      }
      p {
          font-size: 16px;
          margin: 8px 0;
      }
      ul {
          font-size: 16px;
          margin-left: 20px;
      }
    </style>
</head>
<body>
    <h2>Hi, Admin!</h2>
    <p><strong>${EmailContext.first_name} ${' '} ${EmailContext.last_name}</strong> has reached out to Safezy for support. Below are their details:</p>
    <ul>
    <li><strong>Email ID:  </strong>${' '} ${EmailContext.email} </li>
    <li><strong>Contact Number:  </strong> ${' '} ${EmailContext.contact_number}</li>
    <li><strong>Company Name:  </strong>${' '} ${EmailContext.company_name}</li>
    <li><strong>Requirements:  </strong>${' '} ${EmailContext.requirements}</li>
    </ul>
    <p>Please review the request and take the necessary action.</p>
    <p>Thank you.</p>
   
</body>
</html>`;

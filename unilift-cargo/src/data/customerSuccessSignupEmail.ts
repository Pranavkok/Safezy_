type EmailContext = {
  first_name: string;
  last_name: string;
};

export const customerSuccessSignupEmailHTML = (context: EmailContext) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Safezy!</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
            padding: 20px;
        }
        h1 {
            color: #2c3e50;
        }
        .btn {
            display: inline-block;
            margin-top: 15px;
            padding: 10px 20px;
            color: #fff;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div>
        <h2>Dear ${context.first_name} ${' '}${context.last_name},</h2>
        <h3>Congratulations! 🎉 You have successfully registered on Safezy. We're excited to have you on board!</h3>
        <p>
        <strong>Here's what you can do next:</strong>
        <br>
        ✅ Explore our platform and access your dashboard.
        <br>
        ✅ Update your profile and preferences.
        <br>
        ✅ Stay tuned for exclusive updates and features.
        <br>
        </p>

        <p>
        Need help? Our support team is always here for you. Reach out to us at <strong>safezy.support@gmail.com</strong>.
        <br>
        <br>
        Welcome to the Safezy family! 🚀
        <br>
        Best regards,
        <br>
        The Safezy Team
        </p>
    </div>
</body>
</html>`;

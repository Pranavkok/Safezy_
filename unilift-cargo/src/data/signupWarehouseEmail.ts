export const signupWarehouseEmailHTML = (signupUrl: string) => `
<!DOCTYPE html>
<html lang="en">        
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Signup Warehouse</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #000;
            line-height: 1;
        }
    </style>
</head>
<body>
    <h1>Warehouse Creation</h1>

    <p>Please follow the below mentioned link to register your warehouse to access & update order related details:</p>
    <p>
      <a href="${signupUrl}">
        Signup Here
      </a>
    </p>
</body>
</html>`;

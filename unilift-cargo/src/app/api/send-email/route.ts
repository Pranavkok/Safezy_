import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const email = formData.get('superior_email') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const topicName = formData.get('topicName') as string;
    const bestPerformer = formData.get('bestPerformer') as string;
    const sessionDate = new Date().toLocaleString();

    const files: File[] = [];
    formData.forEach((value, key) => {
      if (key === 'file' && value instanceof File) {
        files.push(value);
      }
    });

    const attachments = await Promise.all(
      files.map(async file => {
        const fileBuffer = await file.arrayBuffer();
        return {
          filename: file.name,
          content: Buffer.from(fileBuffer)
        };
      })
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      }
    });

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Toolbox Talk Completion</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                color: #000;
                line-height: 1.5;
            }
            h1 {
                font-size: 24px;
                color: #333;
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
        <h1>Toolbox Talk Completion Notification</h1>
        <p>We are pleased to inform you that <strong>${firstName}${' '}${lastName}</strong> has successfully completed the Toolbox Talk.</p>
        <p><strong>Details:</strong></p>
        <ul>
            <li><strong>Topic:</strong> ${topicName}</li>
            <li><strong>Completion Date:</strong> ${sessionDate}</li>
            <li><strong>Best Performer:</strong> ${bestPerformer}</li>
        </ul>
        <p>Attached, you will find the attendance sheets for the session.</p>
        <p>Thank you for your continued commitment to workplace safety and training.</p>
    </body>
    </html>`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Safezy | Toolbox Talk Completion Notification',
      html,
      attachments
    });

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to send email' },
      { status: 500 }
    );
  }
}

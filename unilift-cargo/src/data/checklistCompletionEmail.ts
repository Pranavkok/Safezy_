import { sendChecklistMailType } from '@/types/ehs.types';

export const checklistCompletionEmailHTML = (
  userName: string,
  context: sendChecklistMailType
) => `
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Checklist Completion</title>
   <style>
       body {
           font-family: Arial, sans-serif;
           color: #333;
           background-color: #f8f9fa;
           padding: 24px;
           margin: 0;
           line-height: 1.6;
       }
       h1 {
           font-size: 24px;
           color: #2D3748;
           margin-bottom: 16px;
           text-align: left;
           font-weight: 600;
       }
       h2 {
           font-size: 20px;
           color: #4A5568;
           margin-top: 20px;
           margin-bottom: 12px;
           text-align: left;
           font-weight: 500;
       }
       .container {
           background: #fff;
           padding: 32px;
           border-radius: 12px;
           box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
       }
       .header {
           border-bottom: 2px solid #FF914D;
           padding-bottom: 16px;
           margin-bottom: 24px;
       }
       .info-section {
           background-color: #FFF5EB;
           padding: 16px;
           border-radius: 8px;
           margin-bottom: 24px;
           border-left: 4px solid #FF914D;
       }
       table {
           width: 100%;
           border-collapse: separate;
           border-spacing: 0;
           margin-top: 20px;
           background: #fff;
           border-radius: 8px;
           overflow: hidden;
           box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
       }
       th, td {
           padding: 14px 16px;
           text-align: left;
           border-bottom: 1px solid #E2E8F0;
       }
       th {
           background-color: #FF914D;
           color: white;
           font-size: 15px;
           font-weight: 600;
           white-space: nowrap;
       }
       th:first-child {
           border-top-left-radius: 8px;
       }
       th:last-child {
           border-top-right-radius: 8px;
       }
       tr:last-child td:first-child {
           border-bottom-left-radius: 8px;
       }
       tr:last-child td:last-child {
           border-bottom-right-radius: 8px;
       }
       tr:nth-child(even) {
           background-color: #F7FAFC;
       }
       tr:hover {
           background-color: #FFF5EB;
           transition: background-color 0.2s ease;
       }
       td {
           font-size: 14px;
           color: #4A5568;
       }
       .weightage-cell {
           font-weight: 600;
           color: #FF914D;
       }
       @media (max-width: 768px) {
           body {
               padding: 16px;
           }
           .container {
               padding: 20px;
           }
           table {
               display: block;
               overflow-x: auto;
           }
           th, td {
               padding: 12px;
           }
       }
   </style>
</head>
<body>
   <div class="container">
       <div class="header">
           <h1>${userName} has performed the Checklist</h1>
       </div>
       <div class="info-section">
           <h2>Topic Name: ${context.topicName}</h2>
       </div>
       <h2>Checklist Details</h2>
       <table>
           <thead>
               <tr>
                   <th>Question ID</th>
                   <th>Answer</th>
                   <th>Remark</th>
                   <th>Weightage</th>
               </tr>
           </thead>
           <tbody>
               ${context.answers
                 .filter(ans => ans.answer)
                 .map(answer => {
                   return `
                       <tr>
                           <td>${answer.questionText}</td>
                           <td>${answer.answer}</td>
                           <td>${answer.remark}</td>
                           <td class="weightage-cell">${answer.weightage}</td>
                       </tr>
                     `;
                 })
                 .join('')}
           </tbody>
       </table>
   </div>
</body>
</html>`;

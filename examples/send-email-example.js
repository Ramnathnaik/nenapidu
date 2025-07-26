// Example usage of the /api/send-email endpoint
// This is a client-side example showing how to use the email API

// Example 1: Send a simple text email
async function sendSimpleEmail() {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: "Welcome to our service!",
        message:
          "Thank you for signing up. We are excited to have you on board!",
      }),
    });

    const result = await response.json();
    console.log("Email sent:", result);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Example 2: Send HTML email
async function sendHTMLEmail() {
  try {
    const htmlContent = `
      <html>
        <body>
          <h1>Welcome to Our Service!</h1>
          <p>Thank you for signing up. We are excited to have you on board!</p>
          <p>Here are your next steps:</p>
          <ul>
            <li>Complete your profile</li>
            <li>Explore our features</li>
            <li>Contact support if you need help</li>
          </ul>
          <p>Best regards,<br>The Team</p>
        </body>
      </html>
    `;

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: "Welcome to our service!",
        message:
          "Thank you for signing up. We are excited to have you on board!",
        htmlContent: htmlContent,
      }),
    });

    const result = await response.json();
    console.log("HTML email sent:", result);
  } catch (error) {
    console.error("Error sending HTML email:", error);
  }
}

// Example 3: Get user email info
async function getUserEmailInfo() {
  try {
    const response = await fetch("/api/send-email", {
      method: "GET",
    });

    const result = await response.json();
    console.log("User email info:", result);
  } catch (error) {
    console.error("Error fetching user info:", error);
  }
}

// Example 4: Using in a React component
// function EmailComponent() {
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   const handleSendEmail = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch('/api/send-email', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           subject: 'Test Email',
//           message: 'This is a test email from your application.',
//         }),
//       });

//       const result = await response.json();
//       if (response.ok) {
//         setMessage('Email sent successfully!');
//       } else {
//         setMessage(`Error: ${result.error}`);
//       }
//     } catch (error) {
//       setMessage(`Error: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <button onClick={handleSendEmail} disabled={loading}>
//         {loading ? 'Sending...' : 'Send Email'}
//       </button>
//       {message && <p>{message}</p>}
//     </div>
//   );
// }

// Export for use in other files
export { sendSimpleEmail, sendHTMLEmail, getUserEmailInfo };

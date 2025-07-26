"use client";
import React, { useState } from "react";

const TestEmail = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: "Test Email",
          message: "This is a test email from your application.",
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Email sent successfully!");
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleSendEmail} disabled={loading}>
        {loading ? "Sending..." : "Send Email"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TestEmail;

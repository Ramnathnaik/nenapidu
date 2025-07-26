import { NextResponse } from "next/server";
// import { auth, clerkClient } from "@clerk/nextjs/server";
import nodemailer from "nodemailer";

// Create a transporter with dummy SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com", // Dummy SMTP host
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "dummy@gmail.com", // Dummy email
    pass: process.env.SMTP_PASS || "dummy_password", // Dummy password
  },
});

export async function POST(request: Request) {
  try {
    // Get the authenticated user
    // const { userId } = await auth();

    // if (!userId) {
    //   return NextResponse.json(
    //     { status: "Unauthorized", error: "User not authenticated" },
    //     { status: 401 }
    //   );
    // }

    // Parse request body for email content
    const body = await request.json();
    const { subject, message, htmlContent, email } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { status: "Bad Request", error: "Subject and message are required" },
        { status: 400 }
      );
    }

    // Get the user's email address from Clerk
    // const clerkClientInstance = await clerkClient();
    // const user = await clerkClientInstance.users.getUser(userId);

    // Get the primary email address (prioritize verified emails)
    // const emailAddresses = user.emailAddresses.map((email) => ({
    //   emailAddress: email.emailAddress,
    //   verificationStatus: email.verification
    //     ? email.verification.status
    //     : undefined,
    // }));

    // const userEmail: string | undefined =
    //   emailAddresses.find((email) => email.verificationStatus === "verified")
    //     ?.emailAddress || emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        {
          status: "Email not found",
          error: "User does not have an email address",
        },
        { status: 400 }
      );
    }

    // Email options
    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@example.com", // Dummy sender email
      to: email,
      subject: subject,
      text: message,
      html: htmlContent || `<p>${message}</p>`, // HTML content if provided, otherwise convert text to HTML
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      status: "Email sent successfully",
      messageId: info.messageId,
      sentTo: email,
      userInfo: {
        email: email,
      },
    });
  } catch (error) {
    console.error("Email sending error:", error);
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message: string }).message
        : String(error);
    return NextResponse.json(
      { status: "Failed to send email", error: errorMessage },
      { status: 500 }
    );
  }
}

// GET endpoint to get user's email info
// export async function GET() {
//   try {
// Get the authenticated user
// const { userId } = await auth();

// if (!userId) {
//   return NextResponse.json(
//     { status: "Unauthorized", error: "User not authenticated" },
//     { status: 401 }
//   );
// }

// // Get the user's email address from Clerk
// const clerkClientInstance = await clerkClient();
// const user = await clerkClientInstance.users.getUser(userId);

// // Get the primary email address (prioritize verified emails)
// const emailAddresses = user.emailAddresses.map((email) => ({
//   emailAddress: email.emailAddress,
//   verificationStatus: email.verification
//     ? email.verification.status
//     : undefined,
// }));

// const userEmail: string | undefined =
//   emailAddresses.find((email) => email.verificationStatus === "verified")
//     ?.emailAddress || emailAddresses[0]?.emailAddress;

//     if (!userEmail) {
//       return NextResponse.json(
//         {
//           status: "Email not found",
//           error: "User does not have an email address",
//         },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json({
//       status: "Success",
//       userInfo: {
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: userEmail,
//         emailAddresses: emailAddresses,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching user info:", error);
//     const errorMessage =
//       typeof error === "object" && error !== null && "message" in error
//         ? (error as { message: string }).message
//         : String(error);
//     return NextResponse.json(
//       { status: "Failed to fetch user info", error: errorMessage },
//       { status: 500 }
//     );
//   }
// }

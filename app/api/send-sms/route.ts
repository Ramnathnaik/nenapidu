import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import twilio from "twilio";

// Initialize Twilio client with dummy credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Dummy SID
const authToken = process.env.TWILIO_AUTH_TOKEN; // Dummy Auth Token
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER; // Dummy phone number
const client = twilio(accountSid, authToken);

export async function POST() {
  try {
    // Get the authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { status: "Unauthorized", error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get the user's phone number (prioritize verified phone numbers)
    // Use the Clerk User type as returned by clerkClient
    const clerkClientInstance = await clerkClient();
    const user = await clerkClientInstance.users.getUser(userId);

    // Map phoneNumbers to handle possible null verification
    const phoneNumbers = user.phoneNumbers.map((phone) => ({
      phoneNumber: phone.phoneNumber,
      verificationStatus: phone.verification
        ? phone.verification.status
        : undefined,
    }));

    const phoneNumber: string | undefined =
      phoneNumbers.find((phone) => phone.verificationStatus === "verified")
        ?.phoneNumber || phoneNumbers[0]?.phoneNumber;

    if (!phoneNumber) {
      return NextResponse.json(
        {
          status: "Phone number not found",
          error: "User does not have a phone number",
        },
        { status: 400 }
      );
    }

    // Send SMS using Twilio
    const message = await client.messages.create({
      body: "Hi, user",
      from: twilioPhoneNumber, // Dummy Twilio number - replace with your actual Twilio number
      to: phoneNumber,
    });

    return NextResponse.json({
      status: "Message sent",
      sid: message.sid,
      sentTo: phoneNumber,
    });
  } catch (error) {
    console.error("SMS sending error:", error);
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message: string }).message
        : String(error);
    return NextResponse.json(
      { status: "Failed to send message", error: errorMessage },
      { status: 500 }
    );
  }
}

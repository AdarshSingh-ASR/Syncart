import { AccessToken, AccessTokenOptions, VideoGrant } from "livekit-server-sdk";
import { NextResponse } from "next/server";

// Attempt to read shopping-specific LiveKit credentials first. If they are not
// provided fall back to the generic LIVEKIT_* variables so the shopping voice
// assistant can still function without requiring a second set of env vars.
const API_KEY = process.env.LIVEKIT_SHOPPING_API_KEY ?? process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_SHOPPING_API_SECRET ?? process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_SHOPPING_URL ?? process.env.LIVEKIT_URL;

export const revalidate = 0;

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

export async function GET() {
  try {
    if (LIVEKIT_URL === undefined) {
      throw new Error("LIVEKIT_URL is not defined");
    }
    if (API_KEY === undefined) {
      throw new Error("LIVEKIT_API_KEY is not defined");
    }
    if (API_SECRET === undefined) {
      throw new Error("LIVEKIT_API_SECRET is not defined");
    }

    const participantIdentity = `shopping_user_${Math.floor(Math.random() * 10_000)}`;
    const roomName = `shopping_room_${Math.floor(Math.random() * 10_000)}`;
    const participantToken = await createParticipantToken(
      {
        identity: participantIdentity,
        agent: "shopping_voice_agent",
      } as any,
      roomName
    );

    const data: ConnectionDetails = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantToken: participantToken,
      participantName: participantIdentity,
    };
    const headers = new Headers({
      "Cache-Control": "no-store",
    });
    return NextResponse.json(data, { headers });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return new NextResponse(error.message, { status: 500 });
    }
  }
}

function createParticipantToken(userInfo: AccessTokenOptions, roomName: string) {
  const at = new AccessToken(API_KEY, API_SECRET, {
    ...userInfo,
    ttl: "15m",
  });
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);
  return at.toJwt();
} 
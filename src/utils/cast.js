import dotenv from "dotenv";
dotenv.config();

export async function postToWarpcast(text) {
  console.log("Posting to Warpcast with text:", text);
  try {
    const url = "https://api.neynar.com/v2/farcaster/cast";
    const body = {
      signer_uuid: process.env.WARPCAST_SIGNER_UUID,
      text: text,
    };

    console.log("Posting to Warpcast with body:", body);

    const response = await fetch(url, {
      method: "POST",
      headers: new Headers({
        accept: "application/json",
        "content-type": "application/json",
        "x-api-key": process.env.NEYNAR_API_KEY || "",
      }),
      body: JSON.stringify(body),
    });

    const jsonResponse = await response.json();
    console.log("Warpcast API Response:", jsonResponse);
    return jsonResponse;
  } catch (error) {
    console.error("Failed to post to Warpcast:", error);
    return null;
  }
}

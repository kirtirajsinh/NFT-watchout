import dotenv from "dotenv";
dotenv.config();

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function findStandaloneUrls(text) {
  if (!text) return [];
  const matches = text.match(URL_REGEX);
  return matches || []; // Returns an array of found URLs or an empty array
}

export async function postToWarpcast(text) {
  console.log("Posting to Warpcast with text:", text);
  if (!text) {
    console.error("No text provided to post to Warpcast.");
    return null;
  }

  try {
    const foundUrls = findStandaloneUrls(text);
    const embeds = foundUrls.map((url) => ({ url: url })); // Format for Neynar API

    const url = "https://api.neynar.com/v2/farcaster/cast";
    const body = {
      signer_uuid: process.env.WARPCAST_SIGNER_UUID,
      text: text,
      embeds: embeds,
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

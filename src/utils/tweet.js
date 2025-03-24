import OAuth from "oauth-1.0a";
import axios from "axios";
import Cryptojs from "crypto-js";
import dotenv from "dotenv";
dotenv.config();

const MAX_TWEET_LENGTH = 280;

export const postTweet = async (tweetContent) => {
  const credentials = {
    apiKey: process.env.API_KEY,
    apiKeySecret: process.env.API_KEY_SECRET,
    accessToken: process.env.ACCESS_TOKEN,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  };

  if (!credentials.apiKey || !credentials.apiKeySecret) {
    console.error("API key or secret not found in environment variables.");
    return;
  }
  console.log("I am posting tweet:");

  const oauth = new OAuth({
    consumer: {
      key: credentials.apiKey,
      secret: credentials.apiKeySecret,
    },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
      return Cryptojs.enc.Base64.stringify(Cryptojs.HmacSHA1(base_string, key));
    },
  });

  const tweetEndpoint = "https://api.twitter.com/2/tweets";
  const requestData = {
    url: tweetEndpoint,
    method: "POST",
  };

  const authHeader = oauth.toHeader(
    oauth.authorize(requestData, {
      key: credentials.accessToken,
      secret: credentials.accessTokenSecret,
    })
  );

  const payload = {
    text: tweetContent,
  };

  try {
    const response = await axios({
      url: tweetEndpoint,
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      data: payload,
    });

    console.log("Tweet posted successfully:", response.data);
    console.log(
      "Rate Limit Remaining:",
      response.headers["x-rate-limit-remaining"]
    );
    console.log(
      "Rate Limit Reset Time:",
      new Date(response.headers["x-rate-limit-reset"] * 1000)
    );
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.error(
        "Rate limit exceeded! Try again after:",
        new Date(error.response.headers["x-rate-limit-reset"] * 1000)
      );
    } else {
      console.error("Error posting tweet:", error);
    }
  }
};

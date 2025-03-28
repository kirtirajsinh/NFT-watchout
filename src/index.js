import { EventType } from "@opensea/stream-js";
import client from "./utils/opensea.js";
import "dotenv/config";
import { postTweet } from "./utils/tweet.js";
import { config } from "dotenv";
import { postToWarpcast } from "./utils/cast.js";

config();

const collections = ["twistedtweaks", "tweaks"]; // Your collections

const eventTypes = [
  EventType.ITEM_LISTED,
  EventType.ITEM_SOLD,
  EventType.ITEM_TRANSFERRED,
  EventType.ITEM_RECEIVED_BID,
  EventType.ITEM_RECEIVED_OFFER,
  EventType.ITEM_METADATA_UPDATED,
  EventType.ITEM_CANCELLED,
  EventType.COLLECTION_OFFER,
];

// Loop through each collection and create a separate listener
collections.forEach((collection) => {
  client.onEvents(collection, eventTypes, (event) => {
    console.log(`Event received for ${collection}:`, event.event_type);

    const { event_type, payload } = event;
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const itemName = payload?.item?.metadata?.name || "Unknown Item";
    const collectionSlug = payload?.collection?.slug || collection; // Use predefined collection if missing
    const collectionOffer =
      `${process.env.COLLECTION_LINK}/collection/${collectionSlug}/offers` ||
      collection;
    const salePrice = payload?.sale_price
      ? payload.sale_price / 1e18
      : "unknown";
    const basePrice = payload?.base_price
      ? payload.base_price / 1e18
      : "unknown";

    let message = "";

    switch (event_type) {
      case EventType.ITEM_LISTED:
        message = `${itemName} listed in ${collectionSlug} for ${basePrice} ETH. \n ${payload.item.permalink} `;
        postTweet(message);
        postToWarpcast(message);
        break;

      case EventType.ITEM_SOLD:
        message = `${itemName} from ${collectionSlug} sold for ${salePrice} ETH. \n ${payload.item.permalink}`;
        postTweet(message);
        postToWarpcast(message);
        break;

      case EventType.ITEM_TRANSFERRED:
        message = `${itemName} from ${collectionSlug} transferred from ${payload?.from_account?.address} to ${payload?.to_account?.address}. \n ${payload.item.permalink} `;
        postTweet(message);
        postToWarpcast(message);
        break;

      case EventType.ITEM_RECEIVED_BID:
        message = `${itemName} received a bid: ${basePrice} ETH. \n ${payload.item.permalink} `;
        postTweet(message);
        postToWarpcast(message);
        break;

      case EventType.ITEM_RECEIVED_OFFER:
        message = `${itemName} received an offer in ${collectionSlug}.\n ${payload.item.permalink} `;
        postTweet(message);
        postToWarpcast(message);
        break;

      case EventType.ITEM_CANCELLED:
        message = `${itemName} listing cancelled in ${collectionSlug}.\n ${payload.item.permalink}`;
        postTweet(message);
        postToWarpcast(message);
        break;

      case EventType.COLLECTION_OFFER:
        message = ` offer placed on ${collectionSlug} for ${basePrice} ETH. \n ${collectionOffer} .`;
        postTweet(message);
        postToWarpcast(message);
        break;

      default:
        message = `⚠️ Unhandled event type: ${event_type}`;
    }

    console.log(message);
  });
});

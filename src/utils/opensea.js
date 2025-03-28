import { Network, OpenSeaStreamClient } from "@opensea/stream-js";
import WebSocket from "ws";
import "dotenv/config";

const client = new OpenSeaStreamClient({
  network: Network.MAINNET,
  connectOptions: {
    transport: WebSocket,
  },
  token: process.env.OPENSEA_API_KEY,
});

export default client;

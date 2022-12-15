const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const needle = require("needle");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.SERVER_PORT;
const TOKEN = process.env.TWITTER_BEARER_TOKEN;

const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
const streamURL =
  "https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&user.fields=id,name,username,profile_image_url&expansions=author_id,attachments.media_keys&media.fields=url";

const rules = [
  { value: "@ziara_outdoors", tag: "mentions" },
  { value: "@ziara_outdoors #biking", tag: "biking" },
  { value: "@ziara_outdoors #gamedrive", tag: "gamedrive" },
  { value: "@ziara_outdoors #safari", tag: "safari" },
];

// Get stream rules
async function getRules() {
  const response = await needle("get", rulesURL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  console.log(response.body);
  return response.body;
}

// Set stream rules
async function setRules() {
  const data = {
    add: rules,
  };

  const response = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  return response.body;
}

// Delete stream rules
async function deleteRules(rules) {
  if (!Array.isArray(rules.data)) {
    return null;
  }

  const ids = rules.data.map((rule) => rule.id);

  const data = {
    delete: {
      ids: ids,
    },
  };

  const response = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  return response.body;
}

function streamTweets(socket) {
  const stream = needle.get(streamURL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  stream.on("data", (data) => {
    try {
      const json = JSON.parse(data);
      socket.emit("tweet", json);
      console.log(json);
    } catch (error) {}
  });
}

io.on("connection", async () => {
  console.log("client connected");
  let currentRules;
  try {
    //GET ALL RULES
    currentRules = await getRules();
    //DELETE ALL RULES
    await deleteRules(currentRules);
    //SET RULES
    await setRules();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
  streamTweets(io);
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

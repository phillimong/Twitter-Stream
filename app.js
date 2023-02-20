const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const needle = require("needle");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");
const Tweet = require('./models/tweet');
const models = require("./models");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.SERVER_PORT;
const TOKEN = process.env.TWITTER_BEARER_TOKEN;

const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
const streamURL =
  "https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics,conversation_id,created_at,in_reply_to_user_id,referenced_tweets,entities&user.fields=id,name,username,profile_image_url&expansions=author_id,attachments.media_keys,in_reply_to_user_id,referenced_tweets.id&media.fields=url";

const rules = [
  { value: "@ziara_outdoors", tag: "mentions" },
  { value: "@ziara_outdoors #biking", tag: "biking" },
  { value: "@ziara_outdoors #gamedrive", tag: "gamedrive" },
  { value: "@ziara_outdoors #safari", tag: "safari" },
  { value: "@ziara_outdoors #camping", tag: "camping" },
  { value: "@ziara_outdoors #fishing", tag: "fishing" },
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

function storeTweet(){
  try {
    
  } catch (error) {}
  
}

function streamTweets(socket) {
  const stream = needle.get(streamURL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  stream.on("data", (obj) => {
    try {
      const tweet_obj = JSON.parse(obj);
      const { data, includes, matching_rules } = tweet_obj;
      socket.emit("tweet", tweet_obj);
      console.log(data, includes, matching_rules);
      const { entities, conversation_id, created_at, id, text, referenced_tweets } = data;
      const {hashtags} = entities; 
      const { users, media } = includes;
      const media_dets = media?.map((media) => ({ url: media.url }));
      const tweet_owner = users.shift();
      const mentioned_users = users?.map((user)=>({user_name: user.user_name}));
      const user_name = tweet_owner.name;
      const user_image_url = tweet_owner.profile_image_url;
      const user_username = tweet_owner.username;
      const tags = hashtags?.map((tag) => ({ tag: tag.tag }));
      console.log(tags);
    
      Tweet.create({
        id: id,
        text: text,
        conversation_id: conversation_id,
        created_at: created_at,
        media_dets: media_dets,
        hashtags: tags,
        user_name: user_name,
        user_username: user_username,
        user_image_url: user_image_url,
        referenced_tweets: referenced_tweets,
        mentioned_users: mentioned_users,
      });
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


models.sequelize
  .sync({ update: true })
  .then(function () {
    console.log("Database OK");
  })
  .catch(function (err) {
    console.log(err, `${err}`);
  });

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
});

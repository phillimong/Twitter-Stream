const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const needle = require("needle");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");
// const models = require("./models");
const tweet = require("./models/tweet");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.SERVER_PORT;
const TOKEN = process.env.TWITTER_BEARER_TOKEN;

const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
const streamURL =
  "https://api.twitter.com/2/tweets/search/stream?tweet.fields=conversation_id,created_at,in_reply_to_user_id,referenced_tweets&user.fields=id,name,username,profile_image_url&expansions=author_id,attachments.media_keys,in_reply_to_user_id,referenced_tweets.id&media.fields=url";


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
  stream.on("data", (tweet_obj) => {
    try {
      const tweet = JSON.parse(tweet_obj);
      const {data, includes, matching_rules}=  tweet;
      const{conversation_id, created_at, id, text} = data;
      
      const {users, media} = includes;

      const media_dets = media.map((media) => ({type: media.type, url: media.url}))
    
      console.log("Conversation ID : "+conversation_id)
      console.log("//////////")
      console.log("Tweet ID : "+id)
      console.log("//////////")
      console.log("Text : "+text)
      console.log("////////")
      console.log("Created At : "+created_at);
      console.log("////////")
      console.log(media_dets)

      const user = users[0];

      const user_name =user.name
      const user_image_url = user.profile_image_url
      const user_username = user.username
      
      
      const{tag} = matching_rules[0]
      console.log(" User Details - User name : " + user_name,"Profile Image URL : "+user_image_url, "Username : "+user_username)
      console.log("////////")
      socket.emit("tweet",  tweet);
      console.log("Tweet Tag: "+tag);
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


//database sync
// models.sequelize
//   .sync({ update: true })
//   .then(function () {
//     console.log("Database OK");
//   })
//   .catch(function (err) {
//     console.log(err, `${err}`);
//   });

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

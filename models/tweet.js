"use strict";
const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Tweet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Tweet.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type:DataTypes.STRING},
      text: DataTypes.STRING,
      conversation_id: DataTypes.STRING,
      created_at: DataTypes.DATE,
      media_dets: DataTypes.JSONB,
      hashtags: DataTypes.JSONB,
      user_name: DataTypes.STRING,
      user_image_url: DataTypes.STRING,
      user_username: DataTypes.STRING,
      referenced_tweets:DataTypes.JSONB,
      mentioned_users:DataTypes.JSONB
    },
    {
      sequelize,
      modelName: "Tweet",
    }
  );
  return Tweet;
};
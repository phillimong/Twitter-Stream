'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tweets', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      text: {
        type: Sequelize.STRING
      },
      conversation_id: {
        type: Sequelize.STRING
      },
      created_at: {
        type: Sequelize.DATE
      },
      media_dets: {
        type: Sequelize.ARRAY
      },
      tag: {
        type: Sequelize.STRING
      },
      user_name: {
        type: Sequelize.STRING
      },
      user_image_url: {
        type: Sequelize.STRING
      },
      user_username: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Tweets');
  }
};
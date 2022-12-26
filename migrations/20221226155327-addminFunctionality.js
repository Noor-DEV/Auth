"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface
      .addColumn("users", "is_admin", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      })
      .then(() => {
        return queryInterface.sequelize.query(
          `UPDATE users SET is_admin=true WHERE id=2`
        );
      });
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tags', {
      tagId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.TINYINT(2),
        unique: true,
      },
      tagValue: {
        allowNull: true,
        type: Sequelize.STRING(255),
      },
    },{
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tags');
  },
};

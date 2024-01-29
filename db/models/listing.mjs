export default function initListingModel(sequelize, DataTypes) {
  return sequelize.define(
    'listing',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      productName: {
        type: DataTypes.STRING,
      },
      productDescription: {
        type: DataTypes.STRING,
      },
      isAvailable: {
        type: DataTypes.BOOLEAN,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      productImageInfo: {
        type: DataTypes.TEXT,
      },
      productCategory: {
        type: DataTypes.ENUM('appliances', 'electronics', 'furnitures', 'toys'),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      // The underscored option makes Sequelize reference snake_case names in the DB.
      underscored: true,
    },
  );
}

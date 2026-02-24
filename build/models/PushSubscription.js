"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushSubscription = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
// Clase del modelo
class PushSubscription extends sequelize_1.Model {
}
exports.PushSubscription = PushSubscription;
// Inicializar el modelo
PushSubscription.init({
    id_subscription: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    endpoint: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        unique: true,
    },
    p256dh: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    auth: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'PushSubscription',
    tableName: 'push_subscription',
    timestamps: false,
});

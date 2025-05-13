// processCategoryGames.js
const db = connect('localhost/casino_system');

const adminTenantsCursor = db.tenants.find({ admin_user_id: 617 });
const adminTenants = adminTenantsCursor.map(doc => doc.tenant_id);

const batchDataCursor = db.category_games.find({
  tenant_id: { $in: adminTenants }
}).sort({ category_game_id: 1 }).limit(1000).skip(offset);

const batchData = batchDataCursor.toArray();

const operations = batchData.map(game => ({
  updateOne: {
    filter: { category_game_id: game.category_game_id },
    update: { $set: game },
    upsert: true
  }
}));

db.category_games.bulkWrite(operations);

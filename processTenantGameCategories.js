// processTenantGameCategories.js
const db = connect('localhost/casino_system');

const adminTenantsCursor = db.tenants.find({ admin_user_id: 617 });
const adminTenants = adminTenantsCursor.map(doc => doc.tenant_id);

const batchDataCursor = db.tenant_game_categories.find({
  tenant_id: { $in: adminTenants }
});

const batchData = batchDataCursor.toArray();

const operations = batchData.map(category => ({
  updateOne: {
    filter: { tenant_game_category_id: category.tenant_game_category_id },
    update: { $set: category },
    upsert: true
  }
}));

db.tenant_game_categories.bulkWrite(operations);

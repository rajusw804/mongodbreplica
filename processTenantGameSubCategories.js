// processTenantGameSubCategories.js
const db = connect('localhost/casino_system');

const adminTenantsCursor = db.tenants.find({ admin_user_id: 617 });
const adminTenants = adminTenantsCursor.map(doc => doc.tenant_id);

const batchDataCursor = db.tenant_game_sub_categories.find({
  tenant_game_category_id: { $in: db.tenant_game_categories.find({ tenant_id: { $in: adminTenants } }).map(doc => doc.tenant_game_category_id) }
});

const batchData = batchDataCursor.toArray();

const operations = batchData.map(subCategory => ({
  updateOne: {
    filter: { tenant_game_sub_category_id: subCategory.tenant_game_sub_category_id },
    update: { $set: subCategory },
    upsert: true
  }
}));

db.tenant_game_sub_categories.bulkWrite(operations);

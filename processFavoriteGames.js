// processFavoriteGames.js
const db = connect('localhost/casino_system');

const adminTenantsCursor = db.tenants.find({ admin_user_id: 617 });
const adminTenants = adminTenantsCursor.map(doc => doc.tenant_id);

const tenantLicensesCursor = db.tenant_multi_licenses.find({
  tenant_id: { $in: adminTenants },
  name: 'Tobique'
});
const licenseIds = tenantLicensesCursor.map(doc => doc.id);

const adminTenantUsersCursor = db.users.find({
  tenant_id: { $in: adminTenants },
  license_id: { $in: licenseIds }
});
const userIds = adminTenantUsersCursor.map(doc => doc.user_id);

const batchDataCursor = db.favorite_games.find({
  user_id: { $in: userIds }
});

const batchData = batchDataCursor.toArray();

const operations = batchData.map(game => ({
  updateOne: {
    filter: { favorite_game_id: game.favorite_game_id },
    update: { $set: game },
    upsert: true
  }
}));

db.favorite_games.bulkWrite(operations);

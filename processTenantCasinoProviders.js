// processTenantCasinoProviders.js
const db = connect('localhost/casino_system');

const adminTenantsCursor = db.tenants.find({ admin_user_id: 617 });
const adminTenants = adminTenantsCursor.map(doc => doc.tenant_id);

const batchDataCursor = db.tenant_casino_providers.find({
  tenant_id: { $in: adminTenants }
});

const batchData = batchDataCursor.toArray();

const operations = batchData.map(provider => ({
  updateOne: {
    filter: { tenant_casino_provider_id: provider.tenant_casino_provider_id },
    update: { $set: provider },
    upsert: true
  }
}));

db.tenant_casino_providers.bulkWrite(operations);

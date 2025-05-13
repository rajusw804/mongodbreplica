// processCasinoTransactions.js
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

const batchDataCursor = db.casino_transactions.find({
  user_id: { $in: userIds }
}).sort({ casino_transaction_id: 1 }).limit(1000).skip(offset); // Replace 'offset' dynamically

const batchData = batchDataCursor.toArray();

const operations = batchData.map(transaction => ({
  updateOne: {
    filter: { casino_transaction_id: transaction.casino_transaction_id },
    update: { $set: transaction },
    upsert: true
  }
}));

db.casino_transactions.bulkWrite(operations);

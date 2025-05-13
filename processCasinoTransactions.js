// processCasinoTransactions.js

// Connect to the casino_system database
const db = connect('localhost/casino_system');

// Fetch tenant IDs associated with the admin user
const adminTenantsCursor = db.tenants.find({ admin_user_id: 617 });
const adminTenants = adminTenantsCursor.map(doc => doc.tenant_id);

// Fetch license IDs for the relevant tenants
const tenantLicensesCursor = db.tenant_multi_licenses.find({
  tenant_id: { $in: adminTenants },
  name: 'Tobique'
});
const licenseIds = tenantLicensesCursor.map(doc => doc.id);

// Fetch user IDs associated with the admin tenant licenses
const adminTenantUsersCursor = db.users.find({
  tenant_id: { $in: adminTenants },
  license_id: { $in: licenseIds }
});
const userIds = adminTenantUsersCursor.map(doc => doc.user_id);

// Define an offset for transaction fetching; this must be set dynamically outside this script
const offset = 0;  // Example static offset, adjust as necessary

// Fetch casino transaction data for the given users with pagination and sorting
const batchDataCursor = db.casino_transactions.find({
  user_id: { $in: userIds }
}).sort({ casino_transaction_id: 1 }).limit(1000).skip(offset);

const batchData = batchDataCursor.toArray();

// Function to safely prepare transaction update data, ensuring no circular references
function prepareTransactionUpdate(transaction) {
  // Creating a simplified, safe transaction object for updates
  const safeUpdate = {
    casino_transaction_id: transaction.casino_transaction_id,
    // Add other fields from transaction that are needed for the update
    field1: transaction.field1,
    field2: transaction.field2
    // Add other necessary fields
  };
  
  return { $set: safeUpdate };
}

// Create the bulk update operations
const operations = batchData.map(transaction => ({
  updateOne: {
    filter: { casino_transaction_id: transaction.casino_transaction_id },
    update: prepareTransactionUpdate(transaction),
    upsert: true
  }
}));

// Execute the bulk update operation
db.casino_transactions.bulkWrite(operations);

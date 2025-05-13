// Connection to the MongoDB database
const db = connect('mongodb://localhost:27017/casino_system');

// Ensure the 'casino_transactions' collection exists
try {
    const stats = db.casino_transactions.stats();
    if (!stats.ok) {
        db.createCollection('casino_transactions');
    }
} catch (e) {
    db.createCollection('casino_transactions');
}

// Fetch tenant IDs associated with the admin user
const adminTenantsCursor = db.tenants.find({ admin_user_id: 425 });
const adminTenants = adminTenantsCursor.map(doc => doc.tenant_id);

// Fetch license IDs relevant to tenants
const tenantLicensesCursor = db.tenant_multi_licenses.find({
    tenant_id: { $in: adminTenants },
    name: 'Tobique'
});
const licenseIds = tenantLicensesCursor.map(doc => doc.id);

// Fetch user IDs associated with these licenses
const adminTenantUsersCursor = db.users.find({
    tenant_id: { $in: adminTenants },
    license_id: { $in: licenseIds }
});
const userIds = adminTenantUsersCursor.map(doc => doc.user_id);

// Set the offset value
const offset = 0; // Replace with your dynamic offset

// Fetch transaction batch if collection exists
let batchData = [];
try {
    const batchDataCursor = db.casino_transactions.find({
        user_id: { $in: userIds }
    }).sort({ casino_transaction_id: 1 }).skip(offset).limit(1000);

    batchData = batchDataCursor.toArray();
} catch (e) {
    print("Error occurred while fetching batch data: ", e.message);
}

// Prepare and execute bulk operations
if (batchData.length > 0) {
    const operations = batchData.map(transaction => ({
        updateOne: {
            filter: { casino_transaction_id: transaction.casino_transaction_id },
            update: {
                $set: {
                    tenant_id: transaction.tenant_id,
                    user_id: transaction.user_id,
                    action_type: transaction.action_type,
                    action_id: transaction.action_id,
                    amount: transaction.amount,
                    game_identifier: transaction.game_identifier,
                    game_id: transaction.game_id,
                    wallet_id: transaction.wallet_id,
                    non_cash_amount: transaction.non_cash_amount,
                    status: transaction.status,
                    admin_id: transaction.admin_id,
                    currency_code: transaction.currency_code,
                    before_balance: transaction.before_balance,
                    after_balance: transaction.after_balance,
                    primary_currency_amount: transaction.primary_currency_amount,
                    amount_type: transaction.amount_type,
                    elastic_updated: transaction.elastic_updated,
                    conversion_rate: transaction.conversion_rate,
                    is_sticky: transaction.is_sticky,
                    user_bonus_id: transaction.user_bonus_id,
                    created_at: transaction.created_at,
                    updated_at: transaction.updated_at,
                    more_details: transaction.more_details,
                    jackpot_contribution: transaction.jackpot_contribution
                }
            },
            upsert: true
        }
    }));

    db.casino_transactions.bulkWrite(operations);
} else {
    print("No data found for bulk operations.");
}

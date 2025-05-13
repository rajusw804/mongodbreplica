// processDailyCumulativeReport.js
const db = connect('localhost/casino_system');

const adminTenantsCursor = db.tenants.find({ admin_user_id: 617 });
const adminTenants = adminTenantsCursor.map(doc => doc.tenant_id);

const batchDataCursor = db.daily_cumulative_report.find({
  tenant_id: { $in: adminTenants }
});

const batchData = batchDataCursor.toArray();

const operations = batchData.map(report => ({
  updateOne: {
    filter: { daily_cumulative_report_id: report.daily_cumulative_report_id },
    update: { $set: report },
    upsert: true
  }
}));

db.daily_cumulative_report.bulkWrite(operations);

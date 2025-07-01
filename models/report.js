import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    vendorOne: { type: Number, default: 0 },
    vendorTwo: { type: Number, default: 0 },
    totalDeposits: { type: Number, default: 0 },
    dailyTransactions: { type: Number, default: 0 },
    totalVendorBalance: { type: Number, default: 0 },
    bankBalance: { type: Number, default: 0 },
    profits: { type: Number, default: 0 }, // Auto-calculated
  },
  { timestamps: true }
);

// Middleware for findOneAndUpdate
reportSchema.pre("findOneAndUpdate", async function (next) {
  // console.log(`🔍 findOneAndUpdate triggered!`);
  
  const updateData = this.getUpdate();
  // console.log("Update Data:", updateData);

  // Extract updated fields or use existing document values
  const doc = await this.model.findOne(this.getQuery());
  if (!doc) return next(); // Exit if document not found

  // New values (from update request or existing document)
  const vendorOne = updateData.$set?.vendorOne ?? doc.vendorOne;
  const vendorTwo = updateData.$set?.vendorTwo ?? doc.vendorTwo;
  const totalDeposits = updateData.$set?.totalDeposits ?? doc.totalDeposits;
  const dailyTransactions =
    updateData.$set?.dailyTransactions ?? doc.dailyTransactions;
  const bankBalance = updateData.$set?.bankBalance ?? doc.bankBalance;

  // Calculate profits
  const newProfits =
    vendorOne + vendorTwo + bankBalance + dailyTransactions - totalDeposits;

  // Ensure profits are updated
  this.set({ profits: newProfits });

  // console.log(`💰 Calculated Profits: ${newProfits}`);
  next();
});

// Middleware for save (for new reports)
reportSchema.pre("save", function (next) {
  // console.log("🔍 save triggered!");

  this.profits =
    this.vendorOne +
    this.vendorTwo +
    this.bankBalance +
    this.dailyTransactions -
    this.totalDeposits;

  // console.log(`💰 Initial Profits: ${this.profits}`);
  next();
});

const Report = mongoose.model("Report", reportSchema);
export default Report;

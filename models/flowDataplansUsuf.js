import mongoose from 'mongoose';

// Define the schema for the data plans
const dataPlanSchema = new mongoose.Schema({
  id: { 
    type: Number, 
    required: true,
    unique: true,
},
  Network: {
    type: String, 
    required: true 
},
  PlanType: {
    type: String, 
    required: true 
},
  Amount: { 
    type: String, 
    required: true 
},
  Size: { 
    type: String, 
    required: true 
},
  Validity: { 
    type: String, 
    required: true 
},
vendor: { 
  type: String, 
  required: true 
},
enabled: {
  type: Boolean,
  default: true
}
});

// Create the Mongoose model for the data plans
const FlowDataPlanUsuf = mongoose.model('FlowDataPlanUsuf', dataPlanSchema);

export default FlowDataPlanUsuf;
const mongoose = require("mongoose");
const holidaySchema = new mongoose.Schema({
    date: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['college', 'govt', 'both'], required: true }
  });
holidaySchema.post('init', async function () {
    try {
      const today = new Date().toISOString().split('T')[0];
      await this.constructor.deleteMany({ date: { $lt: today } });
      //console.log('Outdated holidays cleaned up');
    } catch (err) {
      console.error('Error cleaning up outdated holidays:', err);
    }
  });
const Holiday = mongoose.model('Holiday', holidaySchema);
module.exports=Holiday;
import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  value: { type: String, unique: true, default: 'USER' },
});

const RoleModel = mongoose.model('RoleModel', roleSchema);

export default RoleModel;

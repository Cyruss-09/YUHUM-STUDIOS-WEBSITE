const userSchema = new mongoose.Schema({
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});
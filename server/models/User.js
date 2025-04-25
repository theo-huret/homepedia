const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Veuillez ajouter un nom']
    },
    email: {
        type: String,
        required: [true, 'Veuillez ajouter un email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Veuillez ajouter un email valide'
        ]
    },
    password: {
        type: String,
        required: [true, 'Veuillez ajouter un mot de passe'],
        minlength: 6,
        select: false
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET || 'jcuqhfzhefizeufhziof987654dazjfakzjf9876545ezfjzefhzkjfhkjahazkjhdkazda456786545678czehjzjha0976daalbhjbzjb:;!',
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
};

module.exports = mongoose.model('User', UserSchema);
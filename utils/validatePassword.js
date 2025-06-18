async function validatePassword(password) {
    const errors = [];

    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long.");
    }

    if (password.length > 64) {
        errors.push("Password must be at most 64 characters long.");
    }

    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter.");
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter.");
    }

    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number.");
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        errors.push("Password must contain at least one special character.");
    }

    // Only return errors if there are any
    return errors.length > 0 ? errors : null;
}

module.exports = validatePassword; 
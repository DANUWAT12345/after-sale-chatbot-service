const { hashPassword } = require('../Utils/hashPassword');
const { insertAdminUser } = require('../services/adminUserSignupService');
const { ensureAdminUserTable } = require('../Utils/ensureAdminUserTable');

exports.signupAdmin = async (req, res) => {
  const { name, role, tel, username, password } = req.body;
  if (!name || !role || !tel || !username || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    // Ensure table exists (moved to Utils)
    await ensureAdminUserTable();
    const hashedPassword = await hashPassword(password);
    await insertAdminUser({ name, role, tel, username, hashedPassword });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

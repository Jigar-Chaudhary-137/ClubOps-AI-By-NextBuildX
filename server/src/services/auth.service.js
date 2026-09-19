const User = require('../models/User');
const Club = require('../models/Club');
const { generateToken } = require('../utils/token');

/**
 * Custom operational error class with HTTP status
 */
class AuthError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Generates a unique uppercase club code
 */
const generateClubCode = async (clubName) => {
  const base = clubName
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 4) || 'CLUB';

  let code;
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 10) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    code = `${base}-${randomSuffix}`;
    const found = await Club.findOne({ code });
    if (!found) {
      exists = false;
    }
    attempts++;
  }

  return code;
};

/**
 * Register a new user and optionally create or associate a club.
 */
const registerUser = async ({ name, email, password, role = 'member', clubName, clubCategory, clubCode }) => {
  // 1. Validation
  if (!name || !email || !password) {
    throw new AuthError('Name, email, and password are required', 400);
  }

  if (password.length < 6) {
    throw new AuthError('Password must be at least 6 characters long', 400);
  }

  // Prevent self-registering as admin
  if (role === 'admin') {
    throw new AuthError('Registration as admin is restricted', 403);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 2. Check for existing user
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AuthError('An account with this email already exists', 409);
  }

  let assignedClub = null;

  // 3. Handle optional joining via existing clubCode
  if (clubCode) {
    const club = await Club.findOne({ code: clubCode.toUpperCase().trim() });
    if (!club) {
      throw new AuthError(`Club with code "${clubCode.toUpperCase()}" not found`, 404);
    }
    assignedClub = club;
  }

  // 4. Create user
  const user = new User({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role,
    club: assignedClub ? assignedClub._id : null
  });

  await user.save();

  // 5. Handle optional new club creation (e.g., if organizer registers with clubName)
  if (clubName && !assignedClub) {
    const generatedCode = await generateClubCode(clubName);
    const newClub = new Club({
      name: clubName.trim(),
      category: clubCategory || 'General',
      code: generatedCode,
      leadOrganizer: user._id,
      membersCount: 1
    });

    await newClub.save();
    user.club = newClub._id;
    await user.save();
    assignedClub = newClub;
  } else if (assignedClub && clubCode) {
    // Increment member count for joined club
    assignedClub.membersCount = (assignedClub.membersCount || 1) + 1;
    await assignedClub.save();
  }

  // 6. Generate JWT token
  const token = generateToken(user._id, user.role, assignedClub ? assignedClub._id : null);

  return {
    user: user.toJSON(),
    token,
    club: assignedClub
  };
};

/**
 * Authenticates user credentials and returns JWT with safe user profile.
 */
const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AuthError('Email and password are required', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Explicitly select password for comparison
  const user = await User.findOne({ email: normalizedEmail })
    .select('+password')
    .populate('club', 'name code category logoUrl');

  if (!user) {
    throw new AuthError('Invalid email or password', 401);
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new AuthError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AuthError('User account is deactivated. Please contact support.', 403);
  }

  // Update last login timestamp
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const clubId = user.club ? user.club._id || user.club : null;
  const token = generateToken(user._id, user.role, clubId);

  return {
    user: user.toJSON(),
    token,
    club: user.club
  };
};

/**
 * Retrieves the current authenticated user's profile with associated club details.
 */
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).populate('club', 'name code category logoUrl description membersCount');
  if (!user) {
    throw new AuthError('User not found', 404);
  }
  return user.toJSON();
};

/**
 * Creates a new Club and designates the user as lead organizer.
 */
const createClub = async (userId, { name, description = '', category = 'General', code }) => {
  if (!name) {
    throw new AuthError('Club name is required', 400);
  }

  let finalCode = code ? code.toUpperCase().trim() : await generateClubCode(name);

  const existingClub = await Club.findOne({ code: finalCode });
  if (existingClub) {
    throw new AuthError(`Club code "${finalCode}" is already taken`, 409);
  }

  const club = new Club({
    name: name.trim(),
    description: description.trim(),
    category: category.trim(),
    code: finalCode,
    leadOrganizer: userId,
    membersCount: 1
  });

  await club.save();

  // Associate user with the new club if not already associated
  const user = await User.findById(userId);
  if (user && !user.club) {
    user.club = club._id;
    await user.save();
  }

  return club;
};

/**
 * Associates an authenticated user with an existing club using the club code.
 */
const joinClub = async (userId, { code }) => {
  if (!code) {
    throw new AuthError('Club code is required to join', 400);
  }

  const normalizedCode = code.toUpperCase().trim();
  const club = await Club.findOne({ code: normalizedCode });
  if (!club) {
    throw new AuthError(`Club with code "${normalizedCode}" not found`, 404);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AuthError('User not found', 404);
  }

  if (user.club && user.club.toString() === club._id.toString()) {
    throw new AuthError('You are already a member of this club', 400);
  }

  user.club = club._id;
  await user.save();

  club.membersCount = (club.membersCount || 0) + 1;
  await club.save();

  return {
    user: user.toJSON(),
    club
  };
};

module.exports = {
  AuthError,
  registerUser,
  loginUser,
  getCurrentUser,
  createClub,
  joinClub
};

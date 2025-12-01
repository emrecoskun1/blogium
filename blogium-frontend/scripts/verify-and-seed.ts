/**
 * Email Verification + Seed Script
 *
 * Bu script önce email verification kodunu girer, sonra makaleleri oluşturur
 */

const API_URL = 'http://localhost:5000/api';

const USER_CREDENTIALS = {
  email: 'emre28coskun@gmail.com',
  password: 'Test123',
  verificationCode: '' // Bu kodu emailden alıp buraya yazın
};

interface AuthResponse {
  user: {
    email: string;
    token: string;
    username: string;
    bio: string;
    image: string | null;
  };
}

async function verifyEmail(code: string): Promise<void> {
  console.log('📧 Verifying email...');

  const response = await fetch(`${API_URL}/auth/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: USER_CREDENTIALS.email,
      code: code
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Email verification failed: ${response.status} - ${errorText}`);
  }

  console.log('✅ Email verified successfully!');
}

async function login(): Promise<string> {
  console.log('🔐 Logging in...');

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: USER_CREDENTIALS.email,
      password: USER_CREDENTIALS.password
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Login failed: ${response.status} - ${errorText}`);
  }

  const data: AuthResponse = await response.json();
  console.log(`✅ Logged in as ${data.user.username}`);
  return data.user.token;
}

async function main() {
  console.log('\n🌱 Email Verification + Seed Tool\n');

  // Eğer verification code verilmişse, önce verify et
  if (USER_CREDENTIALS.verificationCode) {
    await verifyEmail(USER_CREDENTIALS.verificationCode);
  }

  // Login yap
  const token = await login();

  console.log('\n✅ Ready to seed articles!');
  console.log(`Token: ${token.substring(0, 20)}...`);
  console.log('\nNow run: npm run seed');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

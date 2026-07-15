import fs from 'fs';
import path from 'path';

async function run() {
  const API_BASE = 'http://localhost:8900/api';
  console.log('Logging in to user service...');
  
  try {
    const loginRes = await fetch(`${API_BASE}/accounts/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin_user', password: 'password123' })
    });
    
    if (!loginRes.ok) {
      const errText = await loginRes.text();
      throw new Error(`Login failed with status ${loginRes.status}: ${errText}`);
    }
    
    const loginData = await loginRes.json();
    console.log('Login successful! User ID:', loginData.userId);
    
    const token = loginData.token;
    const userId = loginData.userId;
    
    const filePath = path.resolve('large_image.bmp');
    if (!fs.existsSync(filePath)) {
      throw new Error(`Test file not found at: ${filePath}`);
    }
    
    const fileStats = fs.statSync(filePath);
    console.log(`Uploading file: ${filePath} (${(fileStats.size / (1024 * 1024)).toFixed(2)} MB)`);
    
    const fileBuffer = fs.readFileSync(filePath);
    const fileBlob = new Blob([fileBuffer], { type: 'image/bmp' });
    
    const formData = new FormData();
    formData.append('file', fileBlob, 'large_image.bmp');
    
    console.log('Sending upload request to product-catalog-service...');
    const uploadRes = await fetch(`${API_BASE}/catalog/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Id': String(userId)
      },
      body: formData
    });
    
    console.log('Response Status:', uploadRes.status);
    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Upload failed with status ${uploadRes.status}: ${errText}`);
    }
    
    const uploadData = await uploadRes.json();
    console.log('UPLOAD SUCCESSFUL!');
    console.log('Uploaded secure URL:', uploadData.url);
  } catch (e) {
    console.error('TEST ERROR:', e.message);
    process.exit(1);
  }
}

run();

// API Service untuk komunikasi dengan backend Vercel + Neon PostgreSQL

const API_URL = ''

// Fungsi fetch untuk semua data (unified endpoint)
const fetchData = async (table, method, body = null) => {
  const response = await fetch(`${API_URL}/api/data?table=${table}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Fungsi fetchAPI untuk legacy endpoint (auth, dll)
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
      throw new Error(error.error || `HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error)
    throw error
  }
}

// ==================== AUTHENTICATION ====================
export const loginUser = async (username, password) => {
  if (!username || !password) {
    throw new Error('Username dan password harus diisi')
  }
  
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Login gagal')
  }
  return data
}

export const logoutUser = () => {
  sessionStorage.removeItem('auth_token')
  sessionStorage.removeItem('user')
}

export const getCurrentUser = () => {
  const userStr = sessionStorage.getItem('user')
  if (userStr) {
    try {
      return JSON.parse(userStr)
    } catch (e) {
      console.error('Parse user error:', e)
      return null
    }
  }
  return null
}

export const isAuthenticated = () => {
  const token = sessionStorage.getItem('auth_token')
  return token !== null && token.length > 0
}

export const updatePasswordAPI = async (userId, oldPassword, newPassword) => {
  const response = await fetch('/api/update-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, oldPassword, newPassword })
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Gagal update password')
  return data
}

export const updateUsernameAPI = async (userId, newUsername, currentPassword) => {
  const response = await fetch('/api/update-username', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, newUsername, currentPassword })
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Gagal update username')
  return data
}

export const resetPasswordAPI = async (username, newPassword) => {
  const response = await fetch('/api/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, newPassword })
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Gagal reset password')
  return data
}

// ==================== BAHAN BAKU ====================
export const getBahanBaku = async () => {
  const result = await fetchData('bahan_baku', 'GET');
  console.log('Bahan Baku API response:', result);
  return result;
}
export const addBahanBaku = (data) => fetchData('bahan_baku', 'POST', data);
export const updateBahanBaku = (data) => fetchData('bahan_baku', 'PUT', data);
export const deleteBahanBaku = (id) => fetchData('bahan_baku', 'DELETE', { id });

// ==================== ALAT ====================
export const getAlat = async () => {
  const result = await fetchData('alat', 'GET');
  console.log('Alat API response:', result);
  return result;
}
export const addAlat = (data) => fetchData('alat', 'POST', data);
export const updateAlat = (data) => fetchData('alat', 'PUT', data);
export const deleteAlat = (id) => fetchData('alat', 'DELETE', { id });

// ==================== PRODUKSI ====================
export const getProduksi = async () => {
  try {
    const data = await fetchData('produksi', 'GET');
    if (data && data.length > 0) {
      localStorage.setItem('sismia_produksi', JSON.stringify(data));
      return data;
    }
    return [];
  } catch (err) {
    console.log('API produksi gagal, pakai localStorage');
    const localData = localStorage.getItem('sismia_produksi');
    return localData ? JSON.parse(localData) : [];
  }
}
export const addProduksi = (data) => fetchData('produksi', 'POST', data);
export const updateProduksi = (data) => fetchData('produksi', 'PUT', data);
export const deleteProduksi = (id) => fetchData('produksi', 'DELETE', { id });

// ==================== PENJUALAN ====================
export const getPenjualan = async () => {
  try {
    const data = await fetchData('penjualan', 'GET');
    if (data && data.length > 0) {
      localStorage.setItem('sismia_penjualan', JSON.stringify(data));
      return data;
    }
    return [];
  } catch (err) {
    console.log('API penjualan gagal, pakai localStorage');
    const localData = localStorage.getItem('sismia_penjualan');
    return localData ? JSON.parse(localData) : [];
  }
}
export const addPenjualan = (data) => fetchData('penjualan', 'POST', data);
export const updatePenjualan = (data) => fetchData('penjualan', 'PUT', data);
export const deletePenjualan = (id) => fetchData('penjualan', 'DELETE', { id });

// ==================== KEUANGAN ====================
export const getKeuangan = async () => {
  try {
    const data = await fetchData('keuangan', 'GET');
    if (data && data.length > 0) {
      localStorage.setItem('sismia_keuangan', JSON.stringify(data));
      return data;
    }
    return [];
  } catch (err) {
    console.log('API keuangan gagal, pakai localStorage');
    const localData = localStorage.getItem('sismia_keuangan');
    return localData ? JSON.parse(localData) : [];
  }
}
export const addKeuangan = (data) => fetchData('keuangan', 'POST', data);
export const updateKeuangan = (data) => fetchData('keuangan', 'PUT', data);
export const deleteKeuangan = (id) => fetchData('keuangan', 'DELETE', { id });

// ==================== LAPORAN KERUSAKAN ALAT ====================
export const getLaporanKerusakan = async () => {
  try {
    const data = await fetchData('laporan_kerusakan', 'GET');
    return data;
  } catch (err) {
    console.error('Get laporan kerusakan error:', err);
    return [];
  }
}
export const addLaporanKerusakan = (data) => fetchData('laporan_kerusakan', 'POST', data);
export const updateStatusLaporan = async (id, status) => {
  const result = await fetchData('laporan_kerusakan', 'PUT', { id, status });
  return result;
}
export const deleteLaporanKerusakan = (id) => fetchData('laporan_kerusakan', 'DELETE', { id });

// ==================== RESET DATA ====================
export const resetAllData = async () => {
  try {
    const response = await fetch('/api/reset-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
      throw new Error(error.error || 'Gagal mereset data')
    }
    
    const result = await response.json()
    
    // Clear semua localStorage
    localStorage.removeItem('sismia_bahanBaku')
    localStorage.removeItem('sismia_alat')
    localStorage.removeItem('sismia_produksi')
    localStorage.removeItem('sismia_penjualan')
    localStorage.removeItem('sismia_keuangan')
    localStorage.removeItem('sismia_laporanKerusakan') // TAMBAHKAN INI
    
    // Set ulang dengan array kosong
    localStorage.setItem('sismia_bahanBaku', JSON.stringify([]))
    localStorage.setItem('sismia_alat', JSON.stringify([]))
    localStorage.setItem('sismia_produksi', JSON.stringify([]))
    localStorage.setItem('sismia_penjualan', JSON.stringify([]))
    localStorage.setItem('sismia_keuangan', JSON.stringify([]))
    localStorage.setItem('sismia_laporanKerusakan', JSON.stringify([])) // TAMBAHKAN INI
    
    return result
  } catch (error) {
    console.error('Reset data error:', error)
    throw error
  }
}

// Ekspor default untuk memastikan semua fungsi tersedia
export default {
  loginUser,
  logoutUser,
  getCurrentUser,
  isAuthenticated,
  updatePasswordAPI,
  updateUsernameAPI,
  resetPasswordAPI,
  getBahanBaku,
  addBahanBaku,
  updateBahanBaku,
  deleteBahanBaku,
  getAlat,
  addAlat,
  updateAlat,
  deleteAlat,
  getProduksi,
  addProduksi,
  updateProduksi,
  deleteProduksi,
  getPenjualan,
  addPenjualan,
  updatePenjualan,
  deletePenjualan,
  getKeuangan,
  addKeuangan,
  updateKeuangan,
  deleteKeuangan,
  getLaporanKerusakan,
  addLaporanKerusakan,
  updateStatusLaporan,
  deleteLaporanKerusakan,
  resetAllData
}
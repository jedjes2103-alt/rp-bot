export function createCooldown() {
  const store = new Map(); // key: userId:cmd -> timestamp
  return {
    canRun(userId, cmd, sec) {
      const k = `${userId}:${cmd}`;
      const now = Date.now();
      const last = store.get(k) || 0;
      if (now - last >= sec * 1000) { store.set(k, now); return true; }
      return false;
    },
    remaining(userId, cmd) {
      const k = `${userId}:${cmd}`;
      const last = store.get(k) || 0;
      const diff = Date.now() - last;
      return Math.max(0, Math.ceil((secFromKey(k) * 1000 - diff) / 1000));
    }
  };
  function secFromKey() { return 5; } // ใช้ค่าเดฟลต์เวลาแสดงข้อความ (ไม่ critical)
}

// Local storage utilities

/**
 * Load data from localStorage
 */
export function loadData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`inventory_app_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading data for key: ${key}`, error);
    return defaultValue;
  }
}

/**
 * Save data to localStorage
 */
export function saveData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`inventory_app_${key}`, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving data for key: ${key}`, error);
  }
}

/**
 * Clear specific data from localStorage
 */
export function clearData(key: string): void {
  try {
    localStorage.removeItem(`inventory_app_${key}`);
  } catch (error) {
    console.error(`Error clearing data for key: ${key}`, error);
  }
}

/**
 * Clear all app data from localStorage
 */
export function clearAllData(): void {
  try {
    const keys = Object.keys(localStorage);
    const appKeys = keys.filter(key => key.startsWith('inventory_app_'));
    appKeys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing all data', error);
  }
}
export class Storage {

    static setItem(key, value) {
        localStorage.setItem(key, value);
    }

    static getItem(key) {
        const value = localStorage.getItem(key);
        try {
            return JSON.parse(value);
        } catch (error) {
            return value;
        }
    }

    static removeItem(key) {
        localStorage.removeItem(key);
    }

    static clear() {
        localStorage.clear();
    }
}

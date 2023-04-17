export default function stringify (obj:object): string {
    return JSON.stringify(obj, (_key, value) => {
        if (typeof value === 'number' &&
           (value === Infinity || value === -Infinity || isNaN(value))){
            return 0;
        }
        return value;
    });
}
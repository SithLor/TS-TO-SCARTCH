export default function splitFirst (text: string, separator: any) {
    const index = text.indexOf(separator);
    if (index >= 0) {
        return [text.substring(0, index), text.substring(index + 1)];
    }
    return [text, null];

}

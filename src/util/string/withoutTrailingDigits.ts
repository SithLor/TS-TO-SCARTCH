export default function withoutTrailingDigits (s: string): string {
    let i = s.length - 1;
    while ((i >= 0) && ('0123456789'.indexOf(s.charAt(i)) > -1)) i--;
    return s.slice(0, i + 1);
}
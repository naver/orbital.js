export default function strpad(str: string | number, len = 0, pad = ' ') {
    let res = str + '';
    while (res.length < len) {
        res = pad + res;
    }
    return res;
}

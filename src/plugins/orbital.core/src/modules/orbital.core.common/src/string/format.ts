export default function format(...args: any[]): string {
    const template = args[0];
    if (typeof template === 'string') {
        return template.replace(/{(\d+)}/g, (match, i: number) => {
            return typeof args[++i] === 'undefined' ? '' : args[i];
        });
    }
    throw new Error('The first argument should be a string type.');
}

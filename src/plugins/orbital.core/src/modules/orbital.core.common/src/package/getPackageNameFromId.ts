export default function getPackageNameFromId(id: string): string {
    return id.split(':')[0];
}

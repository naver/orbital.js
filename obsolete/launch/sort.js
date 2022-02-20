const depCount = {
    manifest(manifest) {
        return Reflect.ownKeys(manifest.dependencies).length;
    },
    plugin(plugin) {
        return Reflect.ownKeys(plugin.getManifest().dependencies).length;
    }
};

function swap(array, i, j) {
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
}

export default function sort(array, type) {
    for (let i = 0; i < array.length - 1; i++) {
        let min = i;
        for (let j = i + 1; j < array.length; j++) {
            if (depCount[type](array[j]) < depCount[type](array[min])) {
                min = j;
            }
        }
        swap(array, min, i);
    }
}

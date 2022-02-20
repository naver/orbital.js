function listenNodeRegistry(registry, Starter) {
    registry.on('packageAdded', (pack) => {
        if (!Starter.system) {return;}
        Starter.system.getContext()
            .installPlugin(pack.getManifest())
            .then((plugin) => {
                plugin.start();
            });
    });
    registry.on('packageWillUpdate', (reloadId) => {
        if (!Starter.system) {return;}
        const pluginToReload = Starter.system.getContext()
            .getPluginRegistry().getPluginById(reloadId);
        pluginToReload.stop();
    });
    registry.on('packageUpdated', (id, manifest) => {
        if (!Starter.system) {return;}
        const plugin = Starter.system.getContext()
            .getPluginRegistry().getPluginById(id);
        plugin.ensureStopped().then(() => {
            plugin.init(manifest);
            plugin.start({
                contributors: 'active'
            });
        });
    });
    registry.on('packageWillRemove', (pack) => {
        if (!Starter.system) {return;}
        Starter.system.getContext().uninstallPlugin(pack.getId());
    });
}

export default listenNodeRegistry;

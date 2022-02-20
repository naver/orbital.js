/* tslint:disable: max-line-length */

import {trace} from '../decorators';

import {
    ContributablePermissionCategory, IContributableDefinition,
    IContributablePermission, IContributablePermissionDefinition,
    IManifest, IPermissionValue, IPluginContext,
    IProjectConfig, ISystemContainer
} from 'orbital.core.types';

class ContributablePermission implements IContributablePermission {

    private _contributableId: string;
    private _getProjectPermission: () => IContributablePermissionDefinition;
    private _permission: IContributablePermissionDefinition;
    private _providerId: string;

    constructor(
        container: ISystemContainer,
        manifest: IManifest,
        contributable: IContributableDefinition
    ) {
        let projectPermission: IContributablePermissionDefinition;
        this._contributableId = contributable.id;
        this._permission = contributable.permission;
        this._providerId = manifest.getId();
        this._getProjectPermission = () => {
            if (!projectPermission) {
                const system = container.getSystemPlugin();
                const project = system.getContext().getService('orbital.core:project');
                const {permission} = project.getConfig() as IProjectConfig;
                projectPermission = permission[contributable.id];
            }
            return projectPermission;
        };
    }

    /*
     * IPermissionValue = 'all' | 'config' | 'none' | string[];
     */
    @trace
    allowed(category: ContributablePermissionCategory, user: IPluginContext): boolean {
        const userId = user.getId();
        const {allow, deny} = this._permission[category];
        return this._checkAllow(
            this._contributableId,
            userId,
            this._providerId,
            category,
            allow,
            deny
        );
    }

    toString() {
        return `<ContributablePermission>(${this._contributableId} ${JSON.stringify(this._permission)})`;
    }

    private _checkAllow (
        id: string,
        userId: string,
        providerId: string,
        category: ContributablePermissionCategory,
        allow: IPermissionValue,
        deny: IPermissionValue
    ): boolean {
        if (userId === providerId) {
            return true;
        } else if (allow === 'all') {
            if (deny === 'config') {
                const projectPermission = this._getProjectPermission();
                if (!projectPermission || !projectPermission[category] || !projectPermission[category].deny) {
                    const msg = `Permission value 'deny config' for ${id}' requires the corresponding project config value`;
                    throw new Error(msg);
                }
                const projectDeny = projectPermission[category].deny;
                if (projectDeny === 'config') {
                    const msg = `Permission value 'deny config' for ${id}' cannot have the corresponding project config value as 'config'`;
                    throw new Error(msg);
                }
                return this._checkDenyForAllowAll(projectDeny, userId, providerId);
            }
            return this._checkDenyForAllowAll(deny, userId, providerId);
        } else if (allow === 'none') {
            return false;
        } else if (Array.isArray(allow)) {
            return allow.some((item) => {
                if (item.endsWith('*')) {
                    const pattern = item.substring(0, item.length - 1);
                    return userId.startsWith(pattern);
                }
                return false;
            })
                || (allow.indexOf(userId) > -1)
                || (allow.indexOf(userId.split('@')[0]) > -1);
        } else if (allow === 'config') {
            const projectPermission = this._getProjectPermission();
            if (!projectPermission || !projectPermission[category] || !projectPermission[category].allow) {
                const msg = `Permission value 'allow config' for ${id}' requires the corresponding project config value`;
                throw new Error(msg);
            }
            const projectAllow = projectPermission[category].allow;
            if (projectAllow === 'config') {
                const msg = `Permission value 'allow config' for ${id}' cannot have the corresponding project config value as 'config'`;
                throw new Error(msg);
            }
            return this._checkAllow(id, userId, providerId, category, projectAllow, deny);
        }
        return false;
    }

    private _checkDenyForAllowAll(deny: IPermissionValue, userId: string, providerId: string): boolean {
        if (deny === 'all') {
            throw new Error('Illegal permission. allow: all, deny: all');
        } else if (deny === 'none') {
            return true;
        } else if (Array.isArray(deny)) {
            return deny.every((item) => {
                if (item.endsWith('*')) {
                    const pattern = item.substring(0, item.length - 1);
                    return !userId.startsWith(pattern);
                }
                return true;
            })
                && (deny.indexOf(userId) === -1)
                && (deny.indexOf(userId.split('@')[0]) === -1);
        }
        return false;
    }
}

export default ContributablePermission;

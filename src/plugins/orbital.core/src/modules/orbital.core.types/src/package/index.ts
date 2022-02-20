/* tslint:disable:no-empty-interface */

import {IBase, IFlag, IKeyString} from '../common';

export type IBundler = 'rollup' | 'webpack';
export type IBundleFormat = 'amd' | 'cjs' | 'umd';
export type IContributableSpecTypes = 'boolean' | 'function' | 'number' | 'object' | 'string';
export type IOrbitalPackageState = 'inactive' | 'stopped' | '';
export type IPackageRegistryCallback = (pack: IOrbitalPackage, index: number) => void;
export type IPermissionValue = 'all' | 'config' | 'none' | string[];
export type IPolicyType = 'eager';
export type ITargetType = 'node' | 'web';

export enum ContributablePermissionCategory {
    CALL = 'call',
    REALIZE = 'realize'
}

export enum ContributionCategory {
    EXTENSION = 'extension',
    SERVICE = 'service'
}

export enum ContributionGroupKey {
    EXTENSIONS = 'extensions',
    SERVICES = 'services'
}

export enum ContributionRole {
    CONTRIBUTABLE = 'contributable',
    CONTRIBUTES = 'contributes'
}

export enum PackageEvent {
    resolutionChanged = 'resolutionChanged',
    resolved = 'resolved',
    unresolved = 'unresolved'
}

export enum PackageManagerEvent {
    discovered = 'discovered',
    packageAdded = 'packageAdded',
    packageResolutionChanged = 'packageResolutionChanged',
    packageResolved = 'packageResolved',
    packageUnresolved = 'packageUnresolved',
    traverse = 'traverse'
}

export enum PackageState {
    NORMAL = 0,
    STOPPED = 1,
    STOPPED_BY_DEPENDENCY = 1 << 1,
    UNRESOLVED_DEPEDENCY = 1 << 2,
    INACTIVE = 1 << 3,
    INACTIVE_BY_DEPENDENCY = 1 << 4,
    INVALID_MODULE = 1 << 5,
    CONTRIBUTABLE_SYNTAX_ERROR = 1 << 6,
    CONTRIBUTION_SYNTAX_ERROR = 1 << 7,
    MODULE_NOT_FOUND = 1 << 8,
    INVALID_MANIFEST = 1 << 9,
    UNKNOWN_ERROR = 1 << 10
}

export interface IBundle {
    bundler: IBundler;
    format: IBundleFormat;
    path: string;
}

export interface IContributable {
    extensions: IContributableExtension[];
    services: IContributableService[];
}

/**
 * After normalization.
 */
export interface IContributableDefinition {
    desc?: string;
    id: string;
    permission: IContributablePermissionDefinition;
    spec: {
        [key: string]: IContributableSpecTypes | IContributableSpecValue;
    };
}

export interface IContributableExtension extends IContributableDefinition {}

export interface IContributableService extends IContributableDefinition {
    async?: boolean;
    tolerant?: boolean;
}

export interface IContributableSpecArgument {
    [argument: string]: IContributableSpecTypes;
}

export interface IContributableSpecValue {
    arguments?: IContributableSpecArgument[];
    desc?: string;
    meta?: boolean;
    return?: IContributableSpecTypes;
    type: IContributableSpecTypes;
}

export interface IContributes {
    extensions: IContributingExtension[];
    services: IContributingService[];
}

export interface IContributingDefinition {
    id: string;
    priority?: number;
    realize: string;
    vendor?: string;
}

export interface IContributingExtension extends IContributingDefinition {
    meta?: IExtensionMeta;
}

export interface IContributingService extends IContributingDefinition {}

export interface IDependencyNameVersionMap {
    [key: string]: string;
}

export interface IExtensionMeta {
    [key: string]: any;
}

export interface IOrbitalMeta {
    activator?: string;
    bundle: IBundle | boolean;
    contributable: IContributable;
    contributes: IContributes;
    policies: IPolicyType[];
    state: IOrbitalPackageState;
    target: ITargetType[];
}

export interface IOrbitalMetaResolved extends IOrbitalMeta {
    _id: string;
    _resolution: IOrbitalPackageResolution;
}

export interface IOrbitalPackage extends IFlag {
    dependencies: IOrbitalPackage[];
    packageJson: IOrbitalPackageJson;
    getErrorState(): PackageState;
    getErrorString(): string;
    getId(): string;
    getManifest(): ISerializableManifest;
    getName(): string;
    getVersion(): string;
    init(packageJson: IOrbitalPackageJson): void;
    validate(registry: IPackageRegistry): void;
}

export interface IOrbitalPackageForNode extends IOrbitalPackage {
    initPackageNode(node: IPackageNode): void;
}

export interface IOrbitalPackageGraphNode {
    label: string;
    nodes: IOrbitalPackageGraphNode[];
}

export interface IOrbitalPackageJson extends IPackageJson {
    dependencies: IKeyString;
    orbital: IOrbitalMeta;
}

export interface IOrbitalPackageResolution {
    depNameVersionMap: IDependencyNameVersionMap;

    /**
     * An array of error messages (if exists)
     * from package resolution.
     */
    errorReasons: string[];

    /**
     * Parent node's package id
     */
    parent: string | null;
    path: string;
    state: PackageState;
}

export interface IPackageIdentity {
    name: string;
    version: string;
}

export interface IPackageNode {
    children: IPackageNode[];
    error: Error | null;
    id: number;
    isLink: boolean;
    package: IOrbitalPackageJson;
    parent: IPackageNode;
    path: string;
    realpath: string;
}

export interface IPackageJson extends IPackageIdentity {
    dependencies?: IKeyString;
    description?: string;
    license?: string;
    main?: string;
    module?: string;
}

export interface IPackageManager extends IBase {
    graph(): void;
    init(): void;
    install(): void;
    list(): IOrbitalPackage[];
    uninstall(): void;
    update(): void;
}

export interface IPackageRegistry extends IBase {
    addPackage(pack: IOrbitalPackage): boolean;
    exists(pack: IOrbitalPackage): boolean;
    forEachPacks(callback: IPackageRegistryCallback): void;
    getPackageById(id: string): IOrbitalPackage;
    removePackage(pack: IOrbitalPackage): boolean;
}

export interface IContributablePermissionDefinition {
    call: IPermissionRule;
    realize: IPermissionRule;
}

/**
 * allow: white list pattern
 *   allow: ['abc', 'def']
 *   deny: 'all'
 * deny: black list pattern
 *   allow: 'all'
 *   deny: ['abc', 'def']
 */
export interface IPermissionRule {
    allow: IPermissionValue;
    deny: IPermissionValue;
}

export interface ISerializableManifest extends IPackageJson {
    dependencies: IKeyString;
    orbital: IOrbitalMetaResolved;
}

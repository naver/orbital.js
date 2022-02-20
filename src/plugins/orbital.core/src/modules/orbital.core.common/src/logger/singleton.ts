import {ILogger} from 'orbital.core.types';
import Logger from './Logger';

const singleton: ILogger = Logger.getSingleton();

export default singleton;

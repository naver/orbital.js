import $logger from './singleton';

function traceMethod(instance: object, method: string, params: any[], result: any = void 0, isReturn: boolean = false) {
    if (isReturn) {
        $logger.trace(
            '{0} {1}({2}) => {3}',
            instance.toString(),
            method,
            params,
            typeof result === 'undefined' ? 'void' : result
        );
    } else {
        $logger.trace(
            '{0} {1}({2}) called',
            instance.toString(),
            method,
            params
        );
    }
}

export default traceMethod;

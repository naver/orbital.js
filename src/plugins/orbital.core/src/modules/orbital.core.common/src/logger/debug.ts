import $logger from './singleton';

function debug(instance: object, method: string, params: any[], comment: string) {
    $logger.trace(
        '<{0}>{1}({2}): {3}',
        instance.toString(),
        method,
        params,
        comment
    );
}

export default debug;

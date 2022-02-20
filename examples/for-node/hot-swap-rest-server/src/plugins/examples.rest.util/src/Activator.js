class Activator {

    onStart(context) {
        this.logger = context.getService('orbital.core:logger');
        this.logger.info('hello Activator');
    }

    onStop() {
        this.logger.info('goodbye Activator');
    }
}

export default Activator;

class RestError extends Error{
    constructor(message, status){
        super(message);
        if(typeof message == 'object'){
            this.message = message;
        }
        this.status = status;
    }
}
module.exports = RestError;
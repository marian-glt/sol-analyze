const ExternalCallRule = (ast) => {
    //need to check functions for
    //external calls e.g. transfer, send, call, delegate call, anything else, calling external contracts, stuff like that
    //when found then we want to look for if they are checked
    //this is done by looking for a boolean value that is assigned to the call itself
    //something like require(bool, ) = transfer(this);
}
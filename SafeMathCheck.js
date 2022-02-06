const parser = require("@solidity-parser/parser");
const find = (str, regex) => {
	return (str.match(regex) || []);
}
class SafeMathCheck {
    constructor(ast) {
        this.isOldVersion = false;
        this.hasImport = false;
        this.hasOperation = false;
        this.isUsingSafeMath = false;
    }
}

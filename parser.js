const parser = require('@solidity-parser/parser');

const input = `
    pragma solidity 0.8.10;
    contract SimpleStorage {
        uint storedData;
        function set(uint x) public {
            storedData = x;
        }
        function get() public view returns (uint) {
            return storedData;
        }
    }
`
try {
    const ast = parser.parse(input, { loc: true })
    console.log(ast);
} catch (e) {
    if (e instanceof parser.ParserError) {
        console.error(e.errors);
    }
}
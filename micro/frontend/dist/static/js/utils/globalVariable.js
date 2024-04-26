
let listVariable = [];

function getGlobalVariable() {
    return listVariable;

}


function setGlobalVariable(value) {
    listVariable.push(value);
}

export { getGlobalVariable, setGlobalVariable };
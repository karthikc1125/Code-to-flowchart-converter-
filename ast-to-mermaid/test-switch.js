let a = Number(prompt("Enter first number:"));
let b = Number(prompt("Enter second number:"));
let op = prompt("Enter operator (+, -, *, /):");

switch (op) {
  case '+':
    console.log("Result = " + (a + b));
    break;
  case '-':
    console.log("Result = " + (a - b));
    break;
  case '*':
    console.log("Result = " + (a * b));
    break;
  case '/':
    console.log("Result = " + (a / b));
    break;
  default:
    console.log("Invalid operator");
}

console.log("Calculation completed");
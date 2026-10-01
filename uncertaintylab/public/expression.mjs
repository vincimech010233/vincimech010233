const MAX_EXPRESSION_LENGTH = 512;
const MAX_AST_DEPTH = 64;

const FUNCTIONS = new Map([
  ["abs", Math.abs],
  ["sqrt", Math.sqrt],
  ["exp", Math.exp],
  ["log", Math.log],
  ["sin", Math.sin],
  ["cos", Math.cos],
]);

export class ExpressionError extends Error {
  constructor(message, position = null) {
    super(position === null ? message : `${message} (position ${position + 1})`);
    this.name = "ExpressionError";
    this.position = position;
  }
}

function tokenize(source) {
  if (typeof source !== "string") {
    throw new ExpressionError("Expression must be text");
  }
  if (source.length > MAX_EXPRESSION_LENGTH) {
    throw new ExpressionError(`Expression must be ${MAX_EXPRESSION_LENGTH} characters or fewer`);
  }

  const tokens = [];
  let position = 0;

  while (position < source.length) {
    const char = source[position];
    if (/\s/.test(char)) {
      position += 1;
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      const start = position;
      position += 1;
      while (position < source.length && /[A-Za-z0-9_]/.test(source[position])) {
        position += 1;
      }
      tokens.push({ type: "identifier", value: source.slice(start, position), position: start });
      continue;
    }

    if (char === "*" && source[position + 1] === "*") {
      tokens.push({ type: "operator", value: "**", position });
      position += 2;
      continue;
    }

    if ("+-*/()".includes(char)) {
      const type = "()".includes(char) ? "punctuation" : "operator";
      tokens.push({ type, value: char, position });
      position += 1;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      throw new ExpressionError("Numeric literals are not allowed; use a declared variable", position);
    }

    throw new ExpressionError(`Unsupported character '${char}'`, position);
  }

  tokens.push({ type: "end", value: "", position: source.length });
  return tokens;
}

function validateVariableNames(variableNames) {
  if (!Array.isArray(variableNames) || variableNames.length === 0) {
    throw new ExpressionError("Declare at least one input variable");
  }
  if (variableNames.length > 16) {
    throw new ExpressionError("Use no more than 16 input variables");
  }

  const indexes = new Map();
  for (const [index, name] of variableNames.entries()) {
    if (typeof name !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
      throw new ExpressionError(`Invalid variable name '${String(name)}'`);
    }
    if (FUNCTIONS.has(name)) {
      throw new ExpressionError(`'${name}' is reserved for a math function`);
    }
    if (indexes.has(name)) {
      throw new ExpressionError(`Variable names must be unique: '${name}'`);
    }
    indexes.set(name, index);
  }
  return indexes;
}

export function parseExpression(source, variableNames) {
  const variableIndexes = validateVariableNames(variableNames);
  const tokens = tokenize(source);
  let cursor = 0;
  let nestedDepth = 0;

  const peek = () => tokens[cursor];
  const consume = () => tokens[cursor++];

  function expect(value) {
    if (peek().value !== value) {
      throw new ExpressionError(`Expected '${value}'`, peek().position);
    }
    return consume();
  }

  function nested(parseInner) {
    nestedDepth += 1;
    if (nestedDepth > MAX_AST_DEPTH) {
      nestedDepth -= 1;
      throw new ExpressionError(`Expression nesting must not exceed ${MAX_AST_DEPTH}`);
    }
    try {
      return parseInner();
    } finally {
      nestedDepth -= 1;
    }
  }

  function makeNode(kind, fields, children = []) {
    const depth = 1 + Math.max(0, ...children.map((child) => child.depth));
    if (depth > MAX_AST_DEPTH) {
      throw new ExpressionError(`Expression depth must not exceed ${MAX_AST_DEPTH}`);
    }
    return { kind, ...fields, depth };
  }

  function parseSum() {
    let node = parseProduct();
    while (peek().value === "+" || peek().value === "-") {
      const operator = consume();
      const right = parseProduct();
      node = makeNode("binary", { operator: operator.value, left: node, right }, [node, right]);
    }
    return node;
  }

  function parseProduct() {
    let node = parseUnary();
    while (peek().value === "*" || peek().value === "/") {
      const operator = consume();
      const right = parseUnary();
      node = makeNode("binary", { operator: operator.value, left: node, right }, [node, right]);
    }
    return node;
  }

  function parseUnary() {
    if (peek().value === "+" || peek().value === "-") {
      const operator = consume();
      const operand = nested(parseUnary);
      return makeNode("unary", { operator: operator.value, operand }, [operand]);
    }
    return parsePower();
  }

  function parsePower() {
    const left = parsePrimary();
    if (peek().value === "**") {
      consume();
      const right = nested(parseUnary);
      return makeNode("binary", { operator: "**", left, right }, [left, right]);
    }
    return left;
  }

  function parsePrimary() {
    const token = peek();
    if (token.value === "(") {
      consume();
      const expression = nested(parseSum);
      expect(")");
      return expression;
    }

    if (token.type !== "identifier") {
      throw new ExpressionError("Expected a declared variable or parenthesized expression", token.position);
    }

    consume();
    if (peek().value === "(") {
      if (!FUNCTIONS.has(token.value)) {
        throw new ExpressionError(`Unsupported function '${token.value}'`, token.position);
      }
      consume();
      const argument = nested(parseSum);
      if (peek().value === ",") {
        throw new ExpressionError("Math functions take exactly one argument", peek().position);
      }
      expect(")");
      return makeNode("call", { name: token.value, argument }, [argument]);
    }

    if (FUNCTIONS.has(token.value)) {
      throw new ExpressionError(`Call '${token.value}' with parentheses`, token.position);
    }
    if (!variableIndexes.has(token.value)) {
      throw new ExpressionError(`Unknown variable '${token.value}'`, token.position);
    }
    return makeNode("variable", { index: variableIndexes.get(token.value), name: token.value });
  }

  const ast = parseSum();
  if (peek().type !== "end") {
    throw new ExpressionError(`Unexpected token '${peek().value}'`, peek().position);
  }
  return ast;
}

export function evaluateExpression(ast, values) {
  function evaluate(node) {
    let result;
    switch (node.kind) {
      case "variable":
        result = values[node.index];
        break;
      case "unary": {
        const value = evaluate(node.operand);
        result = node.operator === "-" ? -value : value;
        break;
      }
      case "binary": {
        const left = evaluate(node.left);
        const right = evaluate(node.right);
        if (node.operator === "/" && right === 0) {
          throw new ExpressionError("Division by zero");
        }
        switch (node.operator) {
          case "+": result = left + right; break;
          case "-": result = left - right; break;
          case "*": result = left * right; break;
          case "/": result = left / right; break;
          case "**": result = left ** right; break;
          default: throw new ExpressionError("Unsupported operator");
        }
        break;
      }
      case "call": {
        const value = evaluate(node.argument);
        const fn = FUNCTIONS.get(node.name);
        if (!fn) throw new ExpressionError(`Unsupported function '${node.name}'`);
        result = fn(value);
        break;
      }
      default:
        throw new ExpressionError("Invalid expression tree");
    }

    if (!Number.isFinite(result)) {
      throw new ExpressionError("The expression produced a non-finite value");
    }
    return result;
  }

  if (!Array.isArray(values) && !ArrayBuffer.isView(values)) {
    throw new ExpressionError("Expression values must be a list of numbers");
  }
  return evaluate(ast);
}

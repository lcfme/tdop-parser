const PrecDict = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2
};

const POSTFIX = {
  "++"(parser, left) {
    return UnaryExpressionPostfix(parser, left);
  },
  "--"(parser, left) {
    return UnaryExpressionPostfix(parser, left);
  }
};

function InfixExpression(parser: Parser, left: Tok, prec: number) {
  let tok = left;
  const Op = parser.curTok;
  const OpPrec = PrecDict[Op.Type];
  if (OpPrec > prec) {
    parserRead(parser);
    tok = {
      Type: "InfixExpression",
      Op: Op,
      Left: tok,
      Right: parseExpression(parser, OpPrec)
    };
  }
  return tok;
}

const INFIX = {
  "+"(parser: Parser, left: Tok, prec: number) {
    return InfixExpression(parser, left, prec);
  },
  "-"(parser: Parser, left: Tok, prec: number) {
    return InfixExpression(parser, left, prec);
  },
  "*"(parser: Parser, left: Tok, prec: number) {
    return InfixExpression(parser, left, prec);
  },
  "/"(parser: Parser, left: Tok, prec: number) {
    return InfixExpression(parser, left, prec);
  }
};

function UnaryExpressionPrefix(parser: Parser) {
  const OpTok = parser.curTok;
  parserRead(parser);
  // const ArgTok = parser.curTok;
  // parserRead(parser);
  // if (!ArgTok || !(ArgTok.Type === "Ident" || ArgTok.Type === "Number")) {
  //   err("tok " + JSON.stringify(ArgTok) + " cannot follow prefix op +");
  // }
  return {
    Type: "UnaryExpressionPrefix",
    Op: OpTok,
    Argument: parseExpression(parser, 9)
  };
}

function UnaryExpressionPostfix(parser: Parser, left: Tok) {
  const OpTok = parser.curTok;
  parserRead(parser);
  return {
    Type: "UnaryExpressionPostfix",
    Op: OpTok,
    Argument: left
  };
}

function parseExpression(parser: Parser, prec: number) {
  prec = prec === undefined ? 0 : prec;
  let tok = parser.curTok;

  if (!PREFIX[tok.Type]) {
    err("cannot resolve tok: " + JSON.stringify(tok));
  }
  let left = PREFIX[tok.Type](parser);
  while (parser.curTok && PrecDict[parser.curTok.Type] > prec) {
    left = INFIX[parser.curTok.Type](parser, left, prec);
  }
  return left;
}

const PREFIX = {
  "("(parser: Parser) {
    parserRead(parser);
    let expr = parseExpression(parser, 0);
    if (parser.curTok.Type !== ")") {
      err("parser error" + parser.curTok + '!==")"');
    }
    parserRead(parser);
    return expr;
  },
  "+"(parser: Parser) {
    return UnaryExpressionPrefix(parser);
  },
  "-"(parser: Parser) {
    return UnaryExpressionPrefix(parser);
  },
  Number(parser: Parser) {
    let left = parser.curTok;
    parserRead(parser);
    let right = parser.curTok;
    if (!right || !POSTFIX[right.Type]) {
      return left;
    }
    left = POSTFIX[right.Type](parser, left);
    return left;
  },
  Ident(parser: Parser) {
    let left = parser.curTok;
    parserRead(parser);
    let right = parser.curTok;
    if (!right || !POSTFIX[right.Type]) {
      return left;
    }
    left = POSTFIX[right.Type](parser, left);
    return left;
  },
  "++"(parser: Parser) {
    return UnaryExpressionPrefix(parser);
  },
  "--"(parser: Parser) {
    return UnaryExpressionPrefix(parser);
  }
};

function err(info) {
  throw new Error(info);
}

class Lexer {
  input: string;
  tokens: Array<string>;
  at: number;
  constructor(input: string) {
    this.input = input;
    this.tokens = input.split(" ").filter(Boolean);
    this.at = 0;
  }

  next() {
    const str = this.tokens[this.at];
    let tok;
    if (str) {
      if (/^\d*(?:\.\d+)?$/.test(str)) {
        tok = {
          Type: "Number",
          Val: Number(str)
        };
      } else if (/^[$_a-zA-Z][$_a-zA-Z]*$/.test(str)) {
        tok = {
          Type: "Ident",
          Val: str
        };
      } else {
        tok = {
          Type: str,
          Val: str
        };
      }
      this.at++;
    }
    return tok || null;
  }
}

interface Tok {
  Type: string;
  Val: any;
}

function parserRead(parser: Parser) {
  parser.curTok = parser.peekTok;
  parser.peekTok = parser.l.next();
}

class Parser {
  l: Lexer;
  peekTok: Tok | null;
  curTok: Tok | null;
  constructor(l: Lexer) {
    this.l = l;
    parserRead(this);
    parserRead(this);
  }
  parse() {
    const tok = this.curTok;
    if (!tok) {
      return null;
    }
    const expr = parseExpression(this, 0);
    if (this.curTok !== null) {
      throw new Error("parser bug. remained tok");
    }
    return expr;
  }
}

function evalAst(ast) {
  if (ast.Type === "InfixExpression") {
    const left = evalAst(ast.Left);
    const right = evalAst(ast.Right);
    return eval(left + ast.Op.Type + right);
  }
  if (ast.Type === "Number") {
    return ast.Val;
  }
  if (ast.Type === "UnaryExpressionPrefix") {
    const left = evalAst(ast.Argument);
    return eval(ast.Op.Type + left);
  }
  err("Unsupported ast.Type " + ast.Type);
}

exports.Lexer = Lexer;
exports.Parser = Parser;
exports.evalAst = evalAst;

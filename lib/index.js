"use strict";

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

function InfixExpression(parser, left, prec) {
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
  "+"(parser, left, prec) {
    return InfixExpression(parser, left, prec);
  },

  "-"(parser, left, prec) {
    return InfixExpression(parser, left, prec);
  },

  "*"(parser, left, prec) {
    return InfixExpression(parser, left, prec);
  },

  "/"(parser, left, prec) {
    return InfixExpression(parser, left, prec);
  }

};

function UnaryExpressionPrefix(parser) {
  const OpTok = parser.curTok;
  parserRead(parser);
  const ArgTok = parser.curTok;
  parserRead(parser);

  if (!ArgTok || !(ArgTok.Type === "Ident" || ArgTok.Type === "Number")) {
    err("tok " + JSON.stringify(ArgTok) + " cannot follow prefix op +");
  }

  return {
    Type: "UnaryExpressionPrefix",
    Op: OpTok,
    Argument: ArgTok
  };
}

function UnaryExpressionPostfix(parser, left) {
  const OpTok = parser.curTok;
  parserRead(parser);
  return {
    Type: "UnaryExpressionPostfix",
    Op: OpTok,
    Argument: left
  };
}

function parseExpression(parser, prec) {
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
  "("(parser) {
    parserRead(parser);
    let expr = parseExpression(parser, 0);

    if (parser.curTok.Type !== ")") {
      err("parser error" + parser.curTok + '!==")"');
    }

    parserRead(parser);
    return expr;
  },

  "+"(parser) {
    return UnaryExpressionPrefix(parser);
  },

  "-"(parser) {
    return UnaryExpressionPrefix(parser);
  },

  Number(parser) {
    let left = parser.curTok;
    parserRead(parser);
    let right = parser.curTok;

    if (!right || !POSTFIX[right.Type]) {
      return left;
    }

    left = POSTFIX[right.Type](parser, left);
    return left;
  },

  Ident(parser) {
    let left = parser.curTok;
    parserRead(parser);
    let right = parser.curTok;

    if (!right || !POSTFIX[right.Type]) {
      return left;
    }

    left = POSTFIX[right.Type](parser, left);
    return left;
  },

  "++"(parser) {
    return UnaryExpressionPrefix(parser);
  },

  "--"(parser) {
    return UnaryExpressionPrefix(parser);
  }

};

function err(info) {
  throw new Error(info);
}

class Lexer {
  constructor(input) {
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

function parserRead(parser) {
  parser.curTok = parser.peekTok;
  parser.peekTok = parser.l.next();
}

class Parser {
  constructor(l) {
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

exports.Lexer = Lexer;
exports.Parser = Parser;